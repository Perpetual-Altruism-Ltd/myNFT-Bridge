// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

/// @author Guillaume Gonnaud 2021
/// @title ERC1538Query
/// @notice Modern & commented solidity implementation of 
/// https://github.com/mudgen/transparent-contracts-erc1538/blob/master/contracts/ERC1538QueryDelegates.sol
/// by Nick Mudge 2018
interface ERC1538Query {

    /// @notice Query the number of supported function that can be ran by the proxy
    /// @return the number of supported function that can be ran by the proxy
    function totalFunctions() external view returns(uint256);

    /// @notice Query the function details at a given index
    /// @param _index the index of the function in the transparent contract storage
    /// @return functionSignature the function signature as a string
    /// @return functionId it's EVM hashcall
    /// @return delegate it's logic code smart contract address
    function functionByIndex(uint256 _index) external view returns(string memory functionSignature, bytes4 functionId, address delegate);

    /// @notice Query if a function signature exist in the transparent contract
    /// @param _functionSignature the function signature as a string
    /// @return TRUE if it exist, FALSE if it doesn't
    function functionExists(string calldata _functionSignature) external view returns(bool);

    /// @notice Query the concatenation of all function signatures
    /// @dev Might throw if too long, gas hungry.
    /// @return The concatenation of all function signatures
    function functionSignatures() external view returns(string memory);

    /// @notice Query the concatenation of all function signatures associated with a specific delegate
    /// @dev Might throw if too long, gas hungry.
    /// @param _delegate The address of the queried delegate
    /// @return The concatenation of all function signatures associated with a specific delegate
    function delegateFunctionSignatures(address _delegate) external view returns(string memory);

    /// @notice Query the delegate associated with a function signature
    /// @param _functionSignature The queried function signature
    /// @return The delegate associated with a function signature
    function delegateAddress(string calldata _functionSignature) external view returns(address);

    /// @notice Query the function signature and associated delegate of an EVM function hash
    /// @param _functionId The queried function EVM hash
    /// @return signature The signature associated with a function hash
    /// @return delegate The delegate associated with a function hash
    function functionById(bytes4 _functionId) external view returns(string memory signature, address delegate);

    /// @notice Query the array of all used delegates by this transparent contract
    /// @return The array of all used delegates by this transparent contract
    function delegateAddresses() external view returns(address[] memory);

}