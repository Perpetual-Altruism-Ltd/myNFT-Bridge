/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>

 */

// IP compliant NFT bridge.
// Author : Guillaume Gonnaud

// ---------------------------------------------------- Loading GUI -------------------------------------------
//Loading the EVM networks the bridge can interact with
var bridgeApp = {};
var contracts = {};

//---Global var---
const NoMigrationType = 0;
const RedeemMigrationType = 1;
const IOUMigrationType = 2;
const FullMigrationType = 3;
let migrationTypeSelected = NoMigrationType;

//---Display management---
const MigrationFormDisplay = 1;
const RegistrationDisplay = 2;
let currentDisplay = MigrationFormDisplay;//Initialisation, Do not write it after. Read only. To change the display, only use setDisplay()

let setDisplay = function(displayID){
  currentDisplay = displayID;
  let registrationcontainer = document.getElementById("RegistrationDisplay");
  let migrationFormcontainer = document.getElementById("MigrationFormDisplay");

  switch(displayID){
    case MigrationFormDisplay:
      registrationcontainer.style.display = 'none';
      migrationFormcontainer.style.display = 'inherit';//TRY WITH DISPLAY BLOCK AND FLEX + vertic GAP
      break;

    case RegistrationDisplay:
      registrationcontainer.style.display = 'inherit';
      migrationFormcontainer.style.display = 'none';
      break;
  }
}
//setDisplay(currentDisplay);

var loadNets = async function (_callback) {
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
}
//Load the networks and change the dropdown options based on the list
loadNets(function () {
    var ogSelector = document.getElementById("OriginNetworkSelector");
    var destSelector = document.getElementById("DestinationNetworkSelector");

    //Instanciate select options
    for (var i = 0; i < bridgeApp.networks.length; i++) {
        ogSelector.options[i] = new Option(bridgeApp.networks[i].name, bridgeApp.networks[i].uniqueId);
        destSelector.options[i] = new Option(bridgeApp.networks[i].name, bridgeApp.networks[i].uniqueId);
    }

    destSelector.selectedIndex = -1;
});

let loadRelays = async function(callback){
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
}
//Load the relays and change the dropdown options based on the list
loadRelays(function (){
  var relaySelector = document.getElementById("RelaySelector");

  //Instanciate select options
  for (var i = 0; i < bridgeApp.relays.length; i++) {
      relaySelector.options[i] = new Option(bridgeApp.relays[i].name, bridgeApp.relays[i].uniqueId);
  }
});

// ---------------------------------------------- LOADING ABIS -------------------------------------------
//Loading the ABI
var ABIS = {};
var loadERC721ABI = async function () {
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
        alert("Could not ERC721 ABI at " + pathERC721ABI);
    };
}
loadERC721ABI();

var loadERC721MetadataABI = async function () {
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
        alert("Could not ERC721Metadata ABI at " + pathERC721Metadata);
    };
}
loadERC721MetadataABI();

//=====Retrieve ABI for registration=====
//NOT FINISHED
//Interface MyNFTBridgeERC721Departure
var loadBridgeERC721DepartureABI = async function () {
    let pathERC721Metadata = '/ABI/MyNFTBridgeERC721Departure.json';
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
        alert("Could not ERC721Metadata ABI at " + pathERC721Metadata);
    };
}
//loadERC721MetadataABI();

// ---------------------------------------------- Token Interactions -------------------------------------------

