/* This is the Controller in MVC architecture*/
import WalletConnection from './views/WalletConnection.js';
import MigrationForm from './views/MigrationForm.js';
import RegisterMigration from './views/RegisterMigration.js';
import MigrationProcess from './views/MigrationProcess.js';
import MigrationFinished from './views/MigrationFinished.js';

//Components
import BreadcrumbTrail from './components/breadcrumbTrailHandler.js';
import NFTCollection from './components/nftCollection.js';
import NFTCard from './components/nftCard.js';

import Model from './Model.js';

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const router = async () => {
      const routes = [
          { path: "/wallet_connection", view: WalletConnection },
          { path: "/migration_form", view: MigrationForm },
          { path: "/register_migration", view: RegisterMigration },
          { path: "/migration_process", view: MigrationProcess },
          { path: "/migration_finished", view: MigrationFinished },
      ];

      const potentialMatches = routes.map(route => {
            return {
                route,
                result: location.pathname.match(pathToRegex(route.path))
            };
      });

      let match = potentialMatches.find(potentialMatch => potentialMatch.result !== null);
      /* Route not found - return first route OR a specific "not-found" route */
      if (!match) {
          match = {
              route: routes[0],
              result: [location.pathname]
          };
          history.pushState(null, null, '/wallet_connection');
      }

      const getParams = match => {
        const values = match.result.slice(1);
        const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

        return Object.fromEntries(keys.map((key, i) => {
            return [key, values[i]];
        }));
      };

      /*Controller: update view */
      //Get and display the view's html
      let view = new match.route.view(getParams(match));
      view.getHtml(htmlContent => {
        //Before displaying the new page, check if migData is filled, and if not, redirect to wallet_connection
        //Exceptions for pages wallet_connection and migration_form which load themselves the provider
        if(!Model.isProviderLoaded() &&
          match.route.path != "/wallet_connection" &&
          match.route.path != "/migration_form"){
          console.log("No provider loaded. Redirecting to wallet_connection.");
          navigateTo('/wallet_connection');
        }else{
          //Display the HTML view inside WhiteSheet
          document.getElementById("WhiteSheet").innerHTML = htmlContent;
          //Run the code associated to this view
          view.initCode(Model);
        }
      });
}

//init all components behaviour
window.customElements.define('breadcrumb-trail', BreadcrumbTrail);
window.customElements.define('nft-collection', NFTCollection);
window.customElements.define('nft-card', NFTCard);

/*=====Model functions=====*/
const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};
Model.navigateTo = navigateTo;
//Cookies management
Model.createCookie = function(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    } else {
        var expires = "";
    }
    // document.cookie = name + "=" + value + expires + "; path=/; secure; samesite=strict";
    document.cookie = name + "=" + value + expires + ";path=/; SameSite=Strict; Secure";
}
Model.readCookie = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}
Model.eraseCookie = function(name) {
    Model.createCookie(name, "", -1);
}
//Tell weather user come with migData object already filled up or not.
Model.isMigDataFilled = function(){
  let migData = Model.migrationData;

  if(migData.originUniverseUniqueId &&
    migData.originWorld &&
    !(migData.originWorld.includes(' ')) &&
    migData.originTokenId &&
    !(migData.originTokenId.includes(' ')) &&
    migData.migrationRelay &&
    migData.destinationUniverseUniqueId &&
    migData.migrationType &&
    migData.destinationWorld &&
    parseInt(migData.destinationTokenId) &&
    migData.destinationOwner &&
    !(migData.destinationOwner.includes(' '))){
    return true;
  }else{
    return false;
  }
}
//Return true if a provider is loaded.
Model.isProviderLoaded = function(){
  if(window.connector){
    let userAccount = window.connector.web3.currentProvider.selectedAddress;
    //If web3 already injected
    return userAccount != "" && (window.connector.connected || window.connector.isConnected);
  }else{return false;}
}
Model.displayConnectedWallet = function(){
  console.log("DISPLAY");
}

//=====Persistent migration data handling=====
//=====Setters=====
Model.storeMigDataLocalStorage = function(){
  localStorage.setItem('migrationData', JSON.stringify(Model.migrationData));
}
//Store the step that the user completed in the mig process to local storage to access it later.
Model.storeMigStepLocalStorage = function(step){
  console.log("=====New mig step=====: "  + step);
  Model.currentMigrationStep = step;
  localStorage.setItem('migrationStep', Model.currentMigrationStep);
}
//Needs to be separated from migData because migData set to localstorage when register btn
//clicked, whereas migId retrieved after.
//Maintain model.migrationData.migrationId updated with the migId in local storage
Model.storeMigrationIdLocalStorage = function(migId){
  localStorage.setItem('migrationId', migId);
}
Model.storeHashValuesLocalStorage = function(){
  localStorage.setItem('hashValues', JSON.stringify(Model.hash));
}

//=====Getters=====
Model.getHashValues = function(){
  let hashValues = JSON.parse(localStorage.getItem("hashValues"));
  return hashValues;
}
Model.getMigrationId = function(){
  return localStorage.getItem("migrationId");
}
//Tell weather there is an unfinished migration.
Model.isMigrationPending = function(){
  let storedStep = Model.getPendingMigStep();
  return storedStep != null &&  storedStep != undefined && storedStep != '' && storedStep != Model.migStepMigrationSuccessful;
}
Model.getPendingMigData = function(){
  return JSON.parse(localStorage.getItem("migrationData"));
}
Model.getPendingMigStep = function(){
  return localStorage.getItem("migrationStep");
}
//TODELETEModel.bcTrail = new BreadcrumbTrail();
//Initialize javascript context for all views
initDropDownBehaviour();

/* Document has loaded -  run the router! */
router();

/* call the router when the user goes a page backward*/
window.addEventListener("popstate", function(event){
  let userInsists = confirm('Do you really want to move from the page you are on?\nIf you have already registered the migration, you cannot modify it.');
  if(userInsists){router();}
});


//Set 'contact us' link's href
document.getElementById("ContactUsLink").href = "mailto:bridge@mynft.com";

/*('click', async function(){
  let mailBody = "^^^^^^^^^^^Enter the description of the bug above^^^^^^^^^^^ \n";
  mailBody += encodeURI(JSON.stringify(Model.migrationData));

  //OPen new tab for mailto
  window.open("mailto:bridge@mynft.com?subject=Bridge%20bug%20report&body=" + mailBody);
})*/
