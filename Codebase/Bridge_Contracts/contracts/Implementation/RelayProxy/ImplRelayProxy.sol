// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.9;

/// @author Ian Rodriguez
/// @title ImplRelayProxy
/// @notice A proxy smart contract that to allow multiple relays (addresses) to call a 
/// specific smart contract (eg : Bridge or IOU)
contract ImplRelayProxy {
    address public owner;
    address public delegate;
    mapping(address => bool) internal operators;

    constructor(address _delegate) {
        owner = msg.sender;
        delegate = _delegate;
    }

    /// @notice Set or reaffirm the approved address for this proxy smart contract
    /// @dev Throws unless `msg.sender` is the current smart contract owner
    /// @param _address The new approved proxy caller
    /// @param _allowed True if the operator is approved, false to revoke approval
    function approve(address _address, bool _allowed) external {
        require(msg.sender == owner, "Function restricted to contract owner");
        operators[_address] = _allowed;
    }

    fallback() external payable {
        require(operators[msg.sender] == true, "This address is not allowed to call this contract");
        address _delegate = delegate;
        assembly {
            let ptr := mload(0x40)
            calldatacopy(ptr, 0, calldatasize())
            let result := call(gas(), _delegate, 0, ptr, calldatasize(), 0, 0)
            let size := returndatasize()
            returndatacopy(ptr, 0, size)
            switch result
            case 0 {revert(ptr, size)}
            default { return(ptr, size)}
        }
    }

    receive() external payable {}
}
