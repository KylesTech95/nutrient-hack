
let portions = {
    fat_loss:{proteins:40,carbs:40,fats:20},

    fat_loss2:{proteins:40,carbs:40,fats:20},

    lean_mass:{proteins:35,carbs:35,fats:30},

    lean_mass2:{proteins:35,carbs:35,fats:30},

    balanced:{proteins:30,carbs:40,fats:30},
}


export default function handleMacros(tdee,type) {
    // method
    let portion = portions[type];

    console.log(type)
    
    console.log('get macros')
    console.log(tdee);

    for(let property in portion) {
        console.log("percentage",portion[property])
        console.log("result", tdee * (portion[property]/100))
    }
}