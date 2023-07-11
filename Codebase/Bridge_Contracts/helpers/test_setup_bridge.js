const BridgeTransparentProxy = artifacts.require("BridgeTransparentProxy");
const ERC1538DelegateBridge = artifacts.require("ERC1538DelegateBridge");
const ERC1538QueryDelegateBridge = artifacts.require("ERC1538QueryDelegateBridge");
const ImplTestERC721 = artifacts.require("ImplTestERC721");
const IOUExample = artifacts.require("IOUExample");
const FullERC721 = artifacts.require("FullERC721");
const FullMigrationController = artifacts.require("FullMigrationController");

const ImplBridgeFunInit = artifacts.require("ImplBridgeFunInit");
const ImplERC721TokenReceiver = artifacts.require("ImplERC721TokenReceiver");
const ImplBridgeFunMigrateToERC721 = artifacts.require("ImplBridgeFunMigrateToERC721");
const ImplBridgeFunMigrateFromERC721 = artifacts.require("ImplBridgeFunMigrateFromERC721");

exports.setup = async function(accounts){

    console.log("Setting up a clean test environment");

    let bridgeBuilder = accounts[0];

    //Instancing the delegate contracts
    let logic_ERC1538DelegateBridge = await ERC1538DelegateBridge.new();
    let logic_ERC1538QueryDelegateBridge = await ERC1538QueryDelegateBridge.new();
    let logic_ImplBridgeFunInit = await ImplBridgeFunInit.new();
    let logic_ImplERC721TokenReceiver = await ImplERC721TokenReceiver.new();
    let logic_ImplBridgeFunMigrateToERC721 = await ImplBridgeFunMigrateToERC721.new();
    let logic_ImplBridgeFunMigrateFromERC721 = await ImplBridgeFunMigrateFromERC721.new();

    //Instancing the bridges
    let alpha_proxyBridge =  await BridgeTransparentProxy.new(logic_ERC1538DelegateBridge.address);
    let alpha_instancedProxyBridge = await ERC1538DelegateBridge.at(alpha_proxyBridge.address);

    let beta_proxyBridge =  await BridgeTransparentProxy.new(logic_ERC1538DelegateBridge.address);
    let beta_instancedProxyBridge = await ERC1538DelegateBridge.at(beta_proxyBridge.address);

    await alpha_instancedProxyBridge.updateContract(
        logic_ERC1538QueryDelegateBridge.address, 
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)functionBySignature(string)functionSignatures()totalFunctions()", 
        "ERC1538Query"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ERC1538QueryDelegateBridge.address, 
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)functionBySignature(string)functionSignatures()totalFunctions()", 
        "ERC1538Query"
    );


    // ----------- Initializing the briges ----------------

    //ALPHA (0x1)
    await alpha_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunInit.address, 
        "init(uint256)", 
        "ImplBridgeFunInit"
    );
    let alpha_instancedProxyBridgeInit = await ImplBridgeFunInit.at(alpha_instancedProxyBridge.address);
    await alpha_instancedProxyBridgeInit.init("0x1");

    
    //BETA (0x2)
    await beta_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunInit.address, 
        "init(uint256)", 
        "ImplBridgeFunInit"
    );
    let beta_instancedProxyBridgeInit = await ImplBridgeFunInit.at(beta_instancedProxyBridge.address);
    await beta_instancedProxyBridgeInit.init("0x2");

    //Adding their other features to the bridges
    //BridgeERC721Departure
    await alpha_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateToERC721.address, 
        "setFullMigrationController(address,address)migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)migrateToERC721Full(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)",
        "BridgeERC721Departure Part1"
    );

    await alpha_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateToERC721.address, 
        "setFullMigrationController(address,address)isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)generateMigrationHashERC721IOU(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)",
         "BridgeERC721Departure Part2"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateToERC721.address, 
        "setFullMigrationController(address,address)migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)migrateToERC721Full(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)",
        "BridgeERC721Departure Part1"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateToERC721.address, 
        "setFullMigrationController(address,address)isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)generateMigrationHashERC721IOU(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)",
         "BridgeERC721Departure Part2"
    );


    //ERC721TokenReceiver
    await alpha_instancedProxyBridge.updateContract(
        logic_ImplERC721TokenReceiver.address, 
        "onERC721Received(address,address,uint256,bytes)",
        "ERC721TokenReceiver"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ImplERC721TokenReceiver.address, 
        "onERC721Received(address,address,uint256,bytes)",
        "ERC721TokenReceiver"
    );

    //BridgeArrival
    await alpha_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateFromERC721.address, 
        "migrateFromIOUERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)migrateFromFullERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)registerEscrowHashSignature(bytes32,bytes)registerEscrowHashSignature(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,bytes)isMigrationRedeemable(bool)isMigrationRedeemable(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)",
        "ImplBridgeFunMigrateFromERC721 Pt1"
    );
    await beta_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateFromERC721.address, 
        "migrateFromIOUERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)migrateFromFullERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)registerEscrowHashSignature(bytes32,bytes)registerEscrowHashSignature(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,bytes)isMigrationRedeemable(bool)isMigrationRedeemable(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)",
        "ImplBridgeFunMigrateFromERC721 Pt1"
    );

    //Creating the token contracts
    let alpha_Tokens = await ImplTestERC721.new();
    let beta_Tokens = await IOUExample.new();
    let full_mig_token = await FullERC721.new();
    let migration_controller = await FullMigrationController.new();

    return ({
        bridge_1 : alpha_proxyBridge,
        bridge_2 : beta_proxyBridge,
        erc721_token : alpha_Tokens,
        erc721_iou : beta_Tokens,
        erc721_full: full_mig_token,
        migration_controller: migration_controller,
    })

}

