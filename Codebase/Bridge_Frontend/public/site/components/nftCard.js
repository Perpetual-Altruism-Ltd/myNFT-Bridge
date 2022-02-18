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
    <div>
      <img class="NFTImage">
      <div class="NFTNameText"></div>
      <div class="NFTNetworkText"></div>
    </div>

    <div class="ControlContainer">
      <button class="Button ColoredButton MintIOUButton">Mint IOU</button>
      <button class="Button ColoredButton RedeemIOUButton">Redeem IOU</button>
    </div>
  </div>`;
  return htmlContent.innerHTML;/* Using htmlContent variable is to have the synthax coloration for HTML*/
}

const nftCardStyle = () => {
  let cssStyle = document.createElement('style');
  cssStyle.textContent = `
  *{
    box-sizing: border-box;
  }
  .NFTCardContainer{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 1em;
    margin-bottom: 1em;

    width: 10vw;
    height: calc(100% - 1em);
    overflow-y: auto;
    overflow-x: hidden;
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
    margin-bottom: 1em;
  }
  .NFTImage{
    width: 100%;
    height: auto;
  }
  .NFTNameText, .NFTNetworkText{
    text-align: center;
    word-break: break-word;
    margin-top: 1em;
    margin-bottom: 1em;
  }
  .Button{
    margin-left: 0.5em;
    margin-right: 0.5em;
  }

  /* Colored btn */
  .ColoredButton{
    padding: 0.25em 1em;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    border-radius: 30px;
    border-width: 0em;
    font-size: .88rem;
    line-height: 1.5rem;
    text-decoration: none;
    transition: 0.5s;
    background-image: linear-gradient(to right, #3e287a 0%, #af1540 100%);
    background-size: 200% auto;
    color: #fff;
    white-space: nowrap;
    cursor:pointer;
  }
  .ColoredButton:hover{
    background-position: right center;
  }
  .ColoredButton:active{
    background-image: linear-gradient(to right, #bf1560 0%, #bf1560 100%);
  }
  .ColoredButton:disabled, .ColoredButton[disabled]{
    background-image: linear-gradient(to right, #bbb 0%, #bbb 100%);
    /*Do not set bg-image : none; bg-color: #bbb. it causes a threshold during the switch from disabled to enabled and reverse */
    cursor: default;
  }
  .ColoredButton.Selected{
    background-image: linear-gradient(to right, #bf1560 0%, #bf1560 100%);
  }


`;
  return cssStyle;/* Using htmlContent variable is to have the synthax coloration for HTML*/
}

/* Fill in the migration form with the nft data*/
let fillInNftData = function(originUniverse, originWorld, originTokenId){
  //Change the og network
  selectDropDownOptionByUniqueID("OriginNetworkSelector", originUniverse);
  //Prompt user to change network
  triggerDropDownOnChange("OriginNetworkSelector");
  //Fill in ogWorld & call change event
  document.getElementById("inputOGContractAddress").value = originWorld;
  document.getElementById("inputOGContractAddress").dispatchEvent(new Event("keyup"));
  //Fill in tokenId & call change event
  document.getElementById("inputOGTokenID").value = originTokenId;
  document.getElementById("inputOGTokenID").dispatchEvent(new Event("keyup"));

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

    //Copy of this (class NFTCard) to access it inside click listeners where this is overriden by the button
    let nftCardThis = this;
    //SET MINT IOU BTN CLICK CALLBACK
    let mintBtn = this.shadowRoot.querySelector(".MintIOUButton");
    mintBtn.addEventListener('click', function(e) {
      fillInNftData(nftCardThis.universe, nftCardThis.world, nftCardThis.tokenId);
    });

    //SET REDEEM IOU BTN CLICK CALLBACK
    let redeemBtn = this.shadowRoot.querySelector(".RedeemIOUButton");
    redeemBtn.addEventListener('click', function(e) {
      //Indicate migrationForm js to prefill with redeem info
      window.prefillRedeemForm = true;
      //Prefill origin data in mig form
      fillInNftData(nftCardThis.universe, nftCardThis.world, nftCardThis.tokenId);
    });
  }

  /* Register which attributes to watch for changes */
  static get observedAttributes() {
    return ['name', 'imgsrc', 'is-iou', 'universe', 'network-name', 'world', 'tokenid'];
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    //NFT NAME
    if(attrName == 'name'){
      let nameElem = this.shadowRoot.querySelector(".NFTNameText");
      nameElem.textContent = newVal;
    }
    //NFT MEDIA
    else if(attrName == 'imgsrc'){
      let img = this.shadowRoot.querySelector(".NFTImage");
      //imgElem.src = newVal;

      img.onload = function(){
        console.log(newVal + " loaded OK.");
      };
      img.onerror = function(){
        console.log(newVal + ' error on loading');
        img.src = '/site/medias/noMediaBg.png';
      };
      img.src = newVal;
    }
    //ENABLE or not REDEEM BTN
    else if(attrName == 'is-iou'){
      let btnDisabled;
      if(newVal.toLowerCase() == 'true'){btnDisabled = false;}
      else{btnDisabled = true;}
      this.shadowRoot.querySelector(".RedeemIOUButton").disabled = btnDisabled;
    }
    //SAVE NFT DATA
    else if(attrName == 'universe'){//Origin universe unique ID
      this.universe = newVal;
    }
    else if(attrName == 'network-name'){
      //Display the name of the network
      let networkElem = this.shadowRoot.querySelector(".NFTNetworkText");
      networkElem.textContent = newVal;
    }
    else if(attrName == 'world'){
      this.world = newVal;
    }
    else if(attrName == 'tokenid'){
      this.tokenId = newVal;
    }
  }
}

export default NFTCard;
