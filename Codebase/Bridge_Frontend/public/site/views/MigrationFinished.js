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
      migData.destinationBridgeAddr = "";
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

    //display destination token data
    let showDestTokenData = function(){
      if(migData.migrationType == model.MintOUIMigrationType){document.getElementById("MigrationTypeTextMigFinished").textContent = "created";}
      else{document.getElementById("MigrationTypeTextMigFinished").textContent = "retrieved";}

      document.getElementById("OwnerAddrMigFinished").textContent = migData.destinationOwner;
      document.getElementById("DestNetworkName").textContent = migData.destinationUniverse;
      document.getElementById("DestTokenIdMigFinished").textContent = migData.destinationTokenId;
      document.getElementById("DestWorldMigFinished").textContent = migData.destinationWorld;

    }
    if(migData.destinationTokenId &&
      migData.destinationWorld &&
      migData.destinationUniverse &&
      migData.destinationOwner &&
      migData.migrationType){
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
      options.url = relayURL + '/getDestinationTokenUri';
      options.data.migrationId = model.readCookie("migrationId");

      axios.request(options).then(function (response) {
        if(response.status == 200){
          let tokenURI = response.data.tokenUri;
          console.log("New token URI: " + tokenURI);

          //Set link to DOM element
          let tokenURIElement = document.getElementById("TokenURI");
          tokenURIElement.href = tokenURI;
        }else{console.log(response.status + ' : ' + response.statusText);}
      }).catch(function (error) {
        if(error.response.data){
          //Display error message
          let tokenURIContainer = document.getElementById("TokenURIContainer");
          tokenURIContainer.innerHTML = "Could not load new tokenURI. Please contact our team.";
        }
        console.error(error);
      });
    }
    //If migration successful, display link to tokenURI
    if(model.destinationTokenTransfertTxHash){
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
