import { MeshWallet } from '@meshsdk/core';
import {Args, Flags} from '@oclif/core'
import { existsSync, writeFileSync } from "node:fs"
import { open, writeFile } from 'node:fs/promises'

import {BaseCommand} from "../utils/base-command.js"

export default class GenerateCredentials extends BaseCommand {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }

  static override description = 'describe the command here'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(GenerateCredentials)

    const name = flags.name ?? 'creds'

    if (existsSync(name) && !flags.force ) {
      throw new Error("Credentials file already exists")
    }

    const fileHandle = await open(name, "w")

    const seedPhrase = (MeshWallet.brew(false) as string[]).join(' ')

    await writeFile(fileHandle, seedPhrase)

    const wallet = new MeshWallet(
      { key: {
        type: "mnemonic", words: seedPhrase.split(' ')
      }, networkId: flags.cardanoNetwork === 'mainnet'? 1: 0}
    )

    writeFileSync(`${name}.addr`, wallet.getUnusedAddresses()[0])

    this.log(`(${flags.cardanoNetwork} - ${flags.cardanoNetwork === 'mainnet'? 0: 1}) Credentials saved into ${name}. Address: ${wallet.getUnusedAddresses()[0]}`)

  }
}
