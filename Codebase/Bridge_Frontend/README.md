Just launch this server with an appropriate conf to allow users to migrate their NFT using a bridge.

# World address
Sidechain test (ERC2665): 0xD277FCd0e8199b61eE9Edb87e876dA2D8B6252aF
Mainnet (ERC2665): 0x60e31A1a38213Ec3Ba1C7345EA49C8b57f7bA4D7
Rinkeby: 0x34797AaF0848b0f495cE413e551335362bc793eD (ImplTestERC721)
  0xf2E02E4ee09428755C78658a636B31a289d772B6 (IOUExemple)

Kovan: 0x3551bc5fA3333937A8c555c66640141b432d63B0 (ImplTestERC721)
      0x237546f0f89f7ebb72283a42b125608d67fbae03 (ImplTestERC721)
  0x3c1F63bDb0Ea3Fb6d5cf06195BFD7C48a29eDDBd (IOUExemple)

Contract addresses updated the 4/11/2021

# HTTP-SERVER
This frontend is totally static. You can launch the http server like this:
``` bash
sudo http-server ./public/ -p 85 -c-1
```
For a single page app, we need all routes to redirect to index.html. NPM http-server package redirects all unknown routes to 404.html, so as weird as is can be, the entry page of the frontend is 404.html, but this file contains the app itself, and not a 404 error page.

# Deploy Bridge
On myNFT-Bridge repo: merge modif on master.
On Gloin repo, MyNFTBridge branch: version++ & commit.
  Look at git Action triggered
