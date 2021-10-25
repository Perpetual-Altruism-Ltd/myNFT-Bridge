import AbstractView from './AbstractView.js';

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

    //Define functions which interact with blockchains
    let promptSwitchChain = async function (ID) {
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
      }).then((res) =>{
        console.log("Network switch done.");
        //Display next form field: ogWorld input
        document.getElementById("OriginWorldCardLine").style.display = 'flex';
      }).catch((res) => {
        console.log("Network switch canceled or error");
        alert("Please accept the metamask switch network prompt in order to change to desired network");
      });
    }
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
            promptSwitchChain('0x' + ogEthNetwork.chainID.toString(16));//TODELETE cuz metamask support only
            return;
        }

        //Instanciate an ERC721 contract at the address
        contracts.originalChainERC721Contract = new window.web3.eth.Contract(ABIS.ERC721, document.getElementById("inputOGContractAddress").value);
        contracts.originalChainERC721MetadataContract = new window.web3.eth.Contract(ABIS.ERC721Metadata, document.getElementById("inputOGContractAddress").value);

        //Display token data card
        document.getElementById("TokenDataCard").style.display = 'flex';
        document.getElementById("MigrationCard").style.display = 'flex';
        document.getElementById("MigrationCardLineTitle").style.display = 'flex';
        document.getElementById("MigrationTypeCardLine").style.display = 'flex';

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

    //Functions which interact with relay's backend
    /*let getRelayAvailableWorlds(){
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let htmlContent = xhr.response;
          callback(htmlContent);
        }
      };
      xhr.open('POST', '/site/static_views/MigrationForm.html');
      xhr.send();
    }*/

    //Setup custom selector
    setupDropDown("OriginNetworkSelector");
    setupDropDown("RelaySelector");
    setupDropDown("DestinationNetworkSelector");

    //Load networks
    loadNets(function () {
        //Add select options
        for (var i = 0; i < bridgeApp.networks.length; i++) {
            addDropDownOption("OriginNetworkSelector", bridgeApp.networks[i].name, "", bridgeApp.networks[i].uniqueId);
            addDropDownOption("DestinationNetworkSelector", bridgeApp.networks[i].name, "", bridgeApp.networks[i].uniqueId);
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
      //document.getElementById("OriginWorldCardLine").style.display = 'none';
      //Hide all following elements
      let elementsToHide = document.querySelectorAll("#OriginWorldCardLine,#OriginTokenIDCardLine,#TokenDataCard,#MigrationCard,#MigrationCardLineTitle,#MigrationTypeCardLine,#MigrationRelayCardLine,#ArrivalCard,#ArrivalCardLineTitle,#DestNetworkCardLine,#DestWorldCardLine,#DestTokenDataCard,#DestTokenIdCardLine,#DestOwnerCardLine,#CompleteMigrationCard");
      elementsToHide.forEach(function(elem) {
        elem.style.display = 'none';
      });
      promptSwitchChain(chainIDSelected);//TOCHECK metamask support only?.
    });
    addDropDownOnChangeCallback("RelaySelector", function(chainIndexSelected){
      //Display next form field: arrival title + arrival dest network
      document.getElementById("ArrivalCard").style.display = 'flex';
      document.getElementById("ArrivalCardLineTitle").style.display = 'flex';
      document.getElementById("DestNetworkCardLine").style.display = 'flex';
    });
    addDropDownOnChangeCallback("DestinationNetworkSelector", function(chainIndexSelected){
      //Display next form field: dest world
      document.getElementById("DestWorldCardLine").style.display = 'flex';
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

    //===Destination world input===
    //When return/enter key pressed in input: Display destTokenID input
    document.getElementById("inputDestContractAddress").addEventListener('keyup', async(e) =>{
      //Unfocus input when enter key is pressed
      if (e.key === 'Enter' || e.keyCode === 13) {
        document.getElementById("inputDestContractAddress").dispatchEvent(new Event("focusout"));
      }
    });
    //When input is unfocused, display originTokenID input
    document.getElementById("inputDestContractAddress").addEventListener('focusout', async() =>{
      document.getElementById("DestTokenDataCard").style.display = 'flex';
      document.getElementById("DestTokenIdCardLine").style.display = 'flex';
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
      this.classList.add('Selected');
      //Display next form field: relay drop down
      document.getElementById("MigrationRelayCardLine").style.display = 'flex';
    });
    document.getElementById("RedeemButton").addEventListener('click', function() {
      let selected = this.parentNode.querySelector(".Selected");
      if(selected != undefined){selected.classList.remove('Selected');}
      this.classList.add('Selected');
    });

    //Setting token data retrieval
    document.getElementById("FetchDataButton").addEventListener('click', async() =>{
      //Load metadata from chain: token URI, symbole, name
      loadOgTokenData();
    });
    //Setup rooting
    document.getElementById("CompleteButton").addEventListener('click', async() =>{
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
