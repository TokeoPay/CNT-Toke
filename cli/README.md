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
- [toke-cli](#toke-cli)
- [Usage](#usage)
- [Commands](#commands)
  - [`toke-cli generate-credentials -n <output-file> -c <network>`](#toke-cli-generate-credentials--n-output-file--c-network)
  - [`toke-cli generate-policies`](#toke-cli-generate-policies)
  - [`toke-cli mint-initial`](#toke-cli-mint-initial)
  - [`toke-cli generate-miltisig-wallet`](#toke-cli-generate-miltisig-wallet)
  - [`toke-cli help [COMMAND]`](#toke-cli-help-command)

## `toke-cli generate-credentials -n <output-file> -c <network>`

Create a new Seed Phrase and Wallet Address.

USAGE
  $ toke-cli generate-credentials

## `toke-cli generate-policies`

Print out the polices - this is based upon a single UTxO (which would be have to be spent when performing the actual mint)

```
  $ toke-cli generate-policies -p <Path to Akien Compile File> <UTxO Reference> -n <Path to Credentials File> -c <Network> -b <Blockfrost API Key>
  $ toke-cli generate-policies -p ../plutus.json 3485b69c34eaa4f5ca6ecf738882a747f1f33c427a660186d281d11186580672.1 -n ../.private/creds -c preprod -b $BF_API
```


## `toke-cli mint-initial`

Mint the Authority Token (Thread Token) into the Authority Contract.

```
  $ toke-cli mint-initial -p <Path to Akien Compile File> <UTxO Reference> -n <Path to Credentials File> -c <Network> -b <Blockfrost API Key>
  $ toke-cli mint-initial -p ../plutus.json 3485b69c34eaa4f5ca6ecf738882a747f1f33c427a660186d281d11186580672.1 -n ../.private/creds -c preprod -b $BF_API
```

## `toke-cli generate-miltisig-wallet`

Mint the Authority Token (Thread Token) into the Authority Contract.

```
  $ toke-cli generate-miltisig-wallet [-k <PKH>] -s <PKH>
  $ toke-cli generate-miltisig-wallet -k d006eb7783e8c93160b2bab287bc8a6f069e9e690cd82bc0b52a8c31 -k d006eb7783e8c93160b2bab287bc8a6f069e9e690cd82bc0b52a8c31 -s 730d805b6a2cf67998f0fcd070ce0b6e85957fd758cf0ae348d265eb
```

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

<!-- commandsstop -->