//Loading a token metadata
var loadOgTokenData = async function () {

    //First we check that we have a connected wallet
    if (window.ethereum == undefined) {
        alert("Please connect to a Wallet first");
        return;
    }

    if (web3.currentProvider.selectedAddress == null) {
        alert("Please connect to a Wallet first");
        return;
    }

    let ogEthNetwork = bridgeApp.net[document.getElementById("OriginNetworkSelector").value];

    if (parseInt(web3.currentProvider.chainId) != parseInt(ogEthNetwork.chainID)) {
        alert("Please connect to the original token network in your web3 provider");
        return;
    }

    //Instanciate an ERC721 contract at the address
    contracts.originalChainERC721Contract = new web3.eth.Contract(ABIS.ERC721, document.getElementById("inputOGContractAddress").value);
    contracts.originalChainERC721MetadataContract = new web3.eth.Contract(ABIS.ERC721Metadata, document.getElementById("inputOGContractAddress").value);

	//Get the Contract Name
    let getContractName = async function () {
        try {
			let content = await originalChainERC721MetadataContract.methods.name().call();
			if(content != null){
				document.getElementById("OGContractName").innerHTML = content;
			} else {
				document.getElementById("OGContractName").innerHTML = "Not Specified";
			}

        } catch (err) {
			console.log(err);
			console.log("Could not get name() for: contractAddress" + originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
		}
    }
    getContractName();

	   //Get the Contract Symbol
    let getContractSymbol = async function () {
        try {
    			let content = await originalChainERC721MetadataContract.methods.symbol().call();
    			if(content != null){
    				document.getElementById("OGContractSymbol").innerHTML = content;
    			} else {
    				document.getElementById("OGContractSymbol").innerHTML = "Not Specified";
    			}
        } catch (err) {
    			console.log(err);
    			console.log("Could not get symbol() for: contractAddress" + originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
    		}
    }
    getContractSymbol();


    //Get the Token owner
    let getTokenOwner = async function () {
        try {
			let content = await originalChainERC721Contract.methods.ownerOf(document.getElementById("inputOGTokenID").value).call();
			if(content != null){
				document.getElementById("OGTokenOwner").innerHTML = content;
			} else {
				document.getElementById("OGTokenOwner").innerHTML = "Not Specified";
			}

        } catch (err) {
			console.log(err);
			console.log("Could not get ownerOf() for: contractAddress" + originalChainERC721Contract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);

		}
    }
    getTokenOwner();

	//Get the Token URI
    let getTokenURI = async function () {
        try {
			let content = await originalChainERC721MetadataContract.methods.tokenURI(document.getElementById("inputOGTokenID").value).call();
			if(content != null){
				document.getElementById("OGTokenURI").innerHTML = content;
        console.log(content);
				document.getElementById("OGTokenURI").href = content;

        loadOgTokenMetaData();
			} else {
				document.getElementById("OGTokenURI").innerHTML = "Not Specified";
			}

        } catch (err) {
			console.log(err);
			console.log("Could not get tokenURI() for: contractAddress" + originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);

		}
    }
    getTokenURI();

}

var ogTokenData = {};//Var ogTokenData is the origin token metadata JSON
var loadOgTokenMetaData = async function () {

    let OGTokenMetadataPath = document.getElementById("OGTokenURI").innerHTML;

    if(OGTokenMetadataPath == "Not Specified" || OGTokenMetadataPath == null){
        return;
    } else {
        console.log("sending XHR");
        try {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', OGTokenMetadataPath);
            xhr.onload = function () {
                if (xhr.status != 200) { // analyze HTTP status of the response
                    console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                    alert("Could not load network list at " + pathERC721Metadata);
                } else { // show the result
                    //console.log(`Done, got ${xhr.response}`); // responseText is the server
                    var resp = xhr.response;
                    ogTokenData = JSON.parse(resp);
                    console.log(resp);

                    document.getElementById("OGTokenMetaName").textContent = ogTokenData.name;
                    document.getElementById("OGTokenMetaDesc").textContent = ogTokenData.description;

                    //Img loading
                    let ext4 = ogTokenData.image.substr(ogTokenData.image.length - 4).toLowerCase();
                    if(ext4 == ".png" || ext4 == ".jpg" || ext4 == "jpeg" || ext4 == ".gif" || ext4 == "webp" || ext4== ".svg" || ext4 == "jfif"){
                        document.getElementById("OGTokenMetaImagePath").innerHTML = '<br><img class="imgassetpreview" src="' + encodeURI(ogTokenData.image) +'">';
                    } else if(ogTokenData.image != null) {
                        document.getElementById("OGTokenMetaImagePath").innerHTML = '<a href="' + encodeURI(ogTokenData.image) + '">' + encodeURI(ogTokenData.image) + '>';
                    }


                }
            };
            xhr.send();
        } catch (err) {
            console.log(err);
            alert("Could not ERC721Metadata ABI at " + pathERC721Metadata);
        };
    }

}

var endLoadMetamaskConnection = async function () {
    //Connecting to metmask if injected
    if (web3.__isMetaMaskShim__ && web3.currentProvider.selectedAddress != null) {
        if (connector == null || !connector.isConnected) {
            connector = await ConnectorManager.instantiate(ConnectorManager.providers.METAMASK);
            connectedButton = connectMetaMaskButton;
            providerConnected = "MetaMask";
            connection();
        } else {
            connector.disconnection();
        }
    }

}
setTimeout(endLoadMetamaskConnection, 500);


let promptSwitchChain = async function (ID) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
  });
}

