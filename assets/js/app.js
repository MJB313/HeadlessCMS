const domain = "https://mmd2.jqt-website.com/";
const postsEndpoint = "wp-json/wp/v2/posts";
const getRealImageUrls = "?acf_format=standard";
const authEndpoint = "wp-json/jwt-auth/v1/token";


//fanger til DOM Manipulation

const resultEl = document.querySelector(".results")

init();

async function init() {
    try{

    
    const token = await getToken();
    const recipes = await getPublicRecipes(token);
    renderRecipes(recipes);
    } catch(err) {
        console.log(err)
        resultEl.innerHTML = "Der gik noget galt - øv. Det er vi kede af :( "
    }
}


async function getToken(){
    const userInfo = {
        username: "api-user",
        password: "3Sfy gDjQ hlmQ uFlT FMNW hb81"
    }

    const options = {
        method: "POST", // Vi vil sende data til WP
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
    }


    try{
    const res =  await fetch(domain + authEndpoint, options);
    const authResponse = await res.json();
    return authResponse.token;

    } catch(err){
        console.log('err:', err)
        resultEl.innerHTML = "Der gik noget galt med at hente Token..."
    }

}


async function getPublicRecipes(){

    const res = await fetch(domain + postsEndpoint);
    const recipes = await res.json();
    return recipes;

}



function renderRecipes(data) {
    if (Array.isArray(data)) {
        data.forEach(recipe => {
            console.log('recipe:', recipe)
            resultEl.innerHTML += `
            <article>
                <h2>${recipe.title.rendered}</h2>
                ${recipe.content.rendered}
            </article>
            `;
        })
    } else {
        resultEl.innerHTML += `
            <article>
                <h2>${data.title.rendered}</h2>
                ${data.content.rendered}
            </article>`
    }
}