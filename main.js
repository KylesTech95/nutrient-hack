import {handleMacros, hideMealPlanner, clearResults, clearPlate, mealPlanContainer, clearfoodItems, search} from "./macros.js"
import foodFacts from "./foodfacts.js";

// test food facts
foodFacts();

// find BMR
let next = 1, prev = -1, current_index = 0;
let global_direction = undefined;
let global_tdee;
export let demographics = {
    inputs:['height','weight','age','gender','complete'],
    element:document.querySelector('.demographics-input'),
    prev:document.getElementById('prev-arrow'),
    next:document.getElementById('next-arrow'),
    bin:{height:null}, // user input/data
    genderLocked: false,
    result:document.querySelector('#bmr-result > h4'),
    result2:document.querySelector('#tdee-result > h4'),
    result3:document.querySelector('#total-calorie-result > h4'),
    offset:'',
    final_tdee:'',
}
let fitness_goal = {
    0:'fat_loss',
    1:'fat_loss2',
    2:'lean_mass',
    3:'lean_mass2',
    4:'balanced'
}

let global_BMR = undefined;
// click prev/next buttons
demographics.prev.onclick = handlePrev
demographics.next.onclick = handleNext

// update BMR height placeholder
demographics['inputs'][current_index]==='height' ? demographics.element.setAttribute('placeholder',demographics['inputs'][current_index][0].toUpperCase() + demographics['inputs'][current_index].slice(1) + ' in inches (in)') : null;

// calculate TDEE (BMR x Activity level)
let activiy_locked = true;
// tdee input [select]
const tdee_selection = document.getElementById('tdee-selection')


// offset tiles
const original_percentages = ['15% - 20%','21% - 25%', '5% - 10%', '11% - 15%', '5% - 10%']
const offsetTiles = [...document.querySelectorAll('.offset-option')];
let offset_locked = true;

// interactive buttons 
export const interactive = {
    container:document.getElementById('interactive-scroll-container'),
    scroll:document.getElementById('scroll-btn')
}

interactive.scroll.onclick = handleScrollTarget;

let initialMove = true;

// ____________________________________________


// window events
window.onbeforeunload = beforeUnload;
window.onscroll = handleWindowScroll


// calculate level of activity
tdee_selection.onclick = (e) => calculateBMRAndActivity(e,global_BMR)


// functions

// beforeunload

// unsaved changes may not save
function beforeUnload(e) {  
    e.preventDefault()
    // trigger unsaved changes
    e.returnValue = '';
}
// confirm - go back
function goBack(){
    const message = 'Start over? Changes will not be saved.'
    let bool = confirm(message)

    if(!bool) {
        console.log('user did no confirm. cancel out');
        return false;
    } else {
        // clear plate
        clearPlate(true)
        return true;
    }
}

