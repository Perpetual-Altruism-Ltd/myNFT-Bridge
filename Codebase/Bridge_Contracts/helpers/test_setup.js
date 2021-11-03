const ImplTransparentProxy = artifacts.require("ImplTransparentProxy");
const ERC1538Delegate = artifacts.require("ERC1538Delegate");
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegate");
const ImplTestERC721 = artifacts.require("ImplTestERC721");

const ImplMyNFTBridgeFunInit = artifacts.require("ImplMyNFTBridgeFunInit");
const ImplERC721TokenReceiver = artifacts.require("ImplERC721TokenReceiver");
const ImplMyNFTBridgeFunMigrateToERC721 = artifacts.require("ImplMyNFTBridgeFunMigrateToERC721");

exports.setup = async function(accounts){

    console.log("Setting up a clean test environment");

    let bridgeBuilder = accounts[0];

    //Instancing the delegate contracts
    let logic_ERC1538Delegate = await ERC1538Delegate.new();
    let logic_ERC1538QueryDelegate = await ERC1538QueryDelegate.new();
    let logic_ImplMyNFTBridgeFunInit = await ImplMyNFTBridgeFunInit.new();
    let logic_ImplERC721TokenReceiver = await ImplERC721TokenReceiver.new();
    let logic_ImplMyNFTBridgeFunMigrateToERC721 = await ImplMyNFTBridgeFunMigrateToERC721.new();

    //Instancing the bridges
    let alpha_proxyBridge =  await ImplTransparentProxy.new(logic_ERC1538Delegate.address);
    let alpha_instancedProxyBridge = await ERC1538Delegate.at(alpha_proxyBridge.address);

    let beta_proxyBridge =  await ImplTransparentProxy.new(logic_ERC1538Delegate.address);
    let beta_instancedProxyBridge = await ERC1538Delegate.at(beta_proxyBridge.address);

    await alpha_instancedProxyBridge.updateContract(
        logic_ERC1538QueryDelegate.address, 
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)functionBySignature(string)functionSignatures()totalFunctions()", 
        "ERC1538Query"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ERC1538QueryDelegate.address, 
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)functionBySignature(string)functionSignatures()totalFunctions()", 
        "ERC1538Query"
    );


    // ----------- Initializing the briges ----------------

    //ALPHA (0x1)
    await alpha_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunInit.address, 
        "init(uint256)", 
        "ImplMyNFTBridgeFunInit"
    );
    let alpha_instancedProxyBridgeInit = await ImplMyNFTBridgeFunInit.at(alpha_instancedProxyBridge.address);
    await alpha_instancedProxyBridgeInit.init("0x1");

    
    //BETA (0x2)
    await beta_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunInit.address, 
        "init(uint256)", 
        "ImplMyNFTBridgeFunInit"
    );
    let beta_instancedProxyBridgeInit = await ImplMyNFTBridgeFunInit.at(beta_instancedProxyBridge.address);
    await beta_instancedProxyBridgeInit.init("0x2");

    //Adding their other features to the bridges

    //MyNFTBridgeERC721Departure
    await alpha_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunMigrateToERC721.address, 
        "migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)migrateToERC721Full(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)",
        "MyNFTBridgeERC721Departure Part1"
    );

    await alpha_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunMigrateToERC721.address, 
        "isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)generateMigrationHashERC721IOU(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)",
         "MyNFTBridgeERC721Departure Part2"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunMigrateToERC721.address, 
        "migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)migrateToERC721Full(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)",
        "MyNFTBridgeERC721Departure Part1"
    );

    await beta_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunMigrateToERC721.address, 
        "isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)generateMigrationHashERC721IOU(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)",
         "MyNFTBridgeERC721Departure Part2"
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


    //Creating the token contracts
    let alpha_Tokens = await ImplTestERC721.new();
    let beta_Tokens = await ImplTestERC721.new();

    return ({
        bridge_1 : alpha_proxyBridge,
        bridge_2 : beta_proxyBridge,
        erc721_token : alpha_Tokens,
        erc721_iou : beta_Tokens
    })

}

