/*
=====HTML ELEMENT=====
To pu inside the page where you want to display the breadcrumb trail

To use it: 2 steps
1 - Add <nft-collection></nft-collection> inside HTML doc at desired position.
2 - Add
    import NFTCollection from './components/nftCollection.js';
    window.customElements.define('nft-collection', NFTCollection);
  In the app module of the website

*/
const nftCollectionStruct = () => {
  let htmlContent = {};
  htmlContent.innerHTML = `
  <div class="NFTCollectionContainer">
    <div class="SlideButtonsContainer">
      <!--Navigation buttons -->
      <div class="SlideButton LeftButton">&#8249;</div>
      <div class="SlideButton RightButton">&#8250;</div>
    </div>

    <!--Tokens cards -->
    <slot name="NFTElement">No NFT found</slot>

  </div>`;
  return htmlContent.innerHTML;/* Using htmlContent variable is to have the synthax coloration for HTML*/
}

const nftCollectionStyle = () => {
  let cssStyle = document.createElement('style');
  cssStyle.textContent = `.NFTCollectionContainer{
    width: 100%;
    height: 20em;
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

    font-size: 3em;
    font-weight: bold;
    cursor: pointer;

    /* Flex, center arrow vertic */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .LeftButton{
    background-image: linear-gradient(to right, #aaa 0%, #fff 100%);
    left: 0;
  }
  .RightButton{
    background-image: linear-gradient(to right, #fff 0%, #aaa 100%);
    right: 0;
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

    //Add HTML elements making the breadcrumb trail
    const container = document.createElement('nftCollectionContainer');
    container.innerHTML = nftCollectionStruct();
    // this.shadowRoot.appendChild(style, container);
    this.shadowRoot.append(nftCollectionStyle(), container);
  }

  /* Register which attributes to watch for changes */
  static get observedAttributes() {
    return [''];
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    console.log("attributeChangedCallback " + attrName + ', ' + oldVal + ', ' + newVal);
  }
}

export default NFTCollection;
