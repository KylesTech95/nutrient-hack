import { restoreOffset, lockOffset, demographics, interactive } from "./main.js";
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

    console.log(howManyMeals)
    
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
        example[i].textContent = getMacro[0].toUpperCase() + "- " + (o[getMacro]['grams']).toFixed(2);

        // setup current plate textcontent
        target[i].textContent = getMacro[0].toUpperCase() + "- " + (o[getMacro]['per_meal']).toFixed(2);
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

    clearResults()

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

        li.onclick = selectFood;
    })

    if(e.target.value === '') clearResults();

}

function createSearchResult(item) {

    let li = document.createElement('li');
    let food = document.createElement('p');
    let proteins = document.createElement('p');
    let carbs = document.createElement('p');
    let fats = document.createElement('p');

    food.textContent = item.item;
    proteins.textContent = 'P - ' + item.proteins;
    carbs.textContent = 'C - ' + item.carbs;
    fats.textContent = 'F - ' + item.fats;

    food.classList.add('column-label');
    proteins.classList.add('column-label');
    carbs.classList.add('column-label');
    fats.classList.add('column-label');
    
    proteins.setAttribute('--data-set', 'proteins');
    carbs.setAttribute('--data-set', 'carbs');
    fats.setAttribute('--data-set', 'fats');

    let arr = [food,proteins,carbs,fats]
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
    let cloned = (item.currentTarget).cloneNode(true);
    search.select.append(cloned);
}