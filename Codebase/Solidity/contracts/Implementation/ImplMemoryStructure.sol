// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.2;

/// @author Guillaume Gonnaud 2021
/// @title ImplMemoryStructure
/// @notice The well-ordered memory structure of our bridge. Used for generating proper memory address at compilation.
contract ImplMemoryStructure {

    //////////////////////////////////////////////////////////////////////////////////////
    // Memory structures relevant to the transparency of the contract are defined first //
    //////////////////////////////////////////////////////////////////////////////////////

   //owner of the contract
    address internal contractOwner;

    // maps functions to the delegate contracts that execute the functions
    // funcId => delegate contract
    mapping(bytes4 => address) internal delegates;

    // array of function signatures supported by the contract
    bytes[] internal funcSignatures;

    // maps each function signature to its position in the funcSignatures array.
    // signature => index+1
    mapping(bytes => uint256) internal funcSignatureToIndex;
    
    ////////////////////////////////////////////////////////////////////////////////////////
    // Memory structures relevant to the functionality of the contract are defined second //
    ////////////////////////////////////////////////////////////////////////////////////////

    /*
        Possible universe identifiers 

        ETHMAINNET = Ethereum mained (EVM)
        ETHCLASSIC = Ethereum Classic (EVM)
        ETHROPSTEN = Ethereum Testnet Ropsten (EVM)
        ETHRINKEBY = Ethereum Testnet Rinkeby (EVM)
        MOONBEAM = Polkadot parachain Moonbeam (EVM+)
        MOONRIVER = Kusama parachain Moonriver (EVM+)
        BINANCECHAIN = Binance Smart Chain Mainnet (EVM)
        BINANCECHAINTEST = Binance Smart Chain Testnet (EVM)
    */

    // Internal value storing the local universe identifier.
    bytes32 internal localUniverse;

    // A mapping storing if a migration hash have been registered as a migration. It doesn't mean the migration have not been completed/reversed.
    mapping(bytes32 => bool) internal migrationsRegistered;

    // A mapping registering what is the hash of the latest migration registered for a specific local token hash
    mapping(bytes32 => bytes32) latestRegisteredMigration;

    // A mapping associating a migrationHash with it's escrowhash.
    mapping(bytes32 => bytes32) internal escrowHashOfMigrationHash; // migrationHash => escrowHash

    //Mapping storing if a world have disabled IOU migrations
    mapping(address => bool) internal isIOUForbidden; //False if IOU migrations (wrapping) are allowed for an origin world, True if they are forbidden.

    //Mapping storing where the rules for each  world fullMigrations are decentrally defined.
    mapping(address => address) internal fullMigrationsDelegates; // (world => delegate)

    //Mapping storing if a world is trusting a relay to handle it's tokens
    mapping(address => mapping(address => bool)) internal isAccreditedRelayForWorld; // (world => relay => isAccredited)


 
}