// find BMR - handle iteration
function handleIteration(){
    for(let i = 0; i < demographics['inputs'].length; i++) {
    
    // next and previous buttons
    if(current_index > 0) {
        demographics.prev.classList.remove('no-display');
    } else {
        demographics.prev.classList.add('no-display');
        // set initialMove to true
        initialMove = true;
    }
    
    if(current_index < demographics.inputs.length - 1) {
        demographics.next.textContent = 'NEXT';
        demographics.next.classList.remove('no-display');
    } else {
        demographics.next.classList.add('no-display');

        if(demographics['inputs'].slice(0,-1).every(val => Object.hasOwn(demographics.bin,val) && demographics.bin[val] !== '')){
            demographics.next.classList.remove('no-display');
            demographics.next.textContent = 'SUBMIT';
        }
    }
    
    // update the demo-bin
    // updateBin(demographics)

    
    // update the demo-element
    demographics.element.id = `input-${demographics['inputs'][current_index]}`
    demographics.element.setAttribute('name', demographics['inputs'][current_index])
    !demographics.genderLocked ? demographics.element.setAttribute('placeholder', demographics['inputs'][current_index]==='height' ? 
        demographics['inputs'][current_index][0].toUpperCase() + demographics['inputs'][current_index].slice(1) + ' in inches (in)' :
        demographics['inputs'][current_index]==='weight' ? demographics['inputs'][current_index][0].toUpperCase() + demographics['inputs'][current_index].slice(1) + ' in pounds (lbs)' :
        demographics['inputs'][current_index][0].toUpperCase() + demographics['inputs'][current_index].slice(1)
    ) : null;

    // if gender, update type to Text
    if(current_index > demographics['inputs'].length - 3) {
        demographics.genderLocked = true;
        demographics.element.setAttribute('type', 'text');

        // oninput function
        demographics.element.oninput = handleGenderInput;

        demographics.element.setAttribute('placeholder', 'M or F')

    } else {    
        demographics.genderLocked = false;
        demographics.element.setAttribute('type', 'number');
    }
    
    // if complete, update type to disabled input
    if(current_index > demographics['inputs'].length - 2) {
        // set value to completed
        demographics.element.value = 'Complete';

        delete demographics.bin['complete']

        // if some values are empty, disclose missing values, else show COMPLETE (need to fix)
        Object.values(demographics.bin).filter(empty=>empty==='').length > 0 ? 
        demographics.element.setAttribute('placeholder', `Missing: ${(demographics['inputs'].filter(k => k !== 'complete' && (demographics.bin[k] === '' || !Object.hasOwn(demographics.bin,k)) ? k : null).join`, `)}`) :
        demographics.element.setAttribute('placeholder', 'Complete');

        demographics.element.setAttribute('disabled',true)
        // demographics.element.oninput = handleCompleted;
    } else {
        demographics.element.removeAttribute('disabled')
    }
}
}
function handleWindowScroll(e) {
    // if offset selection is enabled
    if(!offset_locked && demographics.result3.textContent !== '') {
        // detect end of page
        if((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight*.75)) {
            interactive.container.classList.remove('no-display');
        } else {
            interactive.container.classList.add('no-display')
        }
    }
}
// update demo-bin
function updateBin(demographics){
    // update value on next or previous
    demographics.bin[`${demographics['inputs'][current_index-(global_direction)]}`] = demographics.element.value;
    
    let nextElement = document.getElementById(`${demographics['inputs'][current_index]}-input`);
}

// find BMR - previous input
function handlePrev(e){

    if(!initialMove && !goBack()){
        console.log('handlePrev: cancel');
        e.preventDefault();
        return;
    };


    // hide meal planner
    hideMealPlanner();

    // hide serach results and chosen items
    clearResults()
    clearfoodItems([...search.select.children])

    // hide display scroll-button
    interactive.container.classList.add('no-display');

    // restore offset
    restoreOffset();
    
    // disable tiles
    offset_locked = true;
    offsetTiles.map(tile => {

        tile.classList.remove('offset-clicked')
        // remove class
        tile.classList.add('unclickable');
    })


    // if current idx is complete [last], set current idx to heihgt [0]
    if(current_index === demographics['inputs'].length - 1 && activiy_locked === false){
        current_index = 0;
    }

    // lock activity level
    activiy_locked = true;

    // update tdee_selection value & disable
    tdee_selection.value = "";
    tdee_selection.setAttribute('disabled',true);

    // clear BMR result on PREV click
    demographics.result.textContent = '';
    // clear tdee-result
    demographics.result2.textContent = '';
    // clear total-calorie-result
    demographics.result3.textContent = '';
    
    if(current_index > 0){
        current_index+=prev
    }
    
    global_direction = prev;

    // update the demo-bin
    updateBin(demographics);
    
    handleInputInteractions();

    handleIteration();

    handleInputInteractions();

    // focus on element
    demographics.element.focus();
}

// find BMR - next input
function handleNext(e){

    if(demographics.next.textContent === 'NEXT'){
        if(current_index < demographics.inputs.length){
            current_index+=next
        }

        global_direction = next;

        // update the demo-bin
        updateBin(demographics)
        // clear new input value
        if(!demographics.bin[demographics['inputs'][current_index]]) {
            demographics.element.value = ''
        } else {
            demographics.element.value = demographics.bin[demographics['inputs'][current_index]] || String.toString(demographics.bin[demographics['inputs'][current_index]])
        }

        handleIteration()
        

    } else {
        // submit bmr to the board
        handleBMRSubmission(demographics.bin);

        // unlock activity level
        activiy_locked = false;
        unlockActivityLevel();
        
        // remove submit [next] button
        demographics.next.classList.add('no-display');
    }

    handleInputInteractions()

    // focus on element
    if(current_index !== demographics['inputs'].length - 1) {
        demographics.element.focus()
    }
}

function handleBMRSubmission(bin){
    // remove complete property from bin
    delete bin.complete;

    // convert weight from pounds to kg
    bin.weight /= 2.205

    // convert height from inches to cm
    bin.height *= 2.54


    // calculate client BMR
    calculateBMR(bin);

}

