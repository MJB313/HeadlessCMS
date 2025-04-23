// Her får vi erklæret vores variabler
const domain = "https://mmd2.jqt-website.com/";
const postsEndpoint = "wp-json/wp/v2/posts";
const authEndpoint = "wp-json/jwt-auth/v1/token";
const resultEl = document.querySelector(".recipeCard");
 
// Konfiguration til filtrering, her beskriver hvilken type data hvert filter felt er
const filterConfig = {
  svaerhedsgrad: { path: "acf.svaerhedsgrad", type: "string" },
  svaerhedsgradtid: { path: "svaerhedsgradtid", type: "array" },
  maltidstypefase: { path: "maltidstypefase", type: "array" },
  sortering: { path: "sortering", type: "array" },
  cuisine: { path: "cuisine", type: "array" },
  "kost-praeference": { path: "kost-praeference", type: "array" },
  allergener: { path: "allergener", type: "array" },
};
 
 
let allRecipes = []; // Alle opskrifter gemmes her
 
// Initiering køres ved start
init();
 
async function init() {
  try {
    await getToken(); // Henter auth token
    allRecipes = await fetch(`${domain}${postsEndpoint}?per_page=100`).then(
      (res) => res.json()
    ); // Henter opskrifter
    renderRecipes(allRecipes); // Viser opskrifter
    setupFilterListeners(); // Aktiverer filter lyttere
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = "<p>Der gik noget galt :(</p>"; // Fejlbesked
  }
}
 
// Funktion til at hente token via login API
async function getToken() {
  await fetch(domain + authEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "api-user",
      password: "3Sfy gDjQ hlmQ uFlT FMNW hb81",
    }),
  });
}
 
