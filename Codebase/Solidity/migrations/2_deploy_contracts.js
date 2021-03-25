const ImplTransparentProxy = artifacts.require("ImplTransparentProxy");
const ERC1538Delegate = artifacts.require("ERC1538Delegate");
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegate");
const ImplTestERC721 = artifacts.require("ImplTestERC721");
const ImplMyNFTBridgeFunInit = artifacts.require("ImplMyNFTBridgeFunInit");




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
        "init(string)", 
        "ImplMyNFTBridgeFunInit"
    );
    let instancedInit = await ImplMyNFTBridgeFunInit.at(ImplTransparentProxy.address);
    await instancedInit.init("LOCALHOST"); //Replace localhost with whatever you are deploying on

    console.log("Deploying the ERC721 test contract");
    await deployer.deploy(ImplTestERC721);

}