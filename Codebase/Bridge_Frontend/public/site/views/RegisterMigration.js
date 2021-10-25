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


    document.getElementById("EditMigrationButton").addEventListener('click', async() =>{
      model.navigateTo("/migration_form");
    });
    document.getElementById("RegisterButton").addEventListener('click', async() =>{
      model.navigateTo("/escrow_token");
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
