/** ConnectorManager allow to connect with any of the providers available */
class ConnectorManager {
	static providers = {
		METAMASK: "metamask",
		TORUS: "torus",
		WALLETCONNECT: "walletconnect",
		PORTIS: "portis",
		BITSKI: "bitski",
		FORTMATIC: "fortmatic",
		VENLY : "venly",
		ARKANE : "venly",
		COINBASE : "coinbase"
	};

	static loadedLibraries = [];

	constructor() {
		this.onConnection = () => {};
		this.onDisconnection = () => {};
		this.onAccountChanged = (account) => {};
		this.init();
	}

	/** Initialize the connector */
	init() {
		this.web3 = null;
		this.connected = false;
		this.isConnected = false;
	}

	/** Allow to load a specific library */
	static async loadLibrary(url) {
		if (!this.loadedLibraries.includes(url)) {
			await new Promise(resolve => {
				let script = document.createElement("script");
				script.setAttribute("src", url);
				script.setAttribute("async", "false");
				document.body.appendChild(script);

				script.addEventListener('load', () => {
					this.loadedLibraries.push(url);
					resolve();
				});
			});
		}
	}

	/** Allow to load the libraries to correctly run the provider, abstract method must be override
	 *  @throws Error if not overrided into children
	 */
	async loadLibraries() {
		throw new Error('You must implement this function');
	}

	/** Allow to connect, abstract method must be override
	 *  @throws Error if not overrided into children
	 */
	async connection() {
		throw new Error('You must implement this function');
	}

	/** Allow to disconnect, abstract method must be override
	 *  @throws Error if not overrided into children
	 */
	async disconnection() {
		throw new Error('You must implement this function');
	}

	/**
	 * Called when connected is updated
	 * @param {boolean} value
	 */
	set connected(value) {
		this.isConnected = value;

		if (value) {
			this.onConnection();
		} else {
			localStorage.removeItem("provider");
			this.onDisconnection();
		}
	}

	get isLoggedIn() {
		return localStorage.getItem("provider") != null;
	}

	/** Allow to instantiate the good connector depending the provider choosen
	 * @param {ConnectorManager.providers} provider From the enum to select which one to instantiate
	 * @returns MetamaskConnector | TorusConnector | WalletConnectConnector | PortisConnector | BitskiConnector | FortmaticConnector
	 */
	static async instantiate(provider) {
		let connector = null;

		switch (provider) {
			case this.providers.METAMASK: connector = new MetamaskConnector(); break;
			case this.providers.TORUS: connector = new TorusConnector(); break;
			case this.providers.WALLETCONNECT: connector = new WalletConnectConnector(); break;
			case this.providers.PORTIS: connector = new PortisConnector(); break;
			case this.providers.BITSKI: connector = new BitskiConnector(); break;
			case this.providers.FORTMATIC: connector = new FortmaticConnector(); break;
			case this.providers.VENLY: connector = new VenlyConnector(); break;
			case this.providers.ARKANE: connector = new VenlyConnector(); break;
			case this.providers.COINBASE: connector = new CoinbaseConnector(); break;

			default: return null; break;
		}

		await ConnectorManager.loadLibrary("https://cdn.jsdelivr.net/npm/web3@latest/dist/web3.min.js");
		await connector.loadLibraries();

		return connector;
	}
}

/** Allow to connect with MetaMask */
class MetamaskConnector extends ConnectorManager {

	async loadLibraries() {	}

	async connection() {
		console.log("MetaMaskConnectionFunction");
		if (ethereum) {
			ethereum.on('connect', (connectInfo) => {
				// The metamask provider emits this event when it first becomes able to submit RPC requests to a chain.
				console.log("*** Event connect emmited ***");
			});

			ethereum.on('disconnect', (connectInfo) => {
				// The metamask provider emits this event if it becomes unable to submit RPC requests to any chain.
				// In general, this will only happen due to network connectivity issues or some unforeseen error.
				// Once disconnect has been emitted, the provider will not accept any new requests until the
				// connection to the chain has benn re-restablished, which requiries reloading the page.
				console.log("*** Event disconnect emmited ***");
			});

			ethereum.on('accountsChanged', (accounts) => {
				// The metamask provider emits this event whenever the return value of the eth_accounts RPC method changes.
				// eth_accounts returns an array that is either empty or contains a single account address.
				// The returned address, if any, is the address of the most recently used accounts that the caller
				// is permitted to access. Callers are identified by their URL origin, which means that all sites with
				// the same origin share the same permissions.
				console.log("*** Event accountsChanged emmited ***");

				if (this.isConnected) {
					if (accounts.length <= 0)
						this.disconnection();
					else
						this.onAccountChanged(accounts[0]);
				}
			});

			//MODIF BY NICO. Need to change chain during the migration process to retrieve data from origin and then from destination chain, so must not reload.
			/*ethereum.on('chainChanged', (chainId) => {
				// The metamask provider emits this event when the currently connected chain changes.
				// All RPC requests are submitted to the currently connected chain. Therefore, it's critical to keep track
				// of the current chain ID by listening for this event.
				// We strongly recommend reloading the page on chain changed, unless you have good reason not to.
				console.log("*** Event chainChanged emmited ***");
				//window.location.reload();
			});*/

			ethereum.on('message', (providerMessage) => {
				// The metamask provider emits this event when it receives some message that the consumer should be notified of.
				// The kind of message is identified by the type string. (subscription is one of that)
				console.log("*** Event message emmited ***");
			});

			try {
				const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

				if (accounts.length > 0) {
					this.web3 = new Web3(ethereum);
					this.connected = true;
					localStorage.setItem("provider", ConnectorManager.providers.METAMASK);

					return true;
				} else
					return false;

			} catch (e) {
				return false;
			}
		}

		return false;
	}

