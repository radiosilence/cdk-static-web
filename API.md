# README

cdk-static-web

# cdk-static-web

## Table of contents

### Classes

- [StaticWeb](#staticweb)

### Interfaces

- [StaticWebProps](#staticwebprops)

# Staticweb

[cdk-static-web](#readme) / StaticWeb

# Class: StaticWeb

## Hierarchy

* *Construct*

  ↳ **StaticWeb**

## Table of contents

### Constructors

- [constructor](#constructor)

### Properties

- [bucket](#bucket)
- [deployment](#deployment)
- [distribution](#distribution)
- [node](#node)
- [record](#record)

### Methods

- [createARecord](#createarecord)
- [createBucket](#createbucket)
- [createDeployment](#createdeployment)
- [createDistribution](#createdistribution)
- [onPrepare](#onprepare)
- [onSynthesize](#onsynthesize)
- [onValidate](#onvalidate)
- [prepare](#prepare)
- [synthesize](#synthesize)
- [toString](#tostring)
- [validate](#validate)
- [isConstruct](#isconstruct)

## Constructors

### constructor

\+ **new StaticWeb**(`scope`: *Construct*, `id`: *string*, `props`: [*StaticWebProps*](#staticwebprops)): [*StaticWeb*](#staticweb)

#### Parameters:

Name | Type |
------ | ------ |
`scope` | *Construct* |
`id` | *string* |
`props` | [*StaticWebProps*](#staticwebprops) |

**Returns:** [*StaticWeb*](#staticweb)

## Properties

### bucket

• `Readonly` **bucket**: IBucket

___

### deployment

• `Optional` `Readonly` **deployment**: *undefined* | *BucketDeployment*

___

### distribution

• `Readonly` **distribution**: *Distribution*

___

### node

• `Readonly` **node**: *ConstructNode*

The construct tree node associated with this construct.

**`stability`** stable

___

### record

• `Optional` `Readonly` **record**: *undefined* | *ARecord*

## Methods

### createARecord

▸ `Private`**createARecord**(`zone`: IHostedZone, `distribution`: IDistribution): *ARecord*

#### Parameters:

Name | Type |
------ | ------ |
`zone` | IHostedZone |
`distribution` | IDistribution |

**Returns:** *ARecord*

___

### createBucket

▸ `Private`**createBucket**(): *Bucket*

**Returns:** *Bucket*

___

### createDeployment

▸ `Private`**createDeployment**(`destinationBucket`: IBucket, `__namedParameters`: [*StaticWebProps*](#staticwebprops), `distribution`: IDistribution): *BucketDeployment*

#### Parameters:

• **destinationBucket**: IBucket

• **__namedParameters**: [*StaticWebProps*](#staticwebprops)

• **distribution**: IDistribution

**Returns:** *BucketDeployment*

___

### createDistribution

▸ `Private`**createDistribution**(`bucket`: IBucket, `__namedParameters`: [*StaticWebProps*](#staticwebprops), `zoneName`: *undefined* | *string*, `certificate`: *undefined* | ICertificate): *Distribution*

#### Parameters:

• **bucket**: IBucket

• **__namedParameters**: [*StaticWebProps*](#staticwebprops)

• **zoneName**: *undefined* | *string*

• **certificate**: *undefined* | ICertificate

**Returns:** *Distribution*

___

### onPrepare

▸ `Protected`**onPrepare**(): *void*

Perform final modifications before synthesis.

This method can be implemented by derived constructs in order to perform
final changes before synthesis. prepare() will be called after child
constructs have been prepared.

This is an advanced framework feature. Only use this if you
understand the implications.

**`stability`** stable

**Returns:** *void*

___

### onSynthesize

▸ `Protected`**onSynthesize**(`session`: ISynthesisSession): *void*

Allows this construct to emit artifacts into the cloud assembly during synthesis.

This method is usually implemented by framework-level constructs such as `Stack` and `Asset`
as they participate in synthesizing the cloud assembly.

**`stability`** stable

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`session` | ISynthesisSession | The synthesis session.   |

**Returns:** *void*

___

### onValidate

▸ `Protected`**onValidate**(): *string*[]

Validate the current construct.

This method can be implemented by derived constructs in order to perform
validation logic. It is called on all constructs before synthesis.

**`stability`** stable

**Returns:** *string*[]

An array of validation error messages, or an empty array if the construct is valid.

___

### prepare

▸ `Protected`**prepare**(): *void*

Perform final modifications before synthesis.

This method can be implemented by derived constructs in order to perform
final changes before synthesis. prepare() will be called after child
constructs have been prepared.

This is an advanced framework feature. Only use this if you
understand the implications.

**`stability`** stable

**Returns:** *void*

___

### synthesize

▸ `Protected`**synthesize**(`session`: ISynthesisSession): *void*

Allows this construct to emit artifacts into the cloud assembly during synthesis.

This method is usually implemented by framework-level constructs such as `Stack` and `Asset`
as they participate in synthesizing the cloud assembly.

**`stability`** stable

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`session` | ISynthesisSession | The synthesis session.   |

**Returns:** *void*

___

### toString

▸ **toString**(): *string*

Returns a string representation of this construct.

**`stability`** stable

**Returns:** *string*

___

### validate

▸ `Protected`**validate**(): *string*[]

Validate the current construct.

This method can be implemented by derived constructs in order to perform
validation logic. It is called on all constructs before synthesis.

**`stability`** stable

**Returns:** *string*[]

An array of validation error messages, or an empty array if the construct is valid.

___

### isConstruct

▸ `Static`**isConstruct**(`x`: *any*): x is Construct

Return whether the given object is a Construct.

**`stability`** stable

#### Parameters:

Name | Type |
------ | ------ |
`x` | *any* |

**Returns:** x is Construct

# Staticwebprops

[cdk-static-web](#readme) / StaticWebProps

# Interface: StaticWebProps

## Hierarchy

* **StaticWebProps**

## Table of contents

### Properties

- [behaviourProps](#behaviourprops)
- [bucket](#bucket)
- [certificate](#certificate)
- [deploymentProps](#deploymentprops)
- [distributionProps](#distributionprops)
- [environment](#environment)
- [isSPA](#isspa)
- [staticPath](#staticpath)
- [zone](#zone)

## Properties

### behaviourProps

• `Optional` `Readonly` **behaviourProps**: *undefined* | *Partial*<BehaviorOptions\>

___

### bucket

• `Optional` `Readonly` **bucket**: *undefined* | IBucket

___

### certificate

• `Optional` `Readonly` **certificate**: *undefined* | ICertificate

___

### deploymentProps

• `Optional` `Readonly` **deploymentProps**: *undefined* | *Partial*<BucketDeploymentProps\>

___

### distributionProps

• `Optional` `Readonly` **distributionProps**: *undefined* | *Partial*<DistributionProps\>

___

### environment

• `Optional` `Readonly` **environment**: *undefined* | *Record*<*string*, *string*\>

___

### isSPA

• `Optional` `Readonly` **isSPA**: *undefined* | *boolean*

Whether to resolve 404 errors to index.html with 200

___

### staticPath

• `Readonly` **staticPath**: *string*

Path to static files

___

### zone

• `Optional` `Readonly` **zone**: *undefined* | IHostedZone
