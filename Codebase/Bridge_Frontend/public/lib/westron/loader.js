/**
	The loader of the library, what it does:
	It simply wait until full DOM Content is loaded in order to load all the required libs
	- ConnectorManager.js
	- web3.js
*/
document.addEventListener("DOMContentLoaded", () => {
	var index = document.createElement("script");
	index.setAttribute("type","text/javascript");
	index.setAttribute("src","/lib/westron/index.js");
	document.body.appendChild(index);

	var ConnectorManager = document.createElement("script");
	ConnectorManager.setAttribute("type","text/javascript");
	ConnectorManager.setAttribute("src","/lib/westron/ConnectorManager.js");
	document.body.appendChild(ConnectorManager);
});
