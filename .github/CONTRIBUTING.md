# Contributing

**First**, thanks for taking time to help on this project, it means a LOT to a lot of people, specially me! So thanks again!

The following is a set of guidelines for contributing to GotQL, which are hosted on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

**Second**:

> Please note that this project is released with a [Contributor Code of Conduct](../code-of-conduct.md). By participating in this project you agree to abide by its terms.

## Table of Contents

<!-- TOC -->

- [Contributing](#contributing)
  - [Table of Contents](#table-of-contents)
  - [I have an issue!](#i-have-an-issue)
    - [How do I create a good issue?](#how-do-i-create-a-good-issue)
  - [I have an idea I want to propose!](#i-have-an-idea-i-want-to-propose)
    - [How Do I Submit a (Good) Enhancement Suggestion?](#how-do-i-submit-a-good-enhancement-suggestion)
      - [Pull Requests](#pull-requests)
    - [Styleguides](#styleguides)
      - [JavaScript Styleguide](#javascript-styleguide)
      - [Documentation Styleguide](#documentation-styleguide)
      - [Git commit Stylegude](#git-commit-stylegude)
      - [Useful commands](#useful-commands)
  - [That's it!](#thats-it)

<!-- /TOC -->

## I have an issue!

This section is about how you can fill up a good issue template.

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). After you found out the problem and how to reproduce it, open an issue and provide the following information by [filling in the template](./ISSUE_TEMPLATE.md).

### How do I create a good issue?

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible. For example, start by explaining how you imported GotQL, e.g. which command exactly you used, or how you started GotQL otherwise. When listing steps, **don't just say what you did, but explain how you did it**. For example, if you wrote a query with 5 levels of fields, explain what is your final objective and what you expected.
* **Provide specific examples to demonstrate the steps**. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples. If you're providing snippets in the issue, use [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem. If you use the keyboard while following the steps. You can use [this tool](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
* **If you're reporting that GotQL crashed**, include a crash report with a stack trace from the operating system. You can print it, copy it or whatever you like. Include the crash report in the issue in a [code block](https://help.github.com/articles/markdown-basics/#multiple-lines), a [file attachment](https://help.github.com/articles/file-attachments-on-issues-and-pull-requests/), or put it in a [gist](https://gist.github.com/) and provide link to that gist.
* **If the problem wasn't triggered by a specific action**, describe what you were doing before the problem happened and share more information using the guidelines below.

Provide more context by answering these questions:

* **Did the problem start happening recently** (e.g. after updating to a new version) or was this always a problem?
* If the problem started happening recently, **can you reproduce the problem in an older version of GotQL?** What's the most recent version in which the problem doesn't happen? You can download older versions of GotQL from [the releases page](https://github.com/khaosdoctor/gotql/releases).
* **Can you reliably reproduce the issue?** If not, provide details about how often the problem happens and under which conditions it normally happens.

Include details about your configuration and environment:

* **Which version of GotQL are you using?** You can get the exact version by opening `node_modules/gotql/package.json`.
* **What's the name and version of the OS you're using**?
* **Are you running GotQL in a virtual machine?** If so, which VM software are you using and which operating systems and versions are used for the host and the guest?
* **Does your network access to localhost or your GraphQL endpoint is configured correctly?**, most problems may be caused by wrong `/etc/hosts` configurations

Also, if there's something I missed here, you can add a Pull Request _or_ add it to your issue. Remember: The most details you provide, the better we'll be able to support you.

## I have an idea I want to propose!

This section guides you through submitting an enhancement suggestion for GotQL, including completely new features and minor improvements to existing functionality. Following these guidelines helps maintainers and the community understand your suggestion and find related suggestions

### How Do I Submit a (Good) Enhancement Suggestion?

Enhancement suggestions are tracked as [GitHub issues](https://guides.github.com/features/issues/) if you only wish to _propose it_, but if you have already come up with a solution, then you can open a [Pull Request](https://help.github.com/articles/about-pull-requests/) if you are certain of the enhancement, create it and provide the following information, along with the [pull request guidelines](#pull-requests):

* **Use a clear and descriptive title** for the issue/PR to identify the suggestion.
* **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
* **Provide specific examples to demonstrate the steps**. Include copy/pasteable snippets which you use in those examples, as [Markdown code blocks](https://help.github.com/articles/markdown-basics/#multiple-lines).
* **Describe the current behavior** and **explain which behavior you expected to see instead** and why.
* **Include screenshots and animated GIFs** which help you demonstrate the steps or point out the part of Atom which the suggestion is related to. You can use [this tool](https://www.cockos.com/licecap/) to record GIFs on macOS and Windows, and [this tool](https://github.com/colinkeenan/silentcast) or [this tool](https://github.com/GNOME/byzanz) on Linux.
* **Explain why this enhancement would be useful** to most GotQL users.
* **Which version of GotQL are you using?** You can get the exact version by opening `node_modules/gotql/package.json`.
* **Specify the name and version of the OS you're using.**.

#### Pull Requests

* Fill in [the required template](PULL_REQUEST_TEMPLATE.md)
* Do not include issue numbers in the PR **title**
* Include screenshots and animated GIFs in your pull request whenever possible.
* Follow the [JavaScript styleguide](#javascript-styleguide).
* Include thoughtfully-worded, well-structured [Ava](https://github.com/avajs/ava) tests in the `./tests` folder. Run them using `npm test`. Remember, tests are __one file per GotQL file__, which means, if you are going to test the `runner.js`, you should add the test to a file named `runner.test.js`, **remember `.test.js` extension**.
* Ava object **must always be imported as `describe`** and the test parameter passed into the arrow function **must always be declared as `assert`**
```js
// Incorrect
import ava from 'ava'

ava('This is a test title', (test) => { test.pass() })

// Correct
import describe from 'ava'

describe('This is a test title', (assert) => { assert.pass() })
```
* Assert that your code coverage is _at least_ 95% before submitting your pull request
* Document new code based on the [Documentation Styleguide](#documentation-styleguide)
* End all files with a newline
* **Avoid platform-dependent code**

### Styleguides

#### JavaScript Styleguide

All JavaScript must adhere to [JavaScript Standard Style](https://standardjs.com/).

* Do **not** include additional dependencies unless _strictly_ necessary
* Use [template strings](https://developer.mozilla.org/docs/Web/JavaScript/Reference/template_strings) whenever there are variables messed up with strings
* Avoid functions with more than 20 lines of code
* Run `npm lint` before pushing
* Prefer [attribution by destructuring](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Atribuicao_via_desestruturacao) on `require` statements

```js
const { query, mutation } = require('./index.js')
```

#### Documentation Styleguide

Documentations are done both in code and in the [README](../README.md) file.

- **README** should contain the _detailed_ description of your submitted code
- **Code documentation** should always be present using [JSDoc](usejsdoc.org), since their documentation is not the best, I suggest looking at [Google's source code for GCE](https://github.com/googleapis/nodejs-bigquery/blob/master/src/dataset.js), which is pretty awesome

#### Git commit Stylegude

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line, with a description of how they are related
* GotQL uses [Gitmoji](https://github.com/carloscuesta/gitmoji/) guidelines **fully**, please adhere to this guidelines. (_Tip: you can use [gitmoji-cli](https://github.com/carloscuesta/gitmoji-cli) to make it easier_)

#### Useful commands

* `npm test`: Runs all test suites
* `npm run lint`: Starts standard linter
* `npm run lint:fix`: Fix small linter problems
* `npm run build`: Compiles babel. GotQL uses babel to support older versions of NodeJS, the code is compiled on `postinstall` hooks, which ignores the necessity of compiling on CI
* `npm run coverage`: Runs code coverage report, **Please note that the minimum coverage score is 95%**

## That's it!

Thank you for contributing!