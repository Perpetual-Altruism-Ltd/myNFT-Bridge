//=====REGISTRATION PAGE=====
var bridgeApp = {};
var contracts = {};
var account;

const NoMigrationType = 0;
const RedeemMigrationType = 1;
const IOUMigrationType = 2;
const FullMigrationType = 3;
let migrationTypeSelected = NoMigrationType;

//-----------------------LOADING CONFIG DATA---------------------
/*var loadNets = async function (_callback) {
    bridgeApp.networks = [];
    bridgeApp.net = {};

    let pathNetworksJson = '/network_list.json';
    try {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', pathNetworksJson);

        xhr.onload = function () {
            if (xhr.status != 200) { // analyze HTTP status of the response
                console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
                alert("Could not load network list at " + pathNetworksJson);
            } else { // show the result
                //console.log(`Done, got ${xhr.response}`); // responseText is the server
                var resp = xhr.response;
                bridgeApp.networks = JSON.parse(resp).networks;

                //Create a mapping from networkUniqueID
                for (var i = 0; i < bridgeApp.networks.length; i++) {
                    bridgeApp.net[bridgeApp.networks[i].uniqueId] = bridgeApp.networks[i];
                } //You can now access Mainnet network data by calling bridgeApp.net.0x6d2f0e37


                _callback();

            }
        };

        xhr.send();
    } catch (err) {
        console.log(err);
        alert("Could not load network list at " + pathNetworksJson);

    };
}
loadNets(function(){});*/

//---------------------LOADING ABIS-------------------------
var ABIS = {};
//Load DepartureBridge ABI
ABIS.DepartureBridge = {};

//-----------------LOADING CONTRACTS-----------------------
let loadOgBridgeContract = async function(){
  let ogBridgeAddr = migrationData.ogBridgeAddr;
  contracts.originBridgeContract = new web3.eth.Contract(ABIS.DepartureBridge, ogBridgeAddr);
}
//loadOgBridgeContract();//TO UNCOMMENT WHEN ABI & CONTRACT OK


//Loading account addr
var accounts;
async function enableEth() {
    //Will Start the metamask extension
    accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });
    account = accounts[0];
    if (account != null) {
        //document.getElementById("enableEthButton").style.display = "none";
    }
}
let promptSwitchChain = async function (ID) {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: ID}], // chainId must be in hexadecimal numbers
  });
}

let editMigrationButtonClick = function(){
  window.location = '/bridge';
}

//Pre register migration to departure bridge by calling ogBridge.migrateToERC721[Full | IOU]
//will emit MigrationDeparturePreRegisteredERC721[IOU | Full](..., MIGRATIONHASH) event
let preRegisterMigration = async function(){

  if(migrationData.migrationTypeId == IOUMigrationType){
    //signeeAddr = account
    await contracts.originBridgeContract.migrateToERC721IOU(
      migrationData.ogWorld,//address
      parseInt(migrationData.ogTokenID),//uint256
      migrationData.destNet,//bytes for the others params
      migrationData.destBridgeAddr,
      migrationData.destWorld,
      migrationData.destTokenID,
      migrationData.destOwner,
      account,
      {
        from: account
      }, async function (err, res) {
          log("Migration successfully pre-registered !");
          console.log(res);
      }
    );
  }else if(migrationData.migrationTypeId == FullMigrationType){
    await contracts.originBridgeContract.migrateToERC721Full(
      migrationData.ogWorld,//address
      parseInt(migrationData.ogTokenID),//uint256
      migrationData.destNet,//bytes for the others params
      migrationData.destBridgeAddr,
      migrationData.destWorld,
      migrationData.destTokenID,
      migrationData.destOwner,
      account,
      {
        from: account
      }, async function (err, res) {
          log("Migration successfully pre-registered !");
          console.log(res);
      }
    );
  }

}

let registerButtonClick = async function(){
  //1 - Pre register migration
  preRegisterMigration();

  //2 - Transfer origin token to escrow
  //-> emit event TokenDepositedInEscrowERC721(migrationHash, ESCROWHASH)
  //3 - Ask user to sign escrowHash
  //4 - Write migration data in destination bridge
  //Call destBridge.migrateFrom*(..., migrationHashSigned)
  //DON'T UNDERSTAND HERE migrationHashSigned (from contracts) OR proofEscrowHashSigned (from white paper)
  //5 - Ask user to sign migrationRelayedHash
  //6 - Transfer dest token to dest owner
}

let contractAddr = "0x2A7FfeA65a9Db35f600456730399A3530A0492Fe";
let contractABI = ""
let eventListeningTest = async function(){
  let contract = new web3.eth.Contract(contractABI, contractAddr);
  let options = {filter: {value: [],}, fromBlock: "latest"};
  ctr.events.Transfer(options)
          .on('data', function(event) {
            let fromAddr = event.returnValues._from;
            let toAddr = event.returnValues._to;
            let tokenId = event.returnValues._tokenId;
            console.log("HOLLY SHIT AN EVENT OCCURED !");
            console.log("ID " + tokenId + " from " + fromAddr + " to " + toAddr);
          })
          .on('error', err => console.error(err));

}
