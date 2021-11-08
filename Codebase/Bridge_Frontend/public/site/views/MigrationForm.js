import AbstractView from './AbstractView.js';


/*******************************Read before modifying code
Inputs elements are read only.
Therefore to modify the content of inputOGContractAddress, inputOGTokenID, inputDestOwner: call the functions set*InputValue("...")
Call the same function to modify the content of model.migrationData.[originWorld | originTokenId | destinationOwner]

****************************************************************************************/

//0xf181e8B385FE770C78e3B848F321998F78b0d73e
//0xbf21e21414554dB734C9f86835D51B57136BC35b
//Rinkeby ERC721 contract: 0x34797AaF0848b0f495cE413e551335362bc793eD (ImplTestERC721 depl by 0xbf2),
//    0x1cb3bb968c8a09907bfff181a07b57c3ce4ecda2 (IOUExmpl depl by 0xf18) ;
//    Old: 0xf609Ff037BdDA6749cf02651f04f584d8D51d276, 0x04f34D9Bb1595Bc50D90953DFb593348d87faea3
//Kovan ERC721 contract: 0x3551bc5fA3333937A8c555c66640141b432d63B0 ;
//    Old: 0x8eCE62F22Fd38C73CB356b395A6cd79Dc05D988C
//Token URI: https://cryptograph.co/tokenuri/0x2449835e86a539ab33f5773729c0db42e89016ff

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - Migration form");
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

      //Clear Destination networks before fill it again
      clearDropDownOptions("DestinationNetworkSelector");
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

      //If migData already filled, prefill migration form
      //Once wallet loaded, chain is switched, and dest net loaded:
      //we can prefill all form data if user come from register_mig & clicked edit btn
      if(isMigDataFilled()){prefillFormWithMigData();}
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
        alert("Please accept the metamask switch network prompt in order to change to your desired network");
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
        try{
          contracts.originalChainERC721Contract = new window.web3.eth.Contract(ABIS.ERC721, document.getElementById("inputOGContractAddress").value);
          contracts.originalChainERC721MetadataContract = new window.web3.eth.Contract(ABIS.ERC721Metadata, document.getElementById("inputOGContractAddress").value);
        }
        catch(err){
          console.log("Contract instanciation error: " + err);
          displayContractErrorMsg();
          return;
        }
        //Display token data card
        showCardLine("TokenDataCard", true);
        showCardLine("MigrationCard", true);
        showCardLine("DestNetworkCardLine", true);
        showCardLine("BreakLineCardContainer", true);
        showCard("CompleteMigrationCard", true);//Display complete button

    	  //Get the Contract Name
        let getContractName = async function () {
          let content = "";
          try {
      			content = await contracts.originalChainERC721MetadataContract.methods.name().call();
          } catch (err) {
      			//console.log(err);
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
      			//console.log(err);
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
      			//console.log(err);
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
            migData.originOwner = "";
            //Inform user that no owner was found on this NFT
            displayNoOwnerMsg();
            refreshCompleteBtnEnabled();
          }

        }
        getTokenOwner();

    	  //Get the Token URI
        let getTokenURI = async function () {
          let content = "";
          try {
      			content = await contracts.originalChainERC721MetadataContract.methods.tokenURI(document.getElementById("inputOGTokenID").value).call();
          } catch (err) {
      			//console.log(err);
      			console.log("Could not get tokenURI() for: contractAddress" + contracts.originalChainERC721MetadataContract._address + "   tokenID:" + document.getElementById("inputOGTokenID").value);
      		}

          if(content != ""){
            //Display tokenURI
            document.getElementById("OGTokenURI").innerHTML = content;
            document.getElementById("OGTokenURI").href = content;
            console.log("TokenURI: " + content);
            showCardLine("OriginTokenURICardLine", true);

            //Load and display metadata from JSON file
            //Show token metadata attributes
            showCard("MetadataCard", true);
            //Display "Fetching..." message
            document.getElementById("OGTokenMetaName").textContent = "Fetching...";
            document.getElementById("OGTokenMetaDesc").textContent = "Fetching...";
            document.getElementById("OGTokenMetaImagePath").innerHTML = "Fetching...";
            //Load metadata from tokenURI
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
                      if(isIOUToken(ogTokenMetaData) || ext4 == ".png" || ext4 == ".jpg" || ext4 == "jpeg" || ext4 == ".gif" || ext4 == "webp" || ext4== ".svg" || ext4 == "jfif"){
                          document.getElementById("OGTokenMetaImagePath").innerHTML = '<br><img class="imgassetpreview" src="' + encodeURI(ogTokenMetaData.image) +'">';
                      } else if(ogTokenMetaData.image != null) {
                          document.getElementById("OGTokenMetaImagePath").innerHTML = '<a href="' + encodeURI(ogTokenMetaData.image) + '">' + encodeURI(ogTokenMetaData.image) + '</a>';
                      }

                      //enable or not redeem btn depending on the type of token (iou or not)
                      enableRedeemBtnIfNetworkMatch();
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
          //Prefill with the 1st world
          if(response.data.worlds.length > 0){
            selectDropDownOptionByIndex("DestinationWorldSelector", 0);
            triggerDropDownOnChange("DestinationWorldSelector");
          }
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

        //Refresh complete btn
        refreshCompleteBtnEnabled();
      }).catch(function (error) {
        console.error(error);
        //If "Too many requests", wait one minute before resending request
        //Display loading text for tokenID
        document.getElementById("DestTokenID").textContent = "Too many request to relay. Please wait 1 min before getting the token id...";
        setTimeout(getAvailableTokenId, 60000);

        //Reset dest token id
        migData.destinationTokenId = "";
        //Refresh complete button
        refreshCompleteBtnEnabled();
      });
    }

    //Display connected addr + disco btn + ogNet + prefill ogNet
    let displayConnectedWallet = function(){
      document.getElementById("ConnectedAccountAddr").textContent = userAccount;

      //Show origin network drop down
      showCard("DepartureCard", true);
      showCardLine("OriginNetworkCardLine", true);
      showCard("CompleteMigrationCard", true);

      //Timeout to wait for wallet to be connected
      setTimeout(prefillOriginNetwork, 500);
    }
    //autoconnect to metamask if injected
    var connectToMetamask = async function () {
      //set callback function called when a wallet is connected
      connectionCallback = function(){
        console.log("Wallet connected");
        //Refresh connected addr
        userAccount = window.web3.currentProvider.selectedAddress;
        //Display connected addr + ogNet & prefill it
        displayConnectedWallet();
      };

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
      else{
        console.log("Metamask not injected. Redirecting to wallet_connection page.");
        model.navigateTo('wallet_connection');
        return;//To stop javascript execution in initCode() function
      }
    }

    //Display functions
    let clearTokenData = function(){
      showCardLine("TokenErrorMessage", false);
      showCardLine("OriginWorldNameCardLine", false);
      showCardLine("OriginWorldSymbolCardLine", false);
      showCardLine("OriginTokenOwnerCardLine", false);
      showCardLine("OriginTokenURICardLine", false);
      showCardLine("MetadataCard", false);

      document.getElementById("OGContractName").innerHTML = "";
      document.getElementById("OGContractSymbol").innerHTML = "";
      document.getElementById("OGTokenOwner").innerHTML = "";
      document.getElementById("OGTokenURI").innerHTML = "";
      document.getElementById("OGTokenMetaName").textContent = "";
      document.getElementById("OGTokenMetaDesc").textContent = "";
      document.getElementById("OGTokenMetaImagePath").innerHTML = "";

      //Also disable redeem button by default
      document.getElementById("RedeemButton").disabled = true;

      //Clear token metadata. (if previous token was an IOU)
      resetTokenMetadata();
    }
    //Show & Hide form fields
    let hideFormFieldsFromMigrationCard = function(){
      //Hide all elements following departure card
      let cardsToHide = document.querySelectorAll("#MigrationCard,#ArrivalCard,#CompleteMigrationCard");
      cardsToHide.forEach(function(elem) {
        showCard(elem.id, false);
      });
      let cardLinesToHide = document.querySelectorAll("#MigrationTypeCardLine,#MigrationRelayCardLine,#DestNetworkCardLine,#DestWorldCardLine,#DestWorldNameCardLine,#DestWorldSymbolCardLine,#DestTokenIdCardLine,#DestOwnerCardLine");
      cardLinesToHide.forEach(function(elem) {
        showCardLine(elem.id, false);
      });

      //Empty form fields
      document.getElementById("DestTokenID").textContent = "";
      //Empty migdata destination var
      resetDestinationMigrationData();
    }
    let showFormFieldsAfterOgNet = function(show){
      //Hide all following elements
      let elementsToHide = document.querySelectorAll("#OriginWorldCardLine,#OriginTokenIDCardLine,#BreakLineCardContainer,#TokenDataCard,#TokenErrorMessage,#ArrivalCard,#MigrationCard,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        showCard(elem.id, show);
      });
    }
    //Show - Hide from dest network to dest owner
    let showArrivalFormFields = function(show){
      let elementsToShow = document.querySelectorAll("#ArrivalCard,#DestNetworkCardLine,#DestWorldCardLine,#DestTokenIdCardLine,#DestOwnerCardLine");
      elementsToShow.forEach(function(elem) {
        showCard(elem.id, show);
      });
    }
    let showFormFieldsAfterMigButtons = function(show){
      let elementsToHide = document.querySelectorAll("#MigrationRelayCardLine,#ArrivalCard,#DestWorldCardLine,#DestWorldNameCardLine,#DestWorldSymbolCardLine,#DestTokenIdCardLine,#DestOwnerCardLine");
      elementsToHide.forEach(function(elem) {
        showCard(elem.id, show);
      });
    }
    let showFormFieldsAfterRelay = function(show){
      //Hide further form field if ever displayed
      let elementsToHide = document.querySelectorAll("#ArrivalCard,#DestWorldCardLine,#DestTokenIdCardLine,#DestOwnerCardLine");
      elementsToHide.forEach(function(elem) {
        showCard(elem.id, show);
      });
    }
    let showAllFormFields = function(){
      //Show all cards
      let cardsToShow = document.querySelectorAll("#DepartureCard,#TokenDataCard,#MigrationCard,#ArrivalCard,#DestTokenDataCard,#CompleteMigrationCard");
      cardsToShow.forEach(function(elem) {
        showCard(elem.id, true);
      });
      //Show all cardLines
      let cardLinesToShow = document.querySelectorAll("#OriginNetworkCardLine,#OriginWorldCardLine,#OriginTokenIDCardLine,#MigrationTypeCardLine,#MigrationRelayCardLine,#DestNetworkCardLine,#DestWorldCardLine,#DestTokenIdCardLine,#DestOwnerCardLine");
      cardLinesToShow.forEach(function(elem) {
        showCardLine(elem.id, true);
      });
    }

    //Error & user messages
    let checkAndDisplayNotOwnerMsg = function(){

      //Handle if user is not the owner
      if(userAccount != migData.originOwner){
        console.log("Connected addr: " + userAccount + ", token owner: " + migData.originOwner);
        let errorMsg = document.getElementById("TokenErrorMessage");
        errorMsg.innerHTML = "You are not the owner of this NFT. You can't migrate it.";

        showCardLine("TokenErrorMessage", true);
      }else{//If user is the owner, show it next to owner address.
        document.getElementById("OGTokenOwner").innerHTML = document.getElementById("OGTokenOwner").innerHTML + '&emsp;<span style="font-weight: normal;font-style: italic;">(It\'s you !)</span>';
      }
      //Refresh complete btn
      refreshCompleteBtnEnabled();
    }
    let displayNoOwnerMsg = function(){
      let errorMsg = document.getElementById("TokenErrorMessage");
      errorMsg.innerHTML = "No owner could be found for this NFT.<br>Make sure you have selected to origin network that match where the contract is deployed.";

      showCardLine("TokenErrorMessage", true);
    }
    let displayContractErrorMsg = function(){
      let errorMsg = document.getElementById("TokenErrorMessage");
      errorMsg.innerHTML = "This contract couldn't be found. Make sure you filled in a correct contract address.";

      showCard("TokenDataCard", true);
      showCardLine("TokenErrorMessage", true);
      hideFormFieldsFromMigrationCard();
    }
    let showCard = function(id, disp){
      document.getElementById(id).style = (disp ? "display:flex;" : "display:none;")
    }
    let showCardLine = function(id, disp){
      showCard(id, disp);
    }
    let enableRedeemBtnIfNetworkMatch = function(){
      //If dest network is the one from metadata of IOU token, enable redeem button
      if(migData.destinationUniverseUniqueId == migData.metadataDestinationUniverseUniqueId){
        document.getElementById("RedeemButton").disabled = false;
      }else{
        document.getElementById("RedeemButton").disabled = true;
      }
    }
    let refreshCompleteBtnEnabled = function(){
      userAccount = window.web3.currentProvider.selectedAddress;
      document.getElementById("CompleteButton").disabled = !isMigDataFilled() || (migData.originOwner != userAccount);
    }


    //Input setters.
    //These functions make sure the input value displayed is always the same as the variable in migData
    let setOgWorldInputValue = function(txt){
      let input = document.getElementById("inputOGContractAddress");
      //Set new text
      input.value = txt;
      //Save ogWorld into migaData object
      migData.originWorld = txt;
    }
    let setOgTokenIdInputValue = function(txt){
      let input = document.getElementById("inputOGTokenID");
      //Set new text
      input.value = txt;
      //Save ogWorld into migaData object
      migData.originTokenId = txt;
    }
    let setDestOwnerInputValue = function(txt){
      let input = document.getElementById("inputDestOwner");
      //Set new text
      input.value = txt;
      //Save ogWorld into migaData object, only if
      migData.destinationOwner = txt;
    }

    //Data display
    //These functions make sure the input value displayed is always the same as the variable in migData
    let setOriginOwner = function(){
      //TODO
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
    //Tell weather user come with migData object already filled up or not.
    let isMigDataFilled = function(){
      if(migData.originUniverseUniqueId &&
        migData.originWorld &&
        migData.originTokenId &&
        migData.destinationUniverseUniqueId &&
        migData.migrationType &&
        migData.destinationWorld &&
        parseInt(migData.destinationTokenId) &&
        migData.destinationOwner){
        return true;
      }else{
        return false;
      }
    }
    //Prefill all form fields. This function is called inside onChainSwitchedSuccess()
    let prefillFormWithMigData = function(){
      //OgNet is already prefilled because register_migration prompt user to switch to correct net for edit mig btn
      //Prefill ogWorld
      setOgWorldInputValue(migData.originWorld);
      //Prefill ogTokenId
      setOgTokenIdInputValue(migData.originTokenId);

      //load token meta data
      document.getElementById("FetchDataButton").click();
      //Prefill destNet
      selectDropDownOptionByIndex("DestinationNetworkSelector", migData.destinationUniverseTargerListIndex);

      //Enable Redeem if dest net match metadata
      enableRedeemBtnIfNetworkMatch();

      //Select migration button
      if(migData.migrationType == model.MintOUIMigrationType){
        //Select the Mint IOU button
        document.getElementById("IOUMigrationButton").classList.add('Selected');
      }
      else if(migData.migrationType == model.RedeemIOUMigrationType){
        //Enable Redeem btn
        document.getElementById("RedeemButton").disabled = false;
        //Select Redeem btn
        document.getElementById("RedeemButton").classList.add('Selected');
      }

      //Select relay
      selectDropDownOptionByIndex("RelaySelector", migData.migrationRelayIndex);

      //Prefill destWorld
      addDropDownOption("DestinationWorldSelector", migData.destinationWorld, "", "1");
      selectDropDownOptionByIndex("DestinationWorldSelector", 0);
      //Prefill destTokenId
      document.getElementById("DestTokenID").textContent = migData.destinationTokenId;
      //Prefill destTokenOwner
      setDestOwnerInputValue(migData.destinationOwner)

      //Finally display all form fields
      showAllFormFields();
    }
    //Reset destination migrationData to empty
    let resetDestinationMigrationData = function(){
      migData.destinationUniverseIndex = 0;//Index in network_list "networks" array
      migData.destinationUniverseTargerListIndex = 0;//Index in network_list "neworks.targetList" array
      migData.destinationUniverseUniqueId = "";
      migData.destinationUniverse = "";
      migData.destinationBridgeAddr = "";
      resetDestWorldNTokenNOwnerMigData();
    }
    let resetDestWorldNTokenNOwnerMigData = function(){
      migData.destinationWorld = "";
      migData.destinationTokenId = "";
      setDestOwnerInputValue("");
    }
    let resetTokenMetadata = function(){
      migData.metadataDestinationUniverseUniqueId = "";
      migData.metadataDestinationUniverseIndex = 0;
      migData.metadataDestinationUniverse = "";
      migData.metadataDestinationWorld = "";
      migData.metadataDestinationTokenId = "";
      migData.metadataDestinationBridgeAddr = "";
    }

    //Setup custom selector
    setupDropDown("OriginNetworkSelector");
    setupDropDown("RelaySelector");
    setupDropDown("DestinationNetworkSelector");
    setupDropDown("DestinationWorldSelector");

    //Call Load data functions one after the other to execute form prefill when the last is finished
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

      //Clear ogWorld & token Id
      setOgWorldInputValue("");
      setOgTokenIdInputValue("");

      //Reset migration buttons. Unselect the previously selected button.
      let migButtonsCard = document.getElementById("MigrationTypeCardLine");
      let selected = migButtonsCard.querySelector(".Selected");
      if(selected != undefined){selected.classList.remove('Selected');}

      //Hide all form fields after origin network dropdown.
      showFormFieldsAfterOgNet(false);

      refreshCompleteBtnEnabled();
      promptSwitchChain(chainIDSelected);
    });
    addDropDownOnChangeCallback("RelaySelector", function(chainIndexSelected){
      //Add relay to migData
      migData.migrationRelayIndex = getDropDownSelectedOptionIndex("RelaySelector");
      migData.migrationRelay = bridgeApp.relays[Math.max(0, migData.migrationRelayIndex)].name;

      //if MINT IOU
      if(migData.migrationType == model.MintOUIMigrationType){
        //Display next form field: arrival title + arrival dest network
        showCardLine("ArrivalCard", true);
        showCardLine("DestWorldCardLine", true);

        //Clear previous worlds retrived from relay
        clearDropDownOptions("DestinationWorldSelector");
        //Load available destination world from relay
        getRelayAvailableWorlds();
      }
      //Else REDEEM: display all following form fields and prefill them with data from metadata
      else if(migData.migrationType == model.RedeemIOUMigrationType){
        //SHOW all next form field which are prefilled
        showArrivalFormFields(true);
      }

      //Prefill dest owner
      userAccount = window.web3.currentProvider.selectedAddress;
      //Prefill destTokenOwner with the current connected address
      setDestOwnerInputValue(userAccount);

      refreshCompleteBtnEnabled();
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
      showFormFieldsAfterMigButtons(false);

      //Clear MigData from outdated data
      migData.destinationTokenId = 0;
      migData.destinationWorld = "";
      migData.migrationRelayIndex = 0;
      migData.migrationRelay = "";
      document.getElementById("DestTokenID").textContent = "";

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
      migData.destinationUniverseIndex = destUnivAbsoluteIndex;//Index in network_list "networks" array
      migData.destinationUniverseTargerListIndex = destUnivDropDownIndex;//Index in network_list "neworks.targetList" array
      migData.destinationUniverseUniqueId = destUnivUniqueId;
      migData.destinationUniverse = bridgeApp.networks[Math.max(0, migData.destinationUniverseIndex)].name;
      migData.destinationBridgeAddr = bridgeApp.networks[Math.max(0, migData.destinationUniverseIndex)].bridgeAdress;

      //Enable redeem if network dest if same as IOU metadata origin
      enableRedeemBtnIfNetworkMatch();
      //DISPLAY next form field: migration type buttons
      showCardLine("MigrationTypeCardLine", true);

      refreshCompleteBtnEnabled();
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
        showCardLine("DestOwnerCardLine", true);//Owner is prefilled when relay is selected

        //Display loading text for tokenID
        document.getElementById("DestTokenID").textContent = "Fetching...";
        //Load desination tokenId from relay
        getAvailableTokenId();
      }
    });

    //===Origin world input===
    //When return/enter key pressed in input: Display ogTokenID input
    //Focus in & out, hint management
    document.getElementById("inputOGContractAddress").addEventListener('keyup', async(e) =>{
      //Show next form field
      showCardLine("OriginTokenIDCardLine", true);
      migData.originWorld = document.getElementById("inputOGContractAddress").value;
      //Refresh complete button at every character change in the input
      refreshCompleteBtnEnabled();

      if (e.key === 'Enter' || e.keyCode === 13) {
        //document.getElementById("inputOGContractAddress").dispatchEvent(new Event("focusout"));
        document.getElementById("inputOGTokenID").focus();
        //Call change -> fetch token data
        document.getElementById("inputOGContractAddress").dispatchEvent(new Event("change"));
      }
    });
    document.getElementById("inputOGContractAddress").addEventListener('change', async(e) =>{
      //Trigger Fetch data button
      if(migData.originTokenId && document.getElementById("inputOGTokenID").value){
        document.getElementById("FetchDataButton").click();
      }
    });

    //===Origin tokenID input===
    //When return/enter key pressed in input: Display dest owner input
    /*document.getElementById("inputOGTokenID").addEventListener('keyup', async(e) =>{
      //Unfocus input when enter key is pressed
      if (e.key === 'Enter' || e.keyCode === 13) {
        document.getElementById("inputOGTokenID").dispatchEvent(new Event("change"));
      }
    });*/
    document.getElementById("inputOGTokenID").addEventListener('keyup', async() =>{
      let inputVal = document.getElementById("inputOGTokenID").value;
      if(inputVal.startsWith('0x')){
        setOgTokenIdInputValue(parseInt(inputVal, 16).toString());
      }else{
        setOgTokenIdInputValue(inputVal);
      }
      //refresh complete btn enabled
      refreshCompleteBtnEnabled();
    });
    document.getElementById("inputOGTokenID").addEventListener('change', async() =>{
      //Clear previous token datas
      clearTokenData();

      //Trigger Fetch data button
      document.getElementById("FetchDataButton").click();
    });

    //===Destination owner input===
    //When input is unfocused, display originTokenID input
    document.getElementById("inputDestOwner").addEventListener('keyup', async() =>{
      document.getElementById("inputDestOwner").dispatchEvent(new Event("change"));
    });
    document.getElementById("inputDestOwner").addEventListener('change', async() =>{
      migData.destinationOwner = document.getElementById("inputDestOwner").value;
      refreshCompleteBtnEnabled();
    });

    //Disconnect wallet button
    document.getElementById("DisconnectWalletBtn").addEventListener('click', async() =>{
      model.disconnectWallet = true;
      model.navigateTo('wallet_connection');
    });

    //Migration type buttons
    document.getElementById("FullMigrationButton").addEventListener('click', async() =>{/*NOTHING*/});
    document.getElementById("IOUMigrationButton").addEventListener('click', function() {
      //Clear destWorld previous data
      clearDropDownOptions("DestinationWorldSelector");
      //Reset previous migData destination var
      migData.destinationTokenId = "";

      //Unselect the previously selected button.
      let selected = this.parentNode.querySelector(".Selected");
      if(selected != undefined && selected.id == "IOUMigrationButton"){return;}
      if(selected != undefined){selected.classList.remove('Selected');}
      //Select the clicked button
      this.classList.add('Selected');

      //Display next form field: relay drop down
      document.getElementById("MigrationRelayCardLine").style.display = 'flex';
      migData.migrationType = model.MintOUIMigrationType;
      model.isRedeem = false;

      //Hide all fields after relay drop down
      showFormFieldsAfterRelay(false);

      refreshCompleteBtnEnabled();
    });
    document.getElementById("RedeemButton").addEventListener('click', function() {
      //Clear destWorld previous data
      clearDropDownOptions("DestinationWorldSelector");
      //Reset previous migData destination var
      migData.destinationTokenId = "";

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
      //destworld
      console.log("Prefill dest world");
      console.log("migData.destinationWorld: " + migData.destinationWorld);
      addDropDownOption("DestinationWorldSelector", migData.destinationWorld, "", "1");
      selectDropDownOptionByIndex("DestinationWorldSelector", 0);
      //destTokenId
      document.getElementById("DestTokenID").textContent = migData.destinationTokenId;

      //Show relay selector
      showCardLine("MigrationRelayCardLine", true);

      //If relay already selected, display all form till the end !
      if(getDropDownSelectedOptionIndex("RelaySelector") >= 0){
        showArrivalFormFields(true);
      }

      refreshCompleteBtnEnabled();
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

    //HANDLE WALLET CONNECTION
    userAccount = window.web3.currentProvider.selectedAddress;
    //If web3 already injected
    if(userAccount != "" && window.web3.eth != undefined){
      console.log("Westron already loaded, perfect.");
      //Display connected addr + ogNet & prefill it
      displayConnectedWallet();
    }
    //If metamask available: autoconnect without redirecting to connection page.
    else if (window.web3.__isMetaMaskShim__ && window.web3.currentProvider.selectedAddress != null) {
      console.log("Metamask auto connect.");
      loadWestron();
      console.log("Westron lib loaded.");
      setTimeout(connectToMetamask, 500);
    }
    //Redirect to wallet_connection page
    else{
      document.getElementById("ConnectedAccountAddr").textContent = "Wallet not connected. Redirect to connection page.";
      console.log("Westron lib not loaded. Redirecting to wallet_connection");
      model.navigateTo('wallet_connection');
      return;//To stop javascript execution in initCode() function
    }

    //When user come back on tab: verify ogNet & wallet net
    window.onfocus = function(){
      //If migration form displayed
      if(document.getElementById("OriginNetworkSelector")){
        //If tokens data are loaded, do not prompt switch network.
        //Only prompt if ogNet is set
        let originChainSelectedIndex = getDropDownSelectedOptionIndex("OriginNetworkSelector");
        if(!migData.originOwner && originChainSelectedIndex >= 0){
          let chainIDSelected = '0x' + bridgeApp.networks[originChainSelectedIndex].chainID.toString(16);
          promptSwitchChain(chainIDSelected);
        }
      }
    }
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
