use aiken/collection/list
use aiken/interval.{empty}
use cardano/address.{from_verification_key}
use cardano/assets.{AssetName, PolicyId, from_asset, quantity_of}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}
use toke_control.{TokeDatum}
use tx_util/builder.{
  add_asset_to_tx_output, add_signatory, add_tx_input, add_tx_output,
  build_txn_context, mint_assets, new_tx_output,
}

validator toke_mint(
  // Thread Token Details
  toke_control_policy: PolicyId,
  toke_control_asset_name: AssetName,
) {
  mint(_redeemer: Data, _policy_id: PolicyId, self: Transaction) {
    // Ensure that we are "spending" the Thread Token
    // Note: The "control" contract needs to ensure we 
    // are spending the Thread Token in the correct manner.
    expect Some(_control_output) =
      list.find(
        self.inputs,
        fn(input) {
          quantity_of(
            input.output.value,
            toke_control_policy,
            toke_control_asset_name,
          ) == 1
        },
      )
    True
  }

  else(_) {
    fail
  }
}

const test_toke_policy =
  #"00000000000000000000000000000000000000000000000000000000"

const test_toke_control_policy =
  #"00000000000000000000000000000000000000000000000000000001"

const test_treasury_pkh =
  #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5"

test test_toke_mint() {
  // let toke_output = from_asset(
  //       test_toke_policy,
  //       "$Toke",
  //       10,
  //     )
  let toke_control_output =
    from_asset(test_toke_control_policy, "$TokeControl", 1)
  let datum_after =
    TokeDatum {
      totalSupply: 100,
      // Reduced only by a Burn
      totalMinted: 10,
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

  toke_mint.mint(
    test_toke_control_policy,
    "$TokeControl",
    #[],
    test_toke_policy,
    txn.transaction,
  )
}

test test_must_spend_control_token() fail {
  // let toke_output = from_asset(
  //       test_toke_policy,
  //       "$Toke",
  //       10,
  //     )
  let toke_control_output =
    from_asset(#"00000000000000000000000000000000000000000000000000000002", "$TokeControl", 1)
  let datum_after =
    TokeDatum {
      totalSupply: 100,
      // Reduced only by a Burn
      totalMinted: 10,
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

  toke_mint.mint(
    test_toke_control_policy,
    "$TokeControl",
    #[],
    test_toke_policy,
    txn.transaction,
  )
}
/// Helpful: https://github.com/ariady-putra/tx_util/blob/main/validators/test_builder_txn.ak
