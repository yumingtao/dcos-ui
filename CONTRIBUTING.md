## Pull Requests

Pull Request for new features, bugs and improvements are appreciated.
However please follow the guidelines below to save as much time as possible for the maintainers.

Always prefer **small pull requests**. These are much easier to review and more likely
to get merged. Make sure the PR does only one thing, so for example if you have a task to fix a bug you should only
make changes/fixes for the bug, otherwise please split it into multiple PRs.

While working on your changes try using micro-commits when possible during the process, those micro-commits must be able to be cherry picked and work independently.

Commit example after running `git commit`:
```bash
DCOS-0000: Fix undefined error when clicking on profile button

This PR fixes a bug when user try to nagivate to profile page and javascript throw an error blocking the user from navigating.
The error was caused because the method foo expects and object and an array is being passed.
```

### Title

The best way to title your PRs are following the example below, where issue is the Jira ticket and subject is a short summary related to your work. <br>
If Jira ticket not applicable only use the subject.

```
<issue>: <subject>
```

e.g `DCOS-0000: Fix stuff that blocked other stuff`

### Description

Make sure to provide enough information describing your work, don't forget to include related PRs to your description, <br>
Here are a couple of questions that answering will help you describe more clearly your PR and help the maintainers understand, test and merge faster.

- What did you change?
- Why is this work needed?
- How can I reproduce before your work was added? if not why?
- Does the changes affect the UI? where?
- Does the changes affect the behavior? where?
- Is unit tests included? if not why?
- Is integration tests included? if not why?
- Is a regression, did you write a test to catch this in the future?

### Process & Review
<!--
* Two owner/maintainer need to approve (assigner and reviewer label) a PR before it gets merged
* If at least 2 of the PRs breaks master a feaure branch should be created
-->


## Branches

Every branch should be named using the following pattern:


```
<username>/<type>/<issue>-<subject>
```

<!--
  TODO: describe username and issues
    * username = github user name
    * issue = jira issue or nothing
-->

### Type

The following commit types are allowed:

* **feat** -
  use this type for commits that introduce a new features or capabilities
* **fix** - use this one for bug fixes
* **perf** - use this type for performance improvements
* **docs** - use this one to indicate documentation adjustments and improvements
* **chore** - use this type for _maintainance_ commits e.g. removing old files
* **style** - use this one for commits that fix formatting and linting errors
* **refactor** -
  use this type for adjustments to improve maintainability or performance
* **test** - use this one for commits that add new tests


## Commits

Please commit your changes frequently in small logical chunks that are
consistent, work independently of any later commits, and pass the linter as well
as the test suite. Doing so eases rollback and rebase operations.

You should also follow our commit message formatting rules, as they provide a
framework to write explicit messages that are easy to comprehend when looking
through the project history and enable automatic change log generation.

These Guidelines were written based on
[AngularJS Git Commit Message Conventions](https://goo.gl/27wkkO).

### Commit-Message

Each commit message should consist of a header (type, scope, subject), a body
and a footer separated by empty lines:

```
<type>(<scope>): <subject>

<message>

<footer>
```

Any line of the commit message must not be longer than 100 characters to ensure
that the messages are easy to read.

### Subject

The subject contains a succinct description of the change. It should use the
imperative and present tense; “change” not “changed” nor “changes”.
Don't capitalize the first letter, and don't end it with a dot.

### Type

The following commit types are allowed:

* **feat** -
  use this type for commits that introduce a new features or capabilities
* **fix** - use this one for bug fixes
* **perf** - use this type for performance improvements
* **docs** - use this one to indicate documentation adjustments and improvements
* **chore** - use this type for _maintainance_ commits e.g. removing old files
* **style** - use this one for commits that fix formatting and linting errors
* **refactor** -
  use this type for adjustments to improve maintainability or performance
* **test** - use this one for commits that add new tests

### Scope

The scope should specify the place of the committed change.
Use the _class_, component, or filename if you only touched one "file",
otherwise use the page, module or package name.
Please don't list changed files and be as specific as possible.

### Message

The message includes motivation for the change and contrasts with previous
behavior. It should use the imperative and present tense.

### Referencing Issues

Closed issues should be listed on a separate line in the footer prefixed with
"Closes" keyword.

### Breaking Changes

All breaking changes have to be mentioned in the footer with the description of
the change, justification and migration notes. Start the block explaining the
breaking changes with the words `BREAKING CHANGE:` followed by a space.

### Examples

```
fix(AwesomeComponent): remove console log statements

Remove log statements to prevent IE4 errors.

Closes ACME-123, ACME-456
```

```
refactor(*): change constant names

Adjust constant names, following the new naming conventions.

Closes ACME-123
```

```
refactor(VideoPlayer): simplify control interface

Simplify the VideoPlayer control interface as the current
interface is somewhat hard to use and caused bugs due
to accidental misuse.

BREAKING CHANGE: VideoPlayer control interface has changed
to simplify the general usage.

To migrate the code follow the example below:

Before:

VideoPlayer.prototype.stop({pause:true})

After:

VideoPlayer.prototype.pause()
```

### Working with ReactJS Components

To develop ReactJS Components and see the implications immediately in DC/OS UI, it is helpful to use [npm link](https://docs.npmjs.com/cli/link).

1. Run `npm run dist-src` in your `reactjs-components` directory.
2. Run `npm link` in your `reactjs-components` directory.
3. Run `npm link reactjs-components` in your `dcos-ui` directory.
4. Run `export REACTJS_COMPONENTS_LOCAL=true; npm start` to start the Webpack dev server with the proper configuration variable.
5. After any changes are made to `reactjs-components`, run `npm run dist-src` in the `reactjs-components` directory.