	async disconnection() {
		this.init();
	}
}

/** Allow to connect with Torus.
 *  No call of onAccountsChanged because it's impossible to change the account on Torus
 */
class TorusConnector extends ConnectorManager {

	constructor() {
		super();
		this.torus = null;
	}

	async loadLibraries() {
		await ConnectorManager.loadLibrary("https://cdn.jsdelivr.net/npm/@toruslabs/torus-embed");
	}

	async connection() {
		try {
			this.torus = new Torus({buttonPosition: "bottom-right",});
			await this.torus.init(); 	// Initialize Torus's logger
			await this.torus.login(); 	// Logging the user in

			if (!this.isLoggedIn) {
				await this.torus.setProvider({host: "rinkeby"}); // Forcing the chain to be rinkeby
				localStorage.setItem("provider", ConnectorManager.providers.TORUS);
			}

			this.web3 = new Web3(this.torus.provider);
			this.connected = true;

			return true;
		} catch (e) {
			if (this.torus)
				this.torus.cleanUp();	// Remove Torus's button

			return false;
		}
	}

	disconnection() {
		this.torus.logout();	// Logging the user out
		this.torus.cleanUp();	// Remove Torus's button
		this.torus = null;
		this.init();
	}

}

/** Allow to connect with Portis */
class PortisConnector extends ConnectorManager {

	constructor() {
		super();
		this.portis = null;
	}

	async loadLibraries() {
		await ConnectorManager.loadLibrary("https://cdn.jsdelivr.net/npm/@portis/web3@4.0.4/umd/index.min.js");
	}

	async connection() {
		try {
			this.portis = new Portis("f904fd74-6e69-4710-892c-5f8b71f67589", "rinkeby");

			this.portis.onError(error => {
				console.log('*** Event error emmited ***', error);
				this.disconnection();
			});

			this.portis.onActiveWalletChanged(walletAddress => {
				console.log('*** Event onActiveWalletChanged emmited ***', walletAddress);
				this.onAccountChanged(walletAddress);
			});

			this.portis.onLogout(() => {
				console.log('*** Event onLogout emitted ***');
			});

			this.portis.onLogin(() => {
				console.log('*** Event onLogin emitted ***');
			});

			this.web3 = new Web3(this.portis.provider);
			const accounts = await this.web3.eth.getAccounts();	// Logging in the user
			this.connected = true;
			localStorage.setItem("provider", ConnectorManager.providers.PORTIS);

			return true;
		} catch (e) {
			return false;
		}
	}

	async disconnection() {
		// Errors on console on calling portis.logout() but they are from the library
		await this.portis.logout();
		this.portis = null;
		this.init();
	}
}

/** Allow to connect with Bitski
 *  @documentation https://github.com/BitskiCo/bitski-js/
 *  No call of onAccountsChanged because it's impossible to change the account on Bitski
 */
class BitskiConnector extends ConnectorManager {

	constructor() {
		super();
		this.bitski = null;
	}

	async loadLibraries() {
		await ConnectorManager.loadLibrary("https://cdn.jsdelivr.net/npm/bitski@0.11.0-beta.5/dist/bitski.min.js");
	}

	async connection() {
		try {
			this.bitski = new Bitski.Bitski('d64d35ca-37b3-484e-af16-370ddd2aa9f2', 'http://localhost:8080/callback.html');

			if (!this.isLoggedIn) {
				await this.bitski.signIn();	// Logging the user in
			}

			const prov = this.bitski.getProvider({networkName: 'rinkeby'});	// Forcing the chain to be rinkeby
			this.web3 = new Web3(prov);

			this.connected = true;
			localStorage.setItem("provider", ConnectorManager.providers.BITSKI);
			return true;
		} catch (e) {
			return false;
		}
	}

	async disconnection() {
		await this.bitski.signOut();	// Logging the user out
		this.bitski = null;
		this.init();
	}

}

/** Allow to connect with WalletConnect which provide connection for a majority mobile wallets */
class WalletConnectConnector extends ConnectorManager {

	constructor() {
		super();
		this.walletconnect = null;
	}

