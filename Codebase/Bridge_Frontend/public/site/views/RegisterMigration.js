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

    //Cookies management
    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else {
            var expires = "";
        }
        // document.cookie = name + "=" + value + expires + "; path=/; secure; samesite=strict";
        document.cookie = name + "=" + value + expires + ";path=/; SameSite=Strict; Secure";
    }
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0)
                return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    function eraseCookie(name) {
        createCookie(name, "", -1);
    }

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
        }).catch((res) => {
          console.log("Operator approval canceled or error");
          console.log(res);

          alert("Please approve the relay as an operator for this NFT. You must be to owner of that token.");
        });
      }catch(err){
        console.log("Error when setting relay as an operator: " + err);
      }
    }

    //relay's backend interactions
    let initMigration = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;
      let destinationNetworkId = bridgeApp.networks[migData.destinationUniverseIndex].networkID.toString(16);

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          let migId = xhr.response;
          //Add migrationID as cookie
          createCookie("migrationId", migId, 31);
          console.log("MigrationId: " + migId);
        }
      };
      xhr.open('POST', relayURL + '/initMigration');
      let requestParam = {};
      requestParam.migrationData = {};
      requestParam.migrationData.originUniverse = migData.originUniverse;
      requestParam.migrationData.originWorld = migData.originWorld;
      requestParam.migrationData.originTokenId = migData.originTokenId;
      requestParam.migrationData.originOwner = "0x00";
      requestParam.migrationData.destinationUniverse = migData.destinationUniverse;
      requestParam.migrationData.destinationBridge = "0x00";
      requestParam.migrationData.destinationWorld = migData.destinationWorld;
      requestParam.migrationData.destinationTokenId = migData.destinationTokenId;
      requestParam.migrationData.destinationOwner = migData.destinationOwner;
      requestParam.operatorHash = "0x00";

      xhr.send(requestParam);
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
