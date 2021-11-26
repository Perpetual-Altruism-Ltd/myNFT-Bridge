/*
=====HTML ELEMENT=====
To put inside the page where you want to display an NFT card

To use it: 2 steps
1 - Add <nft-card></nft-card> inside HTML doc at desired position.
2 - Add
    import NFTCard from './components/nftCard.js';
    window.customElements.define('nft-card', NFTCard);
  In the app module of the website

*/
const nftCardStruct = () => {
  let htmlContent = {};
  htmlContent.innerHTML = `
  <div class="NFTCardContainer">
    <img class="NFTImage"></img>
    <div class="ControlContainer">
      <div class="NFTNameText"></div>
      <button class="Button ColoredButton MintIOUButton">Mint IOU</button>
      <button class="Button ColoredButton RedeemIOUButton">Redeem IOU</button>
    </div>
  </div>`;
  return htmlContent.innerHTML;/* Using htmlContent variable is to have the synthax coloration for HTML*/
}

const nftCardStyle = () => {
  let cssStyle = document.createElement('style');
  cssStyle.textContent = `
  .NFTCardContainer{
    width: 10vw;
    height: 100%;
    overflow: hidden;
    margin: 0.5em;

    /* Border */
    border-color: #333;
    border-style: solid;
    border-width: 2px;
    border-radius: 0.3em;

    /* background */
    background-color: #fff;
  }
  .ControlContainer{
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5em; 0em;
    margin-bottom: 0.5em;
  }
  .NFTImage{
    width: 10vw;
    height: 10vw;
  }
  .NFTNameText{
    text-align: center;
    word-break: break-word;
    margin-bottom: 1em;
  }
  .Button{
    margin-left: 0.5em;
    margin-right: 0.5em;
  }

`;
  return cssStyle;/* Using htmlContent variable is to have the synthax coloration for HTML*/
}

class NFTCard extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({mode: 'open'}); // sets and returns 'this.shadowRoot'

    //Add style, but this way introduce a FOUC
    /*const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', '/site/style/css/nftCard.css');
    this.shadowRoot.appendChild(linkElem);*/

    //Add HTML elements making the breadcrumb trail
    const container = document.createElement('nftCardContainer');
    container.innerHTML = nftCardStruct();
    //this.shadowRoot.appendChild(container);
    this.shadowRoot.append(nftCardStyle(), container);

    //Default look of a card
    let imgElem = this.shadowRoot.querySelector(".NFTImage");
    imgElem.src = '/site/medias/noMediaBg.png';
    this.shadowRoot.querySelector(".RedeemIOUButton").disabled = true;
  }

  /* Register which attributes to watch for changes */
  static get observedAttributes() {
    return ['name', 'imgsrc', 'is-iou', 'on-redeemiou-click', 'on-mintiou-click'];
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("attributeChangedCallback " + attrName + ', ' + oldVal + ', ' + newVal);
    if(attrName == 'name'){
      let nameElem = this.shadowRoot.querySelector(".NFTNameText");
      nameElem.textContent = newVal;
    }
    else if(attrName == 'imgsrc'){
      let imgElem = this.shadowRoot.querySelector(".NFTImage");
      imgElem.src = newVal;
    }
    else if(attrName == 'is-iou'){
      let btnDisabled;
      if(newVal.toLowerCase() == 'true'){btnDisabled = false;}
      else{btnDisabled = true;}
      this.shadowRoot.querySelector(".RedeemIOUButton").disabled = btnDisabled;
    }
    else if(attrName == 'on-mintiou-click'){
      let mintBtn = this.shadowRoot.querySelector(".MintIOUButton");
      mintBtn.addEventListener('click', function(e) {
        console.log("Hey from on-mintiou-click");
        document.getElementById("inputOGContractAddress").value = newVal;//YEY! Works
      });
    }
    else if(attrName == 'on-redeemiou-click'){
      let redeemBtn = this.shadowRoot.querySelector(".RedeemIOUButton");
    }

  }
}

export default NFTCard;
