import { restoreOffset, lockOffset, demographics, interactive, handleScrollTarget } from "./main.js";
import { foods } from "./foods.js";

const tdee_selection = document.getElementById('tdee-selection');
export const mealPlanContainer = document.getElementById('meal-plan-container');
const totalGramsContainer = document.getElementById('total-grams-container');
const foodSelectionContainer = document.getElementById('food-selection-container');
const currentPlateContainer = document.getElementById('current-plate-container');
const targetGramsContainer = document.getElementById('target-grams-container');
export const search = {
    filter: document.getElementById('food-selection-filter'),
    select:document.getElementById('food-selection-result-container'),
    results:document.getElementById('search-results-container'),
}
// get children from the containers above & store in variable
let children = {
        total:[...totalGramsContainer.children],
        target:[...targetGramsContainer.children],
        current:[...currentPlateContainer.children],
        select:[...foodSelectionContainer.children],
}

let in_range = 10;

let portions = {
    fat_loss:{proteins:30,carbs:40,fats:30},

    fat_loss2:{proteins:40,carbs:30,fats:30},

    lean_mass:{proteins:30,carbs:45,fats:25},

    lean_mass2:{proteins:30,carbs:50,fats:20},

    balanced:{proteins:30,carbs:40,fats:30},
}

let current_portion = {}
let units = {
    proteins:4,
    carbs:4,
    fats:9,
    alcohol:7,
}

let number_of_meals = null;


// search results
search.filter.oninput = searchFood;


export function handleMacros(tdee,type) {
    const question = `How many meals or snacks do you plan to eat in 1 day?`
    // prompt user - # of meals 
    let howManyMeals;
    const handlePrompt = () => howManyMeals = prompt(question);
    handlePrompt();
    // if canceled or meals is 0
    if(howManyMeals === null || (!/^\d+$/.test(howManyMeals) || Number(howManyMeals) < 1)) {

        // alert
        alert('Please enter a number');
        
        // restore tdee-selection
        tdee_selection.value = "";
        tdee_selection.removeAttribute('disabled')

        // restore offset
        setTimeout(()=>{
            restoreOffset();
            lockOffset();
            
            hideMealPlanner();

            // scroll to bottom of page
            window.scrollTo(0, document.body.scrollHeight);

            // hide interactive scroll-up-button
            interactive.container.classList.add('no-display')

        },100);

        // hide result2
        demographics.result2.textContent = '';

        // hide result3
        demographics.result3.textContent = '';

        return;
    } else {
        // if # of meals is valid
        number_of_meals = +howManyMeals;
    }

    // method
    // target portion by fitness-goal (fat loss | lean mass | balanced)
    current_portion = {...portions[type]};
    
    // loop through the targeted portion
    for(let property in current_portion) {
        // list percentage
        const percentage = current_portion[property];
        console.log("percentage",percentage);

        // get the portion from tdee (proteins, carbs, fats)
        const portion = Number((tdee * (current_portion[property]/100)).toFixed(2));
        console.log("result", portion);

        let convertToGram = convertKcalToGram(Number(portion),units[property]);
        console.log(convertToGram);
        current_portion[property] = {
            kcal:Number(portion),
            grams:convertToGram,
            per_meal: Number((convertToGram) / Number(number_of_meals)),
        };
    }
    
    // if # of meals is valid
    if(howManyMeals){
        handleMealPlanner(current_portion);
    }
    
    current_portion['number_of_meals'] = number_of_meals;
    console.log(current_portion);
}

function convertKcalToGram(num,unit) {

    console.log(num,unit)
    
    if(!num || typeof num !== 'number'){
        console.error('error: check argument to convert')
        return;
    }

    return Number((num / unit).toFixed(2));
}

