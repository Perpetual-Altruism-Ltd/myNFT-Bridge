const { throws } = require('assert');
const assert = require('assert');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3')
var testSetup = require("../helpers/test_setup.js");
const ImplMyNFTBridgeFunMigrateToERC721 = artifacts.require("ImplMyNFTBridgeFunMigrateToERC721");

function numberToBytes32(number) {
	return Web3.utils.padLeft(
		Web3.utils.numberToHex(
			Web3.utils.toBN(parseInt(number))), 64)
}
function hexToBytes32(string) {
	return Web3.utils.padLeft(string, 64)
}

contract("Testing Bridges features", async accounts => {

	///////////////////////////////////////////////////
	//////////////// Setup Test //////////////////////
	/////////////////////////////////////////////////

	it("Setup: Setting up both bridges features", async () => {
		const contracts = await testSetup.setup(accounts);
		this.bridge_1 = contracts.bridge_1;
		this.bridge_2 = contracts.bridge_2;
		this.erc721_token = contracts.erc721_token;
		this.erc721_iou = contracts.erc721_iou;
    });

	it(`Shoud mint an nft`, async () => {
		await this.erc721_token.mint();
		let tokenMinted = await this.erc721_token.mintedTokens();
		let tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenMinted, 1, "The token has not been minted");
		assert.equal(tokenOwner, accounts[0], "The main account is not the token owner");
	});

	it(`Should set the relay (${accounts[1]}) as operator of token n°1`, async () => {
		await this.erc721_token.approve(accounts[1], 1);
		let approvedAddress = await this.erc721_token.getApproved(1);
		assert.equal(approvedAddress, accounts[1], "The relay is not an operator of token n°1");
	});

	it(`Should announce an new tranfer of token n°1 to bridge_1`, async () => {
		let bridge_1 = await ImplMyNFTBridgeFunMigrateToERC721.at(this.bridge_1.address);
		// this.bridge_2 = await ERC1538Delegate.at(contracts.bridge_2);

		const data = [
			this.erc721_token.address,
			1,
			hexToBytes32("0x2"),
			hexToBytes32(this.bridge_2.address),
			hexToBytes32(this.erc721_iou.address),
			numberToBytes32(1),
			hexToBytes32(accounts[2]),
			hexToBytes32(accounts[0])
		];
		
		const tx = await bridge_1.migrateToERC721IOU(...data);		
		truffleAssert.eventEmitted(tx, 'MigrationDeparturePreRegisteredERC721IOU', (data) => {
			this.migrationHash = data?._migrationHash;
			return data?._migrationHash != undefined;
		});
	});

	it(`Should transfer token n°1 to bridge_1`, async () => {
		await this.erc721_token.safeTransferFrom(accounts[0], this.bridge_1.address, 1, {
			from: accounts[1],
		});
		let tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenOwner, this.bridge_1.address, "bridge_1 is not the token owner");
	});

});