import * as os from 'os';
import * as path from 'path';
import { AssetHashType, AssetStaging, aws_lambda as lambda, DockerImage, ILocalBundling } from 'aws-cdk-lib';
import { EsbuildInstallation } from './esbuild-installation.ts';
import { PackageManager } from './package-manager.ts';
import { BundlingOptions, SourceMapMode } from './types.ts';
import { exec, extractDependencies, findUp } from './util.ts';

const ESBUILD_MAJOR_VERSION = '0';

/**
 * Bundling properties
 */
export interface BundlingProps extends BundlingOptions {
  /**
   * Path to lock file
   */
  readonly depsLockFilePath: string;

  /**
   * Entry file
   */
  readonly entry: string;

  /**
   * The runtime of the lambda function
   */
  readonly runtime: lambda.Runtime;

  /**
   * Path to project root
   */
  readonly projectRoot: string;
}

/**
 * Bundling with esbuild
 */
export class Bundling implements BundlingOptions {
  /**
   * esbuild bundled Lambda asset code
   */
  public static bundle(options: BundlingProps): lambda.AssetCode {
    return lambda.Code.fromAsset(options.projectRoot, {
      assetHashType: AssetHashType.OUTPUT,
      bundling: new Bundling(options),
    });
  }

  public static clearEsbuildInstallationCache(): void {
    this.esbuildInstallation = undefined;
  }

  private static esbuildInstallation?: EsbuildInstallation;

  // Core bundling options
  public readonly image: DockerImage;
  public readonly command: string[];
  public readonly environment?: { [key: string]: string };
  public readonly workingDirectory: string;
  public readonly local?: ILocalBundling;

  private readonly projectRoot: string;
  private readonly relativeEntryPath: string;
  private readonly relativeTsconfigPath?: string;
  private readonly relativeDepsLockFilePath: string;
  private readonly externals: string[];
  private readonly packageManager: PackageManager;

  constructor(private readonly props: BundlingProps) {
    this.packageManager = PackageManager.fromLockFile(props.depsLockFilePath);

    Bundling.esbuildInstallation = Bundling.esbuildInstallation ?? EsbuildInstallation.detect();

    this.projectRoot = props.projectRoot;
    this.relativeEntryPath = path.relative(this.projectRoot, path.resolve(props.entry));
    this.relativeDepsLockFilePath = path.relative(this.projectRoot, path.resolve(props.depsLockFilePath));

    if (this.relativeDepsLockFilePath.includes('..')) {
      throw new Error(
        `Expected depsLockFilePath: ${props.depsLockFilePath} to be under projectRoot: ${this.projectRoot} (${this.relativeDepsLockFilePath})`,
      );
    }

    if (props.tsconfig) {
      this.relativeTsconfigPath = path.relative(this.projectRoot, path.resolve(props.tsconfig));
    }

    this.externals = [
      ...(props.externalModules ?? ['aws-sdk']), // Mark aws-sdk as external by default (available in the runtime)
      ...(props.nodeModules ?? []), // Mark the modules that we are going to install as externals also
    ];

    // Docker bundling
    const shouldBuildImage = props.forceDockerBundling || !Bundling.esbuildInstallation;
    this.image = shouldBuildImage
      ? props.dockerImage ??
        DockerImage.fromBuild(path.join(__dirname, '../lib'), {
          buildArgs: {
            ...(props.buildArgs ?? {}),
            IMAGE: props.runtime.bundlingImage.image,
            ESBUILD_VERSION: props.esbuildVersion ?? ESBUILD_MAJOR_VERSION,
          },
        })
      : DockerImage.fromRegistry('dummy'); // Do not build if we don't need to

    const bundlingCommand = this.createBundlingCommand({
      inputDir: AssetStaging.BUNDLING_INPUT_DIR,
      outputDir: AssetStaging.BUNDLING_OUTPUT_DIR,
      esbuildRunner: 'esbuild', // esbuild is installed globally in the docker image
      osPlatform: 'linux', // linux docker image
    });
    this.command = ['bash', '-c', bundlingCommand];
    this.environment = props.environment;
    // Bundling sets the working directory to cdk.AssetStaging.BUNDLING_INPUT_DIR
    // and we want to force npx to use the globally installed esbuild.
    this.workingDirectory = '/';

    // Local bundling
    if (!props.forceDockerBundling) {
      // only if Docker is not forced
      this.local = this.getLocalBundlingProvider();
    }
  }

