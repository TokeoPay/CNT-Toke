# TOKE Contract Use Cases

The following are the use cases for the TOKE Contracts

## TOKE Authority Token Mint

The TOKE Authority Token is used to manage the UTxO holding the Datum which is utilized by the
TOKE Authority Contract. The minting of the Token will following the below rules:

1. Only one Mint will be allowed. To achieve this end we are going to link the minting of the Token to an identified UTxO.
2. The Token cannot be burnt.
3. We will only allow 1 token to be minted, with an Amount of 1.
4. The Token Name will be set to `$toke_Authority`

## TOKE Authority Contract

This is the core of the TOKE Minting process. This contract will manage the UTxO holding the
TOKE Authority Token. It will ensure that the UTxO can only be spent in the way that we require
it as layed out below:

The UTxO holding the TOKE Authority Token (from now on known as the Authority UTxO) will have Inline
Datum initialized as such:

Max Supply: 95,000,000
Total Minted: 0
Migration Authority: List of PKH

### Mint

1. A Mint must be signed by a Treasury PKH
2. We must not exceed the "Max Supply" and so we will need to identify the number of tokens being minted in the Transaction,
   plus the number of "Total Minted" does not exceed the Max Supply.
3. We must create a new Authority UTxO containing the correctly updated Datum.
4. The new Authority UTxO must remain on contract.

### Burn

1. A burn is allowed to be executed by anyone who is willing to burn their tokens.
2. The burn redeemer must be a true burn, we must ensure that the quantity of TOKE is reducing (-ive) as part of this process.
3. A Burn will reduce the Max Supply and Total Minted by the number of tokens burnt.
4. We must create a new Authority UTxO containing the correctly updated Datum - calculated from point 3 above.
5. The new Authority UTxO must remain on contract.

### Migrate

The Migration Authority all must sign the transaction to allow the TOKE Authority UTxO to be migrated to a new
contract. It is imperative that the Migration Authority take seriously the process that is being undertaken
here and make sure that the resulting Transaction will maintain the integrity of the TOKE Token.

## TOKE Mint Contract

This is probably the most straight forward contract that we have. This contract just needs to ensure that the Authority UTxO (held on the TOKE Authority Contract above) has been allowed to be spent. We delegate all responsibility to the Authority Contract for managing the Mint of TOKE.
