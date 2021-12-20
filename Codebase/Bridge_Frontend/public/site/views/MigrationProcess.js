import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - Migration process");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;
    let account = window.web3.currentProvider.selectedAddress.toLowerCase();
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

    //=====Callback functions=====
    let onMigrationHashReceived = function(migHash){
      console.log("Migration hash: " + migHash);

      model.hash.migrationHash = migHash;
      //Hashes has been modified : save to localstorage
      model.storeHashValuesLocalStorage();

      //Update migStep
      model.storeMigStepLocalStorage(model.migStepSignMigrationHash);

      //Validate the manipulator approval step
      document.getElementById("BCT").setAttribute('step-num', 1);

      //display valid state (green plain line)
      setCircleHoldOnState();
      loadingText.textContent = "Please sign the migration hash to continue the migration.";

      //Then sign migration hash
      signMigrationHash();
    }

    let onMigrationHashSigned = function(migHashSigned){
      console.log("Migration hash signed: " + migHashSigned);
      loadingText.textContent = "The signature is being sent to the relay...";
      model.hash.migrationHashSigned = migHashSigned;
      //Hashes has been modified : save to localstorage
      model.storeHashValuesLocalStorage();

      //Update migStep
      model.storeMigStepLocalStorage(model.migStepContinueMigration);

      //Advance one step further in breadcrumb
      document.getElementById("BCT").setAttribute('step-num', 2);

      //Resume loading circle spin
      setCircleWaitingState();

      continueMigration();
    }

    let onContinueMigrationResponse = function(){
      //Update migStep
      model.storeMigStepLocalStorage(model.migStepPollEscrowHash);

      //Set it again in case migration is resumed here.
      document.getElementById("BCT").setAttribute('step-num', 2);

      //SetCircleWaitingState is called in escrowHashListener and delayed by 3sec
      //start listening relay for escrow hash
      escrowHashListener();
    }

    let onEscrowHashReceived = function(escrowHash){
      console.log("Escrow hash received: " + escrowHash);

      //Update migStep
      model.storeMigStepLocalStorage(model.migStepSignEscrowHash);

      model.hash.escrowHash = escrowHash;
      //Hashes has been modified : save to localstorage
      model.storeHashValuesLocalStorage();

      //Set it again in case migration is resumed here.
      document.getElementById("BCT").setAttribute('step-num', 2);

      //set circle Valid state
      setCircleHoldOnState();
      if(migData.migrationType == model.RedeemIOUMigrationType){
        loadingText.innerHTML = "IOU token successfully put in escrow.<br>Please sign the escrow hash.";
      }
      else {
        loadingText.innerHTML = "Token successfully put in escrow.<br>Please sign the escrow hash.";
      }

      //Then ask user to sign escrow hash
      signEscrowHash();
    }

    let onEscrowHashSigned = function(escrowHashSigned){
      console.log("Escrow hash signed: " + escrowHashSigned);
      //Advance one step further in breadcrumb trail
      document.getElementById("BCT").setAttribute('step-num', 3);

      //set circle to waiting state. Waiting for escrow hash to be sent + poll end mig
      setCircleWaitingState();
      loadingText.textContent = "The signature is being sent to the relay...";

      model.hash.escrowHashSigned = escrowHashSigned;
      //Hashes has been modified : save to localstorage
      model.storeHashValuesLocalStorage();

      //Update migStep
      model.storeMigStepLocalStorage(model.migStepCloseMigration);

      //Send model.hash.escrowHashSigned to relay
      closeMigration();
    }

    let onMigrationClosed = function(){
      console.log("Escrow hash signed sent!");

      //Set it again in case migration is resumed here.
      document.getElementById("BCT").setAttribute('step-num', 3);

      //Update migStep
      model.storeMigStepLocalStorage(model.migStepPollEndMigration);

      //Start polling for end mig
      endMigrationListener();
    }

    //=====Migration process functions=====
    let migrationHashListener = async function(){
      //Validate the manipulator approval step
      document.getElementById("BCT").setAttribute('step-num', 1);

      //If already approved display msg. Else, the msg will be displayed by registerMigration view l136
      if(model.migStepManipulatorApprove == model.migStepPollMigrationHash){
          loadingText.textContent = "The migration is being registered on origin blockchain.";
      }

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
            onMigrationHashReceived(res.migrationHash);
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
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.hash.migrationHash == ""){
        //Refresh migrationId from cookies. Waiting the return of the /initMigration request
        let migId = model.getMigrationId();
        options.data.migrationId = migId;
        //Ask relay for migration hash, only if migId retrieve from /initMigration
        if(migId != null && migId != undefined && migId != ""){
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
      if(model.hash.migrationHash == ""){
        setCircleErrorState();
        loadingText.textContent = "Couldn't retrieve migration data hash from relay. Please contact our team for support.";
      }
    }

    let signMigrationHash = async function(){
      //personal_sign
      window.ethereum.request({ method: 'personal_sign', params: [ model.hash.migrationHash, account ] })
      .then((res) =>{
        onMigrationHashSigned(res);
      }).catch((res) => {
        //If user canceled signature, display error msg + ask to sign again
        setCircleErrorState();
        loadingText.textContent = "Retry to sign the migration hash or contact our team if the issue persists.";
        //Show re sign button
        document.getElementById("ResignButton").style.display = 'flex';
        console.log("Signature error: " + JSON.stringify(res));
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
      options.data.migrationId = model.getMigrationId();
      options.data.migrationHashSignature = model.hash.migrationHashSigned;

      axios.request(options).then(function (response) {
        if(response.status == 200){
          onContinueMigrationResponse();
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
      options.data.migrationId = model.getMigrationId();

      let requestCallback = function(response){
        if(response.status == 200){
          let res = response.data;
          //If migration Hash received from relay
          if(res.escrowHash != undefined){
            onEscrowHashReceived(res.escrowHash);
          }
        }else{
          setCircleErrorState();
          loadingText.textContent = "Couldn't retrieve escrow hash. Please contact our team.";
          console.log(response.status + ' : ' + response.statusText);
        }
      }

      console.log("Start listening for escrow hash");
      setTimeout(() => {
        //Display waiting msg only if we didn't executed onEscrowHashReceived yet. i.e currentStep != model.migStepSignEscrowHash
        if(model.currentMigrationStep != model.migStepSignEscrowHash){
          setCircleWaitingState();
          loadingText.textContent = "Please wait for your NFT to be transferred into the origin bridge...";
        }
      }, 3000);

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.hash.escrowHash == ""){
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
      if(model.hash.escrowHash == ""){
        setCircleErrorState();
        loadingText.textContent = "Couldn't retrieve escrow hash from relay. Please contact our team.";
      }
    }

    let signEscrowHash = async function(){
      //Ask the wallet to prompt user to sign data
      window.ethereum.request({ method: 'personal_sign', params: [ model.hash.escrowHash, account ] })
      .then((res) =>{
        onEscrowHashSigned(res);
      }).catch((res) => {
        setCircleErrorState();
        loadingText.textContent = "Retry to sign the escrow hash or contact our team if the issue persists.";
        //Show re sign button
        document.getElementById("ResignButton").style.display = 'flex';
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
      options.url = relayURL + ((migData.isRedeem) ? '/closeRedeemMigration' : '/closeMigration');
      options.data.migrationId = model.getMigrationId();
      options.data.escrowHashSignature = model.hash.escrowHashSigned;

      axios.request(options).then(function (response) {
        if(response.status == 200){
          console.log('answer received from ' + options.url + '. Moving to mint_token');

          onMigrationClosed();
        }else{
          loadingText.textContent = "Relay not responding. Contact our team for support.";
          console.log(response.status + ' : ' + response.statusText);
        }

      }).catch(function (error) {
        console.error(error);
      });
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
      options.data.migrationId = model.getMigrationId();

      let requestCallback = function(response){
        if(response.status == 200){
          let res = response.data;
          //If token transfered to destination owner
          if(res.migrationStatus == "Ok"){
            model.destinationTokenTransfertTxHash = res.transactionHash;

            //Advance one step further in breadcrumb trail
            document.getElementById("BCT").setAttribute('step-num', 4);

            console.log("Migration ended !");
            //Display valid (green) circle
            setCircleValidState();
            loadingText.textContent = "Migration ended ! The token has been transferred to the destination owner.";

            //Update migStep
            model.storeMigStepLocalStorage(model.migStepMigrationSuccessful);

            //Clear model.hash
            model.hash.migrationHash = "";
            model.hash.migrationHashSigned = "";
            model.hash.escrowHash = "";
            model.hash.escrowHashSigned = "";
            model.storeHashValuesLocalStorage();

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
      setTimeout(() => {
        loadingText.textContent = "Please wait for the new token to be transferred to the destination owner...";
      }, 3000);

      //Wait until timeout or migrationHash received
      let i = 0;
      while(i < model.listeningTimeOut/model.listeningRefreshFrequency && model.destinationTokenTransfertTxHash == ""){
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
      if(model.destinationTokenTransfertTxHash == ""){
        setCircleErrorState();
        loadingText.textContent = "Couldn't retrieve transaction hash of the destination token transfer to owner.";
      }
    }

    document.getElementById("ResignButton").addEventListener('click', async() => {
      //Hide the button itself
      setCircleHoldOnState();
      document.getElementById("ResignButton").style.display = 'none';
      if(model.currentMigrationStep == model.migStepSignMigrationHash){
        signMigrationHash();
      }
      else if(model.currentMigrationStep == model.migStepSignEscrowHash){
        signEscrowHash();
      }
      else{
        console.log("Wrong step for re-sign button: " + model.currentMigrationStep);
        loadingText.textContent = "The current migration step doesn't match for signing. Please contact our team.";
      }
    })

    //Will call signMigrationHash once migration hash is received, which will call continueMigration once signed by user
    //signMigrationHash() -> continueMigration() -> escrowHashListener() -> /sign_escrow
    if(model.isMigDataFilled()){
      if(model.resumeMigration){
        model.resumeMigration = false;

        let pendingMigStep = model.getPendingMigStep();
        console.log("Resuming migration from step " + pendingMigStep);

        //Start polling mig hash
        if(pendingMigStep == model.migStepPollMigrationHash){
          //Will call signMigrationHash() when migHash will be received
          migrationHashListener();
        }
        //Ask user to sign mig hash. Mig hash is retrieved from migData.migrationHash
        else if(pendingMigStep == model.migStepSignMigrationHash){
          //Will call signMigrationHash()
          onMigrationHashReceived(model.hash.migrationHash);
        }
        else if(pendingMigStep == model.migStepContinueMigration){
          //Will call continueMigration()
          onMigrationHashSigned(model.hash.migrationHashSigned);
        }
        else if(pendingMigStep == model.migStepPollEscrowHash){
          //Display msg without timeout because resume migration here
          loadingText.textContent = "Please wait for your NFT to be transferred into the origin bridge...";
          //Will call escrowHashListener()
          onContinueMigrationResponse();
        }
        else if(pendingMigStep == model.migStepSignEscrowHash){
          //Will call signEscrowHash()
          onEscrowHashReceived(model.hash.escrowHash);
        }
        else if(pendingMigStep == model.migStepCloseMigration){
          //Will call closeMigration()
          onEscrowHashSigned(model.hash.escrowHashSigned);
        }
        else if(pendingMigStep == model.migStepPollEndMigration){
          //Display msg without timeout because resume migration here
          loadingText.textContent = "Please wait for the new token to be transferred to the destination owner...";
          //Will call endMigrationListener()
          onMigrationClosed();
        }
        else{
          console.error("Unknown migration step: " + pendingMigStep);
          model.navigateTo("/migration_form");
        }
      }
      //If no migration pending, call normal process: /initMig has been called in register_mig view,
      //so now we poll the relay for migration hash
      else{
        migrationHashListener();
      }


    }else {
      setCircleErrorState();
      loadingText.textContent = "No migration data found.";
      setTimeout(function(){model.navigateTo('wallet_connection');}, 10000);
    }

  }

  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/MigrationProcess.html');
    xhr.send();
  }
}
