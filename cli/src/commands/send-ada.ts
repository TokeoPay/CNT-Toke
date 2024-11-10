import {MeshTxBuilder, Network, conStr0, integer, largestFirst} from '@meshsdk/core'
import {Args, Flags} from '@oclif/core'
import {readFile} from 'node:fs/promises'

import {BaseCommand} from '../utils/base-command.js'
import {meshWallet} from '../utils/mesh.js'

export default class SendAda extends BaseCommand {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }

  static override description = 'describe the command here'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    bfApiKey: Flags.string({char: 'b', description: 'Blockfrost API Key', required: true}),
    file: Flags.file({char: 'p', default: './plutus.json', description: 'file to read'}),
    force: Flags.boolean({char: 'f'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(SendAda)
    const mnemonic = await readFile(flags.name)
    const networkId = flags.cardanoNetwork === 'mainnet' ? 1 : 0

    const [wallet, bf] = meshWallet(networkId, flags.bfApiKey, mnemonic.toString('utf8'))

    const utxos = await wallet.getUtxos()

    console.log('UTxOs?', utxos)

    const testAddr =
      'addr1q8uw0ttnh9wct2szmagvkfg5zunsmsr20huf2c9yvkg9uadxp5whwest7wev43cgq6gyv76ej6yj73wv23qh8l3qn3psvkm79v'
    const datum = conStr0([integer(95_000_000), integer(0)])

    const txBuilder = new MeshTxBuilder({
      evaluator: bf,
      fetcher: bf,
      submitter: bf,
      verbose: true,
    }).setNetwork(flags.cardanoNetwork as Network)

    for (const utxo of utxos) {
      txBuilder.txIn(utxo.input.txHash, utxo.input.outputIndex, utxo.output.amount, utxo.output.address)
    }

    const txn = await txBuilder
      .txOut(testAddr, [{quantity: '4000000', unit: 'lovelace'}])
      .txOutInlineDatumValue(datum, 'JSON')
      .changeAddress(wallet.getUsedAddresses()[0])
      .complete()

    const signedTx = wallet.signTx(txn, true)

    try {
      const txHashResult = await wallet.submitTx(signedTx)

      this.log('\n\n')
      this.log(`Submitted: ${txHashResult}`)
    } catch (error) {
      this.error(error as Error)
    }
  }
}
