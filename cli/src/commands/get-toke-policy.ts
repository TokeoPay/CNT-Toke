import {PlutusScript, applyParamsToScript, resolvePlutusScriptAddress, resolvePlutusScriptHash} from '@meshsdk/core'
import {Args, Command, Flags} from '@oclif/core'
import {readFile} from 'node:fs/promises'

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
    const blueprint = JSON.parse((await readFile(flags.file)).toString('utf8'))

    const validator = blueprint.validators.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => v.title === 'toke_mint.toke_mint.mint',
    )

    const {compiledCode} = validator

    // this.log(policyId(args.policy).bytes)
    // assetName(Buffer.from('$toke_ctrl').toString('hex')),)

    const result = applyParamsToScript(compiledCode, [args.policy, Buffer.from('$toke_ctrl').toString('hex')])

    const script = {
      code: result,
      version: 'V3',
    } satisfies PlutusScript
    this.log(
      `Toke Token Policy will be: ${resolvePlutusScriptHash(
        resolvePlutusScriptAddress(script, networkId),
      )}.${Buffer.from('TOKE').toString('hex')}`,
    )
  }
}