function unlockActivityLevel(locked) {

    if(locked) {
        console.error('TDEE activity level: Locked')
    } else {
        console.log("%cTDEE activity level: unlocked","color: lime; font-weight: bold;");
    }

    tdee_selection.removeAttribute('disabled');
    
    // click tdee
    // tdee_selection.click();

    // scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);

}

function calculateBMRAndActivity(e,bmr) {
    // hide meal planner
    hideMealPlanner();

    // hide serach results and chosen items
    clearResults()
    clearfoodItems([...search.select.children])

    // hide display scroll-button
    interactive.container.classList.add('no-display');

    // clear total-calorie-result
    demographics.result3.textContent = '';
    // restore offsets
    restoreOffset()

    let select = e.target;

    // store bmr in original
    let original_bmr = Number(bmr.toString().slice());
    let result;
    let value = +select.value
    
    // tdee = BMR x Activity level
    result = Math.ceil(bmr *= value);
    
    global_tdee = result;


    // send global_bmr to original
    bmr = original_bmr;

    // update TDEE result
    demographics.result2.textContent && value > 0 ? demographics.result2.textContent = `TDEE = ${result} kcal` : demographics.result2.textContent = `Choose an option`;

    if(select.value !== '') {
        // unlock offset
        offset_locked = false;
        unlockOffset();
        select.setAttribute('disabled',true)
    } else {
        console.error('error: select a valid option');
        restoreOffset();
        lockOffset();
        select.removeAttribute('disabled')

    }
}
export function lockOffset(){
    offset_locked = true;
    // lock tiles
    offsetTiles.map((tile,i) => {
        // remove class
        tile.classList.add('unclickable')
    })
}
function unlockOffset() {
    if(offset_locked) {
        console.error('error: offset is locked');
        return;
    }

    offsetTiles.map((tile,i) => {
        // remove class
        tile.classList.remove('unclickable')

        // click
        tile.onclick = e => handleOffsetClick(e,i);
    })
    
}

function handlePercentageOptions(percentages) {
    let numbers = percentages.match(/\d+/g);
    // convert string to number
    numbers = numbers.map(n=>Number(n));

    numbers.splice(1,0,numbers.reduce((a,b)=>a+b)/2);

    return numbers;
}
function handleOffsetClick(e,index) {

    // hide scroll button
    interactive.container.classList.add('no-display')
    // reset tdee
    demographics.result2.textContent = `TDEE = ${global_tdee} kcal`;
    demographics.result3.textContent = ``;

    hideMealPlanner()

    // initialMove is over - set to false
    initialMove = false;
    
    // restore offset
    restoreOffset()

    const tile = e.currentTarget;

    tile.classList.add('offset-clicked')

    // update tile percentage -> options for client
    let percentages = [...tile.children][1];
    
    if(percentages.textContent && !percentages.classList.contains('div-tag')){
        // method that returns an array of percentages to choose from
        let percentage_options = handlePercentageOptions(percentages.textContent);

        // if div-tag is open
            // 1. Create a new <div> element
            const divTag = document.createElement("div");

            // 2. Copy over the contents
            divTag.innerHTML = '';

            // 3. Optional: Copy over attributes (like classes or IDs)
            for (const attr of percentages.attributes) {
            divTag.setAttribute(attr.name, attr.value);
            }

            // 4. Swap the <p> tag with the new <div> in the DOM hierarchy
            percentages.replaceWith(divTag);

            // 5. create p tags & store inside div
            percentage_options.map(n => {
                let pTag = document.createElement('p');
                pTag.textContent = n + "%"

            // repalce children within div
                divTag.appendChild(pTag);
                
            });

            // lock the average - DEFAULT
            // divTag.children[1].classList.add('lock-percentage');
            
            // store in demographics[offset]
            let [per,type] = [divTag.children[1].textContent.slice(0,-1),tile.children[2].textContent];
            demographics.offset = `${per} ${type}`;
            // calculateTDEEWithOffset(demographics.offset);

            // 6. update divtag class
            divTag.classList.add('div-tag')

            // 7. expand the tile
            tile.classList.add('expand-tile')

            // 8. divTag p click
            let ops = [...divTag.children].map(o => {
                o.onclick = e => {
                        let restore = [...divTag.children].map(h => h.classList.remove('lock-percentage'));
                        
                        // prevent tile click
                        e.stopPropagation();

                        // lock percentage 
                        e.target.classList.add('lock-percentage');

                        // get target percentage and type [LOSS | GAIN]
                        let [per,type] = [e.target.textContent, tile.children[2].textContent];

                        // store in demographics[offset]
                        demographics.offset = `${per} ${type}`;

                        if(demographics.offset && demographics.offset !== '') {
                        calculateTDEEWithOffset(demographics.offset);
                        handleMacros(demographics.final_tdee, fitness_goal[index]);

                        // scroll to top of page
                        window.scrollTo(0,0)

                        // clear plate
                        clearPlate(false);
                    }
                }
            })
    }
    
}

