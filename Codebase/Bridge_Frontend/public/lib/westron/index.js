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

let connectMetaMaskButton = null;
let connectTorusButton = null;
let connectWalletConnectButton  = null;

let connectPortisButton = null;
let connectBitskiButton = null;
let connectFortmaticButton = null;
let connectVenlyButton = null;
let connectCoinbaseButton = null;

//let connectionCallback = function(){console.log("No callback defined yet.");};
//commented because this may or may not mess with other callbacks.

let setConnectWalletButtonsListeners = function(){

	connectMetaMaskButton = document.querySelector(".connectMetaMask");
	connectTorusButton = document.querySelector(".connectTorus");
	connectWalletConnectButton = document.querySelector(".connectWalletConnect");

	connectPortisButton = document.querySelector(".connectPortis");
	connectBitskiButton = document.querySelector(".connectBitski");
	connectFortmaticButton = document.querySelector(".connectFortmatic");
	connectVenlyButton = document.querySelector(".connectVenly");
	connectCoinbaseButton = document.querySelector(".connectCoinbase");


	// Button click listener
	connectMetaMaskButton.addEventListener("click", async () => {
		if (window.connector == null || !window.connector.isConnected) {
			window.connector = await ConnectorManager.instantiate(ConnectorManager.providers.METAMASK);
			connectedButton = connectMetaMaskButton;
			providerConnected = "MetaMask";
			connection();
		} else {
			window.connector.disconnection();
		}
	});

	connectTorusButton.addEventListener("click", async () => {
		if (window.connector == null || !window.connector.isConnected) {
			window.connector = await ConnectorManager.instantiate(ConnectorManager.providers.TORUS);
			connectedButton = connectTorusButton;
			providerConnected = "Torus";
			connection();
		} else {
			window.connector.disconnection();
		}
	});

	connectWalletConnectButton.addEventListener("click", async () => {
		if (window.connector == null || !window.connector.isConnected) {
			window.connector = await ConnectorManager.instantiate(ConnectorManager.providers.WALLETCONNECT);
			connectedButton = connectWalletConnectButton;

			providerConnected = "WalletConnect";
			connection();
		} else {
			window.connector.disconnection();
		}
	});

	connectPortisButton.addEventListener("click", async () => {
		if (window.connector == null || !window.connector.isConnected) {
			window.connector = await ConnectorManager.instantiate(ConnectorManager.providers.PORTIS);
			connectedButton = connectPortisButton;
			providerConnected = "Portis";
			connection();
		} else {
			window.connector.disconnection();
		}
	});

	connectBitskiButton.addEventListener("click", async () => {
		if (window.connector == null || !window.connector.isConnected) {
			window.connector = await ConnectorManager.instantiate(ConnectorManager.providers.BITSKI);
			connectedButton = connectBitskiButton;
			providerConnected = "Bitski";
			connection();
		} else {
			window.connector.disconnection();
		}
	});

	connectFortmaticButton.addEventListener("click", async () => {
		if (window.connector == null || !window.connector.isConnected) {
			window.connector = await ConnectorManager.instantiate(ConnectorManager.providers.FORTMATIC);
			connectedButton = connectFortmaticButton;
			providerConnected = "Fortmatic";
			connection();
		} else {
			window.connector.disconnection();
		}
	});

	connectVenlyButton.addEventListener("click", async() =>  {
		if(window.connector == null || !window.connector.isConnected) {
			window.connector  = await ConnectorManager.instantiate(ConnectorManager.providers.VENLY);
			connectedButton = connectVenlyButton;
			providerConnected = "Venly";
			connection();
		} else {
			window.connector.disconnection();
		}
	});

	connectCoinbaseButton.addEventListener("click", async () => {
		if (window.connector == null || !window.connector.isConnected) {
			window.connector = await ConnectorManager.instantiate(ConnectorManager.providers.COINBASE);
			connectedButton = connectCoinbaseButton;
			providerConnected = "Coinbase";
			connection();
		} else {
			window.connector.disconnection();
		}
	});
}
//If connection buttons available, set listeners
if(document.querySelector(".connectMetaMask")){
	setConnectWalletButtonsListeners();
}

/** Disable or enable all connection buttons
 *	@param the value to set (true = disable)
 */
function setDisabledConnectButtons(value) {
	if(connectMetaMaskButton){
		connectMetaMaskButton.disabled = value;
		connectTorusButton.disabled = value;
		connectWalletConnectButton.disabled = value;
		connectPortisButton.disabled = value;
		connectBitskiButton.disabled = value;
		connectFortmaticButton.disabled = value;
		connectVenlyButton.disabled = value;
		connectCoinbaseButton.disabled = value;
	}
}

/** Initialize the window.connector with events onConnection and onDisconnection */
function initConnector() {
	window.connector.onConnection = async () => {
		if(connectedButton){connectedButton.disabled = false;}

		const accounts = await window.connector.web3.eth.getAccounts();
		//document.querySelector(".address").innerHTML = accounts[0];
	};

	window.connector.onDisconnection = () => {
		setDisabledConnectButtons(false);
		//document.querySelector(".address").innerHTML = "";
		if(connectedButton){connectedButton.innerHTML = "<div class='ConnectBtnTextContainer'>Connect " + providerConnected + "</div>";}
		connectedButton = null;
		providerConnected = "";
	};

	window.connector.onAccountChanged = (account) => {
		//document.querySelector(".address").innerHTML = account;
	};
}

/** Local function called when a connection/disconnection is engaged to update the frontend */
async function connection(callback) {
	initConnector();
	setDisabledConnectButtons(true);

	if (await window.connector.connection()) {
		if(connectedButton){connectedButton.innerHTML = "<div class='ConnectBtnTextContainer'>Disconnect " + providerConnected + "</div>";}
		web3 = window.connector.web3;

		//Call the callback function once connected
		//Need to be a function stored in this context as connection can be called by wallet conn buttons after
    if(window.connectionCallback){window.connectionCallback();}
	} else {
		setDisabledConnectButtons(false);
		console.log("Connection failed");
	}
}
