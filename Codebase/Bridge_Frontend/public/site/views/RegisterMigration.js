import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Register your migration");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;

    document.getElementById("EditMigrationButton").addEventListener('click', async() =>{
      model.navigateTo("/migration_form");
    });
    document.getElementById("RegisterButton").addEventListener('click', async() =>{
      model.navigateTo("/escrow_token");
    });
  }

  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/RegisterMigration.html');
    xhr.send();
  }
}
