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
       string calldata _localUniverse
    ) external {
        require(localUniverse == 0x0, "local universe value already initialized");
        localUniverse = stringToBytes32(_localUniverse);
    }

    //Convert the first 32 bytes of a string to a bytes32
    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyString = bytes(source);
        if (tempEmptyString.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

}