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
model.migrationData.originUniverseUniqueId = "";
model.migrationData.originNetworkId = "";//Blochain ID
model.migrationData.originUniverse = "";
model.migrationData.originWorld = "";
model.migrationData.originTokenId = "";
model.migrationData.originOwner = "";
model.migrationData.originTokenName = "";
model.migrationData.migrationRelayIndex = 0;
model.migrationData.migrationRelay = 0;
model.migrationData.migrationType = "";
model.migrationData.destinationUniverseIndex = 0;
model.migrationData.destinationUniverseUniqueId = "";
model.migrationData.destinationUniverse = "";
model.migrationData.destinationBridgeAddr = "";
model.migrationData.destinationWorld = "";
model.migrationData.destinationTokenId = "";
model.migrationData.destinationOwner = "";

model.migrationData.metadataDestinationUniverseUniqueId = "";
model.migrationData.metadataDestinationUniverseIndex = 0;
model.migrationData.metadataDestinationUniverse = "";
model.migrationData.metadataDestinationWorld = "";
model.migrationData.metadataDestinationTokenId = "";
model.migrationData.metadataDestinationBridgeAddr = "";

model.MintOUIMigrationType = 'Mint IOU';
model.RedeemIOUMigrationType = 'Redeem IOU';

model.listeningTimeOut = 180; //seconds
model.listeningRefreshFrequency = 5;//seconds

model.migrationHash = "";
model.escrowHash = "";

model.destinationTokenTransfertTxHash = "";

model.isRedeem = false;

export default model;
