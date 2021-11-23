Just launch this server with an appropriate conf to allow users to migrate their NFT using a bridge.

# World address
Sidechain test (ERC2665): 0xD277FCd0e8199b61eE9Edb87e876dA2D8B6252aF
Mainnet (ERC2665): 0x60e31A1a38213Ec3Ba1C7345EA49C8b57f7bA4D7
Rinkeby: 0x34797AaF0848b0f495cE413e551335362bc793eD (ImplTestERC721)
  0xf2E02E4ee09428755C78658a636B31a289d772B6 (IOUExemple)


Kovan: 0x3551bc5fA3333937A8c555c66640141b432d63B0 (ImplTestERC721)
      0x237546f0f89f7ebb72283a42b125608d67fbae03 (ImplTestERC721)
  0x3c1F63bDb0Ea3Fb6d5cf06195BFD7C48a29eDDBd (IOUExemple)
  0x78b1297c4ce735f26b5727a3e8786a206b057b54 (IOUExmpl)

Contract addresses updated the 4/11/2021

# HTTP-SERVER
This frontend is totally static. You can launch the http server like this:
``` bash
sudo http-server ./public/ -p 85 -c-1
```
For a single page app, we need all routes to redirect to index.html. NPM http-server package redirects all unknown routes to 404.html, so as weird as is can be, the entry page of the frontend is 404.html, but this file contains the app itself, and not a 404 error page.

# Deploy myNFT-Bridge frontend
On myNFT-Bridge repo: merge modif on master.
On Gloin repo, MyNFTBridge branch: version++ & commit.
  Look at git Action triggered

# Deploy a bridge contractAddress
yarn global add truffle
cd Bridge-Contracts; yarn
//Modify truffle-config.js
truffle migrate

# Deployment rinkeby by 0x343...68a4
Mig: 0x0D8051b11F7531b44BC55CD26d1308a7308EeE50
ERC1538Delegate: 0x5d1f276B9D9545f662a16c1A6992f8D696daB829
ImplTransparentProxy: 0x7b8f7b466E1645d2456C2bF05A68bBeB39496b9f
ERC1538QueryDelegate: 0xC39BEad9BcC428840CA5E88E83d9758545142b7a
ImplMyNFTBridgeFunInit: 0x6ce20Cc3f63F272511a37d2A394eEe1833318A65
ImplERC721TokenReceiver: 0xcc493e22Cb316156Ec4f6167A7d28dA2268Cfd10
ImplMyNFTBridgeFunMigrateToERC721: 0x37169a6557350cb0072bFF27e24C4Ba32c963C92
ImplMyNFTBridgeFunMigrateFromERC721: 0xbad0F67053547Db5Ad752B4d04faab7dB0d514bb
ImplTestERC721: 0x2189ADBf23f0Bb3FAC0b0e32b50d399c07DB497E
IOUExample: 0x54938238682d260FF09759944510F6c0139452b6

# Some tokenURI
### Video, mp4
https://www.cryptograph.co/tokenuri/0xD0d0649aFd4B5459f966bb28083A66DE3C5B1AD3
  tok 291 on 0xf2E02E4ee09428755C78658a636B31a289d772B6
https://cryptograph.co/tokenuri/0xa0ecc4a6d30efe90f151f30cba3010148019cb0e
  292 om 0xf2E0
