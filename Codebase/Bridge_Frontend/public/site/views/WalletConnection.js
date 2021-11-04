import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - Wallet connection");
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
      //set callback function called when a wallet is connected
      connectionCallback = function(){
        console.log("Wallet connected");
        model.navigateTo('/migration_form');
      };

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

    //If user want to disconnect his wallet, call disconnect from westron lib
    //+ set wallet connection buttons listeners. This is required as the view (HTML content) has been loaded again
    if(model.disconnectWallet){
      connector.disconnection();
      //set again buttons onClick functions
      setConnectWalletButtonsListeners();

      model.disconnectWallet = false;
    }else{
      //Load westron lib, to add the behaviour to connection buttons
      loadWestron();
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
