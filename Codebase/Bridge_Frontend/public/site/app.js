/* This is the Controller in MVC architecture*/
import WalletConnection from './views/WalletConnection.js';
import MigrationForm from './views/MigrationForm.js';
import RegisterMigration from './views/RegisterMigration.js';
import EscrowToken from './views/EscrowToken.js';
import SignEscrow from './views/SignEscrow.js';
import MintToken from './views/MintToken.js';
import MigrationFinished from './views/MigrationFinished.js';

import Model from './Model.js';

//Launch the static server: sudo http-server ./public/ -p 85 -c-1

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const router = async () => {
      const routes = [
          { path: "/wallet_connection", view: WalletConnection },
          { path: "/migration_form", view: MigrationForm },
          { path: "/register_migration", view: RegisterMigration },
          { path: "/escrow_token", view: EscrowToken },
          { path: "/sign_escrow", view: SignEscrow },
          { path: "/mint_token", view: MintToken },
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
        document.getElementById("WhiteSheet").innerHTML = htmlContent;
        //Run the code associated to this view

        view.initCode(Model);
      });
}

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

//Initialize javascript context for all views
initDropDownBehaviour();

/* Document has loaded -  run the router! */
router();

/* call the router when the user goes a page backward*/
window.addEventListener("popstate", router);

//Add bug report button function
document.getElementById("ReportBugBtn").addEventListener('click', async function(){
  let mailBody = "^^^^^^^^^^^Enter the description of the bug above^^^^^^^^^^^ \n";
  mailBody += JSON.stringify(Model.migrationData);

  //OPen new tab for mailto
  window.open("mailto:bridge@mynft.com?subject=Bridge bug report&body=" + mailBody);
})
