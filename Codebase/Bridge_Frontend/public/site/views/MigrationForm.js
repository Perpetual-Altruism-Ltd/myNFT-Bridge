import AbstractView from './AbstractView.js';

//0x343da20c010148b4E4D4D3203e7c445E0a7468A4

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
    let account = window.web3.currentProvider.selectedAddress;

    //Define functions to load data from server
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
      document.getElementById("OriginWorldCardLine").style.display = 'flex';

      //Save origin network in the object migData to access it later during the migration process
      migData.originUniverseIndex = getDropDownSelectedOptionIndex("OriginNetworkSelector");
      migData.originUniverse = bridgeApp.networks[migData.originUniverseIndex].name;
      migData.originUniverseUniqueId = bridgeApp.networks[migData.originUniverseIndex].uniqueId;

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
    //Loading a token metadata from chain
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
        let ogEthNetwork = bridgeApp.net[getDropDownOptionUniqueID("OriginNetworkSelector", selectedIndex)];

        if (parseInt(window.web3.currentProvider.chainId) != parseInt(ogEthNetwork.chainID)) {
            alert("Please connect to the original token network in your web3 provider");
            promptSwitchChain('0x' + ogEthNetwork.chainID.toString(16));
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
              //Add origin token owner to migData
              migData.originOwner = document.getElementById("OGTokenOwner").innerHTML.toLowerCase();

              //Handle is user is not the owner
              if(account != migData.originOwner){
                console.log("Connected addr: " + account + ", token owner: " + migData.originOwner);
                let errorMsg = document.getElementById("TokenErrorMessage");
                errorMsg.innerHTML = "You are not the owner of this NFT. You can't migrate it.";

                document.getElementById("TokenErrorMessage").style.display = 'flex';
                hideFormFieldsFromMigrationCard();
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
    };
    //Loading token metadata from TokenURI
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

                      document.getElementById("OGTokenMetaName").textContent = ogTokenMetaData.name;
                      document.getElementById("OGTokenMetaDesc").textContent = ogTokenMetaData.description;
                      //Add token name to migData to display it later in registerMig page
                      migData.originTokenName = ogTokenMetaData.name;
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
    };

    //Connect to metamask if wallet installed
    var endLoadMetamaskConnection = async function () {
      //Set wallet connection callback for Westron lib
      connectionCallback = function(){
        //Display connected addr + departure cards
        document.getElementById("ConnectedAddrCard").style = 'display: flex;';
        document.getElementById("DepartureCard").style = 'display: flex;';
        //Prefill origin network
        prefillOriginNetwork();
      }

      //Connecting to metmask if injected
      if (window.web3.__isMetaMaskShim__ && window.web3.currentProvider.selectedAddress != null) {
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
        migData.destinationTokenId = '0x' + parseInt(response.data.tokenId).toString(16);
        //Add dest tokenId to input
        document.getElementById("inputDestTokenID").value = migData.destinationTokenId;

        //Display next migration form field
        document.getElementById("inputDestTokenID").dispatchEvent(new Event("focusout"));
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
    }
    let hideFormFieldsFromMigrationCard = function(){
      //Hide all elements following departure card
      let elementsToHide = document.querySelectorAll("#MigrationCard,#MigrationCardLineTitle,#MigrationTypeCardLine,#MigrationRelayCardLine,#ArrivalCard,#ArrivalCardLineTitle,#DestNetworkCardLine,#DestWorldCardLine,#DestTokenDataCard,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });
    }

    //Setup custom selector
    setupDropDown("OriginNetworkSelector");
    setupDropDown("RelaySelector");
    setupDropDown("DestinationNetworkSelector");
    setupDropDown("DestinationWorldSelector");
    //addDropDownOption("DestinationWorldSelector", '0x123456789abcdef', "", '1');//FOR TEST PURPOSE

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
    //Auto connect to metamask if wallet exists
    setTimeout(endLoadMetamaskConnection, 1000);

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
      let elementsToHide = document.querySelectorAll("#OriginWorldCardLine,#OriginTokenIDCardLine,#TokenDataCard,#TokenErrorMessage,#MigrationCard,#MigrationCardLineTitle,#MigrationTypeCardLine,#MigrationRelayCardLine,#ArrivalCard,#ArrivalCardLineTitle,#DestNetworkCardLine,#DestWorldCardLine,#DestTokenDataCard,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });

      promptSwitchChain(chainIDSelected);
    });
    addDropDownOnChangeCallback("RelaySelector", function(chainIndexSelected){
      //Display next form field: arrival title + arrival dest network
      document.getElementById("ArrivalCard").style.display = 'flex';
      document.getElementById("ArrivalCardLineTitle").style.display = 'flex';
      document.getElementById("DestWorldCardLine").style.display = 'flex';
      migData.migrationRelayIndex = getDropDownSelectedOptionIndex("RelaySelector");
      migData.migrationRelay = bridgeApp.relays[Math.max(0, migData.migrationRelayIndex)].name;

      //Load available destination world from relay
      getRelayAvailableWorlds();
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
      let elementsToHide = document.querySelectorAll("#MigrationRelayCardLine,#ArrivalCard,#ArrivalCardLineTitle,#DestWorldCardLine,#DestTokenDataCard,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });

      //DISPLAY next form field: migration type buttons
      document.getElementById("MigrationTypeCardLine").style.display = 'flex';

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
    });
    addDropDownOnChangeCallback("DestinationWorldSelector", function(chainIndexSelected){
      //Display next form field: dest world
      document.getElementById("DestTokenDataCard").style.display = 'flex';
      document.getElementById("DestTokenIdCardLine").style.display = 'flex';
      let destWorldIndex = getDropDownSelectedOptionIndex("DestinationWorldSelector");
      migData.destinationWorld = bridgeApp.destWorlds[destWorldIndex];

      //Load desination tokenId from relay
      getAvailableTokenId();
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
    //When return/enter key pressed in input: Display ogTokenID input
    document.getElementById("inputOGTokenID").addEventListener('keyup', async(e) =>{
      //Unfocus input when enter key is pressed
      if (e.key === 'Enter' || e.keyCode === 13) {
        document.getElementById("inputOGTokenID").dispatchEvent(new Event("focusout"));
        //Trigger Fetch data button
        document.getElementById("FetchDataButton").click();
      }
    });
    document.getElementById("inputOGTokenID").addEventListener('focusout', async() =>{
      migData.originTokenId = document.getElementById("inputOGTokenID").value;
    });

    //===Destination tokenID input===
    //When return/enter key pressed in input: Display destTokenID input
    document.getElementById("inputDestTokenID").addEventListener('keyup', async(e) =>{
      //Unfocus input when enter key is pressed
      if (e.key === 'Enter' || e.keyCode === 13) {
        document.getElementById("inputDestTokenID").dispatchEvent(new Event("focusout"));
      }
    });
    //When input is unfocused, display originTokenID input
    document.getElementById("inputDestTokenID").addEventListener('focusout', async() =>{
      document.getElementById("DestOwnerCardLine").style.display = 'flex';
      migData.destinationTokenId = document.getElementById("inputDestTokenID").value;
    });

    //===Destination owner input===
    //When return/enter key pressed in input: Display destTokenID input
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

    //Setting token data retrieval
    document.getElementById("FetchDataButton").addEventListener('click', async() =>{
      //Load metadata from chain: token URI, symbole, name
      loadOgTokenData();
    });

    //Migration type buttons
    document.getElementById("FullMigrationButton").addEventListener('click', async() =>{/*NOTHING*/});
    document.getElementById("IOUMigrationButton").addEventListener('click', function() {
      //Unselect the previously selected button.
      let selected = this.parentNode.querySelector(".Selected");
      if(selected != undefined){selected.classList.remove('Selected');}
      //Select the clicked button
      this.classList.add('Selected');
      //Display next form field: relay drop down
      document.getElementById("MigrationRelayCardLine").style.display = 'flex';
      migData.migrationType = model.MintOUIMigrationType;
    });
    document.getElementById("RedeemButton").addEventListener('click', function() {
      let selected = this.parentNode.querySelector(".Selected");
      if(selected != undefined){selected.classList.remove('Selected');}
      this.classList.add('Selected');
      document.getElementById("MigrationRelayCardLine").style.display = 'flex';
      migData.migrationType = model.RedeemIOUMigrationType;
    });

    //Setting token data retrieval
    document.getElementById("FetchDataButton").addEventListener('click', async() =>{
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
