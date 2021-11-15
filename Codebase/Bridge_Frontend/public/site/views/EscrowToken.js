import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - NFT escrow");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;
    let migrationHashSigned = "";
    let account = window.web3.currentProvider.selectedAddress;
    let loadingText = document.getElementById("RegistrationLoadingText");

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //Loading circle style
    //Color green + plain line + stop spinning
    let setCircleValidState = function(){
      document.getElementById("EscrowLoadingCircle").style.animationPlayState = 'paused';
      document.getElementById("SVGEscrowCircle").setAttribute('stroke-dasharray', 0);
      document.getElementById("EscrowLoadingCircle").style.color = '#0c0';
    }
    //Color pink + plain line + stop spinning
    let setCircleHoldOnState = function(){
      document.getElementById("EscrowLoadingCircle").style.animationPlayState = 'paused';
      document.getElementById("SVGEscrowCircle").setAttribute('stroke-dasharray', 0);
      document.getElementById("EscrowLoadingCircle").style.color = '#af1540';
    }
    //Color red + plain line + stop spinning
    let setCircleErrorState = function(){
      document.getElementById("EscrowLoadingCircle").style.animationPlayState = 'paused';
      document.getElementById("SVGEscrowCircle").setAttribute('stroke-dasharray', 0);
      document.getElementById("EscrowLoadingCircle").style.color = '#c00';
    }
    //Color pink + dashed line + spin (default state)
    let setCircleWaitingState = function(){
      document.getElementById("EscrowLoadingCircle").style.animationPlayState = 'running';
      document.getElementById("SVGEscrowCircle").setAttribute('stroke-dasharray', 51.1);
      document.getElementById("EscrowLoadingCircle").style.color = '#af1540';
    }

    //Initially hide resign button
    document.getElementById("ResignButton").style.display = 'none';

    let migrationHashListener = async function(){
      //Construct request
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      //Create HTTP request
      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/pollingMigration';

      let requestCallback = function(response){
        if(response.status == 200){
          let res = response.data;
          //If migration Hash received from relay
          if(res.migrationHash != undefined){
            model.migrationHash = res.migrationHash;
            console.log("Migration hash received: " + model.migrationHash);

            //display valid state (green plain line)
            setCircleHoldOnState();
            loadingText.textContent = "Please sign the migration hash to continue the migration.";

            //Then sign migration hash
            signMigrationHash();
          }
        }else{
          setCircleErrorState();
          loadingText.textContent = "Couldn't retrive migration hash. Please contact our team for support.";
          console.log(response.status + ' : ' + response.statusText);
        }
      }

      console.log("Start listening for migration hash");

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.migrationHash == ""){
        //Refresh migrationId from cookies. Waiting the return of the /initMigration request
        let migId = model.readCookie("migrationId");
        options.data.migrationId = migId;
        //Ask relay for migration hash, only if migId retrieve from /initMigration
        if(migId != null && migId != undefined){
          axios.request(options).then(function (response) {
            requestCallback(response);
          }).catch(function (error) {
            setCircleErrorState();
            loadingText.textContent = "Couldn't retrive migration hash. Please contact our team for support.";
            console.error(error);
          });
        }

        await sleep(model.listeningRefreshFrequency*1000);
        i++;
      }

      //If timeout: error message
      if(model.migrationHash == ""){
        setCircleErrorState();
        loadingText.textContent = "Couldn't retrieve migration data hash from relay. Please contact our team for support.";
      }
    }
    //Will call signMigrationHash once migration hash is received, which will call continueMigration once signed by user
    //signMigrationHash() -> continueMigration() -> escrowHashListener() -> /sign_escrow
    if(model.isMigDataFilled()){
      migrationHashListener();
    }else {
      setCircleErrorState();
      loadingText.textContent = "No migration data found. Redirecting to wallet connection page.";
      setTimeout(function(){model.navigateTo('wallet_connection');}, 3000);
    }


    let signMigrationHash = async function(){
      //personal_sign
      window.ethereum.request({ method: 'personal_sign', params: [ model.migrationHash, account ] })
      .then((res) =>{
        console.log("Migration hash signed: " + res);
        loadingText.textContent = "Sending signature to relay.";
        migrationHashSigned = res;

        //Resume loading circle spin
        setCircleWaitingState();

        continueMigration();
      }).catch((res) => {
        //If user canceled signature, display error msg + ask to sign again
        setCircleErrorState();
        loadingText.textContent = "Retry to sign or contact our team if the issue persists.";
        //Show re sign button
        document.getElementById("ResignButton").style.display = 'flex';
        console.log("Signature error: " + res);
      });
    }

    let continueMigration = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/continueMigration';
      options.data.migrationId = model.readCookie("migrationId");
      options.data.migrationHashSignature = migrationHashSigned;

      axios.request(options).then(function (response) {
        if(response.status == 200){
          //SetCircleWaitingState is called in escrowHashListener and delayed by 3sec
          //start listening relay for escrow hash
          escrowHashListener();
        }else{
          setCircleErrorState();
          loadingText.textContent = "Relay not responding. Please contact our team.";
          console.log(response.status + ' : ' + response.statusText);
        }

      }).catch(function (error) {
        setCircleErrorState();
        loadingText.textContent = "Relay not responding. Please contact our team.";
        console.error(error);
      });
    }

    let escrowHashListener = async function(){
      //Construct XHR request
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/pollingEscrow';
      options.data.migrationId = model.readCookie("migrationId");

      let requestCallback = function(response){
        if(response.status == 200){
          let res = response.data;
          //If migration Hash received from relay
          if(res.escrowHash != undefined){
            model.escrowHash = res.escrowHash;
            console.log("Escrow hash received: " + model.escrowHash);

            //set circle Valid state
            setCircleValidState();
            if(migData.migrationType == model.RedeemIOUMigrationType){
              loadingText.textContent = "IOU Token successfully put in escrow.";
            }
            else {
              loadingText.textContent = "Token successfully put in escrow.";
            }

            //Then move to signEscrow page
            setTimeout(function(){model.navigateTo("/sign_escrow");}, 3000);
          }
        }else{
          setCircleErrorState();
          loadingText.textContent = "Couldn't retrieve escrow hash. Please contact our team.";
          console.log(response.status + ' : ' + response.statusText);
        }
      }

      console.log("Start listening for escrow hash");
      setTimeout(() => {
        setCircleWaitingState();
        loadingText.textContent = "Please wait for your NFT to be transferred into the origin bridge...";
      }, 3000);

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.escrowHash == ""){
        //Ask relay for migration hash
        axios.request(options).then(function (response) {
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
      if(model.escrowHash == ""){
        setCircleErrorState();
        loadingText.textContent = "Couldn't retrieve escrow hash from relay. Please contact our team.";
      }
    }

    document.getElementById("ResignButton").addEventListener('click', async() => {
      //Hide the button itself
      setCircleHoldOnState();
      document.getElementById("ResignButton").style.display = 'none';
      signMigrationHash();
    })

    //setTimeout(() => { model.navigateTo("/sign_escrow"); }, 5000);
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
