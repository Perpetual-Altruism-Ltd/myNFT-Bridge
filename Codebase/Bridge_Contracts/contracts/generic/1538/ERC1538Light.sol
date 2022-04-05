// SPDX-License-Identifier: CC0-1.0
pragma solidity 0.8.9;

/// @author Guillaume Gonnaud 2021
/// @title ImplTransparentProxy
/// @notice Same interface defined as in ERC1538.sol but with functions removed as the compiler is too dumb to explore 
/// runtime execution.
interface ERC1538Light {

    /// @dev This emits when one or a set of functions are updated in a transparent contract.
    ///  The message string should give a short description of the change and why
    ///  the change was made.
    event CommitMessage(string message);

    /// @dev This emits for each function that is updated in a transparent contract.
    ///  functionId is the bytes4 of the keccak256 of the function signature.
    ///  oldDelegate is the delegate contract address of the old delegate contract if
    ///  the function is being replaced or removed.
    ///  oldDelegate is the zero value address(0) if a function is being added for the
    ///  first time.
    ///  newDelegate is the delegate contract address of the new delegate contract if 
    ///  the function is being added for the first time or if the function is being 
    ///  replaced.
    ///  newDelegate is the zero value address(0) if the function is being removed.
    event FunctionUpdate(
        bytes4 indexed functionId, 
        address indexed oldDelegate, 
        address indexed newDelegate, 
        string functionSignature
    );

}