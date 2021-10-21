/* This is the Controller in MVC architecture*/
import MigrationForm from './views/MigrationForm.js';
import RegisterMigration from './views/RegisterMigration.js';
import EscrowToken from './views/EscrowToken.js';
import SignEscrow from './views/SignEscrow.js';
import MintToken from './views/MintToken.js';
import MigrationFinished from './views/MigrationFinished.js';

import Model from './Model.js';

const pathToRegex = path => new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const router = async () => {
      const routes = [
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
      }

      const getParams = match => {
        const values = match.result.slice(1);
        const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(result => result[1]);

        return Object.fromEntries(keys.map((key, i) => {
            return [key, values[i]];
        }));
      };

      /*Controller: update view */
      let view = new match.route.view(getParams(match));
      //Get and display the view's html
      view.getHtml(htmlContent => {
        //Code to execute once the HTML content is retrieved from server
        //Display it in whitesheet
        document.getElementById("WhiteSheet").innerHTML = htmlContent;
        //Run the code associated to this view
        view.initCode(Model);
      })

}

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};
Model.navigateTo = navigateTo;

document.addEventListener("DOMContentLoaded", () => {
    //Only useful not to be redirected by <a> tags
    /*document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();//Block default behaviour of redirection
            navigateTo(e.target.href);
        }
    });*/

    //Initialize javascript context for all views
    initDropDownBehaviour();

    /* Document has loaded -  run the router! */
    router();

    /* call the router when the user goes a page backward*/
    window.addEventListener("popstate", router);
});
