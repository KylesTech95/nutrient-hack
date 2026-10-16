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
}
// click prev/next buttons
demographics.prev.onclick = handlePrev
demographics.next.onclick = handleNext


// calculate TDEE (BMR x Activity level)
let activiy_locked = true;
// tdee input [select]
const tdee_selection = document.getElementById('tdee-selection')
// ____________________________________________


// window events
// window.onbeforeunload = beforeUnload;



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
    !demographics.genderLocked ? demographics.element.setAttribute('placeholder', demographics['inputs'][current_index][0].toUpperCase() + demographics['inputs'][current_index].slice(1)) : null;

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
        demographics.element.setAttribute('placeholder', 'Completed');
        demographics.element.oninput = handleCompleted;
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
    // lock activity level
    activiy_locked = true;
    tdee_selection.setAttribute('disabled',true)
    
    if(current_index > 0){
        current_index+=prev
    }
    
    global_direction = prev;

    // update the demo-bin
    updateBin(demographics)

    handleInputInteractions()

    console.log(current_index)
    handleIteration()

    console.log(demographics.element)
    console.log(demographics.bin)

    handleInputInteractions()
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
}

function handleBMRSubmission(bin){
    delete bin.complete;
    console.log(bin);
}

function unlockActivityLevel(locked) {

    if(locked) {
        console.error('TDEE activity level: Locked')
    } else {
        console.log("%cTDEE activity level: unlocked","color: lime; font-weight: bold;");
    }

    console.log(tdee_selection)
    tdee_selection.removeAttribute('disabled');
}

// handleGenderInput
function handleGenderInput(e){

    if(demographics['inputs'][current_index] === 'gender'){
        let value = (e.target.value);
    
        const isValid = /^(m|f)$/g.test(value);

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