import { Network } from "@lucid-evolution/lucid";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";

import { details } from "../lib/constants";
import {
    Lucid,
    Blockfrost,
    WalletApi,
    Data,
    Constr,
} from "@lucid-evolution/lucid";

import plutus from "../../plutus.json";
import {
    AssetExtended,
    deserializeDatum,
    PlutusScript,
    applyParamsToScript,
    resolvePlutusScriptAddress,
} from "@meshsdk/core";

const v = plutus.validators.find(
    (v: any) => v.title === "toke_control.toke_contract.spend"
)!;
const mintValidator = plutus.validators.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (v: any) => v.title === "toke_mint.toke_mint.mint"
)!;

const ALL_NETWORKS = [
    "Mainnet" as Network,
    "Preview" as Network,
    "Preprod" as Network,
    "Custom" as Network,
];

export default function Burn() {
    const { connected, wallet } = useWallet();
    const [loading, setLoading] = useState<boolean>(false);
    const [apiKey, setApiKey] = useState<string>("");
    const [tokensToBurn, setTokensToBurn] = useState<number>(0);
    const [network, setNetwork] = useState<Network>("Preprod");
    const [error, setError] = useState<Error>();
    const [assets, setAssets] = useState<AssetExtended[]>([]);

    async function burnAssets() {
        if (!connected) return;
        if (!wallet) return;

        try {
            setLoading(true);
            const bf = new Blockfrost(
                `https://cardano-${network}.blockfrost.io/api/v0`,
                apiKey
            );
            const lucid = await Lucid(bf, network, {});

            lucid.selectWallet.fromAPI(
                wallet._walletInstance as unknown as WalletApi
            );

            const mintScriptString = applyParamsToScript(mintValidator.compiledCode, [
                details.ctrlPolicy,
                details.ctrlAsset,
            ]);
            const controlScriptString = applyParamsToScript(v.compiledCode, [
                details.mgmtPkh,
                // TOKE
                details.tokePolicy,
                details.tokeAsset,
                // Control Token - Thread Token
                details.ctrlPolicy,
                details.ctrlAsset,
            ]);

            const networkId = network === "Mainnet" ? 1 : 0;

            const script = {
                code: controlScriptString,
                version: "V3",
            } satisfies PlutusScript;

            const controlScriptAddress = resolvePlutusScriptAddress(
                script,
                networkId
            );
            const scriptUtxos = await lucid.utxosAt(controlScriptAddress);
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

            const postBurnMax = (datum.fields[0].int - tokensToBurn).toString();
            const postBurnMinted = (datum.fields[1].int - tokensToBurn).toString();

            // D87A80 d87a80
            const redeemer = Data.to(new Constr(1, []));

            console.log("Redeemer", redeemer);

            const mintingRedeemer = Data.to(new Constr(0, []));

            const outputDatum = Data.to(
                new Constr(0, [BigInt(postBurnMax), BigInt(postBurnMinted)])
            );

            const walletAddress = (await wallet.getUsedAddress()).toBech32();
            const walletUTxOs = await wallet.getUtxos();
            const collateral = walletUTxOs.find(
                (utxo) => utxo.output.amount.length === 1
            );

            let mintAsset: Record<string, bigint> = {};

            mintAsset[`${details.tokePolicy}${details.tokeAsset}`] = BigInt(
                (tokensToBurn * -1).toString()
            );

            const txn = await lucid
                .newTx()
                .collectFrom(scriptUtxos, redeemer)
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
                .complete({
                    changeAddress: walletAddress,
                    localUPLCEval: false,
                    setCollateral: BigInt(5_000_000)
                });
            const signed = await txn.sign.withWallet().complete();

            const txHash = await wallet.submitTx(signed.toCBOR());

            console.log(txHash);
            alert(txHash);
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(e);
                return;
            }

            setError(new Error("Unknown Error"));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!connected) return;
        async function getWalletAssets() {
            if (!wallet) return;
            const assets = await wallet.getAssets();

            const policyId = network === "Mainnet" ? "" : details.tokePolicy;

            setAssets(assets.filter((asset) => asset.policyId === policyId));
        }
        setLoading(true);

        getWalletAssets().finally(() => setLoading(false));
    }, [connected, wallet]);

    return (
        <div className='flex flex-col w-screen h-screen justify-center items-center text-black bg-blue-500'>
            <CardanoWallet />
            {assets.map((asset) => {
                return <div>Toke: {asset.quantity}</div>;
            })}

            {assets.length > 0 ? (
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
                                value={tokensToBurn}
                                onChange={(e) =>
                                    setTokensToBurn(Number.parseInt(e.currentTarget.value))
                                }
                            />
                        </div>
                        {loading ? (
                            <div>Loading</div>
                        ) : (
                            <button
                                type='button'
                                onClick={() => burnAssets()}
                                disabled={loading}
                                style={{
                                    margin: "8px",
                                    backgroundColor: loading ? "orange" : "grey",
                                }}
                            >
                                Burn Assets
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
            ) : (
                <></>
            )}
        </div>
    );
}
