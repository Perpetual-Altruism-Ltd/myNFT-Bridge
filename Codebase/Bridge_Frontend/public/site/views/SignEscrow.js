import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - Sign escrow hash");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;
    let escrowHashSigned = "";
    let account = window.web3.currentProvider.selectedAddress;
    let stateMessage = document.getElementById("StateMessage");

    //If redeem, display specific message
    if(migData.migrationType == model.RedeemIOUMigrationType){
      document.getElementById("TransferMessage").textContent = "The IOU token was successfully transferred to the bridge.";
      document.getElementById("SignMessage").textContent = "Please sign the escrow hash to allow the relay to give you back the token.";
    }

    let signEscrowHash = async function(){
      //Ask the wallet to prompt user to sign data
      window.ethereum.request({ method: 'personal_sign', params: [ model.escrowHash, account ] })
      .then((res) =>{
        console.log("Escrow hash signed: " + res);
        escrowHashSigned = res;
        //Send escrowHashSigned to relay
        closeMigration();
      }).catch((res) => {
        stateMessage.textContent = "Signature refused.";
        console.log("Signature error: " + res);
      });
    }

    let closeMigration = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + ((model.isRedeem) ? '/closeRedeemMigration' : '/closeMigration');
      options.data.migrationId = model.readCookie("migrationId");
      options.data.escrowHashSignature = escrowHashSigned;

      axios.request(options).then(function (response) {
        if(response.status == 200){
          //Move to mint_Token page
          model.navigateTo("/mint_token");
        }else{
          loadingText.textContent = "Relay not responding.";
          console.log(response.status + ' : ' + response.statusText);
        }

      }).catch(function (error) {
        console.error(error);
      });
    }

    //Ask user to sign escrow hash. Once done, call /closeMigration on relay. Once HTTP OK received, move to mint_token
    document.getElementById("SignEscrowHashButton").addEventListener('click', async() =>{
      signEscrowHash();
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
    xhr.open('GET', '/site/static_views/SignEscrow.html');
    xhr.send();
  }
}
