import {NativeScript, serializeNativeScript} from '@meshsdk/core'
import {Command, Flags} from '@oclif/core'

export default class GenerateMiltisigWallet extends Command {
  static override args = {}

  static override description = 'Generate a MultiSig Wallet'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    keyHash: Flags.string({char: 'k', description: 'Provided Key Hash is Hex', multiple: true, required: true}),
    stakeHash: Flags.string({char: 's', description: 'Stake Key Hash'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(GenerateMiltisigWallet)

    const script: NativeScript = {
      scripts: flags.keyHash.map((kh) => ({
        keyHash: kh,
        type: 'sig',
      })),
      type: 'all',
    }

    const nativeScript = serializeNativeScript(script, flags.stakeHash)

    this.log('\n\n')
    this.log(`Address: ${JSON.stringify(nativeScript)}`)
    this.log('\n\n')
    this.log(JSON.stringify(script, null, 2))
  }
}
