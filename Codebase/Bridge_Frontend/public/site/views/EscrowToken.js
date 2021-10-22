import AbstractView from './AbstractView.js';

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Escrowing your NFT");
  }

  /*This function contain all the javascript code which will be executed when this view if selected */
  initCode(model){
    //Define global functions. Only for code reuse purpose.
    let bridgeApp = model.bridgeApp;
    let ABIS = model.ABIS;
    let contracts = model.contracts;

    //setTimeout(() => { model.navigateTo("/sign_escrow"); }, 5000);
  }

  async getHtml(callback){
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        let htmlContent = xhr.response;
        callback(htmlContent);
      }
    };
    xhr.open('GET', '/site/static_views/EscrowToken.html');
    xhr.send();
  }
}
