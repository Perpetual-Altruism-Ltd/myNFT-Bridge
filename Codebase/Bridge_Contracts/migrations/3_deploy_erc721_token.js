const ImplTestERC721 = artifacts.require("ImplTestERC721");

module.exports = async(deployer, network, accounts) => {
    console.log("Deploying the ERC721-TOKEN test contract");
    await deployer.deploy(ImplTestERC721);
}