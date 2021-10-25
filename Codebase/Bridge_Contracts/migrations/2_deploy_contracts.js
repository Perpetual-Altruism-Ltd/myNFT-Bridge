const ImplTransparentProxy = artifacts.require("ImplTransparentProxy");
const ERC1538Delegate = artifacts.require("ERC1538Delegate");
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegate");
const ImplTestERC721 = artifacts.require("ImplTestERC721");

const ImplMyNFTBridgeFunInit = artifacts.require("ImplMyNFTBridgeFunInit");
const ImplERC721TokenReceiver = artifacts.require("ImplERC721TokenReceiver");
const ImplMyNFTBridgeFunMigrateToERC721 = artifacts.require("ImplMyNFTBridgeFunMigrateToERC721");
const ImplMyNFTBridgeFunMigrateFromERC721 = artifacts.require("ImplMyNFTBridgeFunMigrateFromERC721");

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
    await deployer.deploy(ImplMyNFTBridgeFunInit);
    await instancedProxy.updateContract(
        ImplMyNFTBridgeFunInit.address, 
        "init(uint256)", 
        "ImplMyNFTBridgeFunInit"
    );
    let instancedInit = await ImplMyNFTBridgeFunInit.at(ImplTransparentProxy.address);
    await instancedInit.init("LOCALHOST"); //Replace localhost with whatever you are deploying on

    //Adding ImplERC721TokenReceiver features
    console.log("Adding ERC721TokenReceiver features...");
    await deployer.deploy(ImplERC721TokenReceiver);
    await instancedProxy.updateContract(
        ImplERC721TokenReceiver.address, 
        "onERC721Received(address,address,uint256)onERC721Received(address,address,uint256,bytes)", 
        "ImplERC721TokenReceiver"
    );

    //Adding ImplMyNFTBridgeFunMigrateToERC721 features
    console.log("Adding MyNFTBridgeERC721Departure features...");
    await deployer.deploy(ImplMyNFTBridgeFunMigrateToERC721);
    await instancedProxy.updateContract(
        ImplMyNFTBridgeFunMigrateToERC721.address, 
        "isMigrationPreRegisteredERC721(bytes32)getProofOfEscrowHash(bytes32)acceptedMigrationDestinationERC721IOU(address,uint256,bytes32,bytes32,bytes32)acceptedMigrationDestinationERC721Full(address,uint256,bytes32,bytes32,bytes32)", 
        "ImplMyNFTBridgeFunMigrateToERC721 Pt1"
    );

    await instancedProxy.updateContract(
        ImplMyNFTBridgeFunMigrateToERC721.address,
        "generateMigrationHashERC721IOU(bytes32,address,address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)generateMigrationHashERC721Full(bytes32,address,address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32)", 
        "ImplMyNFTBridgeFunMigrateToERC721 Pt2"
    );

    console.log("Adding MyNFTBridgeArrival features...");
    await deployer.deploy(ImplMyNFTBridgeFunMigrateFromERC721);
    await instancedProxy.updateContract(
        ImplMyNFTBridgeFunMigrateFromERC721.address, 
        "migrateFromIOUERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)migrateFromFullERC721ToERC721(bytes32,bytes32,bytes32,bytes32,bytes32,address,uint256,address,address,bytes32,bytes)cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)	registerEscrowHashSignature(bytes32,bytes)registerEscrowHashSignature(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,bytes)isMigrationRedeemable(bool)isMigrationRedeemable(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32)",
        "ImplMyNFTBridgeFunMigrateFromERC721 Pt1"
    );

    console.log("Deploying the ERC721 test contract");
    await deployer.deploy(ImplTestERC721);

}