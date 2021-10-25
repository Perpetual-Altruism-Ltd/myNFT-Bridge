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
      //If MigrationForm already loaded, filled up by user and hidden:
      //User come back from  registration page, and want to edit migration form data.
      //So disaply migration form already filled up
      let migrationFormCard = document.getElementById("MigrationFormDisplay");
      let registrationCard = document.getElementById("RegistrationDisplay");
      if(match.route.path == "/migration_form" && migrationFormCard != undefined && registrationCard != undefined){
        //Remove migration registration card
        document.getElementById("WhiteSheet").removeChild(registrationCard);
        //Show up migration form card
        migrationFormCard.style.display = 'flex';
        //Run the code associated to this view (migration_form)
        //view.initCode(Model);
      }
      else{
        view.getHtml(htmlContent => {
          //Display content in whitesheet
          //If page is register_migration: add its html content below migration form not to loose user filled data
          //And hide migration form
          if(match.route.path == "/register_migration" && migrationFormCard != undefined){
            migrationFormCard.style.display = 'none';
            //document.getElementById("WhiteSheet").innerHTML += htmlContent;
            //Careful, innerHTML += will unlink all javascript code. No event listeners...
            console.log(htmlContent);
            let whiteSheetLastElement = document.getElementById("CompleteMigrationCard");
            whiteSheetLastElement.insertAdjacentHTML("afterend", String(htmlContent));
            //ISSUE HERE WITH STRING
          }else{
            document.getElementById("WhiteSheet").innerHTML = htmlContent;
          }
          //Run the code associated to this view
          view.initCode(Model);
        });
      }
}

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};
Model.navigateTo = navigateTo;

//Initialize javascript context for all views
initDropDownBehaviour();

/* Document has loaded -  run the router! */
router();

/* call the router when the user goes a page backward*/
window.addEventListener("popstate", router);

/*document.addEventListener("DOMContentLoaded", () => {

});*/
