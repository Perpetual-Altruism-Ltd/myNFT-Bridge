// SPDX-License-Identifier: CC0-1.0
pragma solidity 0.8.9;

import "../MemoryStructure.sol";


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


/// @author Guillaume Gonnaud 2021
/// @title ImplTransparentProxy
/// @notice An ownable proxy transparent smart contract that is gonna be the memory space of the bridge.
/// Using reference contract https://github.com/mudgen/transparent-contracts-erc1538
contract TransparentProxy is ERC1538Light, MemoryStructure {

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(address _erc1538Delegate) {
        contractOwner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);

        //Adding ERC1538 updateContract function
        bytes memory signature = "updateContract(address,string,string)";
        bytes4 funcId = bytes4(keccak256(signature));
        delegates[funcId] = _erc1538Delegate;
        funcSignatures.push(signature);
        funcSignatureToIndex[signature] = funcSignatures.length;
        emit FunctionUpdate(funcId, address(0), _erc1538Delegate, string(signature));
        emit CommitMessage("Added ERC1538 updateContract function at contract creation");
    }


    fallback() external payable {
        address delegate = delegates[msg.sig];
        require(delegate != address(0), "Function does not exist.");
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), delegate, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {revert(ptr, size)}
            default {return (ptr, size)}
        }
    }


    receive() external payable {
        address delegate = delegates[msg.sig];
        require(delegate != address(0), "Function does not exist.");
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := delegatecall(gas(), delegate, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {revert(ptr, size)}
            default {return (ptr, size)}
        }
    }
}
