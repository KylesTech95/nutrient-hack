export default async function foodFacts(){
    // test open-food-facts REST API
    const res = await fetch("https://world.openfoodfacts.org/api/v2/product/737628064502.json", {
    headers: { "User-Agent": "MyFoodApp/1.0 (contact@example.com)" },
    });

    const { product } = await res.json();


    console.log(product.product_name, product.nutriscore_grade);
    console.log(product.nutriments)
}