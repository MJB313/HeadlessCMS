const domain = "https://mmd2.jqt-website.com/";
const postsEndpoint = "wp-json/wp/v2/posts";
const authEndpoint = "wp-json/jwt-auth/v1/token";
const resultEl = document.querySelector(".recipeCard");

const filterConfig = {
  svaerhedsgrad:      { path: "acf.svaerhedsgrad",       type: "string" },
  svaerhedsgradtid:   { path: "svaerhedsgradtid",        type: "array"  },
  maltidstypefase:    { path: "maltidstypefase",         type: "array"  },
  sortering:          { path: "sortering",               type: "array"  },
  cuisine:            { path: "cuisine",                 type: "array"  },
  "kost-praeference": { path: "kost-praeference",        type: "array"  },
  allergener:         { path: "allergener",              type: "array"  }
};

let allRecipes = [];

init();
async function init() {
  try {
    await getToken(); // if needed
    allRecipes = await getPublicRecipes();
    renderRecipes(allRecipes);
    setupFilterListeners();
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = "<p>Der gik noget galt :(</p>";
  }
}

async function getToken() {
  const res = await fetch(domain + authEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "api-user",
      password: "3Sfy gDjQ hlmQ uFlT FMNW hb81"
    })
  });
  return (await res.json()).token;
}

async function getPublicRecipes() {
  const res = await fetch(`${domain}${postsEndpoint}?per_page=100`);
  return await res.json();
}

function renderRecipes(recipes) {
  resultEl.innerHTML = "";
  if (recipes.length === 0) {
    resultEl.innerHTML = "<p>Ingen opskrifter fundet.</p>";
    return;
  }
  recipes.forEach(r => {
    resultEl.innerHTML += `
      <div class="recipe">
        ${r.acf?.opskrift_billede?.url ? `<img src="${r.acf.opskrift_billede.url}" alt="${r.acf.opskrift_billede.alt || ""}">` : ""}
        <i class="fa-solid fa-heart"></i>
        <p>${r.acf?.varighed_i_minutter || ""} | Sværhedsgrad: ${r.acf?.svaerhedsgrad || ""}</p>
        <h3>${r.acf?.titel || ""}</h3>
      </div>`;
  });
  removeEmptyCards();
}

function removeEmptyCards() {
  const allCards = document.querySelectorAll(".recipe");
  allCards.forEach(card => {
    if (!card.textContent.trim() || card.innerHTML.trim() === "") {
      card.remove();
    }
  });
}

function setupFilterListeners() {
  document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", () => {
      const filters = getSelectedFilters();
      const filtered = applyFilters(filters);
      renderRecipes(filtered);
    });
  });
}

function getSelectedFilters() {
  const sel = Array.from(document.querySelectorAll("input[type='checkbox']:checked"));
  const filters = {};
  sel.forEach(cb => {
    const id = parseInt(cb.id, 10);
    const name = cb.name.toLowerCase();
    let key = "";

    if (["morgenmad","frokost","aftensmad","forret","hovedret","dessert"].includes(name)) key = "maltidstypefase";
    else if (["bedst bedømte","mest populære","nyeste"].includes(name)) key = "sortering";
    else if (["amerikansk","engelsk","fransk","indisk","italiensk","japansk","kinesisk","mexicansk","spansk","svensk","thai"].includes(name)) key = "cuisine";
    else if (["canivore","halal","helse","omnivore","pesktarisk","vegansk","vegetarisk"].includes(name)) key = "kost-praeference";
    else if (["glutenfri","laktosefri","mælkefri","nøddefri"].includes(name)) key = "allergener";
    else if (["begynder","moderat","avanceret"].includes(name)) key = "svaerhedsgrad";
    else if (["0-30 min","30-60 min","60 min+"].includes(name)) key = "svaerhedsgradtid";

    if (!key) return;
    (filters[key] = filters[key]||[]).push(
      filterConfig[key].type === "array" ? id : cb.value
    );
  });
  return filters;
}

function getNestedValue(obj, path) {
  return path.split(".").reduce((o,k) => o?.[k], obj);
}

function applyFilters(filters) {
  return allRecipes.filter(recipe => {
    return Object.entries(filters).every(([key, vals]) => {
      const { path, type } = filterConfig[key];
      const data = getNestedValue(recipe, path);

      // Special case: only check first element of svaerhedsgradtid
      if (key === "svaerhedsgradtid") {
        const first = Array.isArray(data) ? data[0] : null;
        return first != null && vals.includes(first);
      }

      if (type === "string") {
        return vals.includes(data);
      }
      if (type === "array") {
        return Array.isArray(data) && vals.some(v => data.includes(v));
      }
      return false;
    });
  });
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("fa-heart")) {
    e.target.classList.toggle("liked");
  }
});