//------Destination interface------
//Function which disable the migration buttons that are not selected, and let the button selected enabled.
//To unselect a button, and enable all of them, call selectMigrationButton(NoMigrationType)
//Maintain the global var migrationTypeSelected to the right value depending on which button was selected
let selectMigrationButton = function(btn){
  switch(btn){
    case RedeemMigrationType:
      migrationTypeSelected = RedeemMigrationType;
      document.getElementById("IOUMigrationButton").disabled = true;
      document.getElementById("FullMigrationButton").disabled = true;
    break;
    case IOUMigrationType:
      migrationTypeSelected = IOUMigrationType;
      document.getElementById("RedeemButton").disabled = true;
      document.getElementById("FullMigrationButton").disabled = true;
    break;
    case FullMigrationType:
      migrationTypeSelected = FullMigrationType;
      document.getElementById("RedeemButton").disabled = true;
      document.getElementById("IOUMigrationButton").disabled = true;
    break;

    default:
      migrationTypeSelected = NoMigrationType;
      document.getElementById("RedeemButton").disabled = false;
      document.getElementById("IOUMigrationButton").disabled = false;
      document.getElementById("FullMigrationButton").disabled = false;
  }
}
let RedeemButtonClick = async function(){
  //If migration already selected: enable all buttons so the user can change his choice
  if(migrationTypeSelected == RedeemMigrationType){
    selectMigrationButton(NoMigrationType);
  }else{
    selectMigrationButton(RedeemMigrationType);
  }
}
let IOUMigrationButtonClick = async function(){
  //If migration already selected: enable all buttons so the user can change his choice
  if(migrationTypeSelected == IOUMigrationType){
    selectMigrationButton(NoMigrationType);
  }else{
    selectMigrationButton(IOUMigrationType);
  }
}
let FullMigrationButtonClick = async function(){
  //If migration already selected: enable all buttons so the user can change his choice
  if(migrationTypeSelected == FullMigrationType){
    selectMigrationButton(NoMigrationType);
  }else{
    selectMigrationButton(FullMigrationType);
  }
}

//--------------------Redirecting to Migration Recap----------------------
//Packing all migration data into one JSON.
let PackMigrationData = function(){
  let migrationData = {};
  var ogNetSelector = document.getElementById("OriginNetworkSelector");
  var destNetSelector = document.getElementById("DestinationNetworkSelector");
  var relaySelector = document.getElementById("RelaySelector");

  //Origin universe
  migrationData.ogNetIndex = ogNetSelector.selectedIndex;
  migrationData.ogNet = bridgeApp.networks[ogNetSelector.selectedIndex].name;
  //Origin world
  migrationData.ogWorld = document.getElementById("inputOGContractAddress").value;
  //Origin Token
  migrationData.ogTokenID = document.getElementById("inputOGTokenID").value;
  migrationData.ogTokenName = document.getElementById("OGTokenMetaName").textContent;
  //Origin Bridge addr
  migrationData.ogBridgeAddr = bridgeApp.networks[migrationData.ogNetIndex].bridgeAdress;
  //Origin token owner
  migrationData.ogOwner = document.getElementById("OGTokenOwner").textContent;


  //Migration type
  migrationData.migrationTypeId = migrationTypeSelected;
  switch(migrationTypeSelected){
    case RedeemMigrationType: migrationData.migrationType = 'Redeem IOU'; break;
    case IOUMigrationType: migrationData.migrationType = 'Mint IOU'; break;
    case FullMigrationType: migrationData.migrationType = 'Full migration'; break;
    default: migrationData.migrationType = 'Nothing choosen';
  }
  //Migration relay
  migrationData.relayId = relaySelector.selectedIndex;
  migrationData.relay = bridgeApp.relays[relaySelector.selectedIndex].name;

  //Destination universe
  migrationData.destNetIndex = destNetSelector.selectedIndex;
  migrationData.destNet = bridgeApp.networks[destNetSelector.selectedIndex].name;
  //Destination world
  migrationData.destWorld = document.getElementById("inputDestContractAddress").value;
  //Destination Token
  migrationData.destTokenID = document.getElementById("inputDestTokenID").value;
  //Dest bridge addr
  migrationData.destBridgeAddr = bridgeApp.networks[migrationData.destNetIndex].bridgeAdress;
  //Dest owner
  migrationData.destOwner = document.getElementById("inputDestOwner").value;

  //Migrated token metadata
  switch(migrationTypeSelected){
    case IOUMigrationType:
      migrationData.metadata = ogTokenData;
      migrationData.metadata.name = "IOU of " + migrationData.metadata.name;
      break;

    default:
      migrationData.metadata = ogTokenData;
  }
  return migrationData;
}