  private createBundlingCommand(options: BundlingCommandOptions): string {
    const pathJoin = osPathJoin(options.osPlatform);

    const loaders = Object.entries(this.props.loader ?? {});
    const defines = Object.entries(this.props.define ?? {});

    if (this.props.sourceMap === false && this.props.sourceMapMode) {
      throw new Error('sourceMapMode cannot be used when sourceMap is false');
    }
    // eslint-disable-next-line no-console
    const sourceMapEnabled = this.props.sourceMapMode ?? this.props.sourceMap;
    const sourceMapMode = this.props.sourceMapMode ?? SourceMapMode.DEFAULT;
    const sourceMapValue = sourceMapMode === SourceMapMode.DEFAULT ? '' : `=${this.props.sourceMapMode}`;

    const esbuildCommand: string[] = [
      options.esbuildRunner,
      '--bundle',
      `"${pathJoin(options.inputDir, this.relativeEntryPath)}"`,
      `--target=${this.props.target ?? toTarget(this.props.runtime)}`,
      '--platform=node',
      `--outfile="${pathJoin(options.outputDir, 'index.js')}"`,
      ...(this.props.minify ? ['--minify'] : []),
      ...(sourceMapEnabled ? [`--sourcemap${sourceMapValue}`] : []),
      ...this.externals.map((external) => `--external:${external}`),
      ...loaders.map(([ext, name]) => `--loader:${ext}=${name}`),
      ...defines.map(([key, value]) => `--define:${key}=${JSON.stringify(value)}`),
      ...(this.props.logLevel ? [`--log-level=${this.props.logLevel}`] : []),
      ...(this.props.keepNames ? ['--keep-names'] : []),
      ...(this.relativeTsconfigPath ? [`--tsconfig=${pathJoin(options.inputDir, this.relativeTsconfigPath)}`] : []),
      ...(this.props.metafile ? [`--metafile=${pathJoin(options.outputDir, 'index.meta.json')}`] : []),
      ...(this.props.banner ? [`--banner:js=${JSON.stringify(this.props.banner)}`] : []),
      ...(this.props.footer ? [`--footer:js=${JSON.stringify(this.props.footer)}`] : []),
    ];

    let depsCommand = '';
    if (this.props.nodeModules) {
      // Find 'package.json' closest to entry folder, we are going to extract the
      // modules versions from it.
      const pkgPath = findUp('package.json', path.dirname(this.props.entry));
      if (!pkgPath) {
        throw new Error('Cannot find a `package.json` in this project. Using `nodeModules` requires a `package.json`.');
      }

      // Determine dependencies versions, lock file and installer
      const dependencies = extractDependencies(pkgPath, this.props.nodeModules);
      const osCommand = new OsCommand(options.osPlatform);

      const lockFilePath = pathJoin(options.inputDir, this.relativeDepsLockFilePath ?? this.packageManager.lockFile);

      // Create dummy package.json, copy lock file if any and then install
      depsCommand = chain([
        osCommand.writeJson(pathJoin(options.outputDir, 'package.json'), { dependencies }),
        osCommand.copy(lockFilePath, pathJoin(options.outputDir, this.packageManager.lockFile)),
        osCommand.changeDirectory(options.outputDir),
        this.packageManager.installCommand.join(' '),
      ]);
    }

    return chain([
      ...(this.props.commandHooks?.beforeBundling(options.inputDir, options.outputDir) ?? []),
      esbuildCommand.join(' '),
      ...((this.props.nodeModules && this.props.commandHooks?.beforeInstall(options.inputDir, options.outputDir)) ??
        []),
      depsCommand,
      ...(this.props.commandHooks?.afterBundling(options.inputDir, options.outputDir) ?? []),
    ]);
  }

  private getLocalBundlingProvider(): ILocalBundling {
    const osPlatform = os.platform();
    const createLocalCommand = (outputDir: string, esbuild: EsbuildInstallation) =>
      this.createBundlingCommand({
        inputDir: this.projectRoot,
        outputDir,
        esbuildRunner: esbuild.isLocal ? this.packageManager.runBinCommand('esbuild') : 'esbuild',
        osPlatform,
      });
    const environment = this.props.environment ?? {};
    const cwd = this.projectRoot;

    return {
      tryBundle(outputDir: string) {
        if (!Bundling.esbuildInstallation) {
          process.stderr.write('esbuild cannot run locally. Switching to Docker bundling.\n');
          return false;
        }

        if (!Bundling.esbuildInstallation.version.startsWith(`${ESBUILD_MAJOR_VERSION}.`)) {
          throw new Error(
            `Expected esbuild version ${ESBUILD_MAJOR_VERSION}.x but got ${Bundling.esbuildInstallation.version}`,
          );
        }

        const localCommand = createLocalCommand(outputDir, Bundling.esbuildInstallation);

        exec(osPlatform === 'win32' ? 'cmd' : 'bash', [osPlatform === 'win32' ? '/c' : '-c', localCommand], {
          env: { ...process.env, ...environment },
          stdio: [
            // show output
            'ignore', // ignore stdio
            process.stderr, // redirect stdout to stderr
            'inherit', // inherit stderr
          ],
          cwd,
          windowsVerbatimArguments: osPlatform === 'win32',
        });

        return true;
      },
    };
  }
}

interface BundlingCommandOptions {
  readonly inputDir: string;
  readonly outputDir: string;
  readonly esbuildRunner: string;
  readonly osPlatform: NodeJS.Platform;
}

/**
 * OS agnostic command
 */
class OsCommand {
  constructor(private readonly osPlatform: NodeJS.Platform) {}

  public writeJson(filePath: string, data: any): string {
    const stringifiedData = JSON.stringify(data);
    if (this.osPlatform === 'win32') {
      return `echo ^${stringifiedData}^ > ${filePath}`;
    }

    return `echo '${stringifiedData}' > ${filePath}`;
  }

  public copy(src: string, dest: string): string {
    if (this.osPlatform === 'win32') {
      return `copy ${src} ${dest}`;
    }

    return `cp ${src} ${dest}`;
  }

  public changeDirectory(dir: string): string {
    return `cd ${dir}`;
  }
}

/**
 * Chain commands
 */
function chain(commands: string[]): string {
  return commands.filter((c) => !!c).join(' && ');
}

/**
 * Platform specific path join
 */
function osPathJoin(platform: NodeJS.Platform) {
  return function (...paths: string[]): string {
    const joined = path.join(...paths);
    // If we are on win32 but need posix style paths
    if (os.platform() === 'win32' && platform !== 'win32') {
      return joined.replace(/\\/g, '/');
    }
    return joined;
  };
}

/**
 * Converts a runtime to an esbuild node target
 */
function toTarget(runtime: lambda.Runtime): string {
  const match = runtime.name.match(/nodejs(\d+)/);

  if (!match) {
    throw new Error('Cannot extract version from runtime.');
  }

  return `node${match[1]}`;
}
