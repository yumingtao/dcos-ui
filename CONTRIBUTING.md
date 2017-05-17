# Contributing

## Indice
- [Commits](#commits)
  - [Commit Message](#commit-message)
  - [Subject](#subjet)
  - [Type](#type)
  - [Scope](#scope)
  - [Message](#message)
  - [Referencing Issues](#referencing-issues)
  - [Breaking Changes](#breaking-changes)
  - [Examples](#examples)
- [Tests](#test)
- [ReactJS Components](#reactjs-components)
- [i18n](#i18n)
  - [Translation IDs](#translation-ids)
  - [Translation Strings](#translation-strings)
  - [New Translation files](#new-translation-files)

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

#### Subject

The subject contains a succinct description of the change. It should use the
imperative and present tense; “change” not “changed” nor “changes”.
Don't capitalize the first letter, and don't end it with a dot.

#### Type

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

#### Scope

The scope should specify the place of the committed change.
Use the _class_, component, or filename if you only touched one "file",
otherwise use the page, module or package name.
Please don't list changed files and be as specific as possible.

#### Message

The message includes motivation for the change and contrasts with previous
behavior. It should use the imperative and present tense.

#### Referencing Issues

Closed issues should be listed on a separate line in the footer prefixed with
"Closes" keyword.

#### Breaking Changes

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

## Adding npm Package Dependencies

If you want to add a new npm package to 'node_modules' you will need to `--save-exact`:

1. Install the new package
  * The command below will install and save dependencies in `package.json`

    ```
    npm install [your package] --save --save-exact
    ```

  * Then, (if needed) add the package to devDependencies

    ```
    npm install [your package] --save-dev --save-exact
    ```

2. Create a synced npm-shrinkwrap.json with devDependencies included by running

    ```
    npm run shrinkwrap
    ```

We have a fixShrinkwrap script wich runs when you run `npm run shrinkwrap`, which takes care of the extra fsevents. You only need to manually remove it if shrinkwrap runs automatically. <br>
For more info https://github.com/npm/npm/issues/2679

3. Commit to repository

## Tests

When submitting code to dcos-ui, please make sure that all needed tests are included. 

#### Example 1
When testing a simple Counter Component, you should test that the counter increases a *given number*, not that after initiating and increasing once the *value equals 1*. 

```
class Counter {
  constructor() {
  	this.count = 0
  }
  tick() {
  	return this.count++
  }
  get() {
  	return this.count
  }
}
```

To test it, your could write tests like these

```
// make sure after inialising, the counter is 0
var counter = new Counter(), count = counter.get();
expectEqual(count, 0);

// make sure after ticking, the counter is increased:
var counter = new Counter(), count = counter.get();
counter.tick()
expectEqual(counter.get(), count+1);
```

Now image you need to extend your counter that it is able to start at every given number, you will change your constructor like so:

```
constructor(count = 0) {
  this.count = count
}
```

Now the first test above has to be changed completely, because it was assuming your counter starts at 0. 
The second one is still valid because it didnt assume, that after ticking, the counter equals 1.
Your could change your first test like so:

```
// make sure after inialising with given number, the counter is correct
var number = 0; counter = new Counter(0);
expectEqual(counter.get(), number);
```
Using TDD currectly you are able to find these caveats before even writing a single line of code. when writing your tests, image what could possibly change on your component and how it would affect your tests and component. 

#### Example 2
Speaking of TDD, some BDD techniques can also be applied to Unit tests.
You can imagine your Unit as a Feature and your Methods can be tested via Scenarios. 

Imagine you are asked to write the Counter Component mentioned above, but you dont have started to write your code yet. What does a counter do? What could a user want from it? Shouldnt it also be able to count down? how much more programming effort would it be to implement that? What *exactly* is a Counter and what should be archived by using it? Theses questions sound rather easy to answer, but just think about the narrative below, what do your want to be able to using a counter? simply counting numbers? (hint: no)

```
Feature: Counter Component
  As another Component
  I want to Count numbers up and down
  So that I am able to ... ?

Scenario: Initialisation w/o number
  Given I have a Counter Component
   When I initialize it w/o number
   Then Its getter should return its default

# using Scenario Outlines you are easily able to multiply your tests cases  
 
Scenario Outline: Initialisation with given number
  Given I have a Counter Component
   When I initialise it with <number>
   Then Its getter should return <number>

  Examples:
    | number |
    |  0     |
    |  1     |
    | -1     | 

# writing the following Scenario, you will realize that 1 is a declarative number, 
# it would be better to write "by a given number" which then also imples, 
# that your counter should also be able to increase by 2.

Scenario: Increasing Counter
  Given I have an initialised Counter
   When I increase it
   Then it should increase its value 1 

# having this in mind, you have a new scenario

Scenario Outline: Increasing Counter by given number
  Given I have an initialised Counter
   When I increase it by <number>
   Then it should have its value by <number>
   
  Examples:
    | number |
    |  0     |
    |  1     |
    | -1     |
    |  4     |
   
# now you most likely already know that you need a increaseBy(4) method, 
# but you already have written your 'Increase Counter' Scenario and you probably 
# also want an increase() method, so its completely okay to keep both, lets write the same for decreasing

Scenario: Decreasing Number
  Given I have an initialised Counter
   When I decrease it
   Then it should decrease its value by 1
   
Scenario Outline: Decreasing Counter by given number
  Given I have an initialised Counter
   When I decrease it by <number>
   Then it should have its value by <number>
   
  Examples:
    | number |
    |  0     |
    |  1     |
    | -1     |
    |  4     |

Scenario: resetting Counter to start value
  Given I have an initialized Counter
   When I reset it to start
   Then it should have its start value
   
# now the last thing to do is to test getter & setters, in order 
# to have a good documentation, it would be reasonable to write them down one
# but it should also be okay to group them

Scenario: testing getter and setter
  Given I have a Counter Component
   When I get/set values
   Then they should be get/set
```

After writing these Scenarios, it should be extremely easy to write your Code, your Counter Component could look like this:

```
class Counter {
  constructor(number) {
    this._start = number
    this._count = number
  }
  get start ()       { return this._start }
  get start (number) { this._start = number }
  get count ()       { return this._count }
  set count (number) { this._count = number }
  
  static defaultCounter() {
    return new Counter(0)
  }
  
  increaseBy(inc = 1) {
    this._count += inc;
  }
  increase() {
    this.increaseBy(1)
  }
  tick() {
    this.increaseBy(1)
  }
  
  decreaseBy(dec = 1) {
    this._count -= dec;
  }
  decrease() {
    this.decreaseBy(1)
  }
  
  reset() {
  	this.count(this.start())
  }
}  
```

### Unit Tests

When writing Unit Tests, make sure they test the correct *behaviour* of your code, not an *exact implementation*. 

### Integration Tests

Integration Tests always mock responses to ensure your have a consistent testing enviroment. Also 

## ReactJS Components

To develop ReactJS Components and see the implications immediately in DC/OS UI,
it is helpful to use [npm link](https://docs.npmjs.com/cli/link).

1. Run `npm run dist-src` in your `reactjs-components` directory.
2. Run `npm link` in your `reactjs-components` directory.
3. Run `npm link reactjs-components` in your `dcos-ui` directory.
4. Run `export REACTJS_COMPONENTS_LOCAL=true; npm start` to start the Webpack dev server with the proper configuration variable.
5. After any changes are made to `reactjs-components`, run `npm run dist-src` in the `reactjs-components` directory.

## Development Setup (Sublime Text Only)

1. Add the following to your Sublime Text User Settings:

  ```json
  {
    ...
    "rulers": [80], // lines no longer than 80 chars
    "tab_size": 2, // use two spaces for indentation
    "translate_tabs_to_spaces": true, // use spaces for indentation
    "ensure_newline_at_eof_on_save": true, // add newline on save
    "trim_trailing_white_space_on_save": true, // trim trailing white space on save
    "default_line_ending": "unix"
  }
  ```

2. Add Sublime-linter with jshint & jsxhint:

  * Installing SublimeLinter is straightforward using Sublime Package Manager, see [instructions](http://sublimelinter.readthedocs.org/en/latest/installation.html#installing-via-pc)
  * SublimeLinter-eslint needs a global eslint in your system, see [instructions](https://github.com/roadhump/SublimeLinter-eslint#sublimelinter-eslint)

3. Syntax Highlihgting for files containing JSX

  * Install Babel using Sublime Package Manager, see [instructions](https://github.com/babel/babel-sublime). From here you can decide to use Babel for all .js files. See their docs for that. If you don't want to do that, continue reading.
  * Installing ApplySyntax using Sublime Package Manager, see [instructions](https://github.com/facelessuser/ApplySyntax)
  * Open up the user configuration file for ApplySyntax: `Sublime Text` -> `Preferences` -> `Package Settings` -> `ApplySyntax` -> `Settings - User`
  * Replace the contents with this:

    ```json
    {
      // Put your custom syntax rules here:
      "syntaxes": [
        {
          "name": "Babel/JavaScript (Babel)",
          "rules": [
            {"first_line": "^\\/\\*\\*\\s@jsx\\sReact\\.DOM\\s\\*\\/"}
          ]
        }
      ]
    }
    ```

## i18n

DCOS UI uses [React-Intl](https://github.com/yahoo/react-intl) to enable i18n, please look at the documentation. Currently this project is only supporting `en-us` but planning to support more languages/locales in the future.

### translations ids

When adding a new translation ID make sure there's no existent translation with the same ID to avoiding duplicated translations.
If you find an existing translation ID, make sure that the ID is `prepended` with `COMMON`.

When creating a new **translation ID** please follow the convention/pattern bellow:

- Only uppercase.
- No special characters **BUT** dot (`.`) and underscore (`_`) to create hierarchy.
- No Numbers.
- Prepend `COMMON` when should be used in more places.
- Prepend the component name `FAKECOMPONENT` when should be specific translation to a component.

In theory you can add any string as value but avoid using markup at any cost.

A good example of translations:
```javascript
{
  "COMMON.SUMMARY": "Summary":
  "COMMON.STATUS": "Status",
  "DASHBOARD.HEALTH_LIST": "Component Health List",
}
```

### Translations strings

When formatting a string containing multiple pieces of logic and/or translation IDs you can follow the [documentation here](https://github.com/yahoo/react-intl/wiki/Components#string-formatting-components) where you can also work with plural strings
but if you are looking to compose a normal string with a plural string you can use the component [formattedPlural](https://github.com/yahoo/react-intl/wiki/Components#formattedplural).

Keep in mind that React-intl follows the React pattern where everything is a component that way making it easier to compose and reason about the application.

### New translation files

When adding a new translation file store in `src/js/translations` directory and give it a name based on the language code e.g `en-us` (United States) `en-ie` (Ireland).
