import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("myNFT Bridge - Register your migration");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;
    let migData = model.migrationData;
    let userAccount = "";

    let refreshConnectedAccount = function(){
      let rawAddr = window.connector.web3.currentProvider.selectedAddress;
      if(rawAddr){userAccount = rawAddr.toLowerCase();}
      else{userAccount = '';}
    }

    //When user accept to switch, it will be asked to grant relay as operator of his NFT
    let promptSwitchChainThenGrantOperator = async function (ID) {
      window.connector.web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
      }).then((res) =>{
        console.log("Network switch done.");
        grantRelayOperatorPrivilege();
      }).catch((res) => {
        console.log("Network switch canceled or error");
        alert("Please accept the metamask switch network prompt in order to continue your NFT migration.");
        // should perhaps change wording; not everyone uses metamask
        //Unselect btn to allow user to re click
        document.getElementById("RegisterButton").classList.remove('Selected');
      });
    }
    //Once user accept to switch, it will be redirected to migration_form
    let promptSwitchChainThenEditForm = async function (ID) {
      window.connector.web3.currentProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
      }).then((res) =>{
        console.log("Network switch done.");
        model.editMigrationForm = true;
        model.navigateTo("/migration_form");
      }).catch((res) => {
        console.log("Network switch canceled or error");
        alert("Please accept the metamask switch network prompt in order to edit your migration.");
        // should perhaps change wording; not everyone uses metamask
      });
    }

    //Loading circle styling of escrow_token page
    //Color pink + plain line + stop spinning
    let setCircleHoldOnState = function(){
      let circleContainer = document.getElementById("EscrowLoadingCircle");
      let circleSVG = document.getElementById("SVGEscrowCircle");

      if(circleSVG){circleSVG.setAttribute('stroke-dasharray', 0);}
      if(circleContainer){
        circleContainer.style.color = '#af1540';
        circleContainer.style.animationPlayState = 'paused';
      }
    }
    //Color red + plain line + stop spinning
    let setCircleErrorState = function(){
      let circleContainer = document.getElementById("EscrowLoadingCircle");
      let circleSVG = document.getElementById("SVGEscrowCircle");

      if(circleSVG){circleSVG.setAttribute('stroke-dasharray', 0);}
      if(circleContainer){
        circleContainer.style.color = '#c00';
        circleContainer.style.animationPlayState = 'paused';
      }
    }
    //Color pink + dashed line + spin (default state)
    let setCircleWaitingState = function(){
      let circleContainer = document.getElementById("EscrowLoadingCircle");
      let circleSVG = document.getElementById("SVGEscrowCircle");

      if(circleSVG){circleSVG.setAttribute('stroke-dasharray', 51.1);}
      if(circleContainer){
        circleContainer.style.color = '#af1540';
        circleContainer.style.animationPlayState = 'running';
      }
    }
    //Query the relay to get the manip addr from the og univ unique id from migData.
    let getManipulatorAddrFromRelay = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/getManipulatorAddress';
      options.data.universe = migData.originUniverseUniqueId;

      try{
        let response = await axios.request(options);
        if(response.status == 200){
          let manipAddr = response.data.manipulatorAddress;
          console.log("Manipulator addr retrieved from relay: " + manipAddr);

          return manipAddr;
        }else{console.log(response.status + ' : ' + response.statusText);}
      }catch(error){
        //display redCircle
        setCircleErrorState();
        //Display error msg inside circle
        if(error.response.data){
          let loadingText = document.getElementById("RegistrationLoadingText");
          if(loadingText != null && loadingText != undefined){
            loadingText.textContent = error.response.data.status + ". Please contact us to report the bug with the link in the upper right corner";
          }
        }
        console.error(error);
      }
      //If nothing retrieved from server, return empty
      return "";

    }

    let onManipulatorGrantedAsOperator = function(){
      console.log('Manipulator is now approved');
      //Avdance 1 step in breadcrumb trail
      document.getElementById("BCT").setAttribute('step-num', 1);

      //Delete migId from previous migration, to let place to the new one which will me
      model.storeMigrationIdLocalStorage("");

      //If approval accepted by user: go to next page
      model.navigateTo("/migration_process");
    }

    //Ask user to grant the relay as an operator by calling approve from ERC721 contract
    let grantRelayOperatorPrivilege = async function(){
      //Before engaging in the migration process, save mig data to localStorage
      model.storeMigDataLocalStorage();
      model.storeMigStepLocalStorage(model.migStepManipulatorApprove);

      //Instantiate contract to call approve (If not already done in migration_form)
      if(contracts.originalChainERC721Contract == undefined){
        contracts.originalChainERC721Contract = new window.connector.web3.eth.Contract(ABIS.ERC721, migData.originWorld);
      }

      try{
        let manipulatorAddr = await getManipulatorAddrFromRelay();
        let originTokenId = parseInt(migData.originTokenId);
        console.log("Ask user " + userAccount + " to grant relay " + manipulatorAddr + " as an operator for the token " + originTokenId + " on contract " + migData.originWorld);

        contracts.originalChainERC721Contract.methods.approve(manipulatorAddr, originTokenId)
        .send({from: userAccount, gas:1000000000}, function(error, transactionHash){
          //Function called when user accept or reject relay's operator approval
          if(error){
            console.log('Approval rejected by user');
            alert("The relay need to be an operator for this NFT to be able to operate the migration.\nPlease approve the relay as an operator.");
            //Unselect btn to allow user to re click
            document.getElementById("RegisterButton").classList.remove('Selected');
          }
          else{
            onManipulatorGrantedAsOperator();
          }
        })
        .then((res) => {
          //Function called when transaction accepted on blockchain. Will be executed when page EscrowToken is displayed
          console.log("Relay is now an operator");

          //Update migStep
          model.storeMigStepLocalStorage(model.migStepInitMigration);

          //Call /initMigration from Relay
          initMigration();

          let loadingText = document.getElementById("RegistrationLoadingText");
          if(loadingText != null && loadingText != undefined){loadingText.textContent = "The migration is being registered on origin blockchain.";}
        }).catch((res) => {
          console.log("Operator approval canceled or error");
          console.log(res);

          //Display red circle
          setCircleErrorState();

          //Unselect btn to allow user to re click
          document.getElementById("RegisterButton").classList.remove('Selected');

          //Display error message inside circle on escrow_token page
          let loadingText = document.getElementById("RegistrationLoadingText");
          if(loadingText != null && loadingText != undefined){loadingText.textContent = "Error during relay operator approval.";}

          console.log("An error occured when approving the relay as an operator of your NFT. Make sure you are the owner of that token and to accept the approval operation. Current owner is " + migData.originOwner);
        });
      }catch(err){
        setCircleErrorState();
        console.log("Error when setting relay as an operator: " + err);
      }
    }

    //relay's backend interactions.
    //Will be executed on EscrowToken page
    let initMigration = async function(){
      let selectedRelayIndex = migData.migrationRelayIndex;
      let relayURL = bridgeApp.relays[selectedRelayIndex].url;

      var options = {
        method: 'POST',
        url: '',
        headers: {'Content-Type': 'application/json'},
        data: {}
      };
      options.url = relayURL + '/initMigration';
      options.data.migrationData = {};
      options.data.migrationData.originUniverse = migData.originUniverseUniqueId.toLowerCase();
      options.data.migrationData.originWorld = migData.originWorld.toLowerCase();
      options.data.migrationData.originTokenId = migData.originTokenId;
      options.data.migrationData.originOwner = migData.originOwner.toLowerCase();
      options.data.migrationData.destinationUniverse = migData.destinationUniverseUniqueId.toLowerCase();
      options.data.migrationData.destinationWorld = migData.destinationWorld.toLowerCase();
      options.data.migrationData.destinationTokenId = migData.destinationTokenId;
      options.data.migrationData.destinationOwner = migData.destinationOwner.toLowerCase();
      options.data.operatorHash = "0x00";//Not used yet
      options.data.redeem = migData.isRedeem;

      axios.request(options).then(function (response) {
        if(response.status == 200){
          let migId = response.data.migrationId;
          console.log("Migration initiated with migrationId: " + migId);
          //Add migrationID as cookie. This will trigger EscrowToken to call /pollingMigration.
          model.storeMigrationIdLocalStorage(migId);

          //Update migStep
          model.storeMigStepLocalStorage(model.migStepPollMigrationHash);
        }else{console.log(response.status + ' : ' + response.statusText);}

      }).catch(function (error) {
        //display redCircle
        setCircleErrorState();
        //Display error msg inside circle
        if(error.response.data){
          let loadingText = document.getElementById("RegistrationLoadingText");
          if(loadingText != null && loadingText != undefined){
            loadingText.textContent = error.response.data.status + ". Please contact us to report the bug with the link in the upper right corner";
          }
        }
        console.error(error);
      });
    }

    //Display migration data from model.migData
    document.getElementById("OGNetworkRegistrationDisp").textContent = migData.originUniverse;
    document.getElementById("OGContractAddressRegistrationDisp").textContent = migData.originWorld;
    document.getElementById("OGTokenIDRegistrationDisp").textContent = migData.originTokenId;
    document.getElementById("OGTokenOwnerRegistrationDisp").textContent = migData.originOwner;
    document.getElementById("TokenNameRegistrationDisp").textContent = migData.originTokenName;

    document.getElementById("MigrationTypeRegistrationDisp").textContent = migData.migrationType;
    document.getElementById("MigrationRelayRegistrationDisp").textContent = migData.migrationRelay;

    document.getElementById("DestNetworkRegistrationDisp").textContent = migData.destinationUniverse;
    document.getElementById("DestContractAddressRegistrationDisp").textContent = migData.destinationWorld;
    document.getElementById("DestTokenIDRegistrationDisp").textContent = migData.destinationTokenId;
    document.getElementById("DestTokenNameRegistrationDisp").textContent = migData.destinationTokenName;
    document.getElementById("DestTokenOwnerRegistrationDisp").textContent = migData.destinationOwner;

    //Interface Buttons
    document.getElementById("EditMigrationButton").addEventListener('click', async() =>{
      promptSwitchChainThenEditForm('0x' + migData.originNetworkId.toString(16));
    });
    document.getElementById("RegisterButton").addEventListener('click', async function(e){
      //Prevent double clicks
      //Check if button not already selected
      if(this.classList.contains("Selected")){console.log("Button already clicked.");return;}

      //Select button
      //We can use 'this' inside the event listener, AND IF NON ARROW function (=>)
      this.classList.add('Selected');

      //refresh user wallet account
      refreshConnectedAccount();

      //If not right account connected to wallet
      if(userAccount != migData.originOwner){
        alert("The NFT owner is " + migData.originOwner + ". Please connect to this account through your wallet.");
      }
      //Else, check wallet connected network, and prompt user to switch if wrong network.
      else if(parseInt(window.connector.web3.currentProvider.chainId) != parseInt(migData.originNetworkId)){
        alert("The NFT you want to migrate is on the blochain " + migData.originUniverse + ". Please change the network you are connected to with your wallet.");
        promptSwitchChainThenGrantOperator('0x' + migData.originNetworkId.toString(16));
      }
      //Else: everything OK, launch migration registration
      else{
        grantRelayOperatorPrivilege();
      }
    });

    //Resume migration handling
    if(model.resumeMigration){
      model.resumeMigration = false;

      let pendingMigStep = model.getPendingMigStep();

      //Ask the user to approve manipulator
      if(pendingMigStep == model.migStepManipulatorApprove){
        document.getElementById("RegisterButton").click();
      }
      //call /initMigration route to relay
      else if(pendingMigStep == model.migStepInitMigration){
        initMigration();

        onManipulatorGrantedAsOperator();
      }else{
        console.error("Unknown migration step: " + pendingMigStep);
        model.navigateTo("/migration_form");
      }
    }
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
