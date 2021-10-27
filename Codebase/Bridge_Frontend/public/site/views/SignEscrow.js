import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Sign the escrow data");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let escrowHashSigned = "";
    let stateMessage = document.getElementById("StateMessage");

    let signEscrowHash = async function(){
      model.escrowHash = 'blblblblbl';//FOR TEST PURPOSE

      window.web3.eth.sign(model.escrowHash, account, function(err,res){
        //If user refused to sign
        if(err){
          stateMessage.textContent = "Signature refused.";
        }else{
          escrowHashSigned = res;
          //Send escrowHashSigned to relay
          closeMigration();
        }
      });
    }

    let closeMigration = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;
      let destinationNetworkId = bridgeApp.networks[migData.destinationUniverseIndex].networkID.toString(16);

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          //Move to mint_Token page
          model.navigateTo("/mint_token");
        }else{
          stateMessage.textContent = "Relay not responding.";
          console.log(this.status);
        }
      };
      xhr.open('POST', relayURL + '/closeMigration');
      let requestParam = {};
      requestParam.migrationId = model.readCookie("migrationId");
      requestParam.escrowHashSignature = escrowHashSigned;

      xhr.send(requestParam);
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
