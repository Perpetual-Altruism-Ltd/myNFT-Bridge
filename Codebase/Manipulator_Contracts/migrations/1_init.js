const ERC1538Delegate = artifacts.require("ERC1538Delegate")
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegate")
const TransparentProxy = artifacts.require("TransparentProxy")
const Manipulator = artifacts.require("Manipulator")
const IOU = artifacts.require("IOU")

/*module.exports = async (deployer, network, accounts) => {
    //await deployer.deploy(Manipulator)

    const instancedProxy = await ERC1538Delegate.at("0xe4577D73Fa5eA7414c966e756D73300A6B821150")

    await instancedProxy.updateContract(
        "0x04a5B52f420D81Eb1f1da094ee5D6af238E2eA4b",
        "cancelMigration(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,address,bytes32,address)",
        "ManipulatorAddFunc"
    )
}*/


module.exports = async (deployer, network, accounts) => {
    //Deploying the logic code of the proxyfication
    console.log("Deploying the proxy contract logic...")
    await deployer.deploy(ERC1538Delegate)

    //Deploying the proxy contract itself
    console.log("Deploying the proxy contract...");
    await deployer.deploy(TransparentProxy, ERC1538Delegate.address)
    await TransparentProxy.deployed()
    const instancedProxy = await ERC1538Delegate.at(TransparentProxy.address)

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
    const instancedManipulator = await Manipulator.at(TransparentProxy.address)
    //Setting owner as transparent proxy
    console.log("Setting owner as current account...")
    await instancedManipulator.init(accounts[0])
    //Approving accounts
    await instancedManipulator.approve("0x02f69FaEb7976FB4Ce32cDF4916f9DB01f559595", true)
    await instancedManipulator.approve("0x4795257d72F0055940842900fF11A956189eeba1", true)
    await instancedManipulator.approve("0x402a85Ddd124cc397df8E8F1ca71AAfc24Fca545", true)
    await instancedManipulator.approve("0xc61e49d72C0189fcA2DD2da2237D7bf2aa18C914", true)

    //Deploying IOU contract
    console.log("Deploying IOU contract...")
    await deployer.deploy(IOU, TransparentProxy.address)
    
    //console.log("Calling mintedTokens...")
    //console.log(await instancedManipulator.mintedTokens(IOU.address))
    //console.log("Calling mint...")
    //console.log(await instancedManipulator.mint(IOU.address))
}


/*
const ERC1538Delegate = artifacts.require("ERC1538Delegate")
const ERC1538QueryDelegate = artifacts.require("ERC1538QueryDelegate")
const TransparentProxy = artifacts.require("TransparentProxy")
const Manipulator = artifacts.require("Manipulator")
const IOU = artifacts.require("IOU")

module.exports = async (deployer, network, accounts) => {


    await deployer.deploy(Manipulator)

    const instancedManipulator = await Manipulator.at(Manipulator.address)

    await instancedManipulator.init(accounts[0])

    console.log(await instancedManipulator.test.call(
        Buffer.from("1111111111111111111111111111111122222222222222222222222222222222333333333333333333333333333333334444444444444444444444444444444455555555555555555555555555555555", "ascii")
        , Manipulator.address
        )
    )












    return*/
    /*
    const IOUAddress = "0x7ACacA68e251BdB45F1E9c220953551457a88c7E"
    const TransparentProxyAddress = "0x78c8583d59ec4202F5F6D7B45644c872e7a44a53"


    //await deployer.deploy(Manipulator)


    //const instancedProxy = await ERC1538Delegate.at(TransparentProxyAddress)
    //await instancedProxy.updateContract(
    //    Manipulator.address,
    //    "init(address)approve(address,bool)mint(address)setTokenUri(uint256,string,address)tokenURI(uint256,address)premintFor(address,address)mintedTokens(address)safeTransferFrom(address,address,uint256,address)",
    //    "Manipulator"
    //)

    const instancedManipulator = await Manipulator.at(TransparentProxyAddress)

    console.log("1. Minted tokens : " + (await instancedManipulator.mintedTokens.call(IOUAddress)).toNumber())

    console.log("2. Mint : " + JSON.stringify((await instancedManipulator.mint(IOUAddress))))

    console.log("3. Minted tokens : " + (await instancedManipulator.mintedTokens.call(IOUAddress)).toNumber())

    console.log("4. PremintFor : " + JSON.stringify((await instancedManipulator.premintFor(TransparentProxyAddress, IOUAddress))))

    const tokenId = (await instancedManipulator.mintedTokens.call(IOUAddress)).toNumber()
    console.log("5. Minted tokens : " + tokenId)
    
    console.log("6. SetTokenUri : " + JSON.stringify((await instancedManipulator.setTokenUri(tokenId, "http://perdu.com", IOUAddress))))

    console.log("7. SafeTransferFrom : " + JSON.stringify((await instancedManipulator.safeTransferFrom("0x0000000000000000000000000000000000000000", accounts[0], tokenId, IOUAddress))))
    
    console.log("8. TokenUri : " + (await instancedManipulator.tokenURI.call(tokenId, IOUAddress)))



    //const instancedIOU = await IOU.at(IOUAddress)
    //const instancedManipulator = await Manipulator.at(ManipulatorAddress)
    //console.log("1. IOUOwner : " + (await instancedIOU.owner.call()))
    //console.log("2. Mint : " + JSON.stringify((await instancedManipulator.mint(IOUAddress))))
    //console.log("3. Minted tokens : " + (await instancedIOU.mintedTokens.call()).toNumber())
    //console.log("4. Minted tokens : " + (await instancedManipulator.mintedTokens.call(IOUAddress)).toNumber())
    //console.log("5. TokenUri : " + (await instancedManipulator.tokenURI.call(0, IOUAddress)))



    //console.log(await instancedManipulator.owner())

    //await instancedManipulator.init(accounts[0])

    //await instancedManipulator.approve(accounts[0], true)

    //console.log("1. " + (await instancedManipulator.mintedTokens.call("0xd21ce98550B5813DDA97C7fd10680357b4F42213")).toNumber())

    //console.log("2. "+ (await instancedManipulator.mint("0xd21ce98550B5813DDA97C7fd10680357b4F42213")))

    //const instancedIOU = await IOU.at("0x22Eb1EFc462B6b860ba32B53D547993e6677C877")

    //console.log("2. " + (await instancedIOU.mint()))

    //console.log("3. " + (await instancedManipulator.mintedTokens.call("0xd21ce98550B5813DDA97C7fd10680357b4F42213")).toNumber())

    //console.log("4. " + (await instancedIOU.mint.call()).toNumber())

    //console.log("4. "+ (await instancedManipulator.mint("0xd21ce98550B5813DDA97C7fd10680357b4F42213")))

    //console.log("5. " + (await instancedManipulator.mintedTokens.call("0xd21ce98550B5813DDA97C7fd10680357b4F42213")).toNumber())*/
//}