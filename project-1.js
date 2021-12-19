// global var
const apiKey = '7a39ae85c03d4df3b2509f06ac35bb1f';
const searchButton = $('#searchBtn');
// drink global
const drinkIngredients = $('.drinkIngredients');
const drinkDescription = $('#drinkDescription');
const drinkTitle = $('#drinkTitle');
const drinkGroup = $('.drinkGroup');
const drinkImage = $('#drinkImage');
// global food
const foodTitle = $('#foodTitle');
const foodImg = $('#foodImg');
const foodIngredients = $('.foodIngredients');
const foodDescr = $('#foodDescription');
const foodGroup = $('#foodGroup');
const timeGroup = $('#timeGroup');
// global modal
const modal = $('#modal');
const modalBody = $('.modal-body');
const closeButton = $('.close-button');

// helper function for buttons
// changes button class to primary when selected
// removes primary from unselected buttons
drinkGroup.children().on('click', function (event) {
  event.preventDefault();
  for (let i = 0; i < drinkGroup.children().length; i++) {
    if (drinkGroup.children([i]).hasClass('pure-button-primary')) {
      drinkGroup.children([i]).removeClass('pure-button-primary');
    }
  }
  $(this).addClass('pure-button-primary');
  getDrink();
});

foodGroup.children().on('click', function () {
  for (let i = 0; i < foodGroup.children().length; i++) {
    if (foodGroup.children([i]).hasClass('pure-button-primary')) {
      foodGroup.children([i]).removeClass('pure-button-primary');
    }
  }
  $(this).addClass('pure-button-primary');
});

timeGroup.children().on('click', function () {
  for (let i = 0; i < timeGroup.children().length; i++) {
    if (timeGroup.children([i]).hasClass('pure-button-primary')) {
      timeGroup.children([i]).removeClass('pure-button-primary');
    }
  }
  $(this).addClass('pure-button-primary');
});
// api call for recipes
const getRecipe = async function () {
  let foodGroupId;
  let innerTime = '30';
  let innerText = $(foodGroup).find('button.pure-button-primary').attr('id');
  // gets id's of selected buttons
  if (foodGroup.find('button.pure-button-primary')) {
    foodGroupId = $(foodGroup).find('button.pure-button-primary').attr('id');
  }
  if (timeGroup.find('button.pure-button-primary')) {
    innerTime = $(timeGroup).find('button.pure-button-primary').attr('id');
  }
  // error handling for fetch
  // trys to fetch data then if falis goes to catch
  try {
    let response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?maxReadyTime=${innerTime}&apiKey=${apiKey}&query=${innerText}&number=1`
    );

    let data = await response.json();

    const { title, image, id } = data.results[0];

    let secondResponse = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`
    );

    let secondData = await secondResponse.json();
    const {
      instructions,
      summary,
      extendedIngredients,
      readyInMinutes: time,
    } = secondData;

    let ingredients = [];

    for (let i = 0; i < extendedIngredients.length; i++) {
      ingredients.push(extendedIngredients[i].original);
    }

    postRecipe(title, image, instructions, summary, ingredients);
    // when falis opens modal to test click lamb and 15 min
  } catch {
    openModal();
  }
};
// the search button after clicking a food and time

searchButton.click(getRecipe);

// replacing html elements with data from call with recipes
const postRecipe = function (title, image, instructions, summary, ingredients) {
  foodTitle.html(title);
  foodImg.attr('src', image);
  foodImg.removeClass('hidden');
  if (instructions === '') {
    foodDescr.html(summary);
  } else {
    foodDescr.html(instructions);
  }
  // gets rid of food list items
  foodIngredients.empty();
  for (let i = 0; i < ingredients.length; i++) {
    foodIngredients.append(`<li>${ingredients[i]}</li>`);
  }
};
// drink api call
const getDrink = async function () {
  let innerText = $(drinkGroup).find('button.pure-button-primary').attr('id');

  // this api call only gets title,id and image
  let response = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${innerText}`
  );

  let data = await response.json();

  // chooseing one random drink from the list

  let drink = data.drinks[Math.floor(Math.random() * data.drinks.length)];

  // desctructuring the object so i can rename

  const { strDrink: title, strDrinkThumb: image, idDrink } = drink;

  let secondResponse = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${idDrink}`
  );
  let secondData = await secondResponse.json();

  const { strInstructions: instruct } = secondData.drinks[0];

  // they define the ingredients weird so i have to do this to get what i need

  let contents = [];

  for (let i = 1; i <= 15; i++) {
    /// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
    /// eval allows me to go  through 1-15 without having to manually write each
    const ingredient = eval(`secondData.drinks[0].strIngredient${i}`);
    const measurement = eval(`secondData.drinks[0].strMeasure${i}`);
    // if the ingr and measr exists it will push them to array
    if (ingredient && measurement) {
      contents.push(`${measurement} ${ingredient}`);
    }
    // if the measr dont exist but ingre push ingre
    // example salt to taste
    if (!measurement && ingredient) {
      contents.push(ingredient);
    }
  }

  postDrink(title, image, instruct, contents);
};

const postDrink = function (title, image, instruct, contents) {
  drinkTitle.html(title);
  drinkImage.attr('src', image);
  drinkDescription.html(instruct);
  //  gets ride of previous contents
  drinkIngredients.empty();
  for (let i = 0; i < contents.length; i++) {
    //   https://www.tutorialrepublic.com/faq/how-to-add-li-in-an-existing-ul-using-jquery.php
    // this added lis as children to the existing ul
    drinkIngredients.append(`<li>${contents[i]}</li>`);
  }
};


//  modal functions
function openModal() {
  modal.css('display', 'flex');
  modalBody.text('no results found');
}
function closeModal() {
  modal.css('display', 'none');
}
closeButton.click(closeModal);

