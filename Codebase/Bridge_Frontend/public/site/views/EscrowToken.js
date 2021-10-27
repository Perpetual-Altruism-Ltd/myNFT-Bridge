import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Escrowing your NFT");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migrationHashSigned = "";
    let account = window.web3.currentProvider.selectedAddress;
    let loadingText = document.getElementById("RegistrationLoadingText");

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let migrationHashListener = async function(){
      //Construct XHR request
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;
      let destinationNetworkId = bridgeApp.networks[migData.destinationUniverseIndex].networkID.toString(16);

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let res = xhr.response;
          //If migration Hash received from relay
          if(res.migrationHash != undefined){
            model.migrationHash = res.migrationHash;
            console.log("Migration hash received: " + model.migrationHash);

            loadingText.textContent = "Please sign the migration data hash to agree for the migration.";

            //Then sign migration hash
            signMigrationHash();
          }
        }
      };
      xhr.open('POST', relayURL + '/pollingMigration');
      let requestParam = {};
      requestParam.migrationId = model.readCookie("migrationId");

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.migrationHash == ""){
        await sleep(model.listeningRefreshFrequency);
        //Ask relay for migration hash
        xhr.send(requestParam);
      }

      //If timeout: error message
      if(model.migrationHash == ""){
        loadingText.textContent = "Couldn't retrieve migration data hash from relay.";
      }
    }
    //migrationHashListener();//TO UNCOMMENT WHEN CORS REQ ARE POSSIBLE

    let signMigrationHash = async function(){
      model.migrationHash = 'blblblblbl';//FOR TEST PURPOSE

      window.web3.eth.sign(model.migrationHash, account, function(err,res){
        //If user refused to sign
        if(err){
          loadingText.textContent = "Signature refused.";
        }else{
          loadingText.textContent = "Sending migration data hash signed to relay";
          migrationHashSigned = res;
          continueMigration();
        }
      });
    }
    signMigrationHash();

    let continueMigration = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;
      let destinationNetworkId = bridgeApp.networks[migData.destinationUniverseIndex].networkID.toString(16);

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          //start listening relay for escrow hash
          escrowHashListener();
        }else{
          loadingText.textContent = "Relay not responding.";
          console.log(this.status);
        }
      };
      xhr.open('POST', relayURL + '/continueMigration');
      let requestParam = {};
      requestParam.migrationId = model.readCookie("migrationId");
      requestParam.migrationHashSignature = migrationHashSigned;

      xhr.send(requestParam);
    }

    let escrowHashListener = async function(){
      //Construct XHR request
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;
      let destinationNetworkId = bridgeApp.networks[migData.destinationUniverseIndex].networkID.toString(16);

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let res = xhr.response;
          //If migration Hash received from relay
          if(res.escrowHash != undefined){
            model.escrowHash = res.escrowHash;
            console.log("Escrow hash received: " + model.escrowHash);

            //Then move to signEscrow page
            model.navigateTo("/sign_escrow");
          }
        }
      };
      xhr.open('POST', relayURL + '/pollingEscrow');
      let requestParam = {};
      requestParam.migrationId = model.readCookie("migrationId");

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.escrowHash == ""){
        await sleep(model.listeningRefreshFrequency);
        //Ask relay for migration hash
        xhr.send(requestParam);
      }

      //If timeout: error message
      if(model.escrowHash == ""){
        loadingText.textContent = "Couldn't retrieve escrow hash from relay.";
      }
    }

    //setTimeout(() => { model.navigateTo("/sign_escrow"); }, 5000);
  }

  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/EscrowToken.html');
    xhr.send();
  }
}
