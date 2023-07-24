const assert = require('assert');
const truffleAssert = require('truffle-assertions');
const Web3 = require('web3')
var testSetup = require("../helpers/test_setup_bridge.js");
const ImplBridgeFunMigrateToERC721 = artifacts.require("ImplBridgeFunMigrateToERC721");
const ImplERC721TokenReceiver = artifacts.require("ImplERC721TokenReceiver");
const ImplBridgeFunMigrateFromERC721 = artifacts.require("ImplBridgeFunMigrateFromERC721");

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

	it("Setup: Setting up both bridges features with relay", async () => {
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
		const bridge_1 = await ImplBridgeFunMigrateToERC721.at(this.bridge_1.address);
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
		const block = await web3.eth.getBlock(tx.receipt.blockNumber);
		this.blockTimestamp = block.timestamp;

		truffleAssert.eventEmitted(tx, 'MigrationDeparturePreRegisteredERC721IOU', (data) => {
			this.migrationHash = data?._migrationHash;
			return data?._migrationHash != undefined;
		});

	});

	it(`Should transfer token n°1 to bridge_1`, async () => {
		let bridge_1 = await ImplERC721TokenReceiver.at(this.bridge_1.address);
		const tx = await this.erc721_token.safeTransferFrom(accounts[0], this.bridge_1.address, 1, {
			from: accounts[1],
		});
		let nestedEventValues = (await truffleAssert.createTransactionResult(bridge_1, tx.tx)).logs[0].returnValues;
		const tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenOwner, this.bridge_1.address, "bridge_1 is not the token owner");
		assert.equal(nestedEventValues._escrowHash != undefined, true, 'The escrow hash has not been emitted');
	});

	it(`Shoud premint IOU n°1`, async () => {
		await this.erc721_iou.premintFor(this.bridge_2.address);
		let tokenMinted = await this.erc721_iou.mintedTokens();
		assert.equal(tokenMinted, 1, "The IOU token has not been preminted");
	});

	it(`Should mint and attribute IOU n°1 to account[2] on bridge_2`, async() => {
		const bridge_2 = await ImplBridgeFunMigrateFromERC721.at(this.bridge_2.address);

		let signedMessage = await web3.eth.sign(this.migrationHash, accounts[0]);
		signature = signedMessage.substr(0, 130) + (signedMessage.substr(130) == "00" ? "1b" : "1c");

		const data = [
            hexToBytes32("0x1"),
            hexToBytes32(this.bridge_1.address),
            hexToBytes32(this.erc721_token.address),
            numberToBytes32(1),
            hexToBytes32(accounts[0]),
            this.erc721_iou.address,
            parseInt(1),
            accounts[2],
            accounts[0],
            numberToBytes32(this.blockTimestamp),
            signature
        ]

		const tx = await bridge_2.migrateFromIOUERC721ToERC721(...data, {from: accounts[0]});	
	});


	it(`Shoud perform a migration to IOU`, async () => {
		const contracts = await testSetup.setup(accounts);
		this.bridge_1 = contracts.bridge_1;
		this.bridge_2 = contracts.bridge_2;
		this.erc721_token = contracts.erc721_token;
		this.erc721_iou = contracts.erc721_iou;

		await this.erc721_token.mint();
		let tokenMinted = await this.erc721_token.mintedTokens();
		let tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenMinted, 1, "The token has not been minted");
		assert.equal(tokenOwner, accounts[0], "The main account is not the token owner");

		await this.erc721_token.approve(accounts[1], 1);
		let approvedAddress = await this.erc721_token.getApproved(1);
		assert.equal(approvedAddress, accounts[1], "The relay is not an operator of token n°1");

		let bridge_1 = await ImplBridgeFunMigrateToERC721.at(this.bridge_1.address);
		let data = [
			this.erc721_token.address,
			1,
			hexToBytes32("0x2"),
			hexToBytes32(this.bridge_2.address),
			hexToBytes32(this.erc721_iou.address),
			numberToBytes32(1),
			hexToBytes32(accounts[2]),
			hexToBytes32(accounts[0])
		];

		let tx = await bridge_1.migrateToERC721IOU(...data);
		let block = await web3.eth.getBlock(tx.receipt.blockNumber);
		this.blockTimestamp = block.timestamp;

		truffleAssert.eventEmitted(tx, 'MigrationDeparturePreRegisteredERC721IOU', (data) => {
			this.migrationHash = data?._migrationHash;
			return data?._migrationHash != undefined;
		});

		bridge_1 = await ImplERC721TokenReceiver.at(this.bridge_1.address);
		tx = await this.erc721_token.safeTransferFrom(accounts[0], this.bridge_1.address, 1, {
			from: accounts[1],
		});
		let nestedEventValues = (await truffleAssert.createTransactionResult(bridge_1, tx.tx)).logs[0].returnValues;
		tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenOwner, this.bridge_1.address, "bridge_1 is not the token owner");
		assert.equal(nestedEventValues._escrowHash != undefined, true, 'The escrow hash has not been emitted');

		await this.erc721_iou.premintFor(this.bridge_2.address);
		tokenMinted = await this.erc721_iou.mintedTokens();
		assert.equal(tokenMinted, 1, "The IOU token has not been preminted");

		let bridge_2 = await ImplBridgeFunMigrateFromERC721.at(this.bridge_2.address);

		let signedMessage = await web3.eth.sign(this.migrationHash, accounts[0]);
		signature = signedMessage.substr(0, 130) + (signedMessage.substr(130) == "00" ? "1b" : "1c");

		data = [
            hexToBytes32("0x1"),
            hexToBytes32(this.bridge_1.address),
            hexToBytes32(this.erc721_token.address),
            numberToBytes32(1),
            hexToBytes32(accounts[0]),
            this.erc721_iou.address,
            parseInt(1),
            accounts[2],
            accounts[0],
            numberToBytes32(this.blockTimestamp),
            signature
        ]

		tx = await bridge_2.migrateFromIOUERC721ToERC721(...data, {from: accounts[0]});	

		console.log("Acccount 2", accounts[2])
		console.log("Bridge 1",this.bridge_1.address)

		tokenOwner = await this.erc721_token.ownerOf(1);
		console.log("Token owner original", tokenOwner)
		tokenOwner = await this.erc721_iou.ownerOf(1);
		console.log("Token owner IOU", tokenOwner)
	});

	it(`Shoud perform a full migration`, async () => {
		const contracts = await testSetup.setup(accounts);
		this.bridge_1 = contracts.bridge_1;
		this.bridge_2 = contracts.bridge_2;
		this.erc721_token = contracts.erc721_token;
		this.erc721_full = contracts.erc721_full;
		this.migration_controller = contracts.migration_controller;

		await this.erc721_full.addContractOperator(this.bridge_2.address, true);

		await this.erc721_token.mint();
		let tokenMinted = await this.erc721_token.mintedTokens();
		let tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenMinted, 1, "The token has not been minted");
		assert.equal(tokenOwner, accounts[0], "The main account is not the token owner");

		await this.erc721_token.approve(accounts[1], 1);
		let approvedAddress = await this.erc721_token.getApproved(1);
		assert.equal(approvedAddress, accounts[1], "The relay is not an operator of token n°1");

		let data = [
			this.erc721_token.address,
			1,
			hexToBytes32("0x2"),
			hexToBytes32(this.bridge_2.address),
			hexToBytes32(this.erc721_full.address),
			numberToBytes32(1),
			hexToBytes32(accounts[2]),
			hexToBytes32(accounts[0])
		];

		await this.migration_controller.approveFullMigration(this.erc721_token.address, hexToBytes32("0x2"), hexToBytes32(this.erc721_full.address));
		
		/** +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 */
		let bridge_1 = await ImplBridgeFunMigrateToERC721.at(this.bridge_1.address);
		await bridge_1.setFullMigrationController(this.erc721_token.address, this.migration_controller.address);

		/** +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 * +++++++++++++++++++++++++++++++++
		 */

		
		let tx = await bridge_1.migrateToERC721Full(...data);
		let block = await web3.eth.getBlock(tx.receipt.blockNumber);
		this.blockTimestamp = block.timestamp;

		truffleAssert.eventEmitted(tx, 'MigrationDeparturePreRegisteredERC721Full', (data) => {
			this.migrationHash = data?._migrationHash;
			return data?._migrationHash != undefined;
		});
		console.log("MigrationHash", this.migrationHash)

		bridge_1 = await ImplERC721TokenReceiver.at(this.bridge_1.address);
		tx = await this.erc721_token.safeTransferFrom(accounts[0], this.bridge_1.address, 1, {
			from: accounts[1],
		});
		let nestedEventValues = (await truffleAssert.createTransactionResult(bridge_1, tx.tx)).logs[0].returnValues;
		tokenOwner = await this.erc721_token.ownerOf(1);
		assert.equal(tokenOwner, this.bridge_1.address, "bridge_1 is not the token owner");
		assert.equal(nestedEventValues._escrowHash != undefined, true, 'The escrow hash has not been emitted');

		await this.erc721_full.premintFor(this.bridge_2.address);
		tokenMinted = await this.erc721_full.mintedTokens();
		assert.equal(tokenMinted, 1, "The token has not been preminted");

		let tokenUri = await this.erc721_token.tokenURI(1); 
		await this.erc721_full.setTokenUri(1, tokenUri);
		assert.equal(await this.erc721_full.tokenURI(1), tokenUri, "The token uri has not been set");

		let bridge_2 = await ImplBridgeFunMigrateFromERC721.at(this.bridge_2.address);

		let signedMessage = await web3.eth.sign(this.migrationHash, accounts[0]);
		signature = signedMessage.substr(0, 130) + (signedMessage.substr(130) == "00" ? "1b" : "1c");

		data = [
            hexToBytes32("0x1"),
            hexToBytes32(this.bridge_1.address),
            hexToBytes32(this.erc721_token.address),
            numberToBytes32(1),
            hexToBytes32(accounts[0]),
            this.erc721_full.address,
            parseInt(1),
            accounts[2],
            accounts[0],
            numberToBytes32(this.blockTimestamp),
            signature
        ]

		tx = await bridge_2.migrateFromFullERC721ToERC721(...data, {from: accounts[0]});	

		console.log("Acccount 2", accounts[2])
		console.log("Bridge 1",this.bridge_1.address)

		tokenOwner = await this.erc721_token.ownerOf(1);
		console.log("Token owner original", tokenOwner)
		tokenOwner = await this.erc721_full.ownerOf(1);
		console.log("Token owner full migration", tokenOwner)
	});
});