const ImplTransparentProxy = artifacts.require("ImplTransparentProxy");
const ERC1538Delegate = artifacts.require("ERC1538Delegate");
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegate");
const ImplTestERC721 = artifacts.require("ImplTestERC721");


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

    console.log("Deploying the ERC721 test contract");
    await deployer.deploy(ImplTestERC721);

}