import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Wallet connection");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;

    //Connect to metamask if wallet installed
    var endLoadMetamaskConnection = async function () {
      //Set wallet connection callback for Westron lib
      //DO I NEED A CALLBACK ? WILL IT ACCESS THIS CONTEXT ?
      connectionCallback = function(){
        //Display connected addr + departure cards
        document.getElementById("ConnectedAddrCard").style = 'display: flex;';
        document.getElementById("DepartureCard").style = 'display: flex;';
        //Prefill origin network
        prefillOriginNetwork();
      }

      //Connecting to metmask if injected
      if (window.web3.__isMetaMaskShim__ && window.web3.currentProvider.selectedAddress != null) {
          if (connector == null || !connector.isConnected) {
              connector = await ConnectorManager.instantiate(ConnectorManager.providers.METAMASK);
              connectedButton = connectMetaMaskButton;
              providerConnected = "MetaMask";
              connection();
          } else {
              connector.disconnection();
          }
      }
    }

    //Auto connect to metamask if wallet exists
    setTimeout(endLoadMetamaskConnection, 1000);
  }

  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/WalletConnection.html');
    xhr.send();
  }
}
