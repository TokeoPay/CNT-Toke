import {PlutusScript, Transaction, applyParamsToScript, mOutputReference, resolvePlutusScriptAddress, resolvePlutusScriptHash} from '@meshsdk/core';
import {Args, Flags} from '@oclif/core'
import {readFile} from 'node:fs/promises'

import {BaseCommand} from '../utils/base-command.js'
import {meshWallet} from '../utils/mesh.js'


export default class MintInitial extends BaseCommand {
  static override args = {
    txOutRef: Args.string({description: "UTxO Reference to base the initial mint upon", required: true})
  }

  static override description = 'describe the command here'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    bfApiKey: Flags.string({char: 'b', description: 'Blockfrost API Key', required: true }),
    file: Flags.file({char: "p", default: "./plutus.json", description: 'file to read'}),
    force: Flags.boolean({char: 'f'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(MintInitial)
    const mnemonic = await readFile(flags.name)
    const networkId = flags.cardanoNetwork === 'mainnet'? 1: 0

    const [wallet, blockfrost] = meshWallet(networkId, flags.bfApiKey, mnemonic.toString("utf8"))
    
    const blueprint = JSON.parse((await readFile(flags.file)).toString("utf8"));
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validator = blueprint.validators.find((v: any) => v.title === "toke_initial_mint.toke_control_token_contract.mint")

    const {compiledCode} = validator

    const [txHash, index] = args.txOutRef.split('.')

    const result = applyParamsToScript(compiledCode, [mOutputReference(txHash, Number.parseInt(index, 10))])

    const script = {
      // eslint-disable-next-line import/no-named-as-default-member
      code: result,
      version: "V3",
    } satisfies PlutusScript;

    const utxos = await wallet.getUtxos();

    const mintUtxo = utxos.find((utxo => utxo.input.outputIndex === Number.parseInt(index, 10) && utxo.input.txHash === txHash))

    if (!mintUtxo) {
      throw new Error("Supplied Base UTxO is not in the wallet")
    }

    const redeemer = { data: { alternative: 0, fields: [] } }

    const txn = await new Transaction({fetcher: blockfrost, initiator: wallet})
      .setTxInputs([mintUtxo])
      .mintAsset(script, {
        assetName: "$toke_ctrl",
        assetQuantity: "1",
        recipient: {
          address: wallet.getUnusedAddresses()[0],
          // datum: {
          //   value: Data
          // }
        },
      }, redeemer
    ).build()

    const signedTx = wallet.signTx(txn, true)

    this.log("\n\n")
    this.log(txn)
    this.log("\n\n")
    this.log(signedTx)
    this.log("\n\n")
    this.log(`Control Token is: ${resolvePlutusScriptHash(resolvePlutusScriptAddress(script, networkId))}.${Buffer.from("$toke_ctrl").toString("hex")}`)

    try {
      const txHashResult = await wallet.submitTx(signedTx)
  
      this.log("\n\n")
      this.log(`Submitted: ${txHashResult}`)

    } catch (error) {
      this.error(error as Error)
    }

  }
}