function handleMealPlanner(obj) {
    showMealPlanner()

    let o = {...obj};
    console.log(o);

    let example = children.total;
    let target = children.target;

    // iterate 
    for(let i in example){
        console.log(example[i]);
        let getMacro = example[i].getAttribute(`--data-set`);
        
        console.log(getMacro)

        console.log("grams",o[getMacro]['grams'])

        // setup total textcontent 
        example[i].textContent = getMacro[0].toUpperCase() + " - " + (o[getMacro]['grams']).toFixed(2);

        // setup current plate textcontent
        target[i].textContent = getMacro[0].toUpperCase() + " - " + (o[getMacro]['per_meal']).toFixed(2);
    }


}
// show/hide meal planner
function showMealPlanner(){
    mealPlanContainer.classList.remove('no-display');
}
export function hideMealPlanner(){
    mealPlanContainer.classList.add('no-display');
}

// search filter
function searchFood(e) {
    
    clearResults();

    let f, matches;
    if(foods) {
        // copy foods
        f = [...foods]
        
        matches = f.filter((item,i) => {
            if(new RegExp(e.target.value,'i').test(item.item)){
                return item;
            }
        })
        
    };

    console.log(matches);

    matches.map(match => {
        let li = createSearchResult(match);
        search.results.append(li);
        let replaced = [...search.results.children]; //.filter((a,b)=> b < 10)
        // let replaced = [...search.results.children].filter((a,b)=> b < 10)
        search.results.replaceChildren(...replaced)

        // update quantity
        let quantityVal = li.children[0];
        quantityVal.value = Number(match.serving / 28.35).toFixed(1);

        let quantity_element = li.children[0];
        quantity_element.classList.remove('not-clicked');

        li.onclick = selectFood

        // quantity input
        quantityVal.oninput = (e) => handleQuantityInput(e,match.serving);
    })

    if(e.target.value === '') clearResults();

    e.target.value = e.target.value.trimStart();

}

function createSearchResult(item) {

    let li = document.createElement('li');
    let quantity = document.createElement('input');
    let food = document.createElement('p');
    let proteins = document.createElement('p');
    let carbs = document.createElement('p');
    let fats = document.createElement('p');

    food.textContent = item.item;
    proteins.textContent = 'P - ' + item.proteins;
    carbs.textContent = 'C - ' + item.carbs;
    fats.textContent = 'F - ' + item.fats;

    food.classList.add('column-label','no-pointer-events');
    proteins.classList.add('column-label','no-pointer-events');
    carbs.classList.add('column-label','no-pointer-events');
    fats.classList.add('column-label','no-pointer-events');
    
    proteins.setAttribute('--data-set', 'proteins');
    carbs.setAttribute('--data-set', 'carbs');
    fats.setAttribute('--data-set', 'fats');

    proteins.setAttribute('--data-grams', item.proteins);
    carbs.setAttribute('--data-grams', item.carbs);
    fats.setAttribute('--data-grams', item.fats);

    // handle quanitiy input
    quantity.type = 'number';
    quantity.setAttribute('min','0')
    quantity.setAttribute('placeholder','oz')
    quantity.classList.add('column-label','column-quantity');
    
    let arr = [quantity,food,proteins,carbs,fats]
    li.append(...arr)

    return li;
}

export function clearfoodItems(arr) {
    search.filter.value = '';

    return arr.map(a => a.remove());
}

export function clearResults(){
    
    return [...search.results.children].map(c => c.remove());
}