// Viser opskrifter i DOM’en
function renderRecipes(recipes) {
  resultEl.innerHTML = recipes.length
    ? recipes
        .map(
          (r) => `
      <div class="recipe">
        ${
          r.acf?.opskrift_billede?.url
            ? `<img src="${r.acf.opskrift_billede.url}" loading="lazy" alt="${
                r.acf.opskrift_billede.alt || ""
              }">`
            : ""
        }
        <i class="fa-solid fa-heart"></i>
        <p>${r.acf?.varighed_i_minutter || ""} | Sværhedsgrad: ${
            r.acf?.svaerhedsgrad || ""
          }</p>
        <h3>${r.acf?.titel || ""}</h3>
      </div>
    `
        )
        .join("")
    : "<p>Ingen opskrifter fundet.</p>";
}
 
// Opsætter event listeners på alle filtre
function setupFilterListeners() {
  document.querySelectorAll("input[type='checkbox']").forEach((cb) =>
    cb.addEventListener("change", () => {
      const filters = getSelectedFilters(); // Henter valgte filtre
      const filtered = applyFilters(filters); // Filtrerer opskrifter
      renderRecipes(filtered); // Viser de filtrerede opskrifter
    })
  );
}
 
// Henter hvilke filtre der er valgt, og sorterer dem efter type
function getSelectedFilters() {
  const checkboxes = Array.from(
    document.querySelectorAll("input[type='checkbox']:checked")
  );
  const filters = {};
 
  checkboxes.forEach((checkbox) => {
    const id = parseInt(checkbox.id, 10);
    const name = checkbox.name.toLowerCase();
 
    // Her grupperes filtre efter navne
    const categoryMap = {
      maltidstypefase: [
        "morgenmad",
        "frokost",
        "aftensmad",
        "forret",
        "hovedret",
        "dessert",
      ],
      sortering: ["bedst bedømte", "mest populære", "nyeste"],
      cuisine: [
        "amerikansk",
        "engelsk",
        "fransk",
        "indisk",
        "italiensk",
        "japansk",
        "kinesisk",
        "mexicansk",
        "spansk",
        "svensk",
        "thai",
      ],
      "kost-praeference": [
        "canivore",
        "halal",
        "helse",
        "omnivore",
        "pesktarisk",
        "vegansk",
        "vegetarisk",
      ],
      allergener: ["glutenfri", "laktosefri", "mælkefri", "nøddefri"],
      svaerhedsgrad: ["begynder", "moderat", "avanceret"],
      svaerhedsgradtid: ["0-30 min", "30-60 min", "60 min+"],
    };
 
    // Finder hvilket filter den aktuelle checkbox hører til
    const key = Object.entries(categoryMap).find(([, values]) =>
      values.includes(name)
    )?.[0];
    if (!key) return;
 
    // Tilføjer filter værdi til korrekt kategori
    (filters[key] = filters[key] || []).push(
      filterConfig[key].type === "array" ? id : checkbox.value
    );
  });
 
  return filters;
}
 
// Henter værdien fra objekt via sti som for eksempel "acf.svaerhedsgrad"
function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => o?.[k], obj);
}
 
// Filtrerer alle opskrifter ud fra valgte filtre
function applyFilters(filters) {
  return allRecipes.filter((recipe) =>
    Object.entries(filters).every(([key, values]) => {
      const { path, type } = filterConfig[key];
      const data = getNestedValue(recipe, path);
 
      // Specielt tilfælde: kun første element fra svaerhedsgradtid bruges
      if (key === "svaerhedsgradtid") {
        const first = Array.isArray(data) ? data[0] : null;
        return first != null && values.includes(first);
      }
 
      if (type === "string") return values.includes(data);
      if (type === "array")
        return Array.isArray(data) && values.some((v) => data.includes(v));
      return false;
    })
  );
}
 
// Tilføjer funktionalitet til at like opskrifter med hjerteikon
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("fa-heart")) {
    e.target.classList.toggle("liked");
  }
});
 
 
// Vi fanger reset og alle vores valgte inputs der har (type= "checkbox")
const resetButton = document.querySelector("#reset");
const inputs = document.querySelectorAll("aside input[type='checkbox']");
 
// Vi lytter efter et "click" på vores reset knap, looper igennem hvert input, lytter om inputtede er checkede, hvis ja bliver det sat til false og reloader siden.
resetButton.addEventListener("click", () => {
  inputs.forEach((input) => {
    input.checked = false
    location.reload();
  });
})


// Opskirft side: Opskrift til antal personer.
// Her laver jeg et objekt med arrays i den, har navn, kvantitet, og unit( hvad ingrediensen er).
const originalIngredients = [
  { name: "Stænger smør", quantity: 2, unit: "stænger" },
  { name: "Store æg", quantity: 3, unit: "æg" },
  { name: "Flormelis", quantity: 2, unit: "teskefulde" },
  { name: "Smør", quantity: 2, unit: "spiseskefulde" },
  { name: "Mel", quantity: 2, unit: "spiseskefulde" },
  { name: "Kagehvedemel", quantity: 311, unit: "gram" },
  { name: "Fint salt", quantity: 2, unit: "teskefulde" },
  { name: "Bagepulver", quantity: 2, unit: "teskefulde" },
  { name: "Natron", quantity: 0.25, unit: "teskefuld" },
  { name: "Rød madfarvegelé", quantity: 1, unit: "teskefuld" },
];
 
// her opdatere jeg recipien, når man laver et input i feltet på hjemmesiden, og laver en ratio, hvor på elmo opskriften er opskriftet til 12-20 personer, så jeg tog udgangspunkt i midten af de to med 16 personers servering.
 
function updateRecipe() {
  const servings = parseInt(document.getElementById("serving-count").value);
  const servingsRatio = servings / 16;
  const ingredientsContainer = document.getElementById("recipe-ingredients");
// Den her er for at resette funktionen, så den kan begynde at kalkulere hvor meget der skal bruget til nummeret der er sat ind.
  ingredientsContainer.innerHTML = "";
 
  originalIngredients.forEach((ingredient) => {
    const newQuantity = ingredient.quantity * servingsRatio;
    const ingredientElement = document.createElement("p");
    ingredientElement.textContent = `${ingredient.name}: ${newQuantity.toFixed(
      1
    )} ${ingredient.unit}`;
    ingredientsContainer.appendChild(ingredientElement);
  });
}

//   Det her er til den linje der overstrejer step i fremgangsmåden, når checkboxen er grøn/cheket af.

// Starter med at queryselect min CSS class. Og derefter select step_text i min css, som er min span text ud fra hver checkbox, så jeg kan forbinde de to.
// Derefter har jeg en for each, en for når den er checked og når den er tom, så texten er overstreget kun når boxen er tjekket af
document
  .querySelectorAll('.opskrift_step input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const textSpan = checkbox
        .closest(".opskrift_step")
        .querySelector(".step_text");
      if (checkbox.checked) {
        textSpan.classList.add("checked");
      } else {
        textSpan.classList.remove("checked");
      }
    });
  });


fetch('https://mmd2.jqt-website.com/wp-json/wp/v2/posts/134')
  .then(response => response.json())
  .then(post => {
    console.log('Post data:', post);
    const difficulty = post.acf?.svaerhedsgrad || 'Ikke angivet';
    const timer = post.acf?.varighed_i_minutter || 'Ikke angivet';
    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || '';


    if (imageUrl) {
    document.querySelector('.opskrift_intro img').src = imageUrl;
    }
    const difficultyElement = document.querySelector('.opskrift_tid_span:nth-child(2)');
    difficultyElement.innerHTML = `
      <span class="material-icons">stairs</span> Sværhedsgrad: ${difficulty}`;

    const timerElement = document.querySelector('.opskrift_tid_span:nth-child(1)');
    timerElement.innerHTML = `
    <span class="material-icons">timer</span> Tid:${timer}`;


    // Sæt titel
    document.getElementById('recipe-title').innerHTML = post.title.rendered;

    // Sæt beskrivelse - her bruger jeg hele content (du kan evt. bruge excerpt hvis det findes)
    document.getElementById('recipe-description').innerHTML = post.excerpt.rendered || post.content.rendered;
  })

  .catch(error => {
    console.error('Fejl ved hentning:', error);
  });

