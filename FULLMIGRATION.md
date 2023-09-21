
# Full migration

## Go to the url of the bridge and connect your wallet.
![1](doc/1.PNG)

## On the next page, complete the form:
- **Origin Bridge address:**  brige address in the origin network:
  - Sepolia 0x5F201e815EBBA0AD9a785cb491D3479bb8AFc7D4
  - Moonbase 0x8e647CA097BFB896f4f9050B9f15816D17616baC
- **Origin Migration controller address:** Address of the migration controller can use this one
  - Sepolia 0x512D83dDBc9b60c688BbC716f7102783d54c1658
  - Moonbase 0x01A4f7B71BAcEf0F2fA8254Aaec300C216521dF8
- **ERC721 Contract Address:**  ERC721 token contract address to migrate in the origin network
- **Destination universe:**  Destination network ID:
  - Sepolia 0x4f84498d
  - Moonbase 0xe810b6b7
- **Destination contract:**  ERC721 token contract address to migrate in the destination network

![2](doc/2.PNG)

## With all the fields completed, click on the set full migration controller button
![3](doc/3.PNG)

## Metamask notification will appear, confirm the transaction. This registers the migration controller in the origin bridge
## After that, click Approve Full Migration button and confirm the transaction that popup in Metamask. Once confirmed the full migration to the destination nerwork would be allowed.

## In the destination contract is necessary to approve this manipulator addresser as minters of the tokens:
  - Sepolia 0x345C5E1F88237bb9a3D598D3119F5fdf9342895D
  - Moonbase 0x9490cFD3BB2D54878d0Ebe381627380FFed49FDf

