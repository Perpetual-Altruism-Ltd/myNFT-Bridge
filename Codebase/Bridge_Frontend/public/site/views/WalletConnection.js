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
      window.connectionCallback = function(){
        console.log("Wallet connected from wallet_connection");
        model.navigateTo('/migration_form');
      };

      //NOPE!
      //A: metamask doesn't inject web3 anymore, that's why westron does.
      //B: this isn't great if a user has multiple wallets
      //Connecting to metmask if injected
      /*if (window.web3.__isMetaMaskShim__ && window.web3.currentProvider.selectedAddress != null) {
          if (connector == null || !connector.isConnected) {
              connector = await ConnectorManager.instantiate(ConnectorManager.providers.METAMASK);
              connectedButton = connectMetaMaskButton;
              providerConnected = "MetaMask";
              connection();
          } else {
              connector.disconnection();
          }
      }*/
    }

    //If user want to disconnect his wallet, call disconnect from westron lib
    //+ set wallet connection buttons listeners. This is required as the view (HTML content) has been loaded again
    if(model.disconnectWallet){
      window.connector.disconnection();
      //set again buttons onClick functions
      model.disconnectWallet = false;
      setConnectWalletButtonsListeners();
    }else{
      //Load westron lib, to add the behaviour to connection buttons
      loadWestron();

    }

    window.connectionCallback = function(){
      console.log("Wallet connected from wallet_connection");
      model.navigateTo('/migration_form');
    };


    //Once loadWestron started, wait for it to finish by polling. Timeout after 50ms*100 = 5sec
    //Then auto connect to metamask if wallet exists
    /*let cmptr = 0;
    let pollWestronLoaded = async function(){
      try{
        await endLoadMetamaskConnection();
        console.log("Westron lib loaded after " + cmptr + " attempts.");
      }catch(err){
        cmptr++;
        if(cmptr > 100){
          console.log("Westron loading timed out.");
          alert('It seems that you have no wallet provider installed. You can install metamask in few minutes by visiting https://metamask.io/')
        }else {
          setTimeout(pollWestronLoaded, 50);
        }
      }
    }*/
    //Start polling for westron to be loaded
    //pollWestronLoaded();

    document.getElementById("RequestWalletBtn").addEventListener('click', function(){
      window.open("mailto:bridge@mynft.com?subject=Network%20request");
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
    xhr.open('GET', '/site/static_views/WalletConnection.html');
    xhr.send();
  }
}
