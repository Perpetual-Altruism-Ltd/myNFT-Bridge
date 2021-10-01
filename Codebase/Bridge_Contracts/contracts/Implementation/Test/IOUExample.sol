// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

//This contract only exist in order to run migration test. 
//It is a genric fgreely mintable ERC-721 standard.

import "../ERC721.sol";

contract IOUExample is ERC721 {

    address public owner; //Address of the smart contract creator

    mapping(address => uint256) internal balanceOfToken; //A counter tracking each owner token balance without having to loop.
    mapping(uint256 => address) internal tokenOwners; //The mapping of the token to their owner

    // Mapping associating owner with their operators
    mapping(address => mapping(address => bool)) internal ownerOperators; // owner => operator => isOperator. 

    // Mapping associating tokens with an operator
    mapping(uint256 => address) internal tokenOperator; // tokenId => operator

    mapping(uint256 => address) internal preminters; //Each token preminter

    // Total number of minted token
    uint256 public mintedTokens;

    //Set the owner as the smart contract creator
    constructor(){
        owner = msg.sender;
    }

    /// @notice Mint a token for msg.sender and return the tokenId of this token
    /// @return the newly minted tokenId
    function mint() external returns(uint256){

        mintedTokens = mintedTokens + 1;
        tokenOwners[mintedTokens] = msg.sender;
        balanceOfToken[msg.sender] = balanceOfToken[msg.sender] + 1;

        emit Transfer(address(0x0), msg.sender, mintedTokens);
        return mintedTokens;
    }

    /// @notice Mint a token reservation, allowing the preminter to send the non-existing token from address 0
    /// @return the future minted tokenId
    function premintFor(address _preminter) external returns(uint256){

        mintedTokens = mintedTokens + 1;
        preminters[mintedTokens] = _preminter;

        return mintedTokens;
    }


    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT. When transfer is complete, this function
    ///  checks if `_to` is a smart contract (code size > 0). If so, it calls
    ///  `onERC721Received` on `_to` and throws if the return value is not
    ///  `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    /// @param _data Additional data with no specified format, sent in call to `_to`
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes calldata _data) external payable override {
        safeTransferInternal(_from, _to, _tokenId, _data);
    }


    /// @notice Transfers the ownership of an NFT from one address to another address
    /// @dev This works identically to the other function with an extra data parameter,
    ///  except this function just sets data to ""
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable override {
        safeTransferInternal(_from, _to, _tokenId, bytes(""));
    }


    /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
    ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
    ///  THEY MAY BE PERMANENTLY LOST
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable override{
        transferInternal(_from, _to, _tokenId);
    }

    /// @notice Set or reaffirm the approved address for an NFT
    /// @dev The zero address indicates there is no approved address.
    /// @dev Throws unless `msg.sender` is the current NFT owner, or an authorized
    ///  operator of the current owner.
    /// @param _approved The new approved NFT controller
    /// @param _tokenId The NFT to approve
    function approve(address _approved, uint256 _tokenId) external payable override{

        address _owner = tokenOwners[_tokenId];

        //Operator verification
        require(
            msg.sender == _owner || // the current owner
            ownerOperators[_owner][msg.sender], // an authorized operqtor
            "msg.sender is not allowed to approve an address for the NFT"
        );

        tokenOperator[_tokenId] = _approved;
        emit Approval(_owner, _approved, _tokenId);
    }


    /// @notice Enable or disable approval for a third party ("operator") to manage
    ///  all of `msg.sender`'s assets.
    /// @dev Emits the ApprovalForAll event. The contract MUST allow
    ///  multiple operators per owner.
    /// @param _operator Address to add to the set of authorized operators.
    /// @param _approved True if the operator is approved, false to revoke approval
    function setApprovalForAll(address _operator, bool _approved) external override{
        ownerOperators[msg.sender][_operator] = _approved;
        emit ApprovalForAll(msg.sender, _operator, _approved);
    }

    /// @notice Count all NFTs assigned to an owner
    /// @dev NFTs assigned to the zero address are considered invalid, and this
    ///  function throws for queries about the zero address.
    /// @param _owner An address for whom to query the balance
    /// @return The number of NFTs owned by `_owner`, possibly zero
    function balanceOf(address _owner) external view override returns (uint256){
        require(_owner != address(0x0), "0x0 is an invalid owner address");
        return(balanceOfToken[_owner]);
    }


    /// @notice Find the owner of an NFT
    /// @dev NFTs assigned to zero address are considered invalid, and queries
    ///  about them do throw.
    /// @param _tokenId The identifier for an NFT
    /// @return The address of the owner of the NFT
    function ownerOf(uint256 _tokenId) external view override returns (address){
        address retour = tokenOwners[_tokenId];
        require(retour != address(0x0), "0x0 is an invalid owner address");
        return retour;
    }

    /// @notice Get the approved address for a single NFT
    /// @dev Throws if `_tokenId` is not a valid NFT
    /// @param _tokenId The NFT to find the approved address for
    /// @return The approved address for this NFT, or the zero address if there is none
    function getApproved(uint256 _tokenId) external view  override returns (address) {
        require(tokenOwners[_tokenId] != address(0x0), "_tokenId is not a valid NFT tokenID");
        return tokenOperator[_tokenId];
    }


    /// @notice Query if an address is an authorized operator for another address
    /// @param _owner The address that owns the NFTs
    /// @param _operator The address that acts on behalf of the owner
    /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
    function isApprovedForAll(address _owner, address _operator) external view override returns (bool){
        return ownerOperators[_owner][_operator];
    }


    function isContract( address _addr ) internal view returns (bool addressCheck)
    {
        // This method relies in extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        assembly { codehash := extcodehash(_addr) } // solhint-disable-line
        addressCheck = (codehash != 0x0 && codehash != accountHash);
    }


    function safeTransferInternal(address _from, address _to, uint256 _tokenId, bytes memory _data) internal {

        transferInternal(_from, _to, _tokenId);

        if (isContract(_to))
        {
            bytes4 retval = ERC721TokenReceiver(_to).onERC721Received(msg.sender, _from, _tokenId, _data);
            // bytes4(keccak256("onERC721Received(address,address,uint256,bytes)")) === 0x150b7a02
            require(retval == 0x150b7a02, "The NFT was not received properly by the contract");
        }

    }


    /// @notice Transfer ownership of an NFT
    /// @dev Throws unless `msg.sender` is the current owner, an authorized
    ///  operator, or the approved address for this NFT. Throws if `_from` is
    ///  not the current owner. Throws if `_to` is the zero address. Throws if
    ///  `_tokenId` is not a valid NFT.
    /// @param _from The current owner of the NFT
    /// @param _to The new owner
    /// @param _tokenId The NFT to transfer
    function transferInternal(address _from, address _to, uint256 _tokenId) internal {

        if(tokenOwners[_tokenId] != address(0x0)){ //If already minted
            //Ownership verification
            require( tokenOwners[_tokenId] == _from, "The specified _from does not match the current token owner");

            //Valid nft <=> owner != 0x0
            require(_from != address(0x0), "_tokenId is not a valid NFT");
        } else { //If requiring minting
            require(_from == address(0x0), "_tokenId doesn't exist yet and neet to be minted");
            require(msg.sender == preminters[_tokenId], "_tokenId has not be approved for minting by msg.sender");
        }

        //Prevent 0x0 burns
        require(_to != address(0x0), "_to cannot be the address 0");


        //Operator verification
        require(
            msg.sender == _from || // the current owner
            ownerOperators[_from][msg.sender] || // an authorized operqtor
            msg.sender == tokenOperator[_tokenId], // the approved address for this NFT
            "msg.sender is not allowed to transfer this NFT"
        );

        //Transfer the token ownership record
        tokenOwners[_tokenId] = _to;

        //Clean the token approved address
        tokenOperator[_tokenId] == address(0x0);

        balanceOfToken[_from] = balanceOfToken[_from] - 1;
        balanceOfToken[_to] = balanceOfToken[_to] + 1;

        //Emit the transfer event
        emit Transfer(_from, _to, _tokenId);


    }

    /// @notice A distinct Uniform Resource Identifier (URI) for a given asset.
    /// @dev Throws if `_tokenId` is not a valid NFT. URIs are defined in RFC
    ///  3986. The URI may point to a JSON file that conforms to the "ERC721
    ///  Metadata JSON Schema".
    function tokenURI(uint256 _tokenId) external view returns(string memory){
        require(tokenOwners[_tokenId] != address(0), "This token is not minted");
        return string(abi.encodePacked("http://127.0.0.1/tokens/", addressToString(address(this)), "/", uint2str(_tokenId)));

    }
    
        /// @notice Convert an Ethereum address to a human readable string
    /// @param _addr The adress you want to convert
    /// @return The address in 0x... format
    function addressToString(address _addr) internal pure returns(string memory)
    {
        bytes32 addr32 = bytes32(uint256(uint160(_addr))); //Put the address 20 byte address in a bytes32 word
        bytes memory alphabet = "0123456789abcdef";  //What are our allowed characters ?

        //Initializing the array that is gonna get returned
        bytes memory str = new bytes(42);

        //Prefixing
        str[0] = '0';
        str[1] = 'x';

        for (uint256 i = 0; i < 20; i++) { //iterating over the actual address

            /*
                proper offset : output starting at 2 because of '0X' prefix, 1 hexa char == 2 bytes.
                input starting at 12 because of 12 bytes of padding, byteshifted because 2byte == 1char
            */
            str[2+i*2] = alphabet[uint8(addr32[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(addr32[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function uint2str(uint256 _i) internal pure returns (string memory _uintAsString) {
        unchecked{
            if (_i == 0) {
                return "0";
            }
            uint j = _i;
            uint len;
            while (j != 0) {
                len++;
                j /= 10;
            }
            bytes memory bstr = new bytes(len);
            uint k = len - 1;
            while (_i != 0) {
                bstr[k--] = bytes1(uint8(48 + _i % 10));
                _i /= 10;
            }
            return string(bstr);
        }
    }

}