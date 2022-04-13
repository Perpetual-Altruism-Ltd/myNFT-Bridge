const BridgeTransparentProxy = artifacts.require("BridgeTransparentProxy");
const ERC1538DelegateBridge = artifacts.require("ERC1538DelegateBridge");
const ERC1538QueryDelegateBridge = artifacts.require("ERC1538QueryDelegateBridge");
const ImplTestERC721 = artifacts.require("ImplTestERC721");
const IOU = artifacts.require("IOU");

const ImplBridgeFunInit = artifacts.require("ImplBridgeFunInit");
const ImplERC721TokenReceiver = artifacts.require("ImplERC721TokenReceiver");
const ImplBridgeFunMigrateToERC721 = artifacts.require("ImplBridgeFunMigrateToERC721");
const ImplBridgeFunMigrateFromERC721 = artifacts.require("ImplBridgeFunMigrateFromERC721");

const ManipulatorTransparentProxy = artifacts.require("ManipulatorTransparentProxy");
const ERC1538DelegateManipulator = artifacts.require("ERC1538DelegateManipulator");
const ERC1538QueryDelegateManipulator = artifacts.require("ERC1538QueryDelegateManipulator");
const Manipulator = artifacts.require("Manipulator");

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

    let logic_ERC1538DelegateManipulator_alpha = await ERC1538DelegateManipulator.new();
    let logic_ERC1538DelegateManipulator_beta = await ERC1538DelegateManipulator.new();
    let logic_ERC1538QueryDelegateManipulator_alpha = await ERC1538QueryDelegateManipulator.new();
    let logic_ERC1538QueryDelegateManipulator_beta = await ERC1538QueryDelegateManipulator.new();

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
        "migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)migrateToERC721Full(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)",
        "BridgeERC721Departure Part1"
    );

    await alpha_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateToERC721.address, 
        "isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)generateMigrationHashERC721IOU(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)",
         "BridgeERC721Departure Part2"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateToERC721.address, 
        "migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)migrateToERC721Full(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)",
        "BridgeERC721Departure Part1"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ImplBridgeFunMigrateToERC721.address, 
        "isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)generateMigrationHashERC721IOU(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)",
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

    //---------------- Creating the manipulators ------------------------

    //Instancing the first manipulator
    let alpha_proxyManipulator = await ManipulatorTransparentProxy.new(logic_ERC1538DelegateManipulator_alpha.address)
    let alpha_instancedProxy = await ERC1538DelegateManipulator.at(alpha_proxyManipulator.address)
    await alpha_instancedProxy.updateContract(
        logic_ERC1538QueryDelegateManipulator_alpha.address,
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)"+
        "delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)"+
        "functionBySignature(string)functionSignatures()totalFunctions()",
        "ERC1538Query"
    )
    //Deploying the manipulator
    let alpha_manipulator = await Manipulator.new()

    await alpha_instancedProxy.updateContract(
        alpha_manipulator.address,
        "init(address)approve(address,bool)mintedTokens(address)mint(address)"+
        "setTokenUri(uint256,string,address)tokenURI(uint256,address)"+
        "premintFor(address,address)safeTransferFrom(address,address,uint256,address)"+
        "getProofOfEscrowHash(bytes32,address)migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,address)"+
        "registerEscrowHashSignature(bytes32,bytes,address)"+
        "migrateFromIOUERC721ToERC721(bytes,address)cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,address)",
        "Manipulator"
    )
    
    //Instanciating the manipulator through the proxy
    const alpha_instancedManipulator = await Manipulator.at(alpha_proxyManipulator.address)
    //Setting owner as transparent proxy
    await alpha_instancedManipulator.init(accounts[0])
    //Approving accounts
    await alpha_instancedManipulator.approve(accounts[1], true)
    await alpha_instancedManipulator.approve(accounts[2], true)
    await alpha_instancedManipulator.approve(accounts[3], true)

    // ---------------------------------------------------------------------------------------
    //Instancing the second manipulator
    let beta_proxyManipulator = await ManipulatorTransparentProxy.new(logic_ERC1538DelegateManipulator_beta.address)
    let beta_instancedProxy = await ERC1538DelegateManipulator.at(beta_proxyManipulator.address)
    await beta_instancedProxy.updateContract(
        logic_ERC1538QueryDelegateManipulator_beta.address,
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)"+
        "delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)"+
        "functionBySignature(string)functionSignatures()totalFunctions()",
        "ERC1538Query"
    )
    //Deploying the manipulator
    let beta_manipulator = await Manipulator.new()

    await beta_instancedProxy.updateContract(
        beta_manipulator.address,
        "init(address)approve(address,bool)mintedTokens(address)mint(address)"+
        "setTokenUri(uint256,string,address)tokenURI(uint256,address)"+
        "premintFor(address,address)safeTransferFrom(address,address,uint256,address)"+
        "getProofOfEscrowHash(bytes32,address)migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,address)"+
        "registerEscrowHashSignature(bytes32,bytes,address)"+
        "migrateFromIOUERC721ToERC721(bytes,address)cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,address)",
        "Manipulator"
    )
    
    //Instanciating the manipulator through the proxy
    const beta_instancedManipulator = await Manipulator.at(beta_proxyManipulator.address)
    //Setting owner as transparent proxy
    await beta_instancedManipulator.init(accounts[0])
    //Approving accounts
    await beta_instancedManipulator.approve(accounts[1], true)
    await beta_instancedManipulator.approve(accounts[2], true)
    await beta_instancedManipulator.approve(accounts[3], true)
    
    //Creating the token contracts
    let alpha_Tokens = await ImplTestERC721.new();
    let beta_Tokens = await IOU.new(beta_instancedManipulator.address);

    return ({
        bridge_1 : alpha_proxyBridge,
        bridge_2 : beta_proxyBridge,
        erc721_token : alpha_Tokens,
        erc721_iou : beta_Tokens,
        manipulator_1: alpha_instancedManipulator,
        manipulator_2: beta_instancedManipulator
    })

}