function selectFood(item) {

// prevent tile click
    let cloned = (item.currentTarget).cloneNode(true);
    let all_lis = [...item.currentTarget.parentElement.children];

    // remove "not-clicked" class from all, or any, quantity inputs
    all_lis.map(li => {
        let getQuantity = li.children[0];
        getQuantity.classList.remove('not-clicked');
    })

    if(cloned.children[0].classList.contains('column-quantity')){
        item.stopPropagation();
    } 
    if(item.target.tagName==='LI' && cloned.children[0].value) {
        cloned.children[0].setAttribute('disabled',true);
        cloned.children[0].setAttribute('type','text');
        cloned.children[0].removeAttribute('min');
        cloned.children[0].value = cloned.children[0].value + " oz"
        cloned.children[0].classList.remove('column-quantity');
        // append food
        search.select.append(cloned);
        
        let exitBtn = document.createElement('img');
        exitBtn.src = './media/delete.png'
        exitBtn.classList.add('exit-btn');
        cloned.append(exitBtn);
        
        handleCurrentPlate(cloned);

        // remove list item
        exitBtn.onclick = handleRemoval

        handleScrollTarget(interactive.scroll)

        // if some list items still have a quantity value
        if(all_lis.filter(l => {
            return l.children[0].value
        }).length > 1) {
            item.currentTarget.children[0].value = '';
            
        } else {
            search.filter.value = ''
            clearResults();
        }
        
    } else {
        console.error('error: selectFood - check value');
        if(item.target.tagName === 'LI' && !cloned.children[0].value){
            console.log(item.target)
            item.target.children[0].classList.add('not-clicked')
        }
    }
 
}

// handle the current-plate macros onchange
function handleCurrentPlate(item) {
    // method
    let children = [...item.children].slice(2,item.children.length);
    addMacros(children);
    
}

function addMacros(children){
    let macros = {
        proteins:null,
        carbs:null,
        fats:null,
    }
    
    for(let i = 0; i < children.length; i++) {
        let attr = children[i].getAttribute('--data-set');
        if(attr){
            let picked = +children[i].textContent.split` - `[1] || +children[i].textContent;
            macros[`${attr}`] = picked||0;

            // add to current & subtract from target plates
            if(!/^\d+(\.\d+)?$/g.test(currentPlateContainer.children[i].textContent)){
                totalGramsContainer.children[i].textContent = (Number(totalGramsContainer.children[i].textContent.split` - `[1]) - macros[`${attr}`]).toFixed(2)
                currentPlateContainer.children[i].textContent = +macros[`${attr}`];
            } else {
                console.log(+totalGramsContainer.children[i].textContent)
                console.log(macros[`${attr}`])
                console.log("index",i)
                totalGramsContainer.children[i].textContent = (Number(totalGramsContainer.children[i].textContent||Number(totalGramsContainer.children[i].textContent.split` - `[1])) - macros[`${attr}`]).toFixed(2);
                currentPlateContainer.children[i].textContent = (Number(currentPlateContainer.children[i].textContent) + macros[`${attr}`]).toFixed(2);
            }

            console.log(currentPlateContainer.children[i].textContent)
            console.log(targetGramsContainer.children[i].textContent.split` - `[1])

            let quotient = Math.round((Number(currentPlateContainer.children[i].textContent) / Number(targetGramsContainer.children[i].textContent.split` - `[1]||targetGramsContainer.children[i].textContent)) * 100);

            console.log(quotient);

            targetGramsContainer.children[i].style = `color: ${getColorByPercentage(quotient)} !important; transition:.25s;`
            
            // handle plate indicator
            let getIndicator = document.querySelector(`.plate-indicator[data-${attr}-indicator]`);
            console.log(getIndicator)

            console.log((Number(quotient)/100) * getIndicator.parentElement.clientHeight)
            getIndicator.style = `height:${(Number(quotient)/100) * getIndicator.parentElement.clientHeight}px !important`;

            if(Math.abs(Number(currentPlateContainer.children[i].textContent) - Number(targetGramsContainer.children[i].textContent.split` - `[1])) <= in_range) {
                currentPlateContainer.children[i].style = 'color:#1EA32A !important';
            } else {
                currentPlateContainer.children[i].style = 'color:#rgb(254, 159, 50) !important';
            }
        }
    }
}

