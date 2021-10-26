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
    const listeningTimeOut = 120; //seconds
    const listeningRefreshFrequency = 3;//seconds

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    let migrationHashListener = async function(){
      //Construct XHR request
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;
      let destinationNetworkId = bridgeApp.networks[migData.destinationUniverseIndex].networkID.toString(16);
      let migrationHash = "";

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let res = xhr.response;
          if(res.migrationHash != undefined){
            migrationHash = res.migrationHash;
          }
        }
      };
      xhr.open('POST', relayURL + '/pollingMigration');
      let requestParam = {};
      requestParam.migrationId = model.readCookie("migrationId");

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < listeningTimeOut/listeningRefreshFrequency && migrationHash == ""){
        await sleep(listeningRefreshFrequency);
        //Ask relay for migration hash
        xhr.send(requestParam);
      }
    }

    let signMigrationHash = async function(){

    }

    let continueMigration = async function(){

    }

    let startPollingEscrowHash = async function(){

    }

    setTimeout(() => { model.navigateTo("/sign_escrow"); }, 5000);
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
