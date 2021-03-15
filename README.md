# myNFT-Bridge
The work in progress of an universal NFT bridge. 

## Abstract
A codebase for deploying and running opinionless EVM NFT bridges allowing the transfer of NFTs between them trough third party relays who are themselves free to implement their own trust mechanism. 

Substrate modules as well as the support of more signing scheme than Ethereum Web3 and more NFT kinds than ERC-721 are planned.

## Motivation
Decentralized blockchain allows you to truly own things trough your wallet without the need for third parties such as banks and other middlemen holding your assets for you, and NFTs are just the technical representation of unique assets on a blockchain. However, an NFT is always created in a single chain, and owners might want to move their unique assets to a different chain. How to transfer the NFT and the asset it represents from a token to an another ?

This is an open ended question with no correct answers, only compromises. Many teams and solutions already exist, each with their own strenght and drawbacks, and even more will exist. This can lead to problems: 
 
- Many competing incompatible project is an overload of information for users and marketplaces. A lack of transparency and understanding will lead to a lack of trust.
- Many projects are focusing on decentralized proof of state of the owner "burning" a token and minting it in an another chain. Without the token publisher content, the minted token could be considered counterfeit in most countries. Marketplace might not be willing to take that risk and will refuse to sell the privately minted token as the original, meaning that essentially the migration has failed as the new ownership is not recognized by anyone else.

## Main bridge features

- Separate two concepts : A Bridge is a smart contract serving as an escrow/messaging system for NFT migrations (think of it as an airport 🛄), Relays are the one trusted by both token publishers and token owners to actually perform the migration (think of them as airlines ✈️).
- Can take tokens in escrow in order to mint a deed to them in an another chain.  
- Can give back tokens in escrow when the deed to them is reclaimed in the bridge the did was minted.
- Allow token publishers to veto their token being represented as deeds by third parties
- Can take tokens in escrow in order for the original token publisher to mint them in an another chain.
- Can give back tokens in escrow when the token to them is migrated back in a fashion defined by the original token publisher.
- Allow token publishers to specify the only allowed migration destinations for a proper cross-chain NFT migration as well as hooking callbacks for it.
- Can provably show declared previous owner intent to migrate
- Allow token publishers to designate relays
- Allow users to chose a relay

## More details 

https://docs.google.com/document/d/1c5Uor2By5igFWXimipcKhsWjTAG8OWrl9bSVWTPsi6U/edit?usp=sharing

## Thanks to

