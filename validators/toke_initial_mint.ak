use aiken/collection/list
use cardano/address.{from_verification_key}
use cardano/assets.{PolicyId, from_asset, from_lovelace, match}
use cardano/transaction.{
  InlineDatum, Input, NoDatum, Output, OutputReference, Transaction,
}
use toke_control.{TokeDatum}

validator toke_control_token_contract(utxo_ref: OutputReference) {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    // Make sure we are spending the control UTxO
    expect
      list.any(self.inputs, fn(input) { input.output_reference == utxo_ref })

    // Make sure we are minting one Control Token
    trace @"PolicyId": policy_id
    trace @"Tx Mint": self.mint
    trace @"Expect to mint: ": from_asset(policy_id, "$toke_ctrl", 1)
    expect match(self.mint, from_asset(policy_id, "$toke_ctrl", 1), ==)

    True
  }

  else(_) {
    fail
  }
}

test basic_mint() {
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
          totalSupply: 100,
          // Reduced only by a Burn
          totalMinted: 10,
        },
      ),
      reference_script: None,
    }

  let inputs =
    [
      transaction.Input {
        output_reference: OutputReference {
          transaction_id: #"3485b69c34eaa4f5ca6ecf738882a747f1f33c427a660186d281d11186580672",
          output_index: 0,
        },
        output: transaction.Output {
          address: from_verification_key(
            #"7086cd0926c4710af45f49886dec5840423da77d48552d2b3e4538adf0",
          ),
          value: from_lovelace(1163700),
          datum: NoDatum,
          reference_script: None,
        },
      },
      transaction.Input {
        output_reference: OutputReference {
          transaction_id: #"3485b69c34eaa4f5ca6ecf738882a747f1f33c427a660186d281d11186580672",
          output_index: 1,
        },
        output: transaction.Output {
          address: from_verification_key(
            #"7086cd0926c4710af45f49886dec5840423da77d48552d2b3e4538adf0",
          ),
          value: from_lovelace(8000000),
          datum: NoDatum,
          reference_script: None,
        },
      },
    ]
  let txn =
    Transaction {
      ..transaction.placeholder,
      inputs: inputs,
      mint: // extra_signatories: [
      //   #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      // ],
      from_asset(
        #"00000000000000000000000000000000000000000000000000000000",
        "$toke_ctrl",
        1,
      ),
      outputs: [mintOutput],
    }

  toke_control_token_contract.mint(
    OutputReference(
      #"3485b69c34eaa4f5ca6ecf738882a747f1f33c427a660186d281d11186580672",
      0,
    ),
    #[],
    #"00000000000000000000000000000000000000000000000000000000",
    txn,
  )
}

test can_we_mint_a_single_token() {
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
          totalSupply: 100,
          // Reduced only by a Burn
          totalMinted: 10,
        },
      ),
      reference_script: None,
    }

  let inputs =
    transaction.Input {
      output_reference: OutputReference {
        transaction_id: #"0000000000000000000000000000000000000000000000000000000000000001",
        output_index: 0,
      },
      output: transaction.Output {
        address: from_verification_key(
          #"00000000000000000000000000000000000000000000000000000001",
        ),
        value: from_lovelace(1000000),
        datum: NoDatum,
        reference_script: None,
      },
    }
  let txn =
    Transaction {
      ..transaction.placeholder,
      inputs: [inputs],
      extra_signatories: [
        #"87dabce266595fecb7d5c48b423b3a41ad5a3b864c43a35ee001d6d5",
      ],
      mint: from_asset(
        #"00000000000000000000000000000000000000000000000000000000",
        "$toke_ctrl",
        1,
      ),
      outputs: [mintOutput],
    }

  toke_control_token_contract.mint(
    OutputReference(
      #"0000000000000000000000000000000000000000000000000000000000000001",
      0,
    ),
    #[],
    #"00000000000000000000000000000000000000000000000000000000",
    txn,
  )
}
/// Helpful: https://github.com/ariady-putra/tx_util/blob/main/validators/test_builder_txn.ak
