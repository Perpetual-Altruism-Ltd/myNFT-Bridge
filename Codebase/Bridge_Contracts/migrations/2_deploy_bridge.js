const ImplTransparentProxy = artifacts.require("BridgeTransparentProxy");
const ERC1538Delegate = artifacts.require("ERC1538DelegateBridge");
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegateBridge");

const ImplBridgeFunInit = artifacts.require("ImplBridgeFunInit");
const ImplERC721TokenReceiver = artifacts.require("ImplERC721TokenReceiver");
const ImplBridgeFunMigrateToERC721 = artifacts.require("ImplBridgeFunMigrateToERC721");
const ImplBridgeFunMigrateFromERC721 = artifacts.require("ImplBridgeFunMigrateFromERC721");
const FullMigrationController = artifacts.require("FullMigrationController");

module.exports = async(deployer, network, accounts) => {

    //Deploying the lofic code of the proxyfication
    console.log("Deploying the proxy contract logic...");
    await deployer.deploy(ERC1538Delegate);


    //Deploying the proxy contract itself
    console.log("Deploying the proxy contract...");
    await deployer.deploy(ImplTransparentProxy, ERC1538Delegate.address);
    await ImplTransparentProxy.deployed();
    let instancedProxy = await ERC1538Delegate.at(ImplTransparentProxy.address);


    //Registering the extra proxy functions
    console.log("Deploying and binding logic code...");
    await deployer.deploy(ERC1538QueryDelegate);

    //Putting the logic code address in the version control
    await instancedProxy.updateContract(
        ERC1538QueryDelegate.address,
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)functionBySignature(string)functionSignatures()totalFunctions()",
        "ERC1538Query"
    );

    // Deploying, linking and calling the init of the bridge
    // Done before other functions are added to prevent misuse
    console.log("Deploying, linking and calling the init of the bridge...");
    await deployer.deploy(ImplBridgeFunInit);
    await instancedProxy.updateContract(
        ImplBridgeFunInit.address,
        "init(uint256)",
        "ImplBridgeFunInit"
    );
    let instancedInit = await ImplBridgeFunInit.at(ImplTransparentProxy.address);
    await instancedInit.init("0x8b3528a8"); //  GANACHE Replace localhost with whatever you are deploying on
    // await instancedInit.init("0x07dac20e"); //  RINKEBY
    // await instancedInit.init("0xee0bec75"); // KOVAN
    // await instancedInit.init("0xe35d7d6b"); // POLKADOT TESTNET MOONBASE ALPHA
    // await instancedInit.init("0x6d2f0e37") // Ethereum Mainnet
    // await instancedInit.init("0x06551a5b") // Polkadot Moonriver
    // await instancedInit.init("0x51147ce2") // Polkadot Moonbeam
    // await instancedInit.init("0xb4aa1df4") // Binance Smart Chain Mainnet
    // await instancedInit.init("0xda3d6b12") // Polygon Mainnet

    //Adding ImplERC721TokenReceiver features
    console.log("Adding ERC721TokenReceiver features...");
    await deployer.deploy(ImplERC721TokenReceiver);
    await instancedProxy.updateContract(
        ImplERC721TokenReceiver.address,
        "onERC721Received(address,address,uint256)onERC721Received(address,address,uint256,bytes)",
        "ImplERC721TokenReceiver"
    );

    //Adding ImplBridgeFunMigrateToERC721 features
    console.log("Adding BridgeERC721Departure features...");
    await deployer.deploy(ImplBridgeFunMigrateToERC721);
    await instancedProxy.updateContract(
        ImplBridgeFunMigrateToERC721.address,
        "migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)",
        "ImplBridgeFunMigrateToERC721 Pt1"
    );

    await instancedProxy.updateContract(
        ImplBridgeFunMigrateToERC721.address,
        "setFullMigrationController(address,address)migrateToERC721Full(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721IOU(bytes32,address,address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)",
        "ImplBridgeFunMigrateToERC721 Pt2"
    );

    console.log("Adding BridgeArrival features...");
    await deployer.deploy(ImplBridgeFunMigrateFromERC721);
    await instancedProxy.updateContract(
        ImplBridgeFunMigrateFromERC721.address,
        "migrateFromIOUERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)migrateFromFullERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)registerEscrowHashSignature(bytes32,bytes)registerEscrowHashSignature(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,bytes)isMigrationRedeemable(bool)isMigrationRedeemable(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)",
        "ImplBridgeFunMigrateFromERC721 Pt1"
    );

    console.log("Deploying full migration controller")
    await deployer.deploy(FullMigrationController);
    

}