function calculateTDEEWithOffset(offset) {
    let get_percentage = offset.slice().match(/^\d+/);
    let gain_or_loss = offset.slice().match(/(GAIN|LOSS)/);
    let per = (Number(get_percentage[0]) / 100);

    let tdee = +global_tdee;
    let g_l = gain_or_loss[0]
    let tdee_chunk = +((tdee * per).toFixed(2));


    // update demographics final tdee
    demographics.final_tdee = g_l === 'LOSS' ?  tdee -= tdee_chunk : tdee += tdee_chunk ;

    // update demographics.result2 (tdee display)
    demographics.result2.textContent = `TDEE = ${(demographics.final_tdee)} kcal (${tdee_chunk} kcal ${g_l[0].toUpperCase() + g_l.slice(1).toLowerCase()})`;
    // update demographics.result3 (tdee display)
    demographics.result3.textContent = `Total consumption = ${(demographics.final_tdee)} kcal`;
}
// handleGenderInput
function handleGenderInput(e){

    if(demographics['inputs'][current_index] === 'gender'){
        let value = (e.target.value);
    
        const isValid = /^(m|f)$/ig.test(value);

        if(!isValid){
            console.log('is not valid')
            e.target.value = ''
        } else {
            console.log('is valid')
            e.target.value = value.toUpperCase();
        }
    } else {
        e.preventDefault();
    }
    
}

// handleCompleted
function handleCompleted(e){
    // empty value
    e.target.value = ''
}

// Input interactions
function handleInputInteractions(){
    // input interactions
    if(!Object.hasOwn(demographics.bin,demographics['inputs'][current_index])
        || 
       (Object.hasOwn(demographics.bin,demographics['inputs'][current_index]) && 
        demographics.bin[demographics['inputs'][current_index]] === '')) {

        demographics.element.classList.remove('already-there');
        demographics.element.value = ''
    } else {
        demographics.element.value = demographics.bin[demographics['inputs'][current_index]] || '';
        demographics.element.classList.add('already-there');
    }
}

// calculateBMR
function calculateBMR(bin){

    // validate bin
    if(!bin){
        console.error('error: check your bin')
        return 
    }


    bin.age = +bin.age;
    bin.height = +bin.height
    bin.weight = parseFloat(bin.weight.toFixed(2))
    
    BMI_FORMULA(bin.height,bin.weight,bin.gender,bin.age);

    if(global_BMR) global_BMR = Math.ceil(global_BMR)

    demographics.bin = {};

    demographics.result.textContent = `BMR = ${global_BMR} kcal`

    // scroll to bottom
    window.scrollTo(0, document.body.scrollHeight);
}

// formula
let BMI_FORMULA = (height,weight,gender,age) => gender === 'M' ? 
    global_BMR = (10 * weight) + (6.25 * height) - (5 * age) + 5 :
    gender === 'F' ? 
    global_BMR = (10 * weight) + (6.25 * height) - (5 * age) - 161 :
    undefined;

// restore offset
export function restoreOffset(){
    offsetTiles.map((t,index )=> {
        // remove offset borders | target indication
        t.classList.remove('offset-clicked');
        // remove expanded class
        t.classList.remove('expand-tile');

        // store original percentages
        let p = t.children[1];

        // if div-tag exists
        if(p.classList.contains('div-tag')){
            // create new p tag
            let new_p_tag = document.createElement('p');
            // update textcontent to the percentage by index
            new_p_tag.textContent = original_percentages[index];

            // remove [div-tag] div element
            p.remove();
            t.children[1].before(new_p_tag);
        }
    })
}

function handleScrollUp(e) {
    const target = e.target || interactive.scroll;

    if(!target) {
        console.error('error: check target item');
        return;
    }

    interactive.container.classList.add('no-display');

    // scroll to top of page
    window.scrollTo(0,0)
}

export function handleScrollTarget(e) {
    const target = e.target || interactive.scroll;

    interactive.container.classList.add('no-display');

    window.onbeforeUnload = null;
    location.href = location.origin + "#total-calorie-result"

}