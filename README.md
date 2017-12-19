<h1 align="center">
	<br>
	<img width="360" height="" src="https://cdn.rawgit.com/khaosdoctor/gotql/master/media/gotql.svg" alt="GotQL">
	<br>
	<br>
	<br>
</h1>

> Because JSON is way better

<center>
<a href="https://www.codacy.com/app/khaosdoctor/gotql?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=khaosdoctor/gotql&amp;utm_campaign=Badge_Grade"><img src= "https://api.codacy.com/project/badge/Grade/c993589aba95499691230a0a889377a9" alt="Codacy Badge"></a>
<a href="https://travis-ci.org/khaosdoctor/gotql"><img src= "https://travis-ci.org/khaosdoctor/gotql.svg?branch=master" alt="Build Status"></a>
<a href="https://codecov.io/gh/khaosdoctor/gotql"><img src= "https://codecov.io/gh/khaosdoctor/gotql/branch/master/graph/badge.svg?token=dQlUpT7QSF" alt="Codecov Status"></a>
<a href="https://standardjs.com"><img src= "https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="JavaScript Style Guide"></a>
<br><br>
<a href="https://npmjs.com/gotql"><img src= "https://img.shields.io/npm/dm/gotql.svg" alt="Downloads"></a>
<a href="https://npmjs.com/gotql"><img src= "https://img.shields.io/npm/v/gotql.svg" alt="NPM"></a>
<a href="https://npmjs.com/gotql"><img src= "https://img.shields.io/node/v/gotql.svg" alt="Node Version"></a>
</center>

