/*
This code is inspired from https://andrejgajdos.com/custom-select-dropdown/

==================Use-case====================

//====In HTML file====
//Add the CSS in the HEAD of your HTML page
<link rel="stylesheet" href="customDropDown.css">

//This is your drop down structure to put where you want in your HTML file.
//Choose an ID for the container. You will use this ID to modify the drop down with already built-in functions
<div class="select-wrapper" id="CustomDropDown">
  <div class="select">
    <div class="select-trigger">
      <span></span>
      <div class="arrow"></div>
    </div>

    <div class="select-options">
    </div>
  </div>
</div>

//====In js script====
initDropDownBehaviour();
setupDropDown("CustomDropDown");//The ID of your dropdown container
addDropDownOption("CustomDropDown", "Dell computer", "dell", "0x1")
addDropDownOption("CustomDropDown", "Lenovo computer", "lenovo", "0x2")
addDropDownOption("CustomDropDown", "Bosh washing machine", "bosh", "0x3")

selectDropDownOptionByIndex("CustomDropDown", 0);
selectDropDownOptionByUniqueID("CustomDropDown", "0x3fbf5c9a");
clickDropDownOptionByIndex("CustomDropDown", 0);//Trigger the option click event, and thus onChangeCallback
getDropDownSelectedOptionIndex("CustomDropDown");
getDropDownOptionDataValue("CustomDropDown", 1);
getDropDownOptionText("CustomDropDown", 1);
getDropDownOptionUniqueID("CustomDropDown", 1);
addDropDownOnChangeCallback("CustomDropDown", function(index){
  console.log("New selected item: " + index);
})
clearDropDownOptions("CustomDropDown");
*/


//Drop down management
let callbacks = {};

/*
Initialize the behaviour of all custom drop down in this javascript context
*/
let initDropDownBehaviour = function(){
  //Hide list of options when a click occur anywhere in the window
  window.addEventListener('click', function(e) {
    const selectors = document.querySelectorAll('.select');
    for(const selector of selectors){
      if (!selector.contains(e.target)) {
          selector.classList.remove('open');
      }
    }
  });
}

/*
Register the element 'wrapperId' as new dropDown menu.
This dropdown will only contain options that are set statically in the HTML doc.
*/
let setupDropDown = function(wrapperId){
  //toggle 'open' class in select element
  document.getElementById(wrapperId).addEventListener('click', function() {
    //Add "open" class to the select if not already set, delete otherwise
    this.querySelector('.select').classList.toggle('open');
  });
  //Register an empty onChange callback for 'wrapperId'
  callbacks[wrapperId] = {'onChange': function(index){}};
}

/*
Add an option in the list of the selector uniquely identified by wrapperId.
The displayed text of the new option is 'optionText'.
The data-value attribute is set to optionDataValue. This field can be used to store data associated to an option, but whithout displaying that data.
The option is uniquely identified by optionUniqueID. This ID MUST be different for each option of a dropdown list.
*/
let addDropDownOption = function(wrapperId, optionText, optionDataValue, optionUniqueID){
  //Create the new option element
  let newOption = document.createElement("span");
  newOption.classList.add("select-option");
  newOption.setAttribute("value", optionUniqueID);
  newOption.setAttribute("data-value", optionDataValue);
  newOption.textContent = optionText;
  //Add clickListener
  newOption.addEventListener('click', function() {
      //if (!this.classList.contains('selected')) {
        //Remove the previously selected item, if exists
        let previouslySelectedOption = this.parentNode.querySelector('.select-option.selected');
        if(previouslySelectedOption != undefined){
          previouslySelectedOption.classList.remove('selected');
        }
        //Add selected to the item just clicked
        this.classList.add('selected');
        // Set the title of the dropdown as the content of the selected element
        this.closest('.select').querySelector('.select-trigger span').textContent = this.textContent;

        //Call the onChange callback of the 'wrapperId' dropdown selector
        callbacks[wrapperId].onChange(getDropDownSelectedOptionIndex(wrapperId));
      //}
  });

  //Add the new option to the select options list
  let select = document.getElementById(wrapperId);
  let optionsList = select.querySelector(".select-options");
  optionsList.appendChild(newOption);
}

/*
Add a callback triggered on option change for dropdown identified by 'wrapperId' .
This callback takes one argument which is the index of the newly selected option
*/
let addDropDownOnChangeCallback = function(wrapperId, callbackFunc){
  callbacks[wrapperId].onChange = callbackFunc;
}

