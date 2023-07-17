var testSetup = require("../helpers/test_setup_manipulator.js");

contract("Testing Bridges features", async accounts => {

    it("Deploys", async () => {
		const contracts = await testSetup.setup(accounts);

		await contracts.erc721_token.mint();
		await contracts.erc721_token.mint();
		await contracts.erc721_token.mint();
		await contracts.erc721_token.mint();

        console.log("bridge_1", contracts.bridge_1.address);
        console.log("bridge_2", contracts.bridge_2.address);
        console.log("erc721_token", contracts.erc721_token.address);
        console.log("erc721_iou", contracts.erc721_iou.address);
        console.log("erc721_full", contracts.erc721_full.address);
        console.log("manipulator_1", contracts.manipulator_1.address);
        console.log("manipulator_2", contracts.manipulator_2.address);
        console.log("migration_controller", contracts.migration_controller.address);
    })

});