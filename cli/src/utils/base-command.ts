import {Command, Flags} from '@oclif/core'

export abstract class BaseCommand extends Command {
  static baseFlags = {
    cardanoNetwork: Flags.option({
      char: 'c',
      default: 'preprod',
      description: 'Cardano Network',
      helpGroup: 'GLOBAL',
      options: ['mainnet', 'preprod', 'preview', 'custom'] as const,
    })(),
    interactive: Flags.boolean({
      char: 'i',
      description: 'Run command in interactive mode',
      // Show this flag under a separate GLOBAL section in help.
      helpGroup: 'GLOBAL',
    }),
    // flag with a value (-n, --name=VALUE)
    name: Flags.file({char: 'n', description: 'Credential File', helpGroup: 'GLOBAL',
      required: true,}),
  }
}
