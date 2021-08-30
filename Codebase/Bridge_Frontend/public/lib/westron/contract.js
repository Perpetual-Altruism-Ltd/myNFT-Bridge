const provider = localStorage.getItem("provider");
let colorContract = null;
let connector = null;

if (provider == null) {
    alert("You should connect first");
    window.location.href = "./index.html";
}

const disconnectButton = document.querySelector('.disconnect');
const address = document.querySelector('.address');

// Initialize the connector
async function connection() {
    connector = await ConnectorManager.instantiate(provider);

    connector.onConnection = async () => {
        const accounts = await connector.web3.eth.getAccounts();
        document.querySelector(".address").innerHTML = accounts[0];
    
        colorContract = new ColorContractManager(new connector.web3.eth.Contract(colorJSON, colorContractAddress), accounts[0]);
        refresh();
    };
    
    connector.onDisconnection = () => {
        window.location.href = "./index.html";
    };
    
    connector.onAccountChanged = (account) => {
        document.querySelector(".address").innerHTML = account;
    };

    if (!connector.connection())
        console.log('Fatal error connection');

    disconnectButton.addEventListener('click', () => {
        connector.disconnection();
    });
}

connection();

// Contract
const refreshButton = document.querySelector('.refresh');
refreshButton.addEventListener('click', refresh);

async function refresh() {
    document.querySelector('.refresh').disabled = true;
    document.querySelector('.spinnerRefresh').hidden = false;
    document.querySelector('.name').innerHTML = await colorContract.name();
    document.querySelector('.symbol').innerHTML = await colorContract.symbol();
    document.querySelector('.totalSupply').innerHTML = await colorContract.totalSupply();
    document.querySelector('.spinnerRefresh').hidden = true;
    document.querySelector('.refresh').disabled = false;
}

const balanceOfButton = document.querySelector('.balanceOfButton');
const balanceOfSpinner = document.querySelector('.balanceOfSpinner');

balanceOfButton.addEventListener('click', () => {
	balanceOfSpinner.hidden = false;
	
	colorContract.balanceOf(document.querySelector('.balanceOfInput').value).then(data => {
		document.querySelector('.balanceOf').innerHTML = data;
		balanceOfSpinner.hidden = true;
	});
});

const mintButton = document.querySelector('.mintButton');
const mintSpinner = document.querySelector('.mintSpinner');
const mintInput = document.querySelector('.mintInput');

mintButton.addEventListener('click', () => {
    document.querySelector('.mintDone').hidden = true;
    mintButton.disabled = true;
    mintSpinner.hidden = false;

    colorContract.mint(mintInput.value).then(() => {
        document.querySelector('.mintDone').hidden = false;
        mintSpinner.hidden = true;
        mintButton.disabled = false;
    });
});

const transferButton = document.querySelector('.transferButton');
const transferSpinner = document.querySelector('.transferSpinner');
const fromAddressInput = document.querySelector('.fromInput');
const toAddressInput = document.querySelector('.toInput');
const indexInput = document.querySelector('.indexInput');

transferButton.addEventListener('click', () => {
    document.querySelector('.transferDone').hidden = true;
    transferButton.disabled = true;
    transferSpinner.hidden = false;

    colorContract.safeTransferFrom(fromAddressInput.value, toAddressInput.value, indexInput.value).then(() => {
        document.querySelector('.transferDone').hidden = false;
        transferSpinner.hidden = true;
        transferButton.disabled = false;
    });
});