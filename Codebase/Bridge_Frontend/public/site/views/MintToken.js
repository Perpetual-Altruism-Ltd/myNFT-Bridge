import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - Token minting");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;
    let loadingText = document.getElementById("MigrationLoadingText");

    //Loading circle style
    //Color green + plain line + stop spinning
    let setCircleValidState = function(){
      document.getElementById("MintLoadingCircle").style.animationPlayState = 'paused';
      document.getElementById("SVGMintCircle").setAttribute('stroke-dasharray', 0);
      document.getElementById("MintLoadingCircle").style.color = '#0c0';
    }
    //Color red + plain line + stop spinning
    let setCircleErrorState = function(){
      document.getElementById("MintLoadingCircle").style.animationPlayState = 'paused';
      document.getElementById("SVGMintCircle").setAttribute('stroke-dasharray', 0);
      document.getElementById("MintLoadingCircle").style.color = '#c00';
    }
    //Color pink + dashed line + spin (default state)
    let setCircleWaitingState = function(){
      document.getElementById("MintLoadingCircle").style.animationPlayState = 'running';
      document.getElementById("SVGMintCircle").setAttribute('stroke-dasharray', 51.1);
      document.getElementById("MintLoadingCircle").style.color = '#af1540';
    }

    //If redeem, display specific message
    if(migData.migrationType == model.RedeemIOUMigrationType){
      loadingText.textContent = "Please wait for the relay to retrieve the destination token...";
    }

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
      options.url = relayURL + '/pollingEndMigration';
      options.data.migrationId = model.readCookie("migrationId");

      let requestCallback = function(response){
        if(response.status == 200){
          let res = response.data;
          //If token transfered to destination owner
          if(res.migrationStatus == "Ok"){
            model.destinationTokenTransfertTxHash = res.transactionHash;

            console.log("Migration ended !");
            //Display valid (green) circle
            setCircleValidState();
            loadingText.textContent = "Migration ended ! The token has been transferred to the destination owner.";

            //Then move to migration_finished page to display link to chain explorer for the token transfert transaction
            setTimeout(function () {model.navigateTo("/migration_finished");}, 3000);
          }
        }else{
          setCircleErrorState();
          loadingText.textContent = "Couldn't retrieve the transaction hash. Please contact our team.";
          console.log(response.status + ' : ' + response.statusText);
        }
      }

      console.log("Start listening for destination token transfert to owner");

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.destinationTokenTransfertTxHash == ""){
        //Ask relay for migration hash
        axios.request(options).then(function (response) {
          console.log("requestCallback called");
          requestCallback(response);
        }).catch(function (error) {
          setCircleErrorState();
          loadingText.textContent = "Relay not responding. Please contact our team.";
          console.error(error);
        });

        await sleep(model.listeningRefreshFrequency*1000);
        i++;
      }

      //If timeout: error message
      if(model.destinationTokenTransfertTxHash == ""){
        setCircleErrorState();
        loadingText.textContent = "Couldn't retrieve transaction hash of the destination token transfer to owner.";
      }
    }

    //Start listening for end migration from relay. Once ended, move to mig_finished page
    endMigrationListener();
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
