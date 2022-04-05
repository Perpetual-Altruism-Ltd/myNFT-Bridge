// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "../../../generic/1538/ERC1538.sol";
import "../BridgeMemoryStructure.sol";

/// @author Guillaume Gonnaud 2021
/// @title ERC1538DelegateBridge
/// @notice Modern + commented solidity implementation of 
/// https://github.com/mudgen/transparent-contracts-erc1538/blob/master/contracts/ERC1538Delegate.sol 
/// by Nick Mudge 2018
contract ERC1538DelegateBridge is ERC1538, BridgeMemoryStructure {

    /// @notice Updates functions in a transparent contract.
    /// @dev If the value of _delegate is zero then the functions specified in _functionSignatures are removed.
    ///  If the value of _delegate is a delegate contract address then the functions  specified in _functionSignatures will 
    /// be delegated to that address.
    /// @param _delegate The address of a delegate contract to delegate to or zero to remove functions.      
    /// @param _functionSignatures A list of function signatures listed one after the other
    /// @param _commitMessage A short description of the change and why it is made
    /// This message is passed to the CommitMessage event.     
    function updateContract(address _delegate, string calldata _functionSignatures, string calldata _commitMessage) external override {

        require(msg.sender == contractOwner, "Must own the contract.");

        // pos is first used to check the size of the delegate contract.
        // After that pos is the current memory location of _functionSignatures.
        // It is used to move through the characters of _functionSignatures
        uint256 pos;

        if(_delegate != address(0)) {
            assembly {
                pos := extcodesize(_delegate)
            }
            require(pos > 0, "_delegate address is not a contract and is not address(0)");
        }

        // creates a bytes vesion of _functionSignatures
        bytes memory signatures = bytes(_functionSignatures);

        // stores the position in memory where _functionSignatures ends.
        uint256 signaturesEnd;

        // stores the starting position of a function signature in _functionSignatures
        uint256 start;
        assembly {
            pos := add(signatures,32)
            start := pos
            signaturesEnd := add(pos,mload(signatures))
        }

        // the function id of the current function signature
        bytes4 funcId;

        // the delegate address that is being replaced or address(0) if removing functions
        address oldDelegate;

        // the length of the current function signature in _functionSignatures
        uint256 num;

        // the current character in _functionSignatures
        uint256 char;

        // the position of the current function signature in the funcSignatures array
        uint256 index;

        // the last position in the funcSignatures array
        uint256 lastIndex;

        // parse the _functionSignatures string and handle each function
        // We are only iterating on the parameter string, and hence we can still have an infinite number of handled function
        // as the lookup logic is trough mappings.
        for (; pos < signaturesEnd; pos++) { 

            //Reading the array byte by byte -char is a bit confusing as it will should work for multi-byte chars encoding, only the hash and ')' endonding matters-
            assembly {char := byte(0,mload(pos))}

            // 0x29 == )
            if (char == 0x29) {

                //Let's go to the next character after the ) which is either out of bond or the start of the next function signature
                pos++;
                
                // Calculate the length of the current function signature in _functionSignatures
                num = (pos - start);

                //Setup start at the next function signature start
                start = pos; 

                // This will store num at &signatures
                // In the EVM, the word at the begining of a dynamic lenght array address is the lenght of the array. In essence, we are truncating 
                // 'signatures' to only include the signature of the last explored function.
                assembly {
                    mstore(signatures,num)
                }

                //Compute the function handle funcID used by the evm to call functions
                funcId = bytes4(keccak256(signatures));

                //Store the previous delegate at functionId
                oldDelegate = delegates[funcId];
               
                if(_delegate == address(0)) {  /* Function deletion */
                    index = funcSignatureToIndex[signatures];
                    require(index != 0, "Function does not exist.");
                    index--;
                    lastIndex = funcSignatures.length - 1;
                    if (index != lastIndex) {
                        funcSignatures[index] = funcSignatures[lastIndex]; //Copy last element to the element we wanna erase
                        funcSignatureToIndex[funcSignatures[lastIndex]] = index + 1; //Update the reverse lookup array
                    }
                    funcSignatures.pop(); //Pop the last element

                    delete funcSignatureToIndex[signatures]; //Remove the erased function from the lookup
                    delete delegates[funcId]; //Remove the delegate association with the function
                    emit FunctionUpdate(funcId, oldDelegate, address(0), string(signatures));
                }
                else if (funcSignatureToIndex[signatures] == 0) {  /* Function addition */
                    require(oldDelegate == address(0), "FuncId clash.");
                    delegates[funcId] = _delegate;
                    funcSignatures.push(signatures);
                    funcSignatureToIndex[signatures] = funcSignatures.length;
                    emit FunctionUpdate(funcId, address(0), _delegate, string(signatures));
                }
                else if (delegates[funcId] != _delegate) { /* Function upgrade to new version */
                    delegates[funcId] = _delegate;
                    emit FunctionUpdate(funcId, oldDelegate, _delegate, string(signatures));

                }

                // Make 'signatures' point to the last explored ')' in the string. 
                // The ')' will then be replaced by the lenght of the next explored function signature at the next loop 
                // and henceforth 'signatures' will become a properly formatted dynamic array
                assembly {signatures := add(signatures,num)}
            }
        }
        emit CommitMessage(_commitMessage);
    }
}