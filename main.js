// find BMR
let next = 1, prev = -1, current_index = 0;
let global_direction = undefined;
let demographics = {
    inputs:['height','weight','age','gender','complete'],
    element:document.querySelector('.demographics-input'),
    prev:document.getElementById('prev-arrow'),
    next:document.getElementById('next-arrow'),
    bin:{height:null}, // user input/data
    genderLocked: false,
    result:document.querySelector('#bmr-result > h4'),
    result2:document.querySelector('#tdee-result > h4'),
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
const offsetTiles = [...document.querySelectorAll('.offset-option')];
let offset_locked = true;
// ____________________________________________


// window events
// window.onbeforeunload = beforeUnload;



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

// find BMR - handle iteration
function handleIteration(){
    for(let i = 0; i < demographics['inputs'].length; i++) {
    
    // next and previous buttons
    if(current_index > 0) {
        demographics.prev.classList.remove('no-display');
    } else {
        demographics.prev.classList.add('no-display');
    }
    
    if(current_index < demographics.inputs.length - 1) {
        demographics.next.textContent = 'NEXT';
        demographics.next.classList.remove('no-display');
    } else {
        demographics.next.classList.add('no-display');

        if(demographics['inputs'].slice(0,-1).every(val => Object.hasOwn(demographics.bin,val) && demographics.bin[val] !== '')){
            console.log('all bins full');
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

// update demo-bin
function updateBin(demographics){
    // update value on next or previous
    demographics.bin[`${demographics['inputs'][current_index-(global_direction)]}`] = demographics.element.value;
    
    let nextElement = document.getElementById(`${demographics['inputs'][current_index]}-input`);
    console.log(nextElement);
    
}

// find BMR - previous input
function handlePrev(e){
    
    // disable tiles
    offset_locked = true;
    offsetTiles.map(tile => {
        
        tile.classList.remove('offset-clicked')
        // remove class
        tile.classList.add('unclickable');
    })

    // clear BMR result on PREV click
    demographics.result.textContent = '';

    // if current idx is complete [last], set current idx to heihgt [0]
    if(current_index === demographics['inputs'].length - 1 && activiy_locked === false){
        current_index = 0;
    }

    // lock activity level
    activiy_locked = true;

    // update tdee_selection value & disable
    tdee_selection.value = "";
    tdee_selection.setAttribute('disabled',true);
    // clear tdee-result
    demographics.result2.textContent = '';
    
    if(current_index > 0){
        current_index+=prev
    }
    
    global_direction = prev;

    // update the demo-bin
    updateBin(demographics);
    
    handleInputInteractions();

    console.log(current_index);
    handleIteration();

    console.log(demographics.element);
    console.log(demographics.bin);

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

        console.log(current_index)
        handleIteration()
        

        console.log(demographics.element)
        console.log(demographics.bin)
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

    console.log(bin.weight)

    // convert weight from pounds to kg
    bin.weight /= 2.205

    // convert height from inches to cm
    bin.height *= 2.54

    console.log(bin.weight)

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
    let select = e.target;
    console.log(select)
    console.log(select.value)

    // store bmr in original
    let original_bmr = Number(bmr.toString().slice());
    let result;
    let value = +select.value

    

    result = Math.ceil(bmr *= value);
    console.log(result)


    // send global_bmr to original
    bmr = original_bmr;

    console.log(bmr)

    // update TDEE result
    demographics.result2.textContent && value > 0 ? demographics.result2.textContent = `TDEE = ${result} kcal` : demographics.result2.textContent = `Choose an option`;

    // unlock offset
    offset_locked = false;
    unlockOffset()
}

function unlockOffset() {
    if(offset_locked) {
        console.error('error: offset is locked');
        return;
    }

    offsetTiles.map(tile => {
        // remove class
        tile.classList.remove('unclickable')

        // click
        tile.onclick = handleOffsetClick;
    })
    

}

function handleOffsetClick(e) {
    offsetTiles.map(tile => tile.classList.remove('offset-clicked'))
    const tile = e.currentTarget;

    tile.classList.add('offset-clicked')

}
// handleGenderInput
function handleGenderInput(e){

    if(demographics['inputs'][current_index] === 'gender'){
        let value = (e.target.value);
    
        const isValid = /^(m|f)$/ig.test(value);

        console.log(isValid)
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
    console.log(demographics['inputs'][current_index])
    console.log(demographics.bin)
    if(!Object.hasOwn(demographics.bin,demographics['inputs'][current_index])
        || 
       (Object.hasOwn(demographics.bin,demographics['inputs'][current_index]) && 
        demographics.bin[demographics['inputs'][current_index]] === '')) {

        console.log('not there')
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