This is a better implementation of the [GraphQL](https://github.com/facebook/graphql) request via NodeJS, created as a wrapper of [Got](http://github.com/sindresorhus/got).

Built because manipulating strings is a real pain.

# Table of Contents

<!-- TOC -->

- [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Basic Usage](#basic-usage)
  - [What is it?](#what-is-it)
    - [Motivation](#motivation)
  - [API](#api)
    - [Returns](#returns)
  - [The JSON query format](#the-json-query-format)
    - [Description](#description)
    - [Examples](#examples)
      - [Simple query](#simple-query)
      - [Named query](#named-query)
      - [Query with simple args](#query-with-simple-args)
      - [Query with variables](#query-with-variables)
      - [Nested fields](#nested-fields)
      - [Enum args](#enum-args)
  - [Contributing to this project](#contributing-to-this-project)
  - [To do](#to-do)

<!-- /TOC -->

## Install

```sh
$ npm install gotql
```

Or

```sh
$ yarn install gotql
```

## Basic Usage

```js
const gotQl = require('gotql')

const query = {
  operation: {
    name: 'users',
    fields: ['name', 'age', 'id']
  }
}

const options = {
  headers: {
    "Authorization": "Bearer <token>"
  },
  debug: false
}

gotQL.query('mygraphqlendpoint.com.br/api', query, options)
  .then(response => console.log(response.data))
  .catch(console.error)
```

## What is it?

GotQL is a better interface for GraphQL queries. It provides a way for developers to run queries using JSON instead of strings. Which is a way more usable data format than the string itself.

### Motivation

Manipulating strings is very smelly, even on dynamically typed languages. So, in order to avoid things such as this:

![](./media/motivation-example.png)

Which can be translated to something waay more readable in a JSON format like this:

```js
const mutation = {
  operation {
    name: 'addLog',
    args: {
      logType: { value: 'status_change', escape: false}, // Enum Value
      fromState: variables.fromState,
      toState: variables.toState,
      idUser: variables.idUser,
      idCampaign: variables.idCampaign,
      owner: {
        ownerType: variables.ownerType,
        username: variables.username,
        picture: variables.picture,
        name: variables.name,
        id: variables.id
      }
    },
    fields: [ 'uuid' ]
  }
}
```

This is why GotQL was created.

## API

```js
gotQl.query(graphQLEndpoint, query, [options])
```

- **Description**: Performs a graphQL query

**GraphQLEndpoint**

- Type: `string`
- Description: The GraphQL endpoint to query on

**query**

- Type: `object`
- Description: The JSON-typed query following the [json-query format](#the-json-query-format)

**options**

- Type: `object`
- Description: The option object with the following properties.
  - _debug_: Activates debug logging
    - Type: `boolean`
  - _errorStatusCode_: Default HTTP status code to be returned on error
    - Type: `number`
  - _headers_: Additional headers to be sent
    - Type: `object`, in the form of `[headerName: string]: headerValue: string`

```js
gotQl.mutation(graphQLEndpoint, query, [options])
```

- **Description**: Performs a graphQL mutation

**GraphQLEndpoint**

- Type: `string`
- Description: The GraphQL endpoint to query on

**query**

- Type: `object`
- Description: The JSON-typed query following the [json-query format](#the-json-query-format)

**options**

- Type: `object`
- Description: The option object with the following properties.
  - _debug_: Activates debug logging
    - Type: `boolean`
  - _errorStatusCode_: Default HTTP status code to be returned on error
    - Type: `number`
  - _headers_: Additional headers to be sent
    - Type: `object`, in the form of `[headerName: string]: headerValue: string`

### Returns

All methods return an `object` like this:

```js
const response = {
  data: { 'Your GraphQL response here' },
  statusCode: '200', // Or an error code (or a defined user code) when GraphQL returns an error array
  statusMessage: 'Status Message associated with the statusCode'
}
```

## The JSON query format

The JSON format gotQL uses is a simple and intuitive description based on the [anatomy of a GraphQL query](https://dev-blog.apollodata.com/the-anatomy-of-a-graphql-query-6dffa9e9e747) blog post.

This is a generic model of a JSONLike query:

```js
const query = {
    name?: string;
    operation: {
        name: string;
        alias?: string;
        args?: {
            [argName: string]: any;
        } | {
          [argName: string]: {
              value: string;
              escape: boolean;
          };
        };
        fields: (string | {
            [fieldName: string]: [{
                fields?: (string | {
                    [fieldName: string]: [any];
                })[];
            }];
        })[];
    };
    variables?: {
        [varName: string]: {
            type: string;
            value: string;
        };
    };
}
```

### Description

- Query:
  - Type: `object`
  - Description: The full query object
  - Properties:
    - _name_: [optional]: Query name
      - Type: `string`
    - _variables_: [optional] Query variable declaration
      - Type: `object` with signature like `[varName: string]: { type: string, value: string }`
      - Properties:
        - _varName_: Variable name
          - Type: `string`
        - _type_: Variable type. Can be a GraphQL definition of type (i.e: `string!`)
          - Type: `string`
        - _value_: Variable value
          - Type: `any`
    - _operation_: The query operation (action that will be executed)
      - Type: `object`
      - Properties:
        - _name_: The operation name
          - Type: `string`
        - _alias_: [optional] An alias to give the operation
          - Type: `string`
        - _args_: [optional] The operation args
          - Type: `[argName: string]: any` or a detailed arg object
            - **_Simple args_**: An `object` where the key is the argument name and its value. Accepts variables in the format of `argName: '$value'`
              - Example: `args { name: 'myName' }`
            - **_Detailed args_**: An object with two properties. This will give more control over escaping (mostly to use enums). Argument name should be the key
              - Type: `object`
              - Properties:
                - _value_: The argument value
                  - Type: `any`
                - _escape_: Whether the argument should be escaped or not (escaped means surrounded with double quotes `"argValue"`)
                  - Type: `boolean`
              - Examples: `args: { status: { value: 'an_enum', escape: false } }` should output `operation (status: an_enum)...`
        - _fields_: The field list to get back from the operation
          - Type: An `array` of `object` (to use nested fields) or `string`, or both.
          - Properties (for nested fields):
            - Type: `object` where the field name is the key
            - _fields_: Recursive definition, accepts another array just like the _fields_ above.

### Examples

#### Simple query

```js
const query = {
  operation: {
    name: 'users',
    fields: ['name', 'age']
  }
}
```

Outputs:

```js
query { users { name age } }
```

#### Named query

```js
const query = {
  name: 'myQuery',
  operation: {
    name: 'users',
    fields: ['name', 'age']
  }
}
```

Outputs:

```js
query myQuery { users { name age } }
```

#### Query with simple args

```js
const query = {
  operation: {
    name: 'user',
    args: {
      name: 'Joe'
    }
    fields: ['name', 'age']
  }
}
```

Outputs:

```js
query { user(name: "Joe") { name age } }
```

#### Query with variables

```js
const query = {
  variables: {
    name: {
      type: 'string!',
      value: 'Joe'
    }
  },
  operation: {
    name: 'user',
    args: {
      name: '$name'
    }
    fields: ['name', 'age']
  }
}
```

Outputs:

```js
query ($name: string!) { users(name: $name) { name age } }
```

Variables are sent on a separate object to graphQL.

```json
{
  "variables": { "name": "Joe" }
}
```

#### Nested fields

```js
const query = {
  operation: {
    name: 'users',
    fields: ['name', 'age', { friends: { fields: ['name', 'age'] }
    }]
  }
}
```

Outputs:

```js
query { users { name age friends { name age } } }
```

Recursive fields can go forever.

#### Enum args

```js
const query = {
  operation: {
    name: 'user',
    args: {
      type: {
        value: 'internal',
        escape: false
      }
    }
    fields: ['name', 'age']
  }
}
```

Outputs:

```js
query { users(type: internal) { name age } }
```

If `escape` is set to `true`, the output would be:

```js
query { users(type: "internal") { name age } }
```

> **Note:** Variables such as described [here](#query-with-variables) _will __not___ be recognized. If the arg object is not an `[argName]: value`, variables will not pass through the definition check (GotQL warns if a variable is not declared but used on operation).

## Contributing to this project

> Please note that this project is released with a [Contributor Code of Conduct](code-of-conduct.md). By participating in this project you agree to abide by its terms.

Hey! If you want to contribute, please read the [contributing guidelines](./.github/CONTRIBUTING.md) :smile:

## To do

- [ ] Support for streams
- [ ] Support for multiple operations
- [ ] Add Integration tests
- [X] Full code coverage on Runner and query and mutation types
- [X] Add CONTRIBUTING and CoC
- [X] Add Issue template
