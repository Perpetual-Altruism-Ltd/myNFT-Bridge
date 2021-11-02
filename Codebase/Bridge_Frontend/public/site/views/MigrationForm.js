import AbstractView from './AbstractView.js';

//0xf181e8B385FE770C78e3B848F321998F78b0d73e
//0xbf21e21414554dB734C9f86835D51B57136BC35b
//Rinkeby ERC721 contract: 0x04f34D9Bb1595Bc50D90953DFb593348d87faea3
//Rinkeby ERC721 contract: 0x04f34D9Bb1595Bc50D90953DFb593348d87faea3

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Migration form");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let ogTokenMetaData = model.ogTokenMetaData;
    let migData = model.migrationData;
    //Account var represent the addr whith which the user is connected when clicking Fetch Data btn.
    //This var is not refreshed after this step on purpose.
    let userAccount = "";

    //Load data from server: static files like conf and ABIs
    let loadNets = async function (_callback) {
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
    };
    let loadERC721ABI = async function () {
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
    };
    let loadERC721MetadataABI = async function () {
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
    };

    //Update global var (i.e. model) and display avilable dest net once new network is selected
    let onChainSwitchedSuccess = function(){
      //Display next form field: ogWorld input
      showCardLine("OriginWorldCardLine", true);

      //Save origin network in the object migData to access it later during the migration process
      migData.originUniverseIndex = getDropDownSelectedOptionIndex("OriginNetworkSelector");
      migData.originUniverse = bridgeApp.networks[migData.originUniverseIndex].name;
      migData.originUniverseUniqueId = bridgeApp.networks[migData.originUniverseIndex].uniqueId;
      migData.originNetworkId = bridgeApp.networks[migData.originUniverseIndex].networkID;

      //Show the available destination networks for the ogNet selected
      for(const target of bridgeApp.networks[migData.originUniverseIndex].targetList){
        let destNetId = target.networkId
        let targetNet = {};
        for(const network of bridgeApp.networks){
          if(network.networkID == destNetId)
            targetNet = network;
        }
        addDropDownOption("DestinationNetworkSelector", targetNet.name, "", targetNet.uniqueId);
      }
    }
    //Define functions which interact with blockchains or wallet
    let promptSwitchChain = async function (ID) {
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
      }).then((res) =>{
        console.log("Network switch done.");
        onChainSwitchedSuccess();
      }).catch((res) => {
        console.log("Network switch canceled or error");
        prefillOriginNetwork();
        alert("Please accept the metamask switch network prompt in order to change to desired network");
      });
    }
    //Load a token metadata from chain
    let loadOgTokenData = async function () {

        //First we check that we have a connected wallet
        if (window.ethereum == undefined) {
            alert("Please connect to a Wallet first");
            return;
        }

        if (window.web3.currentProvider.selectedAddress == null) {
            alert("Please connect to a Wallet first");
            return;
        }
        let selectedIndex = getDropDownSelectedOptionIndex("OriginNetworkSelector");
        //let ogEthNetwork = bridgeApp.net[getDropDownOptionUniqueID("OriginNetworkSelector", selectedIndex)];//TODELETE IF NO ISSUE WITH THE NEXT LINE
        let ogEthNetworkId = migData.originNetworkId;

        if (parseInt(window.web3.currentProvider.chainId) != parseInt(ogEthNetworkId)) {
            alert("Please connect to the original token network in your web3 provider");
            promptSwitchChain('0x' + ogEthNetworkId.toString(16));
            return;
        }

        //Instanciate an ERC721 contract at the address
        contracts.originalChainERC721Contract = new window.web3.eth.Contract(ABIS.ERC721, document.getElementById("inputOGContractAddress").value);
        contracts.originalChainERC721MetadataContract = new window.web3.eth.Contract(ABIS.ERC721Metadata, document.getElementById("inputOGContractAddress").value);

        //Display token data card
        document.getElementById("TokenDataCard").style.display = 'flex';
        document.getElementById("MigrationCard").style.display = 'flex';
        document.getElementById("MigrationCardLineTitle").style.display = 'flex';
        document.getElementById("DestNetworkCardLine").style.display = 'flex';

    	  //Get the Contract Name
        let getContractName = async function () {
          let content = "";
          try {
      			content = await contracts.originalChainERC721MetadataContract.methods.name().call();
          } catch (err) {
      			console.log(err);
      			console.log("Could not get name() for: contractAddress" + contracts.originalChainERC721MetadataContract._address + "   tokenID: " + document.getElementById("inputOGTokenID").value);
      		}

          //Display or not the html element
          if(content != ""){
            document.getElementById("OGContractName").innerHTML = content;
            showCardLine("OriginWorldNameCardLine", true);
          } else {
            showCardLine("OriginWorldNameCardLine", false);
          }
        }
        getContractName();

    	  //Get the Contract Symbol
        let getContractSymbol = async function () {
          let content = "";
          try {
      			content = await contracts.originalChainERC721MetadataContract.methods.symbol().call();
          } catch (err) {
      			console.log(err);
      			console.log("Could not get symbol() for: contractAddress" + contracts.originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
      		}
          //Display or not the ctrc symbol
          if(content != ""){
            document.getElementById("OGContractSymbol").innerHTML = content;
            showCardLine("OriginWorldSymbolCardLine", true);
          } else {//Else hide the contract symbol line
            showCardLine("OriginWorldSymbolCardLine", false);
          }
        }
        getContractSymbol();

        //Get the Token owner
        let getTokenOwner = async function () {
          let content = "";
          try {
      			content = await contracts.originalChainERC721Contract.methods.ownerOf(document.getElementById("inputOGTokenID").value).call();
          } catch (err) {
      			console.log(err);
      			console.log("Could not get ownerOf() for: contractAddress" + contracts.originalChainERC721Contract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
      		}

          //Display or not the owner
          if(content != ""){
            document.getElementById("OGTokenOwner").innerHTML = content;
            showCardLine("OriginTokenOwnerCardLine", true);
            //Add origin token owner to migData
            migData.originOwner = content.toLowerCase();
            //display not owner msg depending on the connected addr & tok owner
            checkAndDisplayNotOwnerMsg();
          } else {
            showCardLine("OriginTokenOwnerCardLine", false);
            //Inform user that no user was found on this NFT
            displayNoOwnerMsg();
          }

        }
        getTokenOwner();

    	  //Get the Token URI
        let getTokenURI = async function () {
          let content = "";
          try {
      			content = await contracts.originalChainERC721MetadataContract.methods.tokenURI(document.getElementById("inputOGTokenID").value).call();
          } catch (err) {
      			console.log(err);
      			console.log("Could not get tokenURI() for: contractAddress" + contracts.originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
      		}

          if(content != ""){
            //Display tokenURI
            document.getElementById("OGTokenURI").innerHTML = content;
            console.log("TokenURI: " + content);
            document.getElementById("OGTokenURI").href = content;
            showCardLine("OriginTokenURICardLine", true);

            //Load and display metadata from JSON file
            showCard("MetadataCard", true);
            loadOgTokenMetaData();
          } else {
            //Hide TokenURI display
            showCardLine("OriginTokenURICardLine", false);
            //Hide all metadata fields display
            showCard("MetadataCard", false);
          }
        }
        getTokenURI();
    };
    //Load token metadata from TokenURI
    let loadOgTokenMetaData = async function () {
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

                      //If token is an IOU, extract data from the json metadata file into migData object
                      if(isIOUToken(ogTokenMetaData)){
                        console.log("This token is an IOU of token " + ogTokenMetaData.migrationData.originTokenId + ", from world " + ogTokenMetaData.migrationData.originWorld + " from universe " + ogTokenMetaData.migrationData.originUniverse);

                        //Save all data from NFT => IOU migration into migData
                        migData.metadataDestinationUniverseUniqueId  = ogTokenMetaData.migrationData.originUniverse;
                        //retrieve the index & name of the universe from its uniqueID
                        bridgeApp.networks.forEach((univ, i) => {
                          if(univ.uniqueId == migData.metadataDestinationUniverseUniqueId){
                            migData.metadataDestinationUniverseIndex = i;
                            migData.metadataDestinationUniverse = univ.name;
                          }
                        });

                        migData.metadataDestinationWorld  = ogTokenMetaData.migrationData.originWorld;
                        migData.metadataDestinationTokenId  = ogTokenMetaData.migrationData.originTokenId;
                        migData.metadataDestinationBridgeAddr = bridgeApp.networks[Math.max(0, migData.metadataDestinationUniverseIndex)].bridgeAdress
                        console.log(migData);
                      }

                      document.getElementById("OGTokenMetaName").textContent = ogTokenMetaData.name;
                      document.getElementById("OGTokenMetaDesc").textContent = ogTokenMetaData.description;
                      //Add token name to migData to display it later in registerMig page
                      migData.originTokenName = ogTokenMetaData.name;
                      //Img loading
                      let ext4 = ogTokenMetaData.image.substr(ogTokenMetaData.image.length - 4).toLowerCase();
                      console.log(ext4);
                      if(isIOUToken(ogTokenMetaData) || ext4 == ".png" || ext4 == ".jpg" || ext4 == "jpeg" || ext4 == ".gif" || ext4 == "webp" || ext4== ".svg" || ext4 == "jfif"){
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
    };
    //Load destination contract name and symbol
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
    //Check if the metadata json file represent an IOU
    let isIOUToken = function(metadata){
      if(metadata != null && metadata != undefined){
        return metadata.migrationData != undefined
        && metadata.migrationData.originUniverse != undefined
        && metadata.migrationData.originWorld != undefined
        && metadata.migrationData.originTokenId != undefined;
      }else{
        return false;
      }
    }

    //---Functions which interact with relay's backend---
    //Query relay for list of dest worlds available for the destination network selected
    //And display it into dropDown
    let getRelayAvailableWorlds = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {universe: ''}
      };
      options.url = relayURL + '/getAvailableWorlds';
      options.data.universe = migData.destinationUniverseUniqueId;

      axios.request(options).then(function (response) {
        //Add dest world available to dropdown and model.bridgeApp
        console.log("Available worlds: " + response.data.worlds);
        if(response.status == 200 && response.data.worlds){
          bridgeApp.destWorlds = [];
          response.data.worlds.forEach((worldAddr, i) => {
            bridgeApp.destWorlds.push(worldAddr);
            addDropDownOption("DestinationWorldSelector", worldAddr, "", i);
          });
        }
      }).catch(function (error) {
        console.error(error);
      });
    }
    let getAvailableTokenId = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/getAvailableTokenId';
      options.data.universe = migData.destinationUniverseUniqueId;
      options.data.world = migData.destinationWorld;

      axios.request(options).then(function (response) {
        if(response.status != 200){console.log(response.status + response.statusText);}
        console.log("Available tokenId: " + response.data.tokenId);

        //Save tokenID into migData
        migData.destinationTokenId = response.data.tokenId;

        //Display tokenID
        document.getElementById("DestTokenID").textContent = migData.destinationTokenId;
      }).catch(function (error) {
        console.error(error);
      });
    }

    //Prefill functions
    //Prefill origin network with the one the user is connected to
    let prefillOriginNetwork = function(){
      let connectedChainId = parseInt(window.web3.currentProvider.chainId);
      //If user connected to a chain trough his wallet: prefill and show next form field
      if(connectedChainId != undefined){
        bridgeApp.networks.forEach((net, i) => {
          if(net.chainID == connectedChainId){
            selectDropDownOptionByIndex("OriginNetworkSelector", i);
            //Show next form field
            onChainSwitchedSuccess();
          }
        });
      }
    }

    //Display functions
    let clearTokenData = function(){
      document.getElementById("TokenErrorMessage").style.display = 'none';
      document.getElementById("OGContractName").innerHTML = "";
      document.getElementById("OGContractSymbol").innerHTML = "";
      document.getElementById("OGTokenOwner").innerHTML = "";
      document.getElementById("OGTokenURI").innerHTML = "";
      document.getElementById("OGTokenMetaName").textContent = "";
      document.getElementById("OGTokenMetaDesc").textContent = "";
      document.getElementById("OGTokenMetaImagePath").innerHTML = "";

      //Also disable redeem button by default
      document.getElementById("RedeemButton").disabled = true;
    }
    let hideFormFieldsFromMigrationCard = function(){
      //Hide all elements following departure card
      let elementsToHide = document.querySelectorAll("#MigrationCard,#MigrationCardLineTitle,#MigrationTypeCardLine,#MigrationRelayCardLine,#ArrivalCard,#ArrivalCardLineTitle,#DestNetworkCardLine,#DestWorldCardLine,#DestWorldNameCardLine,#DestWorldSymbolCardLine,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });
    }
    let checkAndDisplayNotOwnerMsg = function(){

      //Handle if user is not the owner
      if(userAccount != migData.originOwner){
        console.log("Connected addr: " + userAccount + ", token owner: " + migData.originOwner);
        let errorMsg = document.getElementById("TokenErrorMessage");
        errorMsg.innerHTML = "You are not the owner of this NFT. You can't migrate it.";

        document.getElementById("TokenErrorMessage").style.display = 'flex';
        hideFormFieldsFromMigrationCard();
      }else{//If user is the owner, show it next to owner address.
        document.getElementById("OGTokenOwner").innerHTML = document.getElementById("OGTokenOwner").innerHTML + '&emsp;<span style="font-weight: normal;font-style: italic;">(It\'s you !)</span>';
      }
    }
    let displayNoOwnerMsg = function(){
      let errorMsg = document.getElementById("TokenErrorMessage");
      errorMsg.innerHTML = "No owner could be found for this NFT.";

      document.getElementById("TokenErrorMessage").style.display = 'flex';
      hideFormFieldsFromMigrationCard();
    }
    let showCard = function(id, disp){
      document.getElementById(id).style = (disp ? "display:flex;" : "display:none;")
    }
    let showCardLine = function(id, disp){
      showCard(id, disp);
    }

    //Tell weather user come with migData object already filled up or not.
    let isMigDataAlreadyFilled = function(){
      //TODO
    }
    //Prefill all form fields
    let prefillMigFormWithMigData = function(){
      //TODO
    }

    //Setup custom selector
    setupDropDown("OriginNetworkSelector");
    setupDropDown("RelaySelector");
    setupDropDown("DestinationNetworkSelector");
    setupDropDown("DestinationWorldSelector");

    //Clear drop down from possibly previous data
    clearDropDownOptions("OriginNetworkSelector");
    clearDropDownOptions("RelaySelector");
    clearDropDownOptions("DestinationNetworkSelector");
    clearDropDownOptions("DestinationWorldSelector");

    //Display connected account addr
    userAccount = window.web3.currentProvider.selectedAddress;
    if(userAccount != "" && window.web3.eth != undefined){
      console.log("Westron lib loaded.");
      document.getElementById("ConnectedAccountAddr").textContent = userAccount;

      //Show origin network drop down
      showCard("DepartureCard", true);
      showCardLine("OriginNetworkCardLine", true);

      //Prefill origin network
      setTimeout(prefillOriginNetwork, 1000);
    }
    else{
      document.getElementById("ConnectedAccountAddr").textContent = "Wallet not connected. Redirect to connection page.";
      console.log("Westron lib not loaded. Redirecting to wallet_connection");
      model.navigateTo('wallet_connection');
      return;//To stop javascript execution in initCode() function
    }

    //Load networks
    loadNets(function () {
        //Add select options
        for (var i = 0; i < bridgeApp.networks.length; i++) {
            addDropDownOption("OriginNetworkSelector", bridgeApp.networks[i].name, "", bridgeApp.networks[i].uniqueId);
        }
    });
    //Load relays
    loadRelays(function (){
      //Add select options
      for (var i = 0; i < bridgeApp.relays.length; i++) {
          addDropDownOption("RelaySelector", bridgeApp.relays[i].name, "", bridgeApp.relays[i].uniqueId);
      }
    });
    //Load ERC721 ABI
    loadERC721ABI();
    //Load ERC721 Metadata ABI
    loadERC721MetadataABI();

    //Listeners & Callback
    //When new origin network selected : Prompt user to connect to new chain selected
    addDropDownOnChangeCallback("OriginNetworkSelector", function(chainIndexSelected){
      let chainIDSelected = '0x' + bridgeApp.networks[chainIndexSelected].chainID.toString(16);
      console.log("Switching to network id " + chainIDSelected);

      //CLEAR PREVIOUS DATA
      clearTokenData();
      //Clear drop downs
      //clearDropDownOptions("RelaySelector");
      clearDropDownOptions("DestinationNetworkSelector");
      clearDropDownOptions("DestinationWorldSelector");

      //Reset migration buttons. Unselect the previously selected button.
      let migButtonsCard = document.getElementById("MigrationTypeCardLine");
      let selected = migButtonsCard.querySelector(".Selected");
      if(selected != undefined){selected.classList.remove('Selected');}

      //Hide all following elements
      let elementsToHide = document.querySelectorAll("#OriginWorldCardLine,#OriginTokenIDCardLine,#TokenDataCard,#TokenErrorMessage,#MigrationCard,#MigrationCardLineTitle,#MigrationTypeCardLine,#MigrationRelayCardLine,#ArrivalCard,#ArrivalCardLineTitle,#DestNetworkCardLine,#DestWorldCardLine,#DestWorldNameCardLine,#DestWorldSymbolCardLine,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });

      promptSwitchChain(chainIDSelected);
    });
    addDropDownOnChangeCallback("RelaySelector", function(chainIndexSelected){
      //Clear destWorld previous data
      clearDropDownOptions("DestinationWorldSelector");

      //if MINT IOU
      if(migData.migrationType == model.MintOUIMigrationType){
        //Display next form field: arrival title + arrival dest network
        document.getElementById("ArrivalCard").style.display = 'flex';
        document.getElementById("ArrivalCardLineTitle").style.display = 'flex';
        document.getElementById("DestWorldCardLine").style.display = 'flex';
        migData.migrationRelayIndex = getDropDownSelectedOptionIndex("RelaySelector");
        migData.migrationRelay = bridgeApp.relays[Math.max(0, migData.migrationRelayIndex)].name;

        //Load available destination world from relay
        getRelayAvailableWorlds();
      }
      //Else REDEEM: display all following form fields and prefill them with data from metadata
      else if(migData.migrationType == model.RedeemIOUMigrationType){
        //SHOW all next form field which are prefilled
        let elementsToShow = document.querySelectorAll("#ArrivalCard,#ArrivalCardLineTitle,#DestNetworkCardLine,#DestWorldCardLine,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
        elementsToShow.forEach(function(elem) {
          elem.style.display = 'flex';
        });
      }
    });
    addDropDownOnChangeCallback("DestinationNetworkSelector", function(chainIndexSelected){
      //CLEAR PREVIOUS DATA
      //First, clear previous data.
      document.getElementById("DestContractName").innerHTML = "";
      document.getElementById("DestContractSymbol").innerHTML = "";

      //Reset migration buttons. Unselect the previously selected button.
      let migButtonsCard = document.getElementById("MigrationTypeCardLine");
      let selected = migButtonsCard.querySelector(".Selected");
      if(selected != undefined){selected.classList.remove('Selected');}
      //Clear drop downs
      //clearDropDownOptions("RelaySelector");
      //load available relay from network_list and relay_list

      //HIDE form fields further than one step from dest network drop down
      let elementsToHide = document.querySelectorAll("#MigrationRelayCardLine,#ArrivalCard,#ArrivalCardLineTitle,#DestWorldCardLine,#DestWorldNameCardLine,#DestWorldSymbolCardLine,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });

      //SAVE data to migData object
      //This index is relative to the list of destination networks which is different from the list of all networks.
      let destUnivDropDownIndex = getDropDownSelectedOptionIndex("DestinationNetworkSelector");
      let destUnivList = bridgeApp.networks[migData.originUniverseIndex].targetList;
      let destUnivId = destUnivList[destUnivDropDownIndex].networkId;
      //This index is the one relative to the full list of all networks. i.e. network_list.json
      let destUnivAbsoluteIndex = 0;
      let destUnivUniqueId = "";
      bridgeApp.networks.forEach((network, i) => {
        if(network.networkID == destUnivId){
          destUnivAbsoluteIndex = i;
          destUnivUniqueId = network.uniqueId;
        }
      });
      migData.destinationUniverseIndex = destUnivAbsoluteIndex;
      migData.destinationUniverseUniqueId = destUnivUniqueId;
      migData.destinationUniverse = bridgeApp.networks[Math.max(0, migData.destinationUniverseIndex)].name;
      migData.destinationBridgeAddr = bridgeApp.networks[Math.max(0, migData.destinationUniverseIndex)].bridgeAdress;

      //Display
      //If dest network is the one from metadata of IOU token, enable redeem button
      if(migData.destinationUniverseUniqueId == migData.metadataDestinationUniverseUniqueId){
        document.getElementById("RedeemButton").disabled = false;
      }else{
        document.getElementById("RedeemButton").disabled = true;
      }
      //DISPLAY next form field: migration type buttons
      document.getElementById("MigrationTypeCardLine").style.display = 'flex';
    });
    addDropDownOnChangeCallback("DestinationWorldSelector", function(chainIndexSelected){
      //If not redeem: display next form field and load data from relay
      if(migData.migrationType != model.RedeemIOUMigrationType){
        //Load dest world info
        //loadDestTokenData():

        //Show dest world infos
        /*showCardLine("DestWorldNameCardLine", true);
        showCardLine("DestWorldSymbolCardLine", true);*/
        showCardLine("DestTokenIdCardLine", true);

        //Save destWorld addr into migData object
        let destWorldIndex = getDropDownSelectedOptionIndex("DestinationWorldSelector");
        migData.destinationWorld = bridgeApp.destWorlds[destWorldIndex];

        //Display next form field: dest owner input
        showCardLine("DestOwnerCardLine", true);
        //Prefill destTokenOwner with the current connected address
        document.getElementById("inputDestOwner").value = userAccount;

        //Display loading text for tokenID
        document.getElementById("DestTokenID").textContent = "Fetching...";
        //Load desination tokenId from relay
        getAvailableTokenId();
      }
    });

    //===Origin world input===
    //When return/enter key pressed in input: Display ogTokenID input
    document.getElementById("inputOGContractAddress").addEventListener('keyup', async(e) =>{
      //Unfocus input when enter key is pressed
      if (e.key === 'Enter' || e.keyCode === 13) {
        document.getElementById("inputOGContractAddress").dispatchEvent(new Event("focusout"));
      }
    });
    //When input is unfocused, display originTokenID input
    document.getElementById("inputOGContractAddress").addEventListener('focusout', async() =>{
      document.getElementById("OriginTokenIDCardLine").style.display = 'flex';
      migData.originWorld = document.getElementById("inputOGContractAddress").value;
    });

    //===Origin tokenID input===
    //When return/enter key pressed in input: Display dest owner input
    document.getElementById("inputOGTokenID").addEventListener('keyup', async(e) =>{
      //Unfocus input when enter key is pressed
      if (e.key === 'Enter' || e.keyCode === 13) {
        document.getElementById("inputOGTokenID").dispatchEvent(new Event("focusout"));
        //Trigger Fetch data button
        document.getElementById("FetchDataButton").click();
      }
    });
    document.getElementById("inputOGTokenID").addEventListener('focusout', async() =>{
      let inputVal = document.getElementById("inputOGTokenID").value;
      if(inputVal.startsWith('0x')){
        migData.originTokenId = parseInt(inputVal, 16).toString();
      }else{
        migData.originTokenId = inputVal;
      }
    });

    //===Destination owner input===
    //When return/enter key pressed in input: Display complete button
    document.getElementById("inputDestOwner").addEventListener('keyup', async(e) =>{
      //Unfocus input when enter key is pressed
      if (e.key === 'Enter' || e.keyCode === 13) {
        document.getElementById("inputDestOwner").dispatchEvent(new Event("focusout"));
      }
    });
    //When input is unfocused, display originTokenID input
    document.getElementById("inputDestOwner").addEventListener('focusout', async() =>{
      document.getElementById("CompleteMigrationCard").style.display = 'flex';
      migData.destinationOwner = document.getElementById("inputDestOwner").value;
    });

    //Disconnect wallet button
    document.getElementById("DisconnectWalletBtn").addEventListener('click', async() =>{
      //HERE
      //OR RELOAD APP
      model.disconnectWallet = true;
      model.navigateTo('wallet_connection');
    });

    //Migration type buttons
    document.getElementById("FullMigrationButton").addEventListener('click', async() =>{/*NOTHING*/});
    document.getElementById("IOUMigrationButton").addEventListener('click', function() {
      model.isRedeem = false;

      //Unselect the previously selected button.
      let selected = this.parentNode.querySelector(".Selected");
      if(selected != undefined && selected.id == "IOUMigrationButton"){return;}
      if(selected != undefined){selected.classList.remove('Selected');}
      //Select the clicked button
      this.classList.add('Selected');

      //Display next form field: relay drop down
      document.getElementById("MigrationRelayCardLine").style.display = 'flex';
      migData.migrationType = model.MintOUIMigrationType;

      //Hide further form field if ever displayed
      let elementsToHide = document.querySelectorAll("#ArrivalCard,#ArrivalCardLineTitle,#DestWorldCardLine,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });
    });
    document.getElementById("RedeemButton").addEventListener('click', function() {

      //Add migration type to migData object
      migData.migrationType = model.RedeemIOUMigrationType;
      model.isRedeem = true;//Same, to delete

      //Select button, & hold it pressed
      let selected = this.parentNode.querySelector(".Selected");
      if(selected != undefined && selected.id == "RedeemButton"){return;}
      if(selected != undefined){selected.classList.remove('Selected');}
      this.classList.add('Selected');

      //Fill migData object with migration data from metadata: destNet, world, tokenId
      migData.destinationUniverseUniqueId = migData.metadataDestinationUniverseUniqueId;
      migData.destinationUniverseIndex = migData.metadataDestinationUniverseIndex;
      migData.destinationUniverse = migData.metadataDestinationUniverse;
      migData.destinationWorld = migData.metadataDestinationWorld;
      migData.destinationTokenId = migData.metadataDestinationTokenId;
      migData.destinationBridgeAddr = migData.metadataDestinationBridgeAddr;

      //PREFILL fields
      //destuniv
      selectDropDownOptionByUniqueID("DestinationNetworkSelector", migData.destinationUniverseUniqueId);
      //destworld
      addDropDownOption("DestinationWorldSelector", migData.destinationWorld, "", "1");
      selectDropDownOptionByIndex("DestinationWorldSelector", 0);
      //destTokenId
      document.getElementById("DestTokenID").textContent = migData.destinationTokenId;

      //Show relay selector
      showCardLine("MigrationRelayCardLine", true);
    });

    //Setting token data retrieval
    document.getElementById("FetchDataButton").addEventListener('click', async() =>{
      //Refresh connected addr for the rest of the migration form
      userAccount = window.web3.currentProvider.selectedAddress;
      //Clear previous tokens data
      clearTokenData();
      //Load metadata from chain: token URI, symbole, name
      loadOgTokenData();
    });
    //Setup rooting
    document.getElementById("CompleteButton").addEventListener('click', async() =>{
      console.log('===Migration Data===');
      console.log(migData);
      model.navigateTo("/register_migration");
    });
  }


  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/MigrationForm.html');
    xhr.send();
  }
}
