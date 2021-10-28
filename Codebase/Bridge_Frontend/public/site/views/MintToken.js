import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Minting the new token");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let loadingText = document.getElementById("MigrationLoadingText");

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let endMigrationListener = async function(){
      //Construct XHR request
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/pollingMigration';
      options.data.migrationId = model.readCookie("migrationId");

      let requestCallback = function(response){
        if(response.status == 200){
          let res = response.data;
          //If token transfered to destination owner
          if(res.migrationStatus == "Ok"){
            model.destinationTokenTransfertTxHash = res.transactionHash;
            console.log("Migration ended !");

            //Then move to migration_finished page to display link to chain explorer for the token transfert transaction
            model.navigateTo("/migration_finished");
          }
        }else{console.log(response.status + ' : ' + response.statusText);}
      }

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.destinationTokenTransfertTxHash == ""){
        await sleep(model.listeningRefreshFrequency);
        //Ask relay for migration hash
        axios.request(options).then(function (response) {
          requestCallback(response);
        }).catch(function (error) {
          console.error(error);
        });
      }

      //If timeout: error message
      if(model.destinationTokenTransfertTxHash == ""){
        loadingText.textContent = "Couldn't retrieve transaction hash of destination token transfert.";
      }
    }
    //Start listening for end migration from relay. Once ended, move to mig_finished page
    endMigrationListener();
    //setTimeout(() => { model.navigateTo("/migration_finished"); }, 5000);
  }

  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/MintToken.html');
    xhr.send();
  }
}
