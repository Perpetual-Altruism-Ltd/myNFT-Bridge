// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

interface IMigrations {
    function setCompleted(uint256 completed) external;
}
