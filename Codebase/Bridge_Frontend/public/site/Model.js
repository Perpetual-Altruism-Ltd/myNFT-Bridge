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
model.migrationData.migrationRelay = "";
model.migrationData.migrationType = "";
model.migrationData.destinationUniverseIndex = 0;//Index in network_list "networks" array
model.migrationData.destinationUniverseTargerListIndex = 0;//Index in network_list "neworks.targetList" array
model.migrationData.destinationUniverseUniqueId = "";
model.migrationData.destinationNetworkId = "";//Blochain ID
model.migrationData.destinationUniverse = "";
model.migrationData.destinationBridgeAddr = "";
model.migrationData.destinationWorld = "";
model.migrationData.destinationTokenId = "";
model.migrationData.destinationTokenName = "";
model.migrationData.destinationOwner = "";
model.migrationData.isRedeem = false;

model.migrationData.metadataDestinationUniverseUniqueId = "";
model.migrationData.metadataDestinationUniverseIndex = 0;
model.migrationData.metadataDestinationUniverse = "";
model.migrationData.metadataDestinationWorld = "";
model.migrationData.metadataDestinationTokenId = "";
model.migrationData.metadataDestinationBridgeAddr = "";

model.hash = {};
model.hash.migrationHash = "";
model.hash.migrationHashSigned = "";
model.hash.escrowHash = "";
model.hash.escrowHashSigned = "";

model.MintOUIMigrationType = 'Mint IOU';
model.RedeemIOUMigrationType = 'Redeem IOU';

model.listeningTimeOut = 1800; //seconds
model.listeningRefreshFrequency = 5;//seconds

model.destinationTokenTransfertTxHash = "";

model.disconnectWallet = false;
model.editMigrationForm = false;

//The names of the step under processing.
model.migStepManipulatorApprove = 'approve';
model.migStepInitMigration = 'init';
model.migStepPollMigrationHash = 'migrationHash';
model.migStepSignMigrationHash = 'signMigrationHash';
model.migStepContinueMigration = 'continue';
model.migStepPollEscrowHash = 'escrowHash';
model.migStepSignEscrowHash = 'signEscrowHash';
model.migStepCloseMigration = 'close';
model.migStepPollEndMigration = 'end';
model.migStepMigrationSuccessful = 'success';

//For instance currentMigrationStep will have 'continue value if  migrationHash has been received, and escrow hash has not been queried yet
model.currentMigrationStep = model.migStepManipulatorApprove;
model.resumeMigration = false;

export default model;
