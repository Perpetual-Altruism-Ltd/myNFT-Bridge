Just launch this server with an appropriate conf to allow users to migrate their NFT using a bridge.

# World address
Sidechain test (ERC2665): 0xD277FCd0e8199b61eE9Edb87e876dA2D8B6252aF
Mainnet (ERC2665): 0x60e31A1a38213Ec3Ba1C7345EA49C8b57f7bA4D7
Rinkeby:

# HTTP-SERVER
This frontend is totally static. You can launch the http server like this:
``` bash
sudo http-server ./public/ -p 85 -c-1
```
For a single page app, we need all routes to redirect to index.html. NPM http-server package redirects all unknown routes to 404.html, so as weird as is can be, the entry page of the frontend is 404.html, but this file contains the app itself, and not a 404 error page.
