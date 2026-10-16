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
// ____________________________________________



// window events
// window.onbeforeunload = beforeUnload;



// functions

// beforeunload
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
        demographics.next.classList.remove('no-display');
    } else {
        demographics.next.classList.add('no-display');
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
    
    if(current_index > 0){
        current_index+=prev
    }
    
    global_direction = prev;

    // update the demo-bin
    updateBin(demographics)
    // clear new input value
    if(demographics.bin[demographics['inputs'][current_index]] == '') {
        demographics.element.value = ''
    } else {
        demographics.element.value = demographics.bin[demographics['inputs'][current_index]]
    }

    console.log(current_index)
    handleIteration()

    console.log(demographics.element)
    console.log(demographics.bin)
}

// find BMR - next input
function handleNext(e){

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
}

function handleGenderInput(e){

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
    
}

function handleCompleted(e){
    // empty value
    e.target.value = ''
}