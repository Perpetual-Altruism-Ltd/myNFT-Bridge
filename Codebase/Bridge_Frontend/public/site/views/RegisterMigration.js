import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Register your migration");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;
    let account = window.web3.currentProvider.selectedAddress;

    //Ask user to grant the relay as an operator by calling approve from ERC721 contract
    let grantRelayOperatorPrivilege = async function(){
      try{
        let selectedRelayIndex = migData.migrationRelayIndex;
        let relayOgNetworkAddr = bridgeApp.relays[selectedRelayIndex].publicKey;
        let originTokenId = parseInt(migData.originTokenId, 16);
        console.log("Asking user " + account + " to grant relay " + relayOgNetworkAddr + " as an operator of the token " + originTokenId);

        contracts.originalChainERC721Contract.methods.approve(relayOgNetworkAddr, originTokenId)
        .send({from: account, gas:30000})
        .then((res) => {
          console.log("Relay is now an operator");
          console.log(res);

          let loadingText = document.getElementById("RegistrationLoadingText");
          if(loadingText != null && loadingText != undefined){loadingText.textContent = "Waiting for the relay to proceed to the token transfert.";}

          signMigrationData();
        }).catch((res) => {
          console.log("Operator approval canceled or error");
          console.log(res);

          alert("Please approve the relay as an operator for this NFT. You must be to owner of that token.");
          signMigrationData();// TODELETE, ONLY FOR TEST PURPOSE
        });
      }catch(err){
        console.log("Error when setting relay as an operator: " + err);
      }
    }

    let signMigrationData = async function(){
      /*try{
        let selectedRelayIndex = getDropDownSelectedOptionIndex("RelaySelector");
        let relayOgNetworkAddr = bridgeApp.relays[selectedRelayIndex].publicKey;
        let originTokenId = migData.originTokenId;

        contracts.originalChainERC721Contract.methods.setApprove(relayOgNetworkAddr, originTokenId)
        .send({from: account, gas: 30000})
        .then((res) => {
          console.log("Relay is now an operator");
          document.getElementById("RegistrationLoadingText").textContent = "Waiting for the relay to proceed to the token transfert.";
          //Waiting for the transaction to be accepted on the blockchain.
        });

        console.log("Migration data signed");
        document.getElementById("RegistrationLoadingText").textContent = "Waiting for the relay to proceed to the token transfert.";
        //Waiting for the transaction to be accepted on the blockchain.
      }catch(err){
        console.log("Error when signing migration data: " + err);
      }*/
      console.log("Will sign...");
    }

    //Display migration data from model.migData
    document.getElementById("OGNetworkRegistrationDisp").textContent = migData.originUniverse;
    document.getElementById("OGContractAddressRegistrationDisp").textContent = migData.originWorld;
    document.getElementById("OGTokenIDRegistrationDisp").textContent = migData.originTokenId;
    document.getElementById("TokenNameRegistrationDisp").textContent = migData.originTokenName;

    document.getElementById("MigrationTypeRegistrationDisp").textContent = migData.migrationType;
    document.getElementById("MigrationRelayRegistrationDisp").textContent = migData.migrationRelay;

    document.getElementById("DestNetworkRegistrationDisp").textContent = migData.destinationUniverse;
    document.getElementById("DestContractAddressRegistrationDisp").textContent = migData.destinationWorld;
    document.getElementById("DestTokenIDRegistrationDisp").textContent = migData.destinationTokenId;
    document.getElementById("DestTokenOwnerRegistrationDisp").textContent = migData.destinationOwner;

    //Interface Buttons
    document.getElementById("EditMigrationButton").addEventListener('click', async() =>{
      model.navigateTo("/migration_form");
    });
    document.getElementById("RegisterButton").addEventListener('click', async() =>{
      grantRelayOperatorPrivilege();
      //model.navigateTo("/escrow_token");
    });
  }

  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'text';
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/RegisterMigration.html');
    xhr.send();
  }
}
