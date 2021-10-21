//================MODEL==================
// Creating the model to store the state of the app and functions common to different views
let model = {};
//Load networks from server's network_list.json file
model.bridgeApp = {};
model.ABIS = {};
model.contracts = {};
model.web3 = {};
model.ogTokenMetaData = {};
/*model.loadNets = async function (_callback) {
    let bridgeApp = model.bridgeApp;
    bridgeApp.networks = [];
    bridgeApp.net = {};

    let pathNetworksJson = '/network_list.json';
    try {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', pathNetworksJson);

        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                alert("Could not load network list at " + pathNetworksJson);
            } else { // show the result
                //console.log(`Done, got ${xhr.response}`); // responseText is the server
                var resp = xhr.response;
                bridgeApp.networks = JSON.parse(resp).networks;

                //Create a mapping from networkUniqueID
                for (var i = 0; i < bridgeApp.networks.length; i++) {
                    bridgeApp.net[bridgeApp.networks[i].uniqueId] = bridgeApp.networks[i];
                } //You can now access Mainnet network data by calling bridgeApp.net.0x6d2f0e37


                _callback();

            }
        };

        xhr.send();
    } catch (err) {
        console.log(err);
        alert("Could not load network list at " + pathNetworksJson);

    };
};
model.loadRelays = async function(callback){
  let bridgeApp = model.bridgeApp;
  bridgeApp.relays = [];

  let pathRelaysJson = '/relay_list.json';
  try {
      let xhr = new XMLHttpRequest();
      xhr.open('GET', pathRelaysJson);

      xhr.onload = function () {
          if (xhr.status != 200) { // analyze HTTP status of the response
              console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
              alert("Could not load relay list at " + pathRelaysJson);
          } else { // show the result
              //console.log(`Done, got ${xhr.response}`); // responseText is the server
              var resp = xhr.response;
              bridgeApp.relays = JSON.parse(resp).relays;

              callback();

          }
      };

      xhr.send();
  } catch (err) {
      console.log(err);
      alert("Could not load relay list at " + pathRelaysJson);

  };
};

model.loadERC721ABI = async function () {
    let ABIS = model.ABIS;
    let pathERC721ABI = '/ABI/ERC721.json';
    try {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', pathERC721ABI);
        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                alert("Could not load ERC721 ABI at " + pathERC721ABI);
            } else { // show the result
                //console.log(`Done, got ${xhr.response}`); // responseText is the server
                var resp = xhr.response;
                ABIS.ERC721 = JSON.parse(resp).abi;
            }
        };
        xhr.send();
    } catch (err) {
        console.log(err);
        alert("Could not load ERC721 ABI at " + pathERC721ABI);
    };
}
model.loadERC721MetadataABI = async function () {
    let ABIS = model.ABIS;
    let pathERC721Metadata = '/ABI/ERC721Metadata.json';
    try {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', pathERC721Metadata);
        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                alert("Could not load ERC721Metadata ABI at " + pathERC721Metadata);
            } else { // show the result
                //console.log(`Done, got ${xhr.response}`); // responseText is the server
                var resp = xhr.response;
                ABIS.ERC721Metadata = JSON.parse(resp).abi;
            }
        };
        xhr.send();
    } catch (err) {
        console.log(err);
        lert("Could not load ERC721Metadata ABI at " + pathERC721Metadata);
    };
}*/

export default model;
