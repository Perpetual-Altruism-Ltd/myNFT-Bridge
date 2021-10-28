// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "../ImplMemoryStructure.sol";

/// @author Guillaume Gonnaud 2021
/// @title ImplMyNFTBridgeFunInit
/// @notice The implementation of a bridge initilalisation. Call this function at once before using the bridge.
contract ImplMyNFTBridgeFunInit  is ImplMemoryStructure {

    /// @notice Initialize a bridge
    /// @param _localUniverse The local universe this bridge is deployed in. Refer to ImplMemoryStructure for a list
    /// of standardized universes.
    function init(
       uint256 _localUniverse
    ) external {
        require(localUniverse == 0x0, "local universe value already initialized");
        localUniverse = bytes32(_localUniverse);
    }

  
}