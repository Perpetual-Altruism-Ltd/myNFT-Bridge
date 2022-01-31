// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

/// @notice The well-ordered memory structure of our bridge. Used for generating proper memory address at compilation.
interface IMyNFTBridgeFunInit {
    /// @notice Initialize a bridge
    /// @param _localUniverse The local universe this bridge is deployed in. Refer to ImplMemoryStructure for a list
    /// of standardized universes.
    function init(uint256 _localUniverse) external;
}
