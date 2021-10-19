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
// Collaborator: Foin Nicolas

// ---------------------------------------------------- Loading GUI -------------------------------------------
//Loading the EVM networks the bridge can interact with
var bridgeApp = {};
var contracts = {};
let migrationData = {};
let ogTokenMetaData = {};//ogTokenMetaData is the origin token metadata JSON. It is the content of the token URI
let accounts = [];
let account = "";

//---Global var---
const NoMigrationType = 0;
const RedeemMigrationType = 1;
const IOUMigrationType = 2;
const FullMigrationType = 3;
let migrationTypeSelected = NoMigrationType;

//---Display management---
const MigrationFormDisplay = 1;
const RegistrationDisplay = 2;
const RegistrationLoadingDisplay = 3;//When waiting for the network event MigrationDeparturePreRegisteredERC721
const MigrateNFTDisplay = 4;
const MigrationLoadingDisplay = 5;
const MigrationCompleteDisplay = 6;
let currentDisplay = 0;//Initialisation, Do not write it after. Read only. To change the display, only use setDisplay()
let setDisplay = function(displayID){
  currentDisplay = displayID;
  let migrationFormContainer = document.getElementById("MigrationFormDisplay");
  let registrationContainer = document.getElementById("RegistrationDisplay");
  let registrationLoadingContainer = document.getElementById("RegistrationLoadingDisplay");
  let migrateNFTContainer = document.getElementById("MigrateNFTDisplay");
  let migrationLoadingContainer = document.getElementById("MigrationLoadingDisplay");
  let migrationCompleteContainer = document.getElementById("MigrationCompleteDisplay");

  migrationFormContainer.style.display = 'none';
  registrationContainer.style.display = 'none';
  registrationLoadingContainer.style.display = 'none';
  migrateNFTContainer.style.display = 'none';
  migrationLoadingContainer.style.display = 'none';
  migrationCompleteContainer.style.display = 'none';

  switch(displayID){
    case MigrationFormDisplay:
      migrationFormContainer.style.display = 'flex';
      break;
    case RegistrationDisplay:
      registrationContainer.style.display = 'flex';
      break;
    case RegistrationLoadingDisplay:
      registrationLoadingContainer.style.display = 'flex';
      break;
    case MigrateNFTDisplay:
      migrateNFTContainer.style.display = 'flex';
      break;
    case MigrationLoadingDisplay:
      migrationLoadingContainer.style.display = 'flex';
      break;
    case MigrationCompleteDisplay:
      migrationCompleteContainer.style.display = 'flex';
      break;

    default:
      migrationFormContainer.style.display = 'flex';
      registrationContainer.style.display = 'flex';
      registrationLoadingContainer.style.display = 'flex';
      migrateNFTContainer.style.display = 'flex';
      migrationLoadingContainer.style.display = 'flex';
      migrationCompleteContainer.style.display = 'flex';
      break;
  }
}
//Set initial display when page loaded
setDisplay(MigrationFormDisplay);

// ---- SETUP CUSTOM SELECTOR ----
initDropDownBehaviour();
setupDropDown("OriginNetworkSelector");//The ID of your dropdown container
setupDropDown("RelaySelector");//The ID of your dropdown container
setupDropDown("DestinationNetworkSelector");//The ID of your dropdown container


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
    //Add select options
    for (var i = 0; i < bridgeApp.networks.length; i++) {
        addDropDownOption("OriginNetworkSelector", bridgeApp.networks[i].name, "", bridgeApp.networks[i].uniqueId);
        addDropDownOption("DestinationNetworkSelector", bridgeApp.networks[i].name, "", bridgeApp.networks[i].uniqueId);
    }
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
  //Add select options
  for (var i = 0; i < bridgeApp.relays.length; i++) {
      addDropDownOption("RelaySelector", bridgeApp.relays[i].name, "", bridgeApp.relays[i].uniqueId);
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

//Load DepartureBridge ABI
var loadBridgeERC721DepartureABI = async function () {
    let pathERC721Metadata = '/ABI/MyNFTBridgeERC721Departure.json';
    try {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', pathERC721Metadata);
        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                alert("Could not load DepartureBridge ABI at " + pathERC721Metadata);
            } else { // show the result
                var resp = xhr.response;
                ABIS.DepartureBridge = JSON.parse(resp).abi;
            }
        };
        xhr.send();
    } catch (err) {
        console.log(err);
        alert("Could not DepartureBridge ABI at " + pathERC721Metadata);
    };
}
//loadBridgeERC721DepartureABI();//TO UNCOMMENT WHEN ABI OK
ABIS.DepartureBridge = {};

//Load ArrivalBridge ABI
//TODO
ABIS.ArrivalBridge = {};

