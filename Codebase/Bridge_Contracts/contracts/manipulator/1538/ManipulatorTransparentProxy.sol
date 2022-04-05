// SPDX-License-Identifier: CC0-1.0
pragma solidity 0.8.9;

import "../ManipulatorMemoryStructure.sol";
import "../../generic/1538/ERC1538Light.sol";



/// @author Guillaume Gonnaud 2021
/// @title ManipulatorTransparentProxy
/// @notice An ownable proxy transparent smart contract that is gonna be the memory space of the bridge.
/// Using reference contract https://github.com/mudgen/transparent-contracts-erc1538
contract ManipulatorTransparentProxy is ERC1538Light, ManipulatorMemoryStructure {

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