//Send migrationData to server through GET and redirect to migration recap
let CompleteButtonClick = async function(){
  let migrationData = PackMigrationData();
  console.log(migrationData);
  //GET /register migrationData
  let form = document.getElementById("sendingForm");
  //Add data to form
  let input = document.createElement('input');
  input.setAttribute('name', 'migrationData');
  input.setAttribute('value', JSON.stringify(migrationData));//Object-Json format
  input.setAttribute('type', 'hidden');

  form.appendChild(input);
  form.submit();
}

let destNetworkChanged = function(){
  let destSelector = document.getElementById("DestinationNetworkSelector");
  let chainIndexSelected = destSelector.selectedIndex;
  let chainIDSelected = '0x' + bridgeApp.networks[chainIndexSelected].chainID;
  promptSwitchChain(chainIDSelected);
}

let destContractChanged = function(){
  document.getElementById("DestContractSymbol").innerHTML = "";
  document.getElementById("DestContractName").innerHTML = "";
  loadDestTokenData();

  //Autofill tokenID
  document.getElementById("inputDestTokenID").value = document.getElementById("inputOGTokenID").value;
  //Autofill dest owner with the current connected account
  document.getElementById("inputDestOwner").value = web3.currentProvider.selectedAddress;
}


//------Destination data loading------
var destChainERC721Contract = {};
var destChainERC721MetadataContract = {};
let loadDestTokenData = async function(){

  destChainERC721Contract = new web3.eth.Contract(ABIS.ERC721, document.getElementById("inputDestContractAddress").value);
  destChainERC721MetadataContract = new web3.eth.Contract(ABIS.ERC721Metadata, document.getElementById("inputDestContractAddress").value);

  let getContractName = async function () {
      try {
        let content = await destChainERC721MetadataContract.methods.name().call();
        if(content != null){
          document.getElementById("DestContractName").innerHTML = content;
        } else {
          document.getElementById("DestContractName").innerHTML = "Not Specified";
        }
      } catch (err) {
        console.log(err);
        console.log("Could not get name() for: contractAddress" + destChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputDestTokenID").value);
      }
  }
  getContractName();

  //Get the Contract Symbol
  let getContractSymbol = async function () {
     try {
       let content = await destChainERC721MetadataContract.methods.symbol().call();
       if(content != null){
         document.getElementById("DestContractSymbol").innerHTML = content;
       } else {
         document.getElementById("DestContractSymbol").innerHTML = "Not Specified";
       }
     } catch (err) {
       console.log(err);
       console.log("Could not get symbol() for: contractAddress" + destChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputDestTokenID").value);
     }
   }
   getContractSymbol();



}


//--------Migration registering---------


//---------Sending Metadata to server--------
let sendIOUPrefixedMetadata = async function(){
  //load metadata, prefix it by "IOU OF" and create the JSON file.
  let OGTokenMetadataPath = document.getElementById("OGTokenURI").innerHTML;
  var ogTokenData = {};
  if(OGTokenMetadataPath == "Not Specified" || OGTokenMetadataPath == null){
      return;
  } else {
      console.log("sending XHR");
      try {
          //First retrieve original metadata
          let xhr = new XMLHttpRequest();
          xhr.open('GET', OGTokenMetadataPath);
          xhr.onload = function () {
              if (xhr.status != 200) { // analyze HTTP status of the response
                  console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                  alert("Could not load network list at " + pathERC721Metadata);
              } else { // show the result
                  var resp = xhr.response;
                  ogTokenData = JSON.parse(resp);

                  //Prefix Metadata
                  ogTokenData.name = "IOU of " + ogTokenData.name;
                  ogTokenData.tokId = document.getElementById("inputOGTokenID").value; // Just for the name of the file to create serverside
                  //Watermark the image (to do later)

                  //Send the new metadata to the server
                  let xhrSend = new XMLHttpRequest();
                  xhrSend.open('POST', '/iouMetadata');
                  xhrSend.setRequestHeader("Accept", "application/json");
                  xhrSend.setRequestHeader("Content-Type", "application/json");
                  xhrSend.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                     console.log(xhrSend.status);
                     console.log(xhrSend.responseText);
                    };
                  }
                  var data = JSON.stringify(ogTokenData);
                  xhrSend.send(data);

              }
          };
          xhr.send();
      } catch (err) {
          console.log(err);
          alert("Could not ERC721Metadata ABI at " + pathERC721Metadata);
      };
  }
}