// ---------------------------------------------- LOADING CONTRACTS -------------------------------------------
let loadOgBridgeContract = async function(){
  let ogBridgeAddr = migrationData.ogBridgeAddr;
  contracts.originBridgeContract = new web3.eth.Contract(ABIS.DepartureBridge, ogBridgeAddr);
}
//loadOgBridgeContract();//TO UNCOMMENT WHEN ABI & CONTRACT OK

//TODO: Load dest Bridge contract

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
    let selectedIndex = getDropDownSelectedOptionIndex("OriginNetworkSelector");
    let ogEthNetwork = bridgeApp.net[getDropDownOptionUniqueID("OriginNetworkSelector", selectedIndex)];

    if (parseInt(web3.currentProvider.chainId) != parseInt(ogEthNetwork.chainID)) {
        alert("Please connect to the original token network in your web3 provider");
        promptSwitchChain('0x' + ogEthNetwork.chainID.toString(16));//TODELETE cuz metamask support only
        return;
    }

    //Instanciate an ERC721 contract at the address
    contracts.originalChainERC721Contract = new web3.eth.Contract(ABIS.ERC721, document.getElementById("inputOGContractAddress").value);
    contracts.originalChainERC721MetadataContract = new web3.eth.Contract(ABIS.ERC721Metadata, document.getElementById("inputOGContractAddress").value);

	//Get the Contract Name
    let getContractName = async function () {
        try {
			let content = await contracts.originalChainERC721MetadataContract.methods.name().call();
			if(content != null){
				document.getElementById("OGContractName").innerHTML = content;
			} else {
				document.getElementById("OGContractName").innerHTML = "Not Specified";
			}

        } catch (err) {
			console.log(err);
			console.log("Could not get name() for: contractAddress" + contracts.originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
		}
    }
    getContractName();

	   //Get the Contract Symbol
    let getContractSymbol = async function () {
        try {
    			let content = await contracts.originalChainERC721MetadataContract.methods.symbol().call();
    			if(content != null){
    				document.getElementById("OGContractSymbol").innerHTML = content;
    			} else {
    				document.getElementById("OGContractSymbol").innerHTML = "Not Specified";
    			}
        } catch (err) {
    			console.log(err);
    			console.log("Could not get symbol() for: contractAddress" + contracts.originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
    		}
    }
    getContractSymbol();


    //Get the Token owner
    let getTokenOwner = async function () {
        try {
			let content = await contracts.originalChainERC721Contract.methods.ownerOf(document.getElementById("inputOGTokenID").value).call();
			if(content != null){
				document.getElementById("OGTokenOwner").innerHTML = content;
			} else {
				document.getElementById("OGTokenOwner").innerHTML = "Not Specified";
			}

        } catch (err) {
			console.log(err);
			console.log("Could not get ownerOf() for: contractAddress" + contracts.originalChainERC721Contract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);

		}
    }
    getTokenOwner();

	//Get the Token URI
    let getTokenURI = async function () {
        try {
			let content = await contracts.originalChainERC721MetadataContract.methods.tokenURI(document.getElementById("inputOGTokenID").value).call();
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
			console.log("Could not get tokenURI() for: contractAddress" + contracts.originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);

		}
    }
    getTokenURI();

}

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
                    ogTokenMetaData = JSON.parse(resp);
                    console.log(resp);

                    document.getElementById("OGTokenMetaName").textContent = ogTokenMetaData.name;
                    document.getElementById("OGTokenMetaDesc").textContent = ogTokenMetaData.description;

                    //Img loading
                    let ext4 = ogTokenMetaData.image.substr(ogTokenMetaData.image.length - 4).toLowerCase();
                    if(ext4 == ".png" || ext4 == ".jpg" || ext4 == "jpeg" || ext4 == ".gif" || ext4 == "webp" || ext4== ".svg" || ext4 == "jfif"){
                        document.getElementById("OGTokenMetaImagePath").innerHTML = '<br><img class="imgassetpreview" src="' + encodeURI(ogTokenMetaData.image) +'">';
                    } else if(ogTokenMetaData.image != null) {
                        document.getElementById("OGTokenMetaImagePath").innerHTML = '<a href="' + encodeURI(ogTokenMetaData.image) + '">' + encodeURI(ogTokenMetaData.image) + '>';
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

//Loading account addr
let enableEth = async function() {
    //Will Start the metamask extension
    accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });
    account = accounts[0];
    if (account != null) {
        //document.getElementById("enableEthButton").style.display = "none";
    }
}
enableEth();
let promptSwitchChain = async function (ID) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
  });
}


