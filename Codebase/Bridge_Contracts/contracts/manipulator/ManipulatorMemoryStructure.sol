// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

/// @author Guillaume Gonnaud 2021
/// @title ManipulatorMemoryStructure
/// @notice The well-ordered memory structure of our bridge. Used for generating proper memory address at compilation.
contract ManipulatorMemoryStructure {

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

    ////////////////////////////////////////////////////////////////////////
    // Memory structures relevant to the manipulator contract goes second //
    ////////////////////////////////////////////////////////////////////////

    address public owner;
    
    mapping(address => bool) internal operators;
}