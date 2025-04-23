const domain = "https://mmd2.jqt-website.com/";
const postsEndpoint = "wp-json/wp/v2/posts";
const getRealImageUrls = "?acf_format=standard";
const authEndpoint = "wp-json/jwt-auth/v1/token";
 
fetch("https://mmd2.jqt-website.com/wp-json/wp/v2/svaerhedsgradtid")
  .then((response) => response.json())
 
  .then((svaerhedsgradtid) => {
    console.log(svaerhedsgradtid);
  });
 
//fanger til DOM Manipulation
 
const resultEl = document.querySelector(".recipeCard");
 
init();
 
async function init() {
  try {
    const token = await getToken();
    const recipes = await getPublicRecipes(token);
    renderRecipes(recipes);
  } catch (err) {
    console.log(err);
    resultEl.innerHTML = "Der gik noget galt - øv. Det er vi kede af :( ";
  }
}
 
async function getToken() {
  const userInfo = {
    username: "api-user",
    password: "3Sfy gDjQ hlmQ uFlT FMNW hb81",
  };
 
  const options = {
    method: "POST", // Vi vil sende data til WP
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userInfo),
  };
 
  try {
    const res = await fetch(domain + authEndpoint, options);
    const authResponse = await res.json();
    return authResponse.token;
  } catch (err) {
    console.log("err:", err);
    resultEl.innerHTML = "Der gik noget galt med at hente Token...";
  }
}
 
async function getPublicRecipes() {
  const res = await fetch(domain + postsEndpoint + "?per_page=100");
  const recipes = await res.json();
  return recipes;
}
 
function renderRecipes(data) {
  if (Array.isArray(data)) {
    data.forEach((recipe) => {
      console.log("recipe:", recipe);
      resultEl.innerHTML += `
          <div>
            <img src="${recipe.acf.opskrift_billede.url}" alt="${recipe.acf.opskrift_billede.alt}">
            <i class="fa-solid fa-heart"></i>
            <p>${recipe.acf.varighed_i_minutter} | Sværhedsgrad: ${recipe.acf.svaerhedsgrad}</p>
            <h3>${recipe.acf.titel}</h3>
          </div>
            `;
    });
  } else {
    resultEl.innerHTML += `
            <article>
                <h2>${data.title.rendered}</h2>
                ${data.content.rendered}
            </article>`;
  }
}
 
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("fa-heart")) {
      e.target.classList.toggle("liked");
    }
  });
});


// Update init() to store all recipes
async function init() {
  try {
    const token = await getToken();
    const recipes = await getPublicRecipes(token);
    renderRecipes(recipes);
  } catch (err) {
    console.log(err);
    resultEl.innerHTML = "Der gik noget galt - øv. Det er vi kede af :( ";
  }
}


