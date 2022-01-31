// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

import "./IMigrations.sol";

contract Migrations is IMigrations {
    address public owner = msg.sender;
    uint256 public last_completed_migration;

    modifier restricted() {
        require(
            msg.sender == owner,
            "This function is restricted to the contract's owner"
        );
        _;
    }

    function setCompleted(uint256 completed) public override restricted {
        last_completed_migration = completed;
    }
}
