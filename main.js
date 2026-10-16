










// window events
// window.onbeforeunload = beforeUnload;



// functions
function beforeUnload(e) {  
    e.preventDefault()
    // trigger unsaved changes
    e.returnValue = '';
}