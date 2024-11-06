/* eslint-disable perfectionist/sort-objects */
import {
  MeshTxBuilder,
  Network,
  PlutusScript,
  applyParamsToScript,
  conStr0,
  deserializeAddress,
  integer,
  list,
  mConStr0,
  mOutputReference,
  pubKeyHash,
  resolvePlutusScriptAddress,
  resolvePlutusScriptHash,
} from '@meshsdk/core'
import {Args, Flags} from '@oclif/core'
import {readFile} from 'node:fs/promises'

import {BaseCommand} from '../utils/base-command.js'
import {calcTokePolicy} from '../utils/calc-mint-policy.js'
import {meshWallet} from '../utils/mesh.js'

export default class MintInitial extends BaseCommand {
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
    const {args, flags} = await this.parse(MintInitial)
    const mnemonic = await readFile(flags.name)
    const networkId = flags.cardanoNetwork === 'mainnet' ? 1 : 0

    const [wallet, bf] = meshWallet(networkId, flags.bfApiKey, mnemonic.toString('utf8'))

    const blueprint = JSON.parse((await readFile(flags.file)).toString('utf8'))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const controlValidator = blueprint.validators.find((v: any) => v.title === 'toke_control.toke_contract.spend')
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

    const mgmtAddr = deserializeAddress(
      'addr1qxlk4expdpk5eg40xen5rr3h7vcxf47v8ecj6nnlwrrymzhpmvvw5j5mhlus644494mwgr2qvejrja92dymkhvnrpn4qjchtv4',
    )

    const managementPKH = mgmtAddr.pubKeyHash

    const {hash: tokePolicy} = await calcTokePolicy(flags.file, controlTokenHash, networkId)

    this.logJson([
      managementPKH,
      // Control Token - Thread Token
      controlTokenHash,
      Buffer.from('$toke_ctrl').toString('hex'),
      // TOKE
      tokePolicy,
      Buffer.from('TOKE').toString('hex'),
    ])

    const controlScriptString = applyParamsToScript(controlValidator.compiledCode, [
      managementPKH,
      // Control Token - Thread Token
      controlTokenHash,
      Buffer.from('$toke_ctrl').toString('hex'),
      // TOKE
      tokePolicy,
      'TOKE',
    ])

    const controlScript = {
      code: controlScriptString,
      version: 'V2',
    } satisfies PlutusScript

    const controlAddress = resolvePlutusScriptAddress(controlScript, networkId)

    const utxos = await wallet.getUtxos()

    const mintUtxo = utxos.find(
      (utxo) => utxo.input.outputIndex === Number.parseInt(index, 10) && utxo.input.txHash === txHash,
    )

    if (!mintUtxo) {
      throw new Error('Supplied Base UTxO is not in the wallet')
    }

    const redeemer = {
      alternative: 0,
      fields: [],
    }

    const datum = conStr0([integer(95_000_000), integer(95_000_000), integer(0), list([pubKeyHash(managementPKH)])])

    const txn = await new MeshTxBuilder({
      fetcher: bf,
      submitter: bf,
      evaluator: bf,
      verbose: true,
    })
      .setNetwork(flags.cardanoNetwork as Network)
      .txIn(mintUtxo.input.txHash, mintUtxo.input.outputIndex, mintUtxo.output.amount)
      .mintPlutusScript('V3')
      .mint('1', controlTokenHash, Buffer.from('$toke_ctrl').toString('hex'))
      .mintingScript(script.code)
      .mintRedeemerValue(redeemer)
      .txOut(controlAddress, [{unit: controlTokenHash + Buffer.from('$toke_ctrl').toString('hex'), quantity: '1'}])
      .txOutInlineDatumValue(datum, 'JSON')
      .changeAddress(wallet.getUnusedAddresses()[0])
      .txInCollateral(mintUtxo.input.txHash, mintUtxo.input.outputIndex, mintUtxo.output.amount)
      .selectUtxosFrom(utxos)
      .complete()

    // const signedTx = wallet.signTx(txn, true)

    // this.log('\n\n')
    this.log(txn)
    // this.log('\n\n')
    // this.log(signedTx)
    // this.log('\n\n')
    // this.log(
    //   `Control Token is: ${resolvePlutusScriptHash(resolvePlutusScriptAddress(script, networkId))}.${Buffer.from(
    //     '$toke_ctrl',
    //   ).toString('hex')}`,
    // )

    // try {
    //   const txHashResult = await wallet.submitTx(signedTx)

    //   this.log('\n\n')
    //   this.log(`Submitted: ${txHashResult}`)
    // } catch (error) {
    //   this.error(error as Error)
    // }
  }
}
