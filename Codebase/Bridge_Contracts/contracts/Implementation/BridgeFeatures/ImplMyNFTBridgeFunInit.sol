// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "../ImplMemoryStructure.sol";
import "./IMyNFTBridgeFunInit.sol";

/// @author Guillaume Gonnaud 2021
/// @title ImplMyNFTBridgeFunInit
/// @notice The implementation of a bridge initilalisation. Call this function at once before using the bridge.
contract ImplMyNFTBridgeFunInit  is ImplMemoryStructure, IMyNFTBridgeFunInit {

    /// @notice Initialize a bridge
    /// @param _localUniverse The local universe this bridge is deployed in. Refer to ImplMemoryStructure for a list
    /// of standardized universes.
    /// 0x07dac20e  //  RINKEBY
    /// 0xee0bec75  // KOVAN
    /// 0xe35d7d6b  // POLKADOT TESTNET MOONBASE ALPHA
    /// 0x6d2f0e37 // Ethereum Mainnet
    /// 0x06551a5b // Polkadot Moonriver
    /// 0x51147ce2 // Polkadot Moonbeam
    /// The hash (example : 0x51147ce2) is the 4 last bytes of the keccak256 hash of the universe name
    function init(
       uint256 _localUniverse
    ) external {
        require(localUniverse == 0x0, "local universe value already initialized");
        localUniverse = bytes32(_localUniverse);
    }

  
}