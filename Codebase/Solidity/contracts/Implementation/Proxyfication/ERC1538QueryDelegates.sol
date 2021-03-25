// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.2;

import "./ERC1538.sol";
import "../ImplMemoryStructure.sol";

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

/// @author Guillaume Gonnaud 2021
/// @title ERC1538QueryDelegate
/// @notice Modern + commented solidity implementation of 
/// https://github.com/mudgen/transparent-contracts-erc1538/blob/master/contracts/ERC1538QueryDelegates.sol
/// by Nick Mudge 2018
contract ERC1538QueryDelegate is ERC1538Query, ImplMemoryStructure {
    
    /// @notice Query the number of supported function that can be ran by the proxy
    /// @return the number of supported function that can be ran by the proxy
    function totalFunctions() external view override returns(uint256) {
        return funcSignatures.length;
    }

    /// @notice Query the function details at a given index
    /// @param _index the index of the function in the transparent contract storage
    /// @return functionSignature the function signature as a string
    /// @return functionId it's EVM hashcall
    /// @return delegate it's logic code smart contract address
    function functionByIndex(uint256 _index) external view override returns(string memory functionSignature, bytes4 functionId, address delegate) {
        require(_index < funcSignatures.length, "functionSignatures index does not exist.");
        bytes memory signature = funcSignatures[_index];
        functionId = bytes4(keccak256(signature));
        delegate = delegates[functionId];
        return (string(signature), functionId, delegate);
    }

    /// @notice Query if a function signature exist in the transparent contract
    /// @param _functionSignature the function signature as a string
    /// @return TRUE if it exist, FALSE if it doesn't
    function functionExists(string calldata _functionSignature) external view override returns(bool) {
        return funcSignatureToIndex[bytes(_functionSignature)] != 0;
    }

    /// @notice Query the concatenation of all function signatures
    /// @dev Might throw if too long, gas hungry.
    /// @return The concatenation of all function signatures
    function functionSignatures() external view override returns(string memory) {
        uint256 signaturesLength;
        bytes memory signatures;
        bytes memory signature;
        uint256 functionIndex;
        uint256 charPos;
        uint256 funcSignaturesNum = funcSignatures.length;
        bytes[] memory memoryFuncSignatures = new bytes[](funcSignaturesNum);
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            signature = funcSignatures[functionIndex];
            signaturesLength += signature.length;
            memoryFuncSignatures[functionIndex] = signature;
        }
        signatures = new bytes(signaturesLength);
        functionIndex = 0;
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            signature = memoryFuncSignatures[functionIndex];
            for(uint256 i = 0; i < signature.length; i++) {
                signatures[charPos] = signature[i];
                charPos++;
            }
        }
        return string(signatures);
    }

    /// @notice Query the concatenation of all function signatures associated with a specific delegate
    /// @dev Might throw if too long, gas hungry.
    /// @param _delegate The address of the queried delegate
    /// @return The concatenation of all function signatures associated with a specific delegate
    function delegateFunctionSignatures(address _delegate) external view override returns(string memory) {
        uint256 funcSignaturesNum = funcSignatures.length;
        bytes[] memory delegateSignatures = new bytes[](funcSignaturesNum);
        uint256 delegateSignaturesPos;
        uint256 signaturesLength;
        bytes memory signatures;
        bytes memory signature;
        uint256 functionIndex;
        uint256 charPos;
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            signature = funcSignatures[functionIndex];
            if(_delegate == delegates[bytes4(keccak256(signature))]) {
                signaturesLength += signature.length;
                delegateSignatures[delegateSignaturesPos] = signature;
                delegateSignaturesPos++;
            }

        }
        signatures = new bytes(signaturesLength);
        functionIndex = 0;
        for(; functionIndex < delegateSignatures.length; functionIndex++) {
            signature = delegateSignatures[functionIndex];
            if(signature.length == 0) {
                break;
            }
            for(uint256 i = 0; i < signature.length; i++) {
                signatures[charPos] = signature[i];
                charPos++;
            }
        }
        return string(signatures);
    }

    /// @notice Query the delegate associated with a function signature
    /// @param _functionSignature The queried function signature
    /// @return The delegate associated with a function signature
    function delegateAddress(string calldata _functionSignature) external view override returns(address) {
        require(funcSignatureToIndex[bytes(_functionSignature)] != 0, "Function signature not found.");
        return delegates[bytes4(keccak256(bytes(_functionSignature)))];
    }

    /// @notice Query the function signature and associated delegate of an EVM function hash
    /// @param _functionId The queried function EVM hash
    /// @return signature The signature associated with a function hash
    /// @return delegate The delegate associated with a function hash
    function functionById(bytes4 _functionId) external view override returns(string memory signature, address delegate) {
        for(uint256 i = 0; i < funcSignatures.length; i++) {
            if(_functionId == bytes4(keccak256(funcSignatures[i]))) {
                return (string(funcSignatures[i]), delegates[_functionId]);
            }
        }
        revert("functionId not found");
    }

    /// @notice Query the array of all used delegates by this transparent contract
    /// @return The array of all used delegates by this transparent contract
    function delegateAddresses() external view override returns(address[] memory) {
        uint256 funcSignaturesNum = funcSignatures.length;
        address[] memory delegatesBucket = new address[](funcSignaturesNum);
        uint256 numDelegates;
        uint256 functionIndex;
        bool foundDelegate;
        address delegate;
        for(; functionIndex < funcSignaturesNum; functionIndex++) {
            delegate = delegates[bytes4(keccak256(funcSignatures[functionIndex]))];
            for(uint256 i = 0; i < numDelegates; i++) {
                if(delegate == delegatesBucket[i]) {
                    foundDelegate = true;
                    break;
                }
            }
            if(foundDelegate == false) {
                delegatesBucket[numDelegates] = delegate;
                numDelegates++;
            }
            else {
                foundDelegate = false;
            }
        }
        address[] memory delegates_ = new address[](numDelegates);
        functionIndex = 0;
        for(; functionIndex < numDelegates; functionIndex++) {
            delegates_[functionIndex] = delegatesBucket[functionIndex];
        }
        return delegates_;
    }
}