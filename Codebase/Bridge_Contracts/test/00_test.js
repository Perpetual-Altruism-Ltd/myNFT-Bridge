const truffleAssert = require('truffle-assertions');
var testSetup = require("../helpers/test_setup.js");

contract("Testing Bridges features", async accounts => {

	/////////////////////////////////////////////////
	//////////////// Setup Test //////////////////
	/////////////////////////////////////////////////

	it("Setup: Setting up both bridges features", async () => {
		await testSetup.setup(accounts);

        assert.equal(10000, 10000);
    });
});