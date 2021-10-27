//================MODEL==================
//Blank structure of the model
// Creating the model to store the state of the app and functions common to different views
let model = {};
//Load networks from server's network_list.json file
model.bridgeApp = {};
model.bridgeApp.networks = [];
model.bridgeApp.relays = [];
model.bridgeApp.destWorlds = [];

model.ABIS = {};
model.contracts = {};
model.web3 = {};
model.ogTokenMetaData = {};
model.migrationData = {};
model.migrationData.originUniverseIndex = 0;
model.migrationData.originUniverse = "";
model.migrationData.originWorld = "";
model.migrationData.originTokenId = "";
model.migrationData.originOwner = "";
model.migrationData.originTokenName = "";
model.migrationData.migrationRelayIndex = 0;
model.migrationData.migrationRelay = 0;
model.migrationData.migrationType = "";
model.migrationData.destinationUniverseIndex = 0;
model.migrationData.destinationUniverse = "";
model.migrationData.destinationBridgeAddr = "";
model.migrationData.destinationWorld = "";
model.migrationData.destinationTokenId = "";
model.migrationData.destinationOwner = "";

model.MintOUIMigrationType = 'Mint IOU';
model.RedeemIOUMigrationType = 'Redeem IOU';

model.listeningTimeOut = 180; //seconds
model.listeningRefreshFrequency = 15;//seconds

model.migrationHash = "";
model.escrowHash = "";

model.destinationTokenTransfertTxHash = "";

export default model;
