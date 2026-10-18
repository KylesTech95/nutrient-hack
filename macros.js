
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
export default function handleMacros(tdee,type) {
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

        current_portion[property] = {
            kcal:Number(portion),
            grams:convertKcalToGram(Number(portion),units[property])
        };
    }

    console.log(current_portion)
}

function convertKcalToGram(num,unit) {

    if(!num || typeof num !== 'number'){
        console.error('error: check argument to convert')
        return;
    }

    return Number((num /= unit).toFixed(2));
}