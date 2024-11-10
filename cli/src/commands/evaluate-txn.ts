/* eslint-disable perfectionist/sort-objects */
import {Args, Flags} from '@oclif/core'

import {BaseCommand} from '../utils/base-command.js'

export default class EvaluateTxn extends BaseCommand {
  static override args = {
    txn: Args.string({description: 'Transaction to evaluate', required: true}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({char: 'n', description: 'name to print'}),
    ogmiosApi: Flags.string({char: 'a', required: true}),
    ogmiosUrl: Flags.string({char: 'u', required: true}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(EvaluateTxn)

    const res = await fetch(flags.ogmiosUrl, {
      method: 'POST',
      headers: {
        'dmtr-api-key': flags.ogmiosApi,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'evaluateTransaction',
        params: {transaction: {cbor: args.txn}},
      }),
    })

    console.log(res)
  }
}