/*
Select the option corresponding to 'optionUniqueID' from the selector identified by 'wrapperId'.
Nothing thrown and nothing changed if 'optionUniqueID' if a bad ID.
*/
let selectDropDownOptionByUniqueID = function(wrapperId, optionUniqueID){
  let select = document.getElementById(wrapperId);
  let options = select.querySelectorAll(".select-option");

  //Iterate trough all the options of the select.
  for(const option of options){
    //Once the option found, set it to selected
    if(option.getAttribute("value") == optionUniqueID){
      //Remove the previously selected item, if exists
      let previouslySelectedOption = option.parentNode.querySelector('.select-option.selected')
      if(previouslySelectedOption != undefined){
        previouslySelectedOption.classList.remove('selected');
      }
      //Set option to selected
      option.classList.add('selected');
      //Set the title of the select as the text of the option newly selected
      option.closest('.select').querySelector('.select-trigger span').textContent = option.textContent;
    }
  }
}

/*
Select the option corresponding to the integer 'optionIndex' from the selector identified by 'wrapperId'
Index start at 0 for the first element.
*/
let selectDropDownOptionByIndex = function(wrapperId, optionIndex){
  let select = document.getElementById(wrapperId);
  let options = select.querySelectorAll(".select-option");
  let option = options[optionIndex];
  if(option == undefined){
    console.error("Bad optionIndex given to selectDropDownOptionByIndex(wrapperId, optionIndex)");
    return;
  }
  //Remove the previously selected item
  let previouslySelectedOption = option.parentNode.querySelector('.select-option.selected');
  if(previouslySelectedOption != undefined){
    previouslySelectedOption.classList.remove('selected');
  }
  //Set option to selected
  option.classList.add('selected');
  //Set the title of the select as the text of the option newly selected
  option.closest('.select').querySelector('.select-trigger span').textContent = option.textContent;
}

/*
Trigger the onclick of the drop down's option
*/
let triggerDropDownOnChange = function(wrapperId){
  //Call the onChange callback of the 'wrapperId' dropdown selector
  callbacks[wrapperId].onChange(getDropDownSelectedOptionIndex(wrapperId));
}

/*
Retrieve the 0-starting index of the selected option from the select identified by wrapperId.
return -1 if no option selected
*/
let getDropDownSelectedOptionIndex = function(wrapperId){
  let select = document.getElementById(wrapperId);
  let options = select.querySelectorAll(".select-option");
  let cmptr = 0;
  //Iterate to find the selected option
  for(const option of options){
    //When selected option found: return index
    if(option.classList.contains("selected")){
      return cmptr;
    }
    cmptr++;
  }
  console.error("No option selected in " + wrapperId + " when calling getDropDownSelectedOptionIndex(wrapperId)");
  return -1;
}

/*
Retrieve the data-value attribute of the option identified by the 0-starting index 'optionIndex' from the select 'wrapperId'.
If optionIndex doesn't exists: returns "".
*/
let getDropDownOptionDataValue = function(wrapperId, optionIndex){
  let select = document.getElementById(wrapperId);
  let options = select.querySelectorAll(".select-option");
  let option = options[optionIndex];
  //If optionIndex doesn't exists, return "" and display error
  if(option == undefined){
    console.error("Bad optionIndex given to getDropDownOptionDataValue(wrapperId, optionIndex)");
    return "";
  }else{
    return option.getAttribute("data-value");
  }
}

/*
Retrieve the text content of the option identified by the 0-starting index 'optionIndex' from the select 'wrapperId'.
*/
let getDropDownOptionText = function(wrapperId, optionIndex){
  let select = document.getElementById(wrapperId);
  let options = select.querySelectorAll(".select-option");
  let option = options[optionIndex];
  //If optionIndex doesn't exists, return "" and display error
  if(option == undefined){
    console.error("Bad optionIndex given to getDropDownOptionText(wrapperId, optionIndex)");
    return "";
  }else{
    return option.textContent;
  }
}

/*
Retrieve the uniqueID attribute of the option identified by the 0-starting index 'optionIndex' from the select 'wrapperId'.
*/
let getDropDownOptionUniqueID = function(wrapperId, optionIndex){
  let select = document.getElementById(wrapperId);
  let options = select.querySelectorAll(".select-option");
  let option = options[optionIndex];
  //If optionIndex doesn't exists, return "" and display error
  if(option == undefined){
    console.error("Bad optionIndex given to getDropDownOptionUniqueID(wrapperId, optionIndex)");
    return "";
  }else{
    return option.getAttribute("value");
  }
}


/*
Delete all options from a drop down.
*/
let clearDropDownOptions = function(wrapperId){
  let select = document.getElementById(wrapperId);
  let options = select.querySelectorAll(".select-option");

  options.forEach((opt, i) => {
    opt.remove();
  });

  //Remove select trigger title
  select.querySelector('.select-trigger span').textContent = "";

}