//--------------------Migration Form Interface----------------------
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
let redeemButtonClick = async function(){
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
let fullMigrationButtonClick = async function(){
  //If migration already selected: enable all buttons so the user can change his choice
  if(migrationTypeSelected == FullMigrationType){
    selectMigrationButton(NoMigrationType);
  }else{
    selectMigrationButton(FullMigrationType);
  }
}

//Packing all migration data into one JSON.
let packMigrationData = function(){
  let migrationData = {};
  //Origin universe
  migrationData.ogNetIndex = getDropDownSelectedOptionIndex("OriginNetworkSelector");
  migrationData.ogNet = bridgeApp.networks[migrationData.ogNetIndex].name;
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
  migrationData.relayId = getDropDownSelectedOptionIndex("RelaySelector");
  migrationData.relay = bridgeApp.relays[Math.max(0, migrationData.relayId)].name;

  //Destination universe
  migrationData.destNetIndex = getDropDownSelectedOptionIndex("DestinationNetworkSelector");
  migrationData.destNet = bridgeApp.networks[Math.max(0, migrationData.destNetIndex)].name;
  //Destination world
  migrationData.destWorld = document.getElementById("inputDestContractAddress").value;
  //Destination Token
  migrationData.destTokenID = document.getElementById("inputDestTokenID").value;
  //Dest bridge addr
  migrationData.destBridgeAddr = bridgeApp.networks[Math.max(0, migrationData.destNetIndex)].bridgeAdress;
  //Dest owner
  migrationData.destOwner = document.getElementById("inputDestOwner").value;

  //Migrated token metadata. Metadata on dest network
  switch(migrationTypeSelected){
    case IOUMigrationType:
      migrationData.metadata = getIOUPrefixedMetadata();
      break;

    default:
      migrationData.metadata = ogTokenMetaData;
  }
  return migrationData;
}

//Display migration registration interface
let completeButtonClick = async function(){
  //Put all data into one object : migrationData
  migrationData = packMigrationData();
  //Display the registration interface
  setDisplay(RegistrationDisplay);
  refreshMigrationDataDisplay();
  console.log("=====Migration Data=====");
  console.log(migrationData);
}

//Prompt user to connect to new chain selected from origin network selector
addDropDownOnChangeCallback("OriginNetworkSelector", function(chainIndexSelected){
  let chainIDSelected = '0x' + bridgeApp.networks[chainIndexSelected].chainID.toString(16);
  console.log("Switching to network id " + chainIDSelected);
  promptSwitchChain(chainIDSelected);//TODELETE cuz metamask support only.
});

//Prompt user to connect to new chain selected from destination network selector
addDropDownOnChangeCallback("DestinationNetworkSelector", function(chainIndexSelected){
  let chainIDSelected = '0x' + bridgeApp.networks[chainIndexSelected].chainID.toString(16);
  console.log("Switching to network id " + chainIDSelected);
  promptSwitchChain(chainIDSelected);//TODELETE cuz metamask support only.
});

//Autofill tokenID & owner with current departure data when destWorld input changed
let destContractChanged = function(){
  document.getElementById("DestContractSymbol").innerHTML = "";
  document.getElementById("DestContractName").innerHTML = "";
  loadDestTokenData();

  //Autofill tokenID
  document.getElementById("inputDestTokenID").value = document.getElementById("inputOGTokenID").value;
  //Autofill dest owner with the current connected account
  document.getElementById("inputDestOwner").value = account;
}

//------Destination data loading------
var destChainERC721Contract = {};
var destChainERC721MetadataContract = {};
let loadDestTokenData = async function(){

  try{
    destChainERC721Contract = new web3.eth.Contract(ABIS.ERC721, document.getElementById("inputDestContractAddress").value);
    destChainERC721MetadataContract = new web3.eth.Contract(ABIS.ERC721Metadata, document.getElementById("inputDestContractAddress").value);
  }catch(err){
    document.getElementById("DestContractName").innerHTML = "Unable to connect to contract.";
    document.getElementById("DestContractSymbol").innerHTML = "Unable to connect to contract.";
  }

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

//--------------------------------------------Register Migration-----------------------------------------
//----------Registration Interface--------
let editMigrationButtonClick = function(){
  setDisplay(MigrationFormDisplay);
}

let refreshMigrationDataDisplay = function(){
  document.getElementById("OGNetworkRegistrationDisp").textContent = migrationData.ogNet;
  document.getElementById("OGContractAddressRegistrationDisp").textContent = migrationData.ogWorld;
  document.getElementById("OGTokenIDRegistrationDisp").textContent = migrationData.ogTokenID;
  document.getElementById("TokenNameRegistrationDisp").textContent = migrationData.ogTokenName;

  document.getElementById("MigrationTypeRegistrationDisp").textContent = migrationData.migrationType;
  document.getElementById("MigrationRelayRegistrationDisp").textContent = migrationData.relay;

  document.getElementById("DestNetworkRegistrationDisp").textContent = migrationData.destNet;
  document.getElementById("DestContractAddressRegistrationDisp").textContent = migrationData.destWorld;
  document.getElementById("DestTokenIDRegistrationDisp").textContent = migrationData.destTokenID;
}

//-------------Register-------------
//Ask user to grant approvalForAll to the relay
let grantRelayOperatorPrivilege = async function(){
  try{
    let relayOgNetworkAddr = bridgeApp.relays[0].relayNetworkaddr.rinkeby;//TODO ADAPT DEPENDING ON THE OG NETWORK
    contracts.originalChainERC721Contract.methods.setApprovalForAll(relayOgNetworkAddr, "true")
    .send({from: account, gas: 30000,})
    .then((res) => {
      console.log("Relay is now an operator");
      console.log(res);
      document.getElementById("RegistrationLoadingText").textContent = "Waiting for the relay to proceed to the token transfert.";
      //Waiting for the transaction to be accepted on the blockchain.
    });
  }catch(err){
    console.log("Error when setting relay as an operator: " + err);
  }
}

//Start listening to preRegister event on departure bridge
let setupPreRegisterEventListener = async function(){
  //Pre register IOU migration Event
  contracts.originBridgeContract.events.MigrationDeparturePreRegisteredERC721IOU(options)
          .on('data', function(event) {
            console.log("IOU Migration successfully pre-registered.");
          })
          .on('error', err => console.error(err));

  //Pre register IOU migration Event
  contracts.originBridgeContract.events.MigrationDeparturePreRegisteredERC721IOU(options)
          .on('data', function(event) {
            console.log("Full Migration successfully pre-registered.");

          })
          .on('error', err => console.error(err));
}

//Pre register migration to departure bridge by calling ogBridge.migrateToERC721[Full | IOU] serverside
//will emit MigrationDeparturePreRegisteredERC721[IOU | Full](..., MIGRATIONHASH) event
let preRegisterMigration = async function(){

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

let registerButtonClick = async function(){
  //Ask the user to grant operator privilege to the relay
  grantRelayOperatorPrivilege();
  setDisplay(RegistrationLoadingDisplay);
  //Listen to preRegister event on blockchain
  //setupPreRegisterEventListener();
  //1 - Pre register migration
  //preRegisterMigration();

  //2 - Transfer origin token to escrow (serverside)
  //-> emit event TokenDepositedInEscrowERC721(migrationHash, ESCROWHASH)
  //3 - Ask user to sign escrowHash
  //4 - Write migration data in destination bridge
  //Call destBridge.migrateFrom*(..., proofEscrowHashSigned)
  //5 - Ask user to sign migrationRelayedHash
  //6 - Transfer dest token to dest owner
}

//-----------------------------------Migrate NFT------------------------------------
let signEscrowHashButtonClick = function(){
  setDisplay(5);
}

//-----------------------------------Metadata prefixing------------------------------
let getIOUPrefixedMetadata = function(){
  //Prefix Metadata
  let IOUPrefixedMetadata = {};
  IOUPrefixedMetadata = JSON.parse(JSON.stringify(ogTokenMetaData));//Deep copy
  IOUPrefixedMetadata.name = "IOU of " + ogTokenMetaData.name;
  //Add migration data
  var ogNetSelectorIndex = getDropDownSelectedOptionIndex("OriginNetworkSelector");
  IOUPrefixedMetadata.originUniverse = bridgeApp.networks[ogNetSelectorIndex].name;
  IOUPrefixedMetadata.originWorld = document.getElementById("inputOGContractAddress").value;
  IOUPrefixedMetadata.originTokenId = document.getElementById("inputOGTokenID").value;
  //Watermark the image (to do later)
  return IOUPrefixedMetadata;
}

//---------Sending Metadata to server--------
//load metadata, prefix it by "IOU OF", add migration details and send the JSON file to the server.
let sendIOUPrefixedMetadata = async function(){
  //Send the new metadata to the server
  let xhrSend = new XMLHttpRequest();
  xhrSend.open('POST', '/iouMetadata');
  xhrSend.setRequestHeader("Accept", "application/json");
  xhrSend.setRequestHeader("Content-Type", "application/json");
  xhrSend.onreadystatechange = function () {
    if (xhrSend.readyState === 4) {
     console.log(xhrSend.status);
     console.log(xhrSend.responseText);
    };
  }
  var data = JSON.stringify(getIOUPrefixedMetadata());
  xhrSend.send(data);
}
