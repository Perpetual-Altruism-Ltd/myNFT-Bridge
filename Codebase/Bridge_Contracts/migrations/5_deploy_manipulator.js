const ERC1538Delegate = artifacts.require("ERC1538DelegateManipulator")
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegateManipulator")
const ImplTransparentProxy = artifacts.require("ManipulatorTransparentProxy")
const Manipulator = artifacts.require("Manipulator")

module.exports = async (deployer, network, accounts) => {
    //Deploying the logic code of the proxyfication
    console.log("Deploying the proxy contract logic...")
    await deployer.deploy(ERC1538Delegate)

    //Deploying the proxy contract itself
    console.log("Deploying the proxy contract...");
    await deployer.deploy(ImplTransparentProxy, ERC1538Delegate.address)
    await ImplTransparentProxy.deployed()
    const instancedProxy = await ERC1538Delegate.at(ImplTransparentProxy.address)

    //Registering the extra proxy functions
    console.log("Deploying and binding logic code...")
    await deployer.deploy(ERC1538QueryDelegate)

    //Putting the logic code address in the version control
    console.log("Putting the logic code address in the version control...")
    await instancedProxy.updateContract(
        ERC1538QueryDelegate.address,
        "functionByIndex(uint256)functionExists(string)delegateAddress(string)"+
        "delegateAddresses()delegateFunctionSignatures(address)functionById(bytes4)"+
        "functionBySignature(string)functionSignatures()totalFunctions()",
        "ERC1538Query"
    )

    //Deploying the manipulator
    console.log("Deploying the manipulator...")
    await deployer.deploy(Manipulator)
    
    //Binding the manipulator to the proxy
    console.log("Binding the manipulator to the proxy...")
    await instancedProxy.updateContract(
        Manipulator.address,
        "init(address)approve(address,bool)mintedTokens(address)mint(address)"+
        "setTokenUri(uint256,string,address)tokenURI(uint256,address)"+
        "premintFor(address,address)safeTransferFrom(address,address,uint256,address)"+
        "getProofOfEscrowHash(bytes32,address)migrateToERC721IOU(address,uint256,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,address)"+
        "registerEscrowHashSignature(bytes32,bytes,address)"+
        "migrateFromIOUERC721ToERC721(bytes,address)cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,address)",
        "Manipulator"
    )
    
    //Instanciating the manipulator through the proxy
    console.log("Instanciating the manipulator through the proxy...")
    const instancedManipulator = await Manipulator.at(ImplTransparentProxy.address)
    //Setting owner as transparent proxy
    console.log("Setting owner as current account...")
    await instancedManipulator.init(accounts[0])
    //Approving accounts
    await instancedManipulator.approve("0x3809C624f6640BCbd0A22bb27beCD92D80E656CC", true)
    await instancedManipulator.approve("0x1F1ee303a3Ac8F75F5B85ee94545d6D6c88e5c3e", true)
    await instancedManipulator.approve("0xBF1FD5Fe98feECcaE704ccdd803d05BCc0a68d92", true)
    await instancedManipulator.approve("0xCAb3FC510Fb41b7F72A89Be5A9718780D2E6f0Dc", true)
}