function subtractMacros(children){
    let macros = {
        proteins:null,
        carbs:null,
        fats:null,
    }

    for(let i = 0; i < children.length; i++) {
        let attr = children[i].getAttribute('--data-set');
        if(attr){
            let picked = +children[i].textContent.split` - `[1] || +children[i].textContent;
            macros[`${attr}`] = picked||0;

            // subtract
            totalGramsContainer.children[i].textContent = (Number(totalGramsContainer.children[i].textContent) + macros[`${attr}`]).toFixed(2);
            currentPlateContainer.children[i].textContent = (Number(currentPlateContainer.children[i].textContent) - macros[`${attr}`]).toFixed(2);
            
            let targetPercentage = Math.round((Number(currentPlateContainer.children[i].textContent) - macros[`${attr}`]).toFixed(2) / Number(targetGramsContainer.children[i].textContent.split` - `[1]));

            console.log(targetPercentage);

            let quotient = Math.round((Number(currentPlateContainer.children[i].textContent) / Number(targetGramsContainer.children[i].textContent.split` - `[1]||targetGramsContainer.children[i].textContent)) * 100);

            console.log(quotient);

            targetGramsContainer.children[i].style = `color: ${getColorByPercentage(quotient)} !important; transition:.25s;`;

            // handle plate indicator
            let getIndicator = document.querySelector(`.plate-indicator[data-${attr}-indicator]`);
            console.log(getIndicator)

            console.log((Number(quotient)/100) * getIndicator.parentElement.clientHeight);
            getIndicator.style = `height:${(Number(quotient)/100) * getIndicator.parentElement.clientHeight}px !important`;

            if(Math.abs(Number(currentPlateContainer.children[i].textContent) - Number(targetGramsContainer.children[i].textContent.split` - `[1])) <= in_range) {
                currentPlateContainer.children[i].style = 'color:#1EA32A !important';
            } else {
                currentPlateContainer.children[i].style = 'color:#rgb(254, 159, 50) !important';
            }
        }
    }
    
}
let restoreMacros = {
    0:'P - 250',
    1:'C - 193',
    2:'F - 86',
}
export function clearPlate(cleared) {
    current_portion = {};

    const indicators = [...document.querySelectorAll('.plate-indicator')];

    // lower indicator height
    indicators.map(ind => ind.style = `height:0`);

    let total_grams_children = [...totalGramsContainer.children];
        total_grams_children.map((child,idx) => {
            if(cleared){
                child.textContent = restoreMacros[idx]
            }
            currentPlateContainer.children[idx].textContent = restoreMacros[idx];
        })

        // clear results
        let chosen_items = [...search.select.children];
        chosen_items.map(ch => ch.remove());
}
function handleRemoval(e) {
    let target = e.target;
    let parent = target.parentElement;

    let children = [...parent.children].slice(2,-1);

    subtractMacros(children);

    parent.remove(); 
}

function handleQuantityInput(e,serving) {
    let parent = e.target.parentElement;

    let children = [...parent.children].slice(2,parent.children.length);
    
    children.map((child,index) => {
        // convert to number
        let num_str = +child.getAttribute('--data-grams')

        // multiply copy by quantity
        let getNum = (parseFloat(num_str) * parseFloat(e.target.value) / parseFloat(serving/28.35)).toFixed(1);

        child.textContent = (child.getAttribute('--data-set')[0].toUpperCase() + " - " + (getNum))||0;
    })
}

function getColorByPercentage(percentage) {
  // Handle overflow first
  if (percentage > 115) return '#EB2F2F'; // Red
  if (percentage < 0) return '#rgb(254, 159, 50)';   // Default to yellow for negative numbers
  
  if (percentage <= 25) {
    return '#rgb(254, 159, 50)'; // Yellow
  } else if (percentage <= 50) {
    return '#B5E325'; // Yellow-Green
  } else if (percentage <= 75) {
    return '#61D836'; // Light Green
  } else if (percentage <= 115) {
    return '#1EA32A'; // Dark Green
  }
}

