const assert = require('assert');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3')
var testSetup = require("../helpers/test_setup_manipulator.js");
function numberToBytes32(number) {
	return Web3.utils.padLeft(
		Web3.utils.numberToHex(
			Web3.utils.toBN(parseInt(number))), 64)
}
function hexToBytes32(string) {
	return Web3.utils.padLeft(string, 64)
}

contract("Testing Bridge features with manipulator", async accounts => {

	///////////////////////////////////////////////////
	//////////////// Setup Test //////////////////////
	/////////////////////////////////////////////////

	it("Setup: Setting up both bridges features and manipulator", async () => {
		const contracts = await testSetup.setup(accounts);
		this.bridge_1 = contracts.bridge_1;
		this.bridge_2 = contracts.bridge_2;
		this.erc721_token = contracts.erc721_token;
		this.erc721_iou = contracts.erc721_iou;
		this.manipulator_1 = contracts.manipulator_1;
		this.manipulator_2 = contracts.manipulator_2;
    });

	it(`Should mint an nft`, async () => {
		await this.erc721_token.mint();
		let tokenMinted = await this.erc721_token.mintedTokens();
		let tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenMinted, 1, "The token has not been minted");
		assert.equal(tokenOwner, accounts[0], "The main account is not the token owner");
	});

	it(`Should set the manipulator as operator of token n°1`, async () => {
		await this.erc721_token.approve(this.manipulator_1.address, 1);
		let approvedAddress = await this.erc721_token.getApproved(1);
		assert.equal(approvedAddress, this.manipulator_1.address, "The manipulator is not an operator of token n°1");
	});

	it(`Should announce an new transfer of token n°1 to bridge_1 via a call on manipulator`, async () => {
	
		const data = [
			this.erc721_token.address,
			1,
			hexToBytes32("0x2"),
			hexToBytes32(this.bridge_2.address),
			hexToBytes32(this.erc721_iou.address),
			numberToBytes32(1),
			hexToBytes32(accounts[2]),
			hexToBytes32(accounts[0]),
            this.bridge_1.address
		];
		const tx = await this.manipulator_1.migrateToERC721IOU(...data);
		const block = await web3.eth.getBlock(tx.receipt.rawLogs[0].blockNumber);
		this.blockTimestamp = block.timestamp;
		this.migrationHash = tx.receipt.rawLogs[0].topics[3];
		let event = tx.receipt.rawLogs.some(l => { return l.topics[0] == '0x' + 'fa90ed0aaa999d2cb82691a60b10f4a8f6543965f9073af93d8e0af64ed1a08d' });
																				// Keccak256(MigrationDeparturePreRegisteredERC721IOU(address,uint256,address,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32,bytes32))
		assert.ok(event, "event MigrationDeparturePreRegisteredERC721IOU not emitted");
	});

	it(`Should transfer token n°1 to bridge_1 via manipulator`, async () => {

		const tx = await this.manipulator_1.safeTransferFrom(accounts[0], this.bridge_1.address, 1, this.erc721_token.address);
		const tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenOwner, this.bridge_1.address, "bridge_1 is not the token owner");
	});

	it(`Shoud premint IOU n°1 via manipulator`, async () => {

		await this.manipulator_2.premintFor(this.bridge_2.address,this.erc721_iou.address);
		let tokenMinted = await this.erc721_iou.mintedTokens();
		assert.equal(tokenMinted, 1, "The IOU token has not been preminted");
	});

	it(`Should mint and attribute IOU n°1 to account[2] on bridge_2 via manipulator`, async() => {
       
		let signedMessage = await web3.eth.sign(this.migrationHash, accounts[0]);

		const data = '0x'
            + hexToBytes32("0x1").replace("0x", "")
            + hexToBytes32(this.bridge_1.address).replace("0x", "")
            + hexToBytes32(this.erc721_token.address).replace("0x", "")
            + numberToBytes32(1).replace("0x", "")
            + hexToBytes32(accounts[0]).replace("0x", "")
            + hexToBytes32(this.erc721_iou.address).replace("0x", "")
            + numberToBytes32(1).replace("0x", "")
            + hexToBytes32(accounts[2]).replace("0x", "")
            + hexToBytes32(accounts[0]).replace("0x", "")
            + numberToBytes32(this.blockTimestamp).replace("0x", "")
            + signedMessage.replace("0x", "")

		const tx = await this.manipulator_2.migrateFromIOUERC721ToERC721(data, this.bridge_2.address);	
	});
});