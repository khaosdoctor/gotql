<h1 align="center">
	<br>
	<img width="360" height="" src="https://cdn.rawgit.com/khaosdoctor/gotql/master/media/gotql.svg" alt="GotQL">
	<br>
	<br>
	<br>
</h1>

> Because JSON is way better

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/c993589aba95499691230a0a889377a9)](https://www.codacy.com/app/khaosdoctor/gotql?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=khaosdoctor/gotql&amp;utm_campaign=Badge_Grade) [![Build Status](https://travis-ci.org/khaosdoctor/gotql.svg?branch=master)](https://travis-ci.org/khaosdoctor/gotql)
[![codecov](https://codecov.io/gh/khaosdoctor/gotql/branch/master/graph/badge.svg?token=dQlUpT7QSF)](https://codecov.io/gh/khaosdoctor/gotql) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![Gitmoji](https://img.shields.io/badge/gitmoji-%20%F0%9F%98%9C%20%F0%9F%98%8D-FFDD67.svg?style=flat)](https://gitmoji.carloscuesta.me/)

[![Downloads](https://img.shields.io/npm/dm/gotql.svg)](https://npmjs.com/gotql)
[![npm](https://img.shields.io/npm/v/gotql.svg)](http://npmjs.com/gotql)
[![node](https://img.shields.io/node/v/gotql.svg)](http://npmjs.com/gotql)

This is a better implementation of the [GraphQL](https://github.com/facebook/graphql) request via NodeJS, created as a wrapper of [Got](http://github.com/sindresorhus/got).

Built because manipulating strings is a real pain.

# Table of Contents

<!-- TOC -->

- [Table of Contents](#table-of-contents)
  - [Install](#install)
  - [Basic Usage](#basic-usage)
  - [API](#api)
  - [What is it?](#what-is-it)
    - [Motivation](#motivation)
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

## API

-- Comming soon

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

## To do

- [] Support for streams
- [] Full code coverage on Runner and query and mutation types
