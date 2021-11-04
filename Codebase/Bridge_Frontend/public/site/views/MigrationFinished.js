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

      model.destinationTokenTransfertTxHash = "";

      model.disconnectWallet = false;
      model.isRedeem = false;
    }

    let tfTokChainExplo = document.getElementById("TransfertTokenChainExplo");
    let destinationNetworkExplorer = bridgeApp.networks[migData.destinationUniverseIndex].explorer;

    tfTokChainExplo.href = destinationNetworkExplorer + "tx/" + model.destinationTokenTransfertTxHash;

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
