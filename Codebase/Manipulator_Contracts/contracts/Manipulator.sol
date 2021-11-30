// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./MemoryStructure.sol";

/// @author Alexandre Guillioud
/// @title Manipulator
/// @notice A proxy smart contract that to allow multiple relays (addresses) to call a
/// any smart contracts implementing Bridge or IOU interfaces
contract Manipulator is MemoryStructure {
    constructor() {}

    modifier onlyOwnerOrOperator {
      require(operators[msg.sender] == true || owner == msg.sender, "This address is not allowed to call this contract");
      _;
   }

    function init(address _owner) external {
        require(owner == address(0), "Owner already set");
        owner = _owner;
    }

    /// @notice Set or reaffirm the approved address for this proxy smart contract
    /// @dev Throws unless `msg.sender` is the current smart contract owner
    /// @param _address The new approved proxy caller
    /// @param _allowed True if the operator is approved, false to revoke approval
    function approve(address _address, bool _allowed) external {
        require(msg.sender == owner, "Function restricted to contract owner");
        operators[_address] = _allowed;
    }

    /*
    *   Manipulate an IOU contract
    */

    function mintedTokens(address _contractAddress) external onlyOwnerOrOperator returns (uint256) {
        bytes memory payload = abi.encodeWithSignature("mintedTokens()");
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (uint256));
    }

    function mint(address _contractAddress) external onlyOwnerOrOperator returns (uint256) {
        bytes memory payload = abi.encodeWithSignature("mint()");
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (uint256));
    }

    function setTokenUri (uint256 _tokenId, string calldata _tokenUri, address _contractAddress) external onlyOwnerOrOperator {
        bytes memory payload = abi.encodeWithSignature("setTokenUri(uint256,string)", _tokenId, _tokenUri);
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
    }

    function tokenURI(uint256 _tokenId, address _contractAddress) external onlyOwnerOrOperator returns(string memory){
        bytes memory payload = abi.encodeWithSignature("tokenURI(uint256)", _tokenId);
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (string));
    }

    function premintFor(address _preminter, address _contractAddress) external onlyOwnerOrOperator returns (uint256) {
        bytes memory payload = abi.encodeWithSignature("premintFor(address)", _preminter);
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (uint256));
    }

    function safeTransferFrom(address _from, address _to, uint256 _tokenId, address _contractAddress) external onlyOwnerOrOperator{
        bytes memory payload = abi.encodeWithSignature("safeTransferFrom(address,address,uint256)", _from, _to, _tokenId);
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
    }

    /*
    *   Manipulate a bridge
    */

    function getProofOfEscrowHash(bytes32 _migrationHash, address _contractAddress) external onlyOwnerOrOperator returns (bytes32){
        bytes memory payload = abi.encodeWithSignature("getProofOfEscrowHash(bytes32)", _migrationHash);
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (bytes32));
    }

    function migrateToERC721IOU(
        address _originWorld
        , uint256 _originTokenId
        , bytes32 _destinationUniverse
        , bytes32 _destinationBridge
        , bytes32 _destinationWorld
        , bytes32 _destinationTokenId
        , bytes32 _destinationOwner
        , bytes32 _signee
        , address _contractAddress
        ) external onlyOwnerOrOperator returns (string memory){
        bytes4 signature = bytes4(keccak256("migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)"));

        assembly{
            let ptr := mload(0x40) // Loading a free memory pointer
            mstore(ptr, signature) // Adding signature hash to ptr
            mstore(add(ptr, 0x04), _originWorld)
            mstore(add(ptr, 0x24), _originTokenId)
            mstore(add(ptr, 0x44), _destinationUniverse)
            mstore(add(ptr, 0x64), _destinationBridge)
            mstore(add(ptr, 0x84), _destinationWorld)
            mstore(add(ptr, 0xa4), _destinationTokenId)
            mstore(add(ptr, 0xc4), _destinationOwner)
            mstore(add(ptr, 0xe4), _signee)
            
            let result := call(gas(), _contractAddress, 0, ptr, 0x104, 0, 0) // Call child function
            
            if iszero(result) { revert(ptr, 0x104) } // If result is zero, revert
        }
    }

    function registerEscrowHashSignature(
        bytes32 _migrationHash
        , bytes calldata _escrowHashSigned
        , address _contractAddress
        ) external onlyOwnerOrOperator returns (string memory){
        bytes memory payload = abi.encodeWithSignature("registerEscrowHashSignature(bytes32,bytes)", _migrationHash, _escrowHashSigned);
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (string));
    }

    /*
        migrateFromIOUERC721ToERC721 function call by the manipulator needs assembly because we can't stack all signature variables
        into the SWAP-16. What we are doing is crafting the function call using a single bytes type input.
        The bytes type _data variable is composed of every variable needed by the child function. Here's an example of its content :

        0x
        3131313131313131313131313131313131313131313131313131313131313131 // _originUniverse (bytes32)
        3232323232323232323232323232323232323232323232323232323232323232 // _originBridge (bytes32)
        3333333333333333333333333333333333333333333333333333333333333333 // _originWorld (bytes32)
        3434343434343434343434343434343434343434343434343434343434343434 // _originTokenId (bytes32)
        3535353535353535353535353535353535353535353535353535353535353535 // _originOwner (bytes32)
        000000000000000000000000cafecafecafe9440008183EF92a3296C075A8c15 // _destinationWorld (address)
        0000000000000000000000000000000000000000000000000000000000000005 // _destinationTokenId (uint256)
        000000000000000000000000cafecafe1B089440008183EF92a3296C075A8c15 // _destinationOwner (address)
        000000000000000000000000cafe8aF61B089440008183EF92a3296C075A8c15 // _signee (address)
        3636363636363636363636363636363636363636363636363636363636363636 // _height (bytes32)
        3737373737373737373737373737373737373737373737373737373737373737 // _migrationHashSigned part1 (bytes)
        3838383838383838383838383838383838383838383838383838383838383838 // _migrationHashSigned part2 (... and can continue as it is converted to a bytes)

    */

    function migrateFromIOUERC721ToERC721(bytes calldata _data, address _contractAddress) external onlyOwnerOrOperator {
        bytes4 signature = bytes4(keccak256("migrateFromIOUERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)"));

        assembly{
            let ptr := mload(0x40) // Loading a free memory pointer
            mstore(ptr, signature) // Adding signature hash to ptr
            calldatacopy(add(ptr, 0x04), _data.offset, 0x140) // Add all fixed size variables to it
            mstore(add(ptr, 0x144), 0x160) // State position of bytes variable
            mstore(add(ptr, 0x164), sub(_data.length, 0x140)) // State size of byte variable
            calldatacopy(add(ptr, 0x184), add(_data.offset, 0x140), sub(_data.length, 0x140)) // Add byte variable to ptr
            
            let result := call(gas(), _contractAddress, 0, ptr, add(0x184, sub(_data.length, 0x140)), 0, 0) // Call child function
            
            if iszero(result) { revert(ptr, add(0x184, sub(_data.length, 0x140))) } // If result is zero, revert
        }
    }
}
