import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - Migration successful");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;

    //=====Function definition=====
    //Clear all data in model.migrationData related to previous migration
    let clearMigData = function(){
      migData.originUniverseIndex = 0;
      migData.originUniverseUniqueId = "";
      migData.originNetworkId = "";//Blochain ID
      migData.originUniverse = "";
      migData.originWorld = "";
      migData.originTokenId = "";
      migData.originOwner = "";
      migData.originTokenName = "";
      migData.migrationRelayIndex = 0;
      migData.migrationRelay = "";
      migData.migrationType = "";
      migData.destinationUniverseIndex = 0;//Index in network_list "networks" array
      migData.destinationUniverseTargerListIndex = 0;//Index in network_list "neworks.targetList" array
      migData.destinationUniverseUniqueId = "";
      migData.destinationUniverse = "";
      migData.destinationWorld = "";
      migData.destinationTokenId = "";
      migData.destinationOwner = "";

      migData.metadataDestinationUniverseUniqueId = "";
      migData.metadataDestinationUniverseIndex = 0;
      migData.metadataDestinationUniverse = "";
      migData.metadataDestinationWorld = "";
      migData.metadataDestinationTokenId = "";
      migData.metadataDestinationBridgeAddr = "";

      model.migrationHash = "";
      model.escrowHash = "";

      //model.destinationTokenTransfertTxHash = "";

      model.disconnectWallet = false;
      model.isRedeem = false;
    }

    //display destination token data: dest univ + world + tokId + owner
    let showDestTokenData = function(){
      if(migData.migrationType == model.MintOUIMigrationType){document.getElementById("MigrationTypeTextMigFinished").textContent = "created";}
      else{document.getElementById("MigrationTypeTextMigFinished").textContent = "retrieved";}

      document.getElementById("OwnerAddrMigFinished").textContent = migData.destinationOwner;
      document.getElementById("DestNetworkName").textContent = migData.destinationUniverse;
      document.getElementById("DestTokenIdMigFinished").textContent = migData.destinationTokenId;
      document.getElementById("DestWorldMigFinished").textContent = migData.destinationWorld;

    }

    //Ask provider to prompt user to add the destination token to wallet
    let promptAddNFTToWallet = async function () {
      let tokenSymbol = /*migData.migrationType == model.MintOUIMigrationType ? 'IOU' :*/ 'TKN';
      console.log('tokenSymbol ' + tokenSymbol);

      window.ethereum.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20',
          options: {
            address: migData.destinationWorld,
            symbol: tokenSymbol,
            decimals: 0,
          }},
      }).then((res) =>{
        console.log("Token added to wallet.");
        console.log(res);
      }).catch((res) => {
        console.log("Token NOT added: canceld | error: ");
        console.log(res);
      });
    }

    //Prompt user to switch to destNetwork in order to add dest token
    let promptSwitchDestChainAndAddToken = async function (ID) {
      try{
        window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
        }).then((res) =>{
          console.log("Network switch done to " + ID);
          //Timeout to let provider time to switch network (previous prompt)
          setTimeout(promptAddNFTToWallet, 2000);
        }).catch((res) => {
          console.log("Network switch canceled or error.");
        });
      }catch(err){
        console.error("promptSwitchChainFetchedData failed when sending wallet_switchEthereumChain request.");
        console.error(err);
      }
    }

    //Retrieve new token URI
    let getTokenURI = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/getTokenUri';
      options.data.universe = migData.destinationUniverseUniqueId;
      options.data.world = migData.destinationWorld;
      options.data.tokenId = migData.destinationTokenId;

      axios.request(options).then(function (response) {
        if(response.status == 200){
          let tokenURI = response.data.tokenUri;
          console.log("New token URI: " + tokenURI);

          //Set link to DOM element
          document.getElementById("TokenURI").href = tokenURI;
        }else{console.log(response.status + ' : ' + response.statusText);}
      }).catch(function (error) {
        if(error.response.data){
          //Display error message
          let tokenURIContainer = document.getElementById("TokenURIContainer");
          tokenURIContainer.innerHTML = "Could not load new tokenURI. Please contact us to report the bug with the link in the upper right corner.";
        }
        console.error(error);
      });
    }

    //Tell weather destination token data are fill in
    let areDestTokenDataFilled = function(){
      if(migData.destinationTokenId &&
        migData.destinationWorld &&
        migData.destinationUniverse &&
        migData.destinationNetworkId &&
        migData.destinationOwner &&
        migData.migrationType){
        return true;
      }else{return false;}
    }

    //=====View setup=====
    //If migData object filled up, display destination token info: univ+world+tokId
    if(areDestTokenDataFilled()){
      //Show dest univ, world, tokId, owner
      showDestTokenData();
    }

    //If mig successful: set link to chain explorer of the dest token tranfser transaction.
    let tfTokChainExplo = document.getElementById("TransferTokenChainExplo");
    if(model.destinationTokenTransfertTxHash){
      let destinationNetworkExplorer = bridgeApp.networks[migData.destinationUniverseIndex].explorer;
      tfTokChainExplo.href = destinationNetworkExplorer + "tx/" + model.destinationTokenTransfertTxHash;
    }
    else {
      let tfLinkContainer = document.getElementById("TransferLinkContainer");
      tfLinkContainer.innerHTML = "No transaction available.";
    }

    //If migration successful, display link to tokenURI
    if(model.destinationTokenTransfertTxHash && areDestTokenDataFilled()){
      getTokenURI();
    }else {
      let tokenURIContainer = document.getElementById("TokenURIContainer");
      tokenURIContainer.innerHTML = "No token URI available.";
    }

    document.getElementById("NewMigrationButton").addEventListener('click', async() =>{
      //clear MigrationData
      clearMigData();
      model.navigateTo("/migration_form");
    });
    document.getElementById("AddTokenWalletButton").addEventListener('click', async function(e) {
      //Prevent double clicks
      //We can use 'this' inside the event listener, AND IF NON ARROW function (=>)
      this.setAttribute('disabled', 'true');

      //Prompt user to add the dest token to his wallet
      if(areDestTokenDataFilled()){
        promptSwitchDestChainAndAddToken(migData.destinationNetworkId);
      }
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
    xhr.open('GET', '/site/static_views/MigrationFinished.html');
    xhr.send();
  }
}
