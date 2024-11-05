use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use aiken/interval.{empty}
use cardano/address.{from_verification_key}
use cardano/assets.{AssetName, PolicyId, from_asset, quantity_of}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}
use tx_util/builder.{
  add_asset_to_tx_output, add_signatory, add_tx_input, add_tx_output,
  build_txn_context, mint_assets, new_tx_output,
}

pub type MintAction {
  // To Mint:
  // 1. Must be signed my Treasury
  // 2. Total onchain must not exceed Max Supply (from Datum)
  // 3. Datum on-chain must be updated
  Minting

  // To Burn - non-recoverable action
  // 1. Anyone can burn
  // 2. Reduce the totalMinted and reduce totalSupply by the Burn amount
  Burning

  // To Migrate:
  // 1. Must be signed my Treasury
  // 2. Must be signed by a majority of Liquidity Providers (I think there are 5??)
  // 3. Somehow we need to ensure that we are Mapping the key Datum values over:
  //     i.e., Total Supply, Total Minted, Total Burnt etc
  // 
  // Contract 1    ----Migrate---> Contract 2
  // Control UTxO  
  // 
  Migrate
}

// BridgeOnRamp
// // Who knows - BTC -> Cardano
// BridgeOffRamp
// // Who knows - Cardano -> BTC
// BridgedBurn
// // BTC has burnt some tokens
// BridgeMint

// BTC has Minted some tokens

pub type TokeDatum {
  totalCardanoSupply: Int,
  xChainTotalSupply: Int,
  // Reduced only by a Burn
  xChainTotalMinted: Int,
  liquidityProviders: List<VerificationKeyHash>,
}

// ??? Do we want to Hard Code this into the Contract?

validator toke_contract(
  treasury: VerificationKeyHash,
  // Toke Token
  toke_policy: PolicyId,
  toke_asset_name: AssetName,
  // Thread Token Details
  toke_control_policy: PolicyId,
  toke_control_asset_name: AssetName,
) {
  spend(
    optional_datum: Option<TokeDatum>,
    redeemer: MintAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    let Transaction { extra_signatories, mint, outputs, .. } = self

    expect Some(datum) = optional_datum

    let is_signed_by_treasuray = list.has(extra_signatories, treasury)
    when redeemer is {
      Minting -> {
        // Ensure we have signed
        expect is_signed_by_treasuray
        let updatexTotalMinted =
          quantity_of(mint, toke_policy, toke_asset_name) + datum.xChainTotalMinted
        expect updatexTotalMinted <= datum.xChainTotalSupply

        // Ensure we are updating the Datum
        expect Some(control_output) =
          list.find(
            outputs,
            fn(output) {
              quantity_of(
                output.value,
                toke_control_policy,
                toke_control_asset_name,
              ) == 1
            },
          )

        expect Some(tx_input) =
          list.find(
            self.inputs,
            fn(input) { input.output_reference == own_ref },
          )

        // input.output_reference.transaction_id == own_ref.transaction_id &&
        // input.output_reference.output_index == own_ref.output_index
        expect control_output.address == tx_input.output.address

        let updated_datum =
          TokeDatum { ..datum, xChainTotalMinted: updatexTotalMinted }

        when control_output.datum is {
          InlineDatum(output_datum) ->
            if output_datum is TokeDatum {
              output_datum == updated_datum
            } else {
              trace @"output_datum is not TokeDatum": output_datum
              False
            }
          _ -> {
            trace @"output_datum is not InlineDatum?"
            False
          }
        }
      }

      Burning -> {
        let burntToken = quantity_of(mint, toke_policy, toke_asset_name)

        if burntToken >= 0 {
          False
        } else {
          let updated_datum =
            TokeDatum {
              ..datum,
              xChainTotalMinted: datum.xChainTotalMinted - burntToken,
            }
          //TODO: Reduct total supplies too!
          expect Some(control_output) =
            list.find(
              outputs,
              fn(output) {
                quantity_of(
                  output.value,
                  toke_control_policy,
                  toke_control_asset_name,
                ) == 1
              },
            )

          expect Some(tx_input) =
            list.find(
              self.inputs,
              fn(input) { input.output_reference == own_ref },
            )

          // input.output_reference.transaction_id == own_ref.transaction_id &&
          // input.output_reference.output_index == own_ref.output_index
          expect control_output.address == tx_input.output.address

          when control_output.datum is {
            InlineDatum(output_datum) ->
              if output_datum is TokeDatum {
                trace @"output_datum is TokeDatum": output_datum
                trace @"output_datum is TokeDatum": updated_datum
                output_datum == updated_datum
              } else {
                trace @"output_datum is not TokeDatum": output_datum
                False
              }
            _ -> {
              trace @"output_datum is not InlineDatum?"
              False
            }
          }
        }
      }

      // No need to check if output is consumed for burning
      Migrate ->
        list.all(
          datum.liquidityProviders,
          fn(sign) { list.has(extra_signatories, sign) },
        )
    }
    // BridgeOffRamp -> False
    // BridgeOnRamp -> False

    // BridgeMint -> is_signed_by_treasuray
    // BridgedBurn -> is_signed_by_treasuray
  }

  else(_ctx: ScriptContext) {
    fail @"unsupported purpose"
  }
}

const test_toke_policy =
  #"00000000000000000000000000000000000000000000000000000000"

const test_toke_control_policy =
  #"00000000000000000000000000000000000000000000000000000001"

const test_treasury_pkh =
  #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5"

