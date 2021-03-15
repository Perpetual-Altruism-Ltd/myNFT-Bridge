const Migrations = artifacts.require("Migrations");
const Migrations = artifacts.require("myNFTBridge.sol");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
};
