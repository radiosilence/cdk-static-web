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

- [aRecord](#arecord)
- [aaaaRecord](#aaaarecord)
- [bucket](#bucket)
- [deployment](#deployment)
- [distribution](#distribution)
- [node](#node)

### Methods

- [createARecord](#createarecord)
- [createAaaaRecord](#createaaaarecord)
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

### aRecord

• `Optional` `Readonly` **aRecord**: *undefined* | *ARecord*

___

### aaaaRecord

• `Optional` `Readonly` **aaaaRecord**: *undefined* | *AaaaRecord*

___

### bucket

• `Readonly` **bucket**: IBucket

___

### deployment

• `Optional` `Readonly` **deployment**: *undefined* | *BucketDeployment*

___

### distribution

• `Readonly` **distribution**: IDistribution

___

### node

• `Readonly` **node**: *ConstructNode*

The construct tree node associated with this construct.

**`stability`** stable

## Methods

### createARecord

▸ `Private`**createARecord**(`__namedParameters`: [*StaticWebProps*](#staticwebprops), `distribution`: IDistribution): *undefined* | *ARecord*

#### Parameters:

• **__namedParameters**: [*StaticWebProps*](#staticwebprops)

• **distribution**: IDistribution

**Returns:** *undefined* | *ARecord*

___

### createAaaaRecord

▸ `Private`**createAaaaRecord**(`__namedParameters`: [*StaticWebProps*](#staticwebprops), `distribution`: IDistribution): *undefined* | *AaaaRecord*

#### Parameters:

• **__namedParameters**: [*StaticWebProps*](#staticwebprops)

• **distribution**: IDistribution

**Returns:** *undefined* | *AaaaRecord*

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

▸ `Private`**createDistribution**(`bucket`: IBucket, `__namedParameters`: [*StaticWebProps*](#staticwebprops)): *Distribution*

#### Parameters:

• **bucket**: IBucket

• **__namedParameters**: [*StaticWebProps*](#staticwebprops)

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

- [behaviourOptions](#behaviouroptions)
- [bucket](#bucket)
- [certificate](#certificate)
- [deploymentProps](#deploymentprops)
- [distributionProps](#distributionprops)
- [environment](#environment)
- [isSPA](#isspa)
- [recordName](#recordname)
- [staticPath](#staticpath)
- [zone](#zone)

## Properties

### behaviourOptions

• `Optional` `Readonly` **behaviourOptions**: *undefined* | *Partial*<BehaviorOptions\>

Additional props to pass to CloudFront distribution

___

### bucket

• `Optional` `Readonly` **bucket**: *undefined* | IBucket

S3 bucket

___

### certificate

• `Optional` `Readonly` **certificate**: *undefined* | ICertificate

ACM certificate

___

### deploymentProps

• `Optional` `Readonly` **deploymentProps**: *undefined* | *Partial*<BucketDeploymentProps\>

Additional props to pass to S3 deployment

___

### distributionProps

• `Optional` `Readonly` **distributionProps**: *undefined* | *Partial*<DistributionProps\>

Additional props to pass to CloudFront distribution

___

### environment

• `Optional` `Readonly` **environment**: *undefined* | *Record*<*string*, *string*\>

___

### isSPA

• `Optional` `Readonly` **isSPA**: *undefined* | *boolean*

Whether to resolve 404 errors to index.html with 200

___

### recordName

• `Optional` `Readonly` **recordName**: *undefined* | *string*

The name of your A record, if you're using a subdomain

___

### staticPath

• `Readonly` **staticPath**: *string*

Path to static files

___

### zone

• `Optional` `Readonly` **zone**: *undefined* | IHostedZone

Route 53 zone