test test_toke_contract_mint() {
  // let toke_output = from_asset(
  //       test_toke_policy,
  //       "$Toke",
  //       10,
  //     )

  let toke_control_output =
    from_asset(test_toke_control_policy, "$TokeControl", 1)

  let datum =
    TokeDatum {
      totalCardanoSupply: 100,
      xChainTotalSupply: 100,
      // Reduced only by a Burn
      xChainTotalMinted: 0,
      liquidityProviders: [],
    }
  let datum_after =
    TokeDatum {
      totalCardanoSupply: 100,
      xChainTotalSupply: 100,
      // Reduced only by a Burn
      xChainTotalMinted: 10,
      liquidityProviders: [],
    }
  let tx_out =
    new_tx_output(
      from_verification_key(
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ),
      1_500_000,
      InlineDatum(datum_after),
    )
      |> add_asset_to_tx_output(toke_control_output)

  let tx_out_control =
    new_tx_output(
      from_verification_key(
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ),
      1_500_000,
      NoDatum,
    )
      |> add_asset_to_tx_output(toke_control_output)

  let a_utxo = OutputReference { transaction_id: "", output_index: 0 }

  let txn =
    empty
      |> build_txn_context()
      |> mint_assets(test_toke_policy, from_asset(test_toke_policy, "$Toke", 10))
      |> add_tx_output(tx_out)
      |> add_tx_input(Input { output_reference: a_utxo, output: tx_out_control })
      |> add_signatory(test_treasury_pkh)

  let redeemer = Minting

  toke_contract.spend(
    test_treasury_pkh,
    test_toke_policy,
    "$Toke",
    test_toke_control_policy,
    "$TokeControl",
    Some(datum),
    redeemer,
    a_utxo,
    txn.transaction,
  )
}

test test_toke_contract_mint_blocked2() fail {
  let datum =
    TokeDatum {
      totalCardanoSupply: 100,
      xChainTotalSupply: 100,
      // Reduced only by a Burn
      xChainTotalMinted: 0,
      liquidityProviders: [],
    }

  let redeemer = Minting

  let a_utxo = OutputReference { transaction_id: "", output_index: 0 }

  let mintOutput =
    Output {
      address: from_verification_key(
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ),
      value: from_asset(
        #"00000000000000000000000000000000000000000000000000000001",
        "$TokeControl",
        1,
      ),
      datum: InlineDatum(
        TokeDatum {
          totalCardanoSupply: 100,
          xChainTotalSupply: 100,
          // Reduced only by a Burn
          xChainTotalMinted: 18,
          liquidityProviders: [],
        },
      ),
      reference_script: None,
    }

  let txn =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ],
      mint: from_asset(
        #"00000000000000000000000000000000000000000000000000000000",
        "$Toke",
        20,
      ),
      outputs: [mintOutput],
    }
  toke_contract.spend(
    #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
    #"00000000000000000000000000000000000000000000000000000000",
    "$Toke",
    #"00000000000000000000000000000000000000000000000000000001",
    "$TokeControl",
    Some(datum),
    redeemer,
    a_utxo,
    txn,
  )
}

test test_toke_contract_mint_blocked() fail {
  let datum =
    TokeDatum {
      totalCardanoSupply: 100,
      xChainTotalSupply: 100,
      // Reduced only by a Burn
      xChainTotalMinted: 0,
      liquidityProviders: [],
    }

  let redeemer = Minting

  let a_utxo = OutputReference { transaction_id: "", output_index: 0 }

  let mintOutput =
    Output {
      address: from_verification_key(
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ),
      value: from_asset(
        #"00000000000000000000000000000000000000000000000000000001",
        "$TokeControl",
        1,
      ),
      datum: InlineDatum(
        TokeDatum {
          totalCardanoSupply: 100,
          xChainTotalSupply: 100,
          // Reduced only by a Burn
          xChainTotalMinted: 101,
          liquidityProviders: [],
        },
      ),
      reference_script: None,
    }

  let txn =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ],
      mint: from_asset(
        #"00000000000000000000000000000000000000000000000000000000",
        "$Toke",
        101,
      ),
      outputs: [mintOutput],
    }
  toke_contract.spend(
    #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
    #"00000000000000000000000000000000000000000000000000000000",
    "$Toke",
    #"00000000000000000000000000000000000000000000000000000001",
    "$TokeControl",
    Some(datum),
    redeemer,
    a_utxo,
    txn,
  )
}

test test_toke_contract_mint_blocked_not_thread_token() fail {
  let datum =
    TokeDatum {
      totalCardanoSupply: 100,
      xChainTotalSupply: 100,
      // Reduced only by a Burn
      xChainTotalMinted: 0,
      liquidityProviders: [],
    }

  let redeemer = Minting

  let a_utxo = OutputReference { transaction_id: "", output_index: 0 }

  let mintOutput =
    Output {
      address: from_verification_key(
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ),
      value: from_asset(
        #"00000000000000000000000000000000000000000000000000000002",
        "$TokeControl",
        1,
      ),
      datum: InlineDatum(
        TokeDatum {
          totalCardanoSupply: 100,
          xChainTotalSupply: 100,
          // Reduced only by a Burn
          xChainTotalMinted: 10,
          liquidityProviders: [],
        },
      ),
      reference_script: None,
    }

  let txn =
    Transaction {
      ..transaction.placeholder,
      extra_signatories: [
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ],
      mint: from_asset(
        #"00000000000000000000000000000000000000000000000000000000",
        "$Toke",
        10,
      ),
      outputs: [mintOutput],
    }
  toke_contract.spend(
    #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
    #"00000000000000000000000000000000000000000000000000000000",
    "$Toke",
    #"00000000000000000000000000000000000000000000000000000001",
    "$TokeControl",
    Some(datum),
    redeemer,
    a_utxo,
    txn,
  )
}
