// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "../../../Generic/ownable.sol";

contract FullMigrationController {

    mapping(address => mapping(bytes32 => bool)) migrationAllowed;

    function approveFullMigration(address _originWorld, bytes32 _destinationUniverse, bytes32 _destinationWorld) external {
      
        require(msg.sender == Ownable(_originWorld).owner(),
            "msg.sender is not the owner, of the token contract"
        );

        bytes32 destination = keccak256(abi.encodePacked(_destinationUniverse, _destinationWorld));
        migrationAllowed[_originWorld][destination] = true;
    }

    function cancelFullMigration(address _originWorld, bytes32 _destinationUniverse, bytes32 _destinationWorld) external {
      
        require(msg.sender == Ownable(_originWorld).owner(),
            "msg.sender is not the owner, of the token contract"
        );

        bytes32 destination = keccak256(abi.encodePacked(_destinationUniverse, _destinationWorld));
        migrationAllowed[_originWorld][destination] = false;
    }

    function acceptableMigration(
        address _originWorld, 
        bytes32 _destinationUniverse, 
        bytes32 _destinationWorld
    ) external view returns(bool) {
        bytes32 destination = keccak256(abi.encodePacked(_destinationUniverse, _destinationWorld));
        return migrationAllowed[_originWorld][destination];
    }

}