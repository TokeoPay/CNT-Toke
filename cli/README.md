toke-cli
=================

A new CLI generated with oclif


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/toke-cli.svg)](https://npmjs.org/package/toke-cli)
[![Downloads/week](https://img.shields.io/npm/dw/toke-cli.svg)](https://npmjs.org/package/toke-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g toke-cli
$ toke-cli COMMAND
running command...
$ toke-cli (--version)
toke-cli/0.0.0 darwin-x64 node-v20.11.0
$ toke-cli --help [COMMAND]
USAGE
  $ toke-cli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`toke-cli hello PERSON`](#toke-cli-hello-person)
* [`toke-cli hello world`](#toke-cli-hello-world)
* [`toke-cli help [COMMAND]`](#toke-cli-help-command)
* [`toke-cli plugins`](#toke-cli-plugins)
* [`toke-cli plugins add PLUGIN`](#toke-cli-plugins-add-plugin)
* [`toke-cli plugins:inspect PLUGIN...`](#toke-cli-pluginsinspect-plugin)
* [`toke-cli plugins install PLUGIN`](#toke-cli-plugins-install-plugin)
* [`toke-cli plugins link PATH`](#toke-cli-plugins-link-path)
* [`toke-cli plugins remove [PLUGIN]`](#toke-cli-plugins-remove-plugin)
* [`toke-cli plugins reset`](#toke-cli-plugins-reset)
* [`toke-cli plugins uninstall [PLUGIN]`](#toke-cli-plugins-uninstall-plugin)
* [`toke-cli plugins unlink [PLUGIN]`](#toke-cli-plugins-unlink-plugin)
* [`toke-cli plugins update`](#toke-cli-plugins-update)

## `toke-cli hello PERSON`

Say hello

```
USAGE
  $ toke-cli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ toke-cli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/toke/toke-cli/blob/v0.0.0/src/commands/hello/index.ts)_

## `toke-cli hello world`

Say hello world

```
USAGE
  $ toke-cli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ toke-cli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/toke/toke-cli/blob/v0.0.0/src/commands/hello/world.ts)_

## `toke-cli help [COMMAND]`

Display help for toke-cli.

```
USAGE
  $ toke-cli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for toke-cli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.16/src/commands/help.ts)_

## `toke-cli plugins`

List installed plugins.

```
USAGE
  $ toke-cli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ toke-cli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/index.ts)_

## `toke-cli plugins add PLUGIN`

Installs a plugin into toke-cli.

```
USAGE
  $ toke-cli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into toke-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the TOKE_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the TOKE_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ toke-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ toke-cli plugins add myplugin

  Install a plugin from a github url.

    $ toke-cli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ toke-cli plugins add someuser/someplugin
```

## `toke-cli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ toke-cli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ toke-cli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/inspect.ts)_

## `toke-cli plugins install PLUGIN`

Installs a plugin into toke-cli.

```
USAGE
  $ toke-cli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into toke-cli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the TOKE_CLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the TOKE_CLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ toke-cli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ toke-cli plugins install myplugin

  Install a plugin from a github url.

    $ toke-cli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ toke-cli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/install.ts)_

## `toke-cli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ toke-cli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ toke-cli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/link.ts)_

## `toke-cli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ toke-cli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ toke-cli plugins unlink
  $ toke-cli plugins remove

EXAMPLES
  $ toke-cli plugins remove myplugin
```

## `toke-cli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ toke-cli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/reset.ts)_

## `toke-cli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ toke-cli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ toke-cli plugins unlink
  $ toke-cli plugins remove

EXAMPLES
  $ toke-cli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/uninstall.ts)_

## `toke-cli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ toke-cli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ toke-cli plugins unlink
  $ toke-cli plugins remove

EXAMPLES
  $ toke-cli plugins unlink myplugin
```

## `toke-cli plugins update`

Update installed plugins.

```
USAGE
  $ toke-cli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/update.ts)_
<!-- commandsstop -->
