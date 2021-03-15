// SPDX-License-Identifier: Unlicense
pragma solidity 0.8.2;


/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge_ERC721_Departure
/// @notice Represent the core bridge functions necessary to migrate an ERC-721 NFT from the bridge universe
interface myNFTBridge_ERC721_Departure {
    
}

/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge_Arrival
/// @notice Represent the core bridge functions necessary to migrate an ERC-721 toward the bridge universe
interface myNFTBridge_ERC721_Arrival {
    
}

/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge_Arrival
/// @notice Represent the core bridge functions necessary to setup and interact with potentials ERC-721 migrations
interface myNFTBridge_ERC721_Control {
    
}

/// @author Guillaume Gonnaud 2021
/// @title myNFTBridge
/// @notice Represent the ABI of all the core Bridge functions
interface myNFTBridge is myNFTBridge_ERC721_Departure, myNFTBridge_ERC721_Arrival, myNFTBridge_ERC721_Control{

}