import {Args, Command, Flags} from '@oclif/core'

import {calcTokePolicy} from '../utils/calc-mint-policy.js'

// import {BaseCommand} from '../utils/base-command.js'

export default class GetTokePolicy extends Command {
  static override args = {
    policy: Args.string({description: 'Control Token Policy', required: true}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    cardanoNetwork: Flags.option({
      char: 'c',
      default: 'preprod',
      description: 'Cardano Network',
      helpGroup: 'GLOBAL',
      options: ['mainnet', 'preprod', 'preview', 'custom'] as const,
    })(),

    file: Flags.file({char: 'p', default: './plutus.json', description: 'file to read'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(GetTokePolicy)

    const networkId = flags.cardanoNetwork === 'mainnet' ? 1 : 0

    const {address, hash, script} = await calcTokePolicy(flags.file, args.policy, networkId)

    this.log(`Toke Token Policy will be: ${hash}.${Buffer.from('TOKE').toString('hex')}`)

    this.log(`Address: ${address}`)
    this.log(JSON.stringify(script))
  }
}
