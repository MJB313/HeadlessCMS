








































































































































































































































































































































































































































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

