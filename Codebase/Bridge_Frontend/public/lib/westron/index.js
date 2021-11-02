let connector = null;
let connectedButton = null;
let providerConnected = "";
// Button declarations
//COMMENTED BY NICO. LET COMMENTED UNLESS IT HAS ANY UTILITY...
/*window.onload = function() {
    if(!window.location.hash){
        window.location = window.location + '#loaded';
		  window.location.href = window.location.href
    }
}*/

const connectMetaMaskButton = document.querySelector(".connectMetaMask");
const connectTorusButton = document.querySelector(".connectTorus");
const connectWalletConnectButton = document.querySelector(".connectWalletConnect");

const connectPortisButton = document.querySelector(".connectPortis");
const connectBitskiButton = document.querySelector(".connectBitski");
const connectFortmaticButton = document.querySelector(".connectFortmatic");
const connectVenlyButton = document.querySelector(".connectVenly");
const connectCoinbaseButton = document.querySelector(".connectCoinbase");

//let connectionCallback = function(){console.log("No callback defined yet");};


// Button click listener
connectMetaMaskButton.addEventListener("click", async () => {
	if (connector == null || !connector.isConnected) {
		connector = await ConnectorManager.instantiate(ConnectorManager.providers.METAMASK);
		connectedButton = connectMetaMaskButton;
		providerConnected = "MetaMask";
		connection();
	} else {
		connector.disconnection();
	}
});

connectTorusButton.addEventListener("click", async () => {
	if (connector == null || !connector.isConnected) {
		connector = await ConnectorManager.instantiate(ConnectorManager.providers.TORUS);
		connectedButton = connectTorusButton;
		providerConnected = "Torus";
		connection();
	} else {
		connector.disconnection();
	}
});

connectWalletConnectButton.addEventListener("click", async () => {
	if (connector == null || !connector.isConnected) {
		connector = await ConnectorManager.instantiate(ConnectorManager.providers.WALLETCONNECT);
		connectedButton = connectWalletConnectButton;

		providerConnected = "WalletConnect";
		connection();
	} else {
		connector.disconnection();
	}
});

connectPortisButton.addEventListener("click", async () => {
	if (connector == null || !connector.isConnected) {
		connector = await ConnectorManager.instantiate(ConnectorManager.providers.PORTIS);
		connectedButton = connectPortisButton;
		providerConnected = "Portis";
		connection();
	} else {
		connector.disconnection();
	}
});

connectBitskiButton.addEventListener("click", async () => {
	if (connector == null || !connector.isConnected) {
		connector = await ConnectorManager.instantiate(ConnectorManager.providers.BITSKI);
		connectedButton = connectBitskiButton;
		providerConnected = "Bitski";
		connection();
	} else {
		connector.disconnection();
	}
});

connectFortmaticButton.addEventListener("click", async () => {
	if (connector == null || !connector.isConnected) {
		connector = await ConnectorManager.instantiate(ConnectorManager.providers.FORTMATIC);
		connectedButton = connectFortmaticButton;
		providerConnected = "Fortmatic";
		connection();
	} else {
		connector.disconnection();
	}
});

connectVenlyButton.addEventListener("click", async() =>  {
	if(connector == null || !connector.isConnected) {
		connector  = await ConnectorManager.instantiate(ConnectorManager.providers.VENLY);
		connectedButton = connectVenlyButton;
		providerConnected = "Venly";
		connection();
	} else {
		connector.disconnection();
	}
});

connectCoinbaseButton.addEventListener("click", async () => {
	if (connector == null || !connector.isConnected) {
		connector = await ConnectorManager.instantiate(ConnectorManager.providers.COINBASE);
		connectedButton = connectCoinbaseButton;
		providerConnected = "Coinbase";
		connection();
	} else {
		connector.disconnection();
	}
});

/** Disable or enable all connection buttons
 *	@param the value to set (true = disable)
 */
function setDisabledConnectButtons(value) {
	connectMetaMaskButton.disabled = value;
	connectTorusButton.disabled = value;
	connectWalletConnectButton.disabled = value;
	connectPortisButton.disabled = value;
	connectBitskiButton.disabled = value;
	connectFortmaticButton.disabled = value;
	connectVenlyButton.disabled = value;
	connectCoinbaseButton.disabled = value;
}

/** Initialize the connector with events onConnection and onDisconnection */
function initConnector() {
	connector.onConnection = async () => {
		connectedButton.disabled = false;

		const accounts = await connector.web3.eth.getAccounts();
		//document.querySelector(".address").innerHTML = accounts[0];
	};

	connector.onDisconnection = () => {
		setDisabledConnectButtons(false);
		//document.querySelector(".address").innerHTML = "";
		connectedButton.innerHTML = "Connect " + providerConnected;
		connectedButton = null;
		providerConnected = "";
	};

	connector.onAccountChanged = (account) => {
		//document.querySelector(".address").innerHTML = account;
	};
}

/** Local function called when a connection/disconnection is engaged to update the frontend */
async function connection(callback) {
	initConnector();
	setDisabledConnectButtons(true);

	if (await connector.connection()) {
		connectedButton.innerHTML = "Disconnect " + providerConnected;
		web3 = connector.web3;

    if(callback){callback();}
	} else {
		setDisabledConnectButtons(false);
		console.log("Connection failed");
	}
}
