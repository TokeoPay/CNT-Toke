import localFont from "next/font/local";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";
import {
  applyParamsToScript,
  AssetExtended,
  BlockfrostProvider,
  deserializeDatum,
  Network,
  PlutusScript,
  resolvePlutusScriptAddress,
  resolvePlutusScriptHash,
} from "@meshsdk/core";

import {
  Lucid,
  Blockfrost,
  WalletApi,
  Data,
  Constr,
} from "@lucid-evolution/lucid";

import plutus from "../../plutus.json";
import { details } from "../lib/constants";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const ALL_NETWORKS = ["testnet", "preview", "preprod", "mainnet"] as const;

const v = plutus.validators.find(
  (v: any) => v.title === "toke_control.toke_contract.spend"
)!;
const mintValidator = plutus.validators.find(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (v: any) => v.title === "toke_mint.toke_mint.mint"
)!;

export default function Home() {
  const { connected, wallet } = useWallet();
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [tokensToMint, setTokensToMint] = useState<number>(0);
  const [network, setNetwork] = useState<Network>("preprod");
  const [error, setError] = useState<Error>();

  async function mintAssets() {
    if (wallet) {
      try {
        setLoading(true);

        const bf = new Blockfrost(
          `https://cardano-${network}.blockfrost.io/api/v0`,
          apiKey
        );
        const lucid = await Lucid(
          bf,
          network === "mainnet"
            ? "Mainnet"
            : network === "preprod"
            ? "Preprod"
            : "Preview",
          {}
        );

        lucid.selectWallet.fromAPI(
          wallet._walletInstance as unknown as WalletApi
        );

        const bfApi = new BlockfrostProvider(apiKey);
        // {
        //   "managementPKH": "d006eb7783e8c93160b2bab287bc8a6f069e9e690cd82bc0b52a8c31",
        //   "tokePolicy": "8bbd7a32cb1ef18796180061ea85f1160e684e7252e120c60c9890bc",
        //   "tokeAsset": "544f4b45",
        //   "controlTokenHash": "832d689d66e83c902048173fc4dcd29e6bc2d0cce9e5eca12edc87d5",
        //   "ctrlAsset": "24746f6b655f6374726c"
        // }
        // const details = {
        //   managementAddress:
        //     "addr_test1qrgqd6mhs05vjvtqk2at9pau3fhsd857dyxds27qk54gcvtnpkq9k63v7eue3u8u6pcvuzmwsk2hl46ceu9wxjxjvh4sj4drgd",
        //   mgmtPkh: "d006eb7783e8c93160b2bab287bc8a6f069e9e690cd82bc0b52a8c31",
        //   ctrlPolicy:
        //     "8906a58aa4a01745ef7985e3f03f4a1baf5ce3ea43c2a55986ff629e",
        //   ctrlAsset: "24746f6b655f6374726c",
        //   tokePolicy:
        //     "dcd091f659bb7e785353ed9543c23b773217c7c3b703d329ba5c7f67",
        //   tokeAsset: "544f4b45",
        // };

        const mintScriptString = applyParamsToScript(
          mintValidator.compiledCode,
          [details.ctrlPolicy, details.ctrlAsset]
        );

        console.log(JSON.stringify(details, null, 2));

        const controlScriptString = applyParamsToScript(v.compiledCode, [
          details.mgmtPkh,
          // TOKE
          details.tokePolicy,
          details.tokeAsset,
          // Control Token - Thread Token
          details.ctrlPolicy,
          details.ctrlAsset,
        ]);

        console.log(controlScriptString);

        const networkId = network === "mainnet" ? 1 : 0;

        assert(
          resolvePlutusScriptHash(
            resolvePlutusScriptAddress(
              {
                code: mintScriptString,
                version: "V3",
              },
              networkId
            )
          ) === details.tokePolicy,
          "Calculated Mint Policy does not match that provided"
        );

        const script = {
          code: controlScriptString,
          version: "V3",
        } satisfies PlutusScript;

        const controlScriptAddress = resolvePlutusScriptAddress(
          script,
          networkId
        );

        console.log(controlScriptAddress);

        // const scriptUtxos = await bfApi.fetchAddressUTxOs(controlScriptAddress);

        const scriptUtxos = await lucid.utxosAt(controlScriptAddress);

        console.log("scriptUtxos", scriptUtxos);

        const ctrlUtxo = scriptUtxos.find(
          (utxo) => !!utxo.assets[`${details.ctrlPolicy}${details.ctrlAsset}`]
        );

        if (!ctrlUtxo || !ctrlUtxo.datum) {
          throw new Error(
            `No Control UTXO found at ${controlScriptAddress} - ${ctrlUtxo}`
          );
        }

        // { constructor: 0, fields: [ { int: 95000000 }, { int: 0 } ] }
        const datum = deserializeDatum(ctrlUtxo.datum) as unknown as {
          constructor: number;
          fields: [{ int: number }, { int: number }];
        };

        datum.fields[1].int = datum.fields[1].int + tokensToMint;

        if (datum.fields[1].int < 0) {
          throw new Error("Trying to mint oo many tokens");
        }

        // RedeemerBuilder
        const redeemer = Data.to(new Constr(0, []));
        const mintingRedeemer = Data.to(new Constr(0, []));

        // d8799f1a05a995c002ff
        const currentMax = datum.fields[0].int.toString();
        const currentMinted = datum.fields[1].int.toString();
        const outputDatum = Data.to(
          new Constr(0, [BigInt(currentMax), BigInt(currentMinted)])
        );

        console.log("Redeemer", deserializeDatum("D87980"));

        const walletAddress = (await wallet.getUsedAddress()).toBech32();
        const walletUTxOs = await wallet.getUtxos();

        const collateral = walletUTxOs.find(
          (utxo) => utxo.output.amount.length === 1
        );

        console.log("walletAddress", walletAddress);
        console.log("walletUTxOs", walletUTxOs);
        console.log("collateral", collateral);
        console.log("Datum In", deserializeDatum(ctrlUtxo.datum));

        if (!collateral) {
          throw new Error("No collateral - setup a UTxO with ADA only");
        }

        // Is signed by is_signed_by_treasuray

        assert(
          datum.fields[0].int == deserializeDatum(ctrlUtxo.datum).fields[0].int,
          "Total Available should not change"
        );
        assert(
          datum.fields[1].int ==
            deserializeDatum(ctrlUtxo.datum).fields[1].int + tokensToMint,
          "Must update the minted amount correctly"
        );

        try {
          let mintAsset: Record<string, bigint> = {};

          mintAsset[`${details.tokePolicy}${details.tokeAsset}`] = BigInt(
            tokensToMint.toString()
          );

          type TransactionMetadata =
            | string
            | number
            | Uint8Array
            | ReadonlyArray<TransactionMetadata>
            | {
                [key: string]: TransactionMetadata;
              };

          const mintMetadata: TransactionMetadata = {};
          const assetMetaData: TransactionMetadata = {
            ticker: "TOKE",
            name: "TOKE",
            desc: "",
            description: "",
            image: "",
            decimals: "0",
            website: "https://tokeopay.io",
            whitepaper: "https://tokeopay.io",
          };
          mintMetadata[details.tokePolicy] = { "544f4b45": assetMetaData };

          const txn = await lucid
            .newTx()
            .collectFrom(scriptUtxos, redeemer)
            .addSigner(details.managementAddress)
            .mintAssets(mintAsset, mintingRedeemer)
            .pay.ToContract(
              scriptUtxos[0].address,
              { kind: "inline", value: outputDatum },
              scriptUtxos[0].assets
            )
            .attach.SpendingValidator({
              type: "PlutusV3",
              script: controlScriptString,
            })
            .attach.MintingPolicy({
              type: "PlutusV3",
              script: mintScriptString,
            })
            .attachMetadata(20, {})
            .complete({
              changeAddress: walletAddress,
              localUPLCEval: true,
            });

          const signed = await txn.sign.withWallet().complete();

          const txHash = await wallet.submitTx(signed.toCBOR());

          console.log(txHash);
          alert(txHash);
        } catch (err) {
          // walletUTxOs.map(u => )

          console.error(err);

          throw err;
        }
      } catch (e) {
        if (e instanceof Error) {
          setError(e);
          return;
        }

        setError(new Error("Unknown Error"));
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className='flex flex-col w-screen h-screen justify-center items-center text-black bg-blue-500'>
      <CardanoWallet />
      {connected && (
        <>
          <div className='pt-6 flex flex-col gap-7 w-9/12'>
            <div className='grid grid-cols-2 gap-5'>
              <span>Network</span>
              <select
                onChange={(e) => setNetwork(e.currentTarget.value as Network)}
                defaultValue={network}
              >
                {ALL_NETWORKS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>

              <span>Blockfrost API Key</span>
              <input
                type='text'
                value={apiKey}
                onChange={(e) => setApiKey(e.currentTarget.value)}
              />

              <span>Number of Tokens to Mint</span>
              <input
                type='text'
                value={tokensToMint}
                onChange={(e) =>
                  setTokensToMint(Number.parseInt(e.currentTarget.value))
                }
              />
            </div>
            {loading ? (
              <div>Loading</div>
            ) : (
              <button
                type='button'
                onClick={() => mintAssets()}
                disabled={loading}
                style={{
                  margin: "8px",
                  backgroundColor: loading ? "orange" : "grey",
                }}
              >
                Mint Assets
              </button>
            )}
            {!!error ? (
              <span className='text-red-700 font-bold m-6 bg-red-950'>
                Error: {error.message}
              </span>
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </div>
  );
}
