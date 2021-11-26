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

    function getProofOfEscrowHash(bytes32 _migrationHash, address _contractAddress) external onlyOwnerOrOperator returns (string memory){
        bytes memory payload = abi.encodeWithSignature("getProofOfEscrowHash(bytes32)", _migrationHash);
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (string));
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
        bytes memory payload = abi.encodeWithSignature(
            "migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)"
            , _originWorld
            , _originTokenId
            , _destinationUniverse
            , _destinationBridge
            , _destinationWorld
            , _destinationTokenId
            , _destinationOwner
            , _signee
        );
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (string));
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

    /*function migrateFromIOUERC721ToERC721(
        bytes32 _originUniverse
        , bytes32 _originBridge
        , bytes32 _originWorld
        , bytes32 _originTokenId
        , bytes32 _originOwner
        , address _destinationWorld
        , uint256 _destinationTokenId
        , address _destinationOwner
        , address _signee
        , bytes32 _height
        , bytes calldata _migrationHashSigned
        , address _contractAddress
        ) external onlyOwnerOrOperator returns (string memory){
        bytes memory payload = abi.encodeWithSignature(
            "migrateToERC721IOU(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)"
            , _originUniverse
            , _originBridge
            , _originWorld
            , _originTokenId
            , _originOwner
            , _destinationWorld
            , _destinationTokenId
            , _destinationOwner
            , _signee
            , _height
            , _migrationHashSigned
        );
        (bool success, bytes memory result) = _contractAddress.call(payload);
        if(!success) revert("Call of child contract failed");
        return abi.decode(result, (string));
    }*/
}
