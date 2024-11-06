import {PlutusScript, applyParamsToScript, mOutputReference, resolvePlutusScriptAddress, resolvePlutusScriptHash} from '@meshsdk/core'
import {Args, Flags} from '@oclif/core'
import {readFile} from 'node:fs/promises'

import {BaseCommand} from '../utils/base-command.js'
import {calcTokePolicy} from '../utils/calc-mint-policy.js'
import {TOKE_TOKEN_NAME} from '../utils/toke-constants.js'

export default class GeneratePolicies extends BaseCommand {
  static override args = {
    txOutRef: Args.string({description: 'UTxO Reference to base the initial mint upon', required: true}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    bfApiKey: Flags.string({char: 'b', description: 'Blockfrost API Key', required: true}),
    file: Flags.file({char: 'p', default: './plutus.json', description: 'file to read'}),
    force: Flags.boolean({char: 'f'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(GeneratePolicies)

    const networkId = flags.cardanoNetwork === 'mainnet' ? 1 : 0

    const blueprint = JSON.parse((await readFile(flags.file)).toString('utf8'))
    const validator = blueprint.validators.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => v.title === 'toke_initial_mint.toke_control_token_contract.mint',
    )

    const {compiledCode} = validator

    const [txHash, index] = args.txOutRef.split('.')

    const result = applyParamsToScript(compiledCode, [mOutputReference(txHash, Number.parseInt(index, 10))])

    const script = {
      code: result,
      version: 'V3',
    } satisfies PlutusScript

    const controlTokenHash = resolvePlutusScriptHash(resolvePlutusScriptAddress(script, networkId))

    const {hash: tokePolicy} = await calcTokePolicy(flags.file, controlTokenHash, networkId)

    this.log(`
      With UTxO: ${txHash}.${index}.
      Authority Token Policy: ${controlTokenHash}
      TOKE Token Policy: ${tokePolicy}
      TOKE Token Name: ${TOKE_TOKEN_NAME} (${Buffer.from(TOKE_TOKEN_NAME).toString('hex')})
      `)
  }
}
