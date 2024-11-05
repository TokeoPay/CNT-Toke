import { BlockfrostProvider, MeshWallet } from "@meshsdk/core"

export const meshWallet = (network: 0 | 1, blockfrostApiKey: string, key: string) => {

  const blockfrost = new BlockfrostProvider(blockfrostApiKey)

  const wallet = new MeshWallet({
    fetcher: blockfrost,
    key: {
      type: "mnemonic",
      words: key.split(' ')
    },
    networkId: network,
    submitter: blockfrost
  })

  return [wallet, blockfrost] as const

}