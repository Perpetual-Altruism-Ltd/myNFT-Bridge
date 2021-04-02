const ImplTransparentProxy = artifacts.require("ImplTransparentProxy");
const ERC1538Delegate = artifacts.require("ERC1538Delegate");
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegate");
const ImplTestERC721 = artifacts.require("ImplTestERC721");

const ImplMyNFTBridgeFunInit = artifacts.require("ImplMyNFTBridgeFunInit");
const ImplERC721TokenReceiver = artifacts.require("ImplERC721TokenReceiver");
const ImplMyNFTBridgeFunMigrateToERC721 = artifacts.require("ImplMyNFTBridgeFunMigrateToERC721");

exports.setup = async function(accounts){

    console.log("Setting up a clean test environement");

    let bridgeBuilder = accounts[0];

    //Instancing the delegate contracts
    let logic_ERC1538Delegate = await ERC1538Delegate.new();
    let logic_ERC1538QueryDelegate = await ERC1538QueryDelegate.new();
    let logic_ImplMyNFTBridgeFunInit = await ImplMyNFTBridgeFunInit.new();
    let logic_ImplERC721TokenReceiver = await ImplERC721TokenReceiver.new();
    let logic_ImplMyNFTBridgeFunMigrateToERC721 = await ImplMyNFTBridgeFunMigrateToERC721.new();

    //Instancing the bridges
    let alpha_proxyBridge =  await ImplTransparentProxy.new(ERC1538Delegate.address);
    let alpha_instancedProxyBridge = await ERC1538Delegate.at(alpha_proxyBridge.address);

    let beta_proxyBridge =  await ImplTransparentProxy.new(ERC1538Delegate.address);
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

    //ALPHA
    await alpha_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunInit.address, 
        "init(string)", 
        "ImplMyNFTBridgeFunInit"
    );
    let alpha_instancedProxyBridgeInit = await ImplMyNFTBridgeFunInit.at(alpha_instancedProxyBridge.address);
    await alpha_instancedProxyBridgeInit.init("ALPHA");

    
    //BETA
    await beta_instancedProxyBridge.updateContract(
        logic_ImplMyNFTBridgeFunInit.address, 
        "init(string)", 
        "ImplMyNFTBridgeFunInit"
    );
    let beta_instancedProxyBridgeInit = await ImplMyNFTBridgeFunInit.at(beta_instancedProxyBridge.address);
    await beta_instancedProxyBridgeInit.init("BETA");

    //Adding their other features to the bridgs


    let alpha_Tokens = await ImplTestERC721.new();
    let beta_Tokens = await ImplTestERC721.new();
  


}