	async loadLibraries() {
		await ConnectorManager.loadLibrary("https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.6/dist/umd/index.min.js");
	}

	async connection() {
		try {
			this.walletconnect = new WalletConnectProvider.default({
				infuraId: "5c0298c3acfe4180b356f507928720e1",
			});

			this.walletconnect.on("accountsChanged", (accounts) => {
				console.log('*** Event accountsChanged emitted ***', accounts[0]);
				this.onAccountChanged(accounts[0]);
			});

			this.walletconnect.on("chainChanged", (chainId) => {
				console.log('*** Event chainChanged emitted ***');
			});

			this.walletconnect.on("disconnect", (code, reason) => {
				console.log('*** Event disconnect emitted ***');
				if (this.isConnected) {
					this.walletconnect = null;
					this.init();
				}
			});

			await this.walletconnect.enable();	// Print the QR Code to the screen
			this.web3 = new Web3(this.walletconnect);

			this.connected = true;
			localStorage.setItem("provider", ConnectorManager.providers.WALLETCONNECT);
			return true;
		} catch (e) {
			return false;
		}
	}

	async disconnection() {
		await this.walletconnect.disconnect();	// Logging the user out
		this.walletconnect = null;
		this.init();
	}

}

/** Allow to connect with Fortmatic */
class FortmaticConnector extends ConnectorManager {

	constructor() {
		super();
		this.fortmatic = null;
	}

	async loadLibraries() {
		await ConnectorManager.loadLibrary("https://cdn.jsdelivr.net/npm/fortmatic@latest/dist/fortmatic.js");
	}

	async connection() {
		try {
			this.fortmatic = new Fortmatic('pk_test_91416D385037C4AC');
			const accounts = await this.fortmatic.user.login();	// Logging the user in

			if (accounts.length > 0) {
				this.web3 = new Web3(this.fortmatic.getProvider());
				this.connected = true;
				localStorage.setItem("provider", ConnectorManager.providers.FORTMATIC);
				return true;
			} else
				return false;
		} catch (e) {
			return false;
		}
	}

	async disconnection() {
		this.fortmatic.user.logout();	// Logging the user out
		this.fortmatic = null;
		this.init();
	}

}


class VenlyConnector extends ConnectorManager {

	async loadLibraries() {
		await ConnectorManager.loadLibrary("https://cdn.jsdelivr.net/npm/@venly/web3-provider@0.24/dist/web3-provider.js");
	}

	async connection() {

		try {
			/*const provider = await Arkane.createArkaneProviderEngine({
				clientId: 'myNFT',
				environment: 'staging',
				secretType: 'ETHEREUM'
			});*/

			const provider = await Venly.createProviderEngine({
				clientId: 'myNFT',
				environment: 'staging',
				secretType:"ETHEREUM"
			});
			this.venly=provider;

			this.web3 = new Web3(provider);
			this.connected = true;
			localStorage.setItem("provider", ConnectorManager.providers.ARKANE);

			return true;
	    } catch(e) {
	        // if (e) {
	        //     switch (e) {
	        //         case 'not-authenticated':
	        //             console.log('User is not authenticated (closed window?)', e);
	        //             break;
	        //         case 'no-wallet-linked':
	        //             console.log('No wallet was linked to this application', e);
	        //             break;
	        //         default:
	        //             console.log('Something went wrong while creating the Arkane provider', e);
	        //     }
	        // } else {
	        //     console.log('Something went wrong while creating the Arkane provider');
	        // }

			return false;
	    }
	}

	async disconnection() {
		Venly.venlyConnect.logout();
		this.init();
	}

}

/** Allow to connect with Coinbase */
class CoinbaseConnector extends ConnectorManager {

	constructor() {
		super();
		this.walletLink = null;
	}

	async loadLibraries() {
		await ConnectorManager.loadLibrary("/lib/westron/bundlewalletlink2-2-10.js");
	}

	async connection() {
		try {
			const ETH_JSONRPC_URL = 'https://rinkeby.infura.io/v3/291396cbd2e9458f8355c6b2512a9e3f';
			const CHAIN_ID = 4; // Rinkeby id = 4, Mainnet id = 1

			this.walletLink = new WalletLink({
				appName: "Cryptograph Connector",
				appLogoUrl: 'https://img.icons8.com/nolan/64/blockchain-technology--v1.png',
				darkMode: false
			});

			const provider = this.walletLink.makeWeb3Provider(ETH_JSONRPC_URL, CHAIN_ID);
			const accounts = await provider.request({ method: 'eth_requestAccounts' });

			if (accounts.length > 0) {
				this.web3 = new Web3(provider);
				localStorage.setItem("provider", ConnectorManager.providers.COINBASE);

				this.connected = true;
				return true;
			} else
				return false;
		} catch(e) {
			return false;
		}
	}

	async disconnection() {
		this.walletLink.disconnect();
		this.walletLink = null;
		this.init();
	}

}
