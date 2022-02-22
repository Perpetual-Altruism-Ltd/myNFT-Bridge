/*
=====HTML ELEMENT=====
To pu inside the page where you want to display the breadcrumb trail

To use it: 2 steps
1 - Add <nft-collection></nft-collection> inside HTML doc at desired position.
2 - Add
    import NFTCollection from './components/nftCollection.js';
    window.customElements.define('nft-collection', NFTCollection);
  In the app module of the website

Whenever you change the value of the attribute 'reset-scroll', the scroll will set itself to 0. It's useful when deleting nfts.
*/
const nftCollectionStruct = () => {
  let htmlContent = {};
  htmlContent.innerHTML = `
  <div class="NFTCollectionComponent">
  <!--Navigation buttons -->
    <div class="SlideButtonsContainer">
      <button class="SlideButton LeftButton">&#8249;</button>
      <button class="SlideButton RightButton">&#8250;</button>
    </div>

    <!--Tokens cards -->
    <div class="CollectionContainer" style="left:0em;">
      <slot name="NFTElement">No NFT found</slot>
    </div>

  </div>`;
  return htmlContent.innerHTML;/* Using htmlContent variable is to have the synthax coloration for HTML*/
}

const nftCollectionStyle = () => {
  let cssStyle = document.createElement('style');
  cssStyle.textContent = `.NFTCollectionComponent{
    width: 100%;
    height: 22em;
    overflow: hidden;
    position: relative;

    /* Border */
    border-color: #333;
    border-style: solid;
    border-width: 2px;
    border-radius: 1em;

    /* background */
    background-color: #fff;
  }
  .CollectionContainer{
    position: absolute;
    display: flex;
    flex-direction: row;
    z-index: 0;
    height: 100%;

    -webkit-transition: left .25s ease;
    -moz-transition: left .25s ease;
    transition: left .25s ease;
  }
  .SlideButtonsContainer{
    position: absolute;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    width: 100%;
    height: 100%;
  }
  .SlideButton{
    height: 100%;
    width: 0.5em;
    opacity: 0.5;
    color: #12132b;

    font-size: 3em;
    font-weight: bold;
    cursor: pointer;
    border: none;

    /* Flex, center arrow vertic */
    display: flex;
    z-index: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .SlideButton:hover{
    opacity: 0.6;
  }
  .SlideButton:active{
    opacity: 0.7;
  }
  .LeftButton{
    background-image: linear-gradient(to right, #000 0%, #fff 100%);
    left: 0;
    color: #af1540;
  }
  .RightButton{
    background-image: linear-gradient(to right, #fff 0%, #000 100%);
    right: 0;
    color: #af1540;
  }
`;
  return cssStyle;/* Using htmlContent variable is to have the synthax coloration for HTML*/
}

class NFTCollection extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({mode: 'open'}); // sets and returns 'this.shadowRoot'

    //Add style
    /*const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', '/site/style/css/breadcrumbTrail.css');
    this.shadowRoot.appendChild(linkElem);*/

    const container = document.createElement('nftCollectionContainer');
    container.innerHTML = nftCollectionStruct();
    // this.shadowRoot.appendChild(style, container);
    this.shadowRoot.append(nftCollectionStyle(), container);

    //Handle click events for sliders
    let shRoot = this.shadowRoot;
    //init style for offset of CollectionContainer
    this.shadowRoot.querySelector(".LeftButton").addEventListener('click', function(){
      //Get & increment left offset
      let collecContainer = shRoot.querySelector(".CollectionContainer");
      let currentOffset = getComputedStyle(collecContainer).left;
      currentOffset = (currentOffset == "" ? '0' : parseInt(currentOffset));//Initialisation

      //Calc of new offset (+20vw = 2 cards)
      let maxLeftOffset = 0;
      let offsetInPx = document.documentElement.clientWidth * 20 / 100;
      let newLeftOffset = currentOffset + offsetInPx;
      newLeftOffset = newLeftOffset > maxLeftOffset ? 0 : newLeftOffset;

      //Apply new offset, corrected if go beyond border
      collecContainer.style.left = newLeftOffset + 'px';
    })
    this.shadowRoot.querySelector(".RightButton").addEventListener('click', function(){
      //Get & increment left offset
      let collecContainer = shRoot.querySelector(".CollectionContainer");
      let currentOffset = getComputedStyle(collecContainer).left;
      currentOffset = (currentOffset == "" ? '0' : parseInt(currentOffset));//Initialisation

      //Calcul of min offset
      let collectionViewCompo = shRoot.querySelector(".NFTCollectionComponent");
      let collecViewWidth = parseInt(getComputedStyle(collectionViewCompo).width);
      let fullCollecWidth = parseInt(getComputedStyle(collecContainer).width);
      let minLeftOffset = -(fullCollecWidth - collecViewWidth);

      //Calc of new offset (+20vw = 2 cards)
      let offsetInPx = document.documentElement.clientWidth * 20 / 100;
      let newLeftOffset = currentOffset - offsetInPx;
      newLeftOffset = newLeftOffset < minLeftOffset ? minLeftOffset : newLeftOffset;

      //Apply new offset, corrected if go beyond border
      collecContainer.style.left = newLeftOffset + 'px';
    })
  }



  /* Register which attributes to watch for changes */
  static get observedAttributes() {
    return ['reset-scroll'];
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("attributeChangedCallback " + attrName + ', ' + oldVal + ', ' + newVal);
    if(attrName == 'reset-scroll'){
      let container = this.shadowRoot.querySelector(".CollectionContainer");
      container.style.left = '0em';
    }
  }
}

export default NFTCollection;
