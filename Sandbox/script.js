const url = "https://pokeapi.co/api/v2/pokemon/";
let response = null;
const pokemonContainer = document.getElementById("pokemon-container");

async function getPokemon(url, action) {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  const data = await response.json();
  action(data);

}

function renderPokemonList(list) {
    console.log("list: ", list);
    const pokemon = list.results;
    const html = pokemon.map(p => `<li><a href="${p.url}" data-url="${p.url}">${p.name}</a></li>`).join("");
    pokemonContainer.innerHTML = `<ul>${html}</ul>`;
    pokemonContainer.querySelectorAll("a[data-url]").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        getPokemon(link.dataset.url, doStuff);
      });
    });
}

function doStuff(data) {
  console.log("first: ", data);
  pokemonContainer.innerHTML = `<h1>${data.name}</h1>
  <h2>${data.types[0].type.name}</h2>
  <img src="${data.sprites.front_default}" alt="${data.name}">
  
  <h3>Stats</h3>
  <ul>
    <li>${data.stats[0].stat.name}: ${data.stats[0].base_stat}</li>
    <li>${data.stats[1].stat.name}: ${data.stats[1].base_stat}</li>
    <li>${data.stats[2].stat.name}: ${data.stats[2].base_stat}</li>
    <li>${data.stats[3].stat.name}: ${data.stats[3].base_stat}</li>
    <li>${data.stats[4].stat.name}: ${data.stats[4].base_stat}</li>
    <li>${data.stats[5].stat.name}: ${data.stats[5].base_stat}</li>
  </ul>
 `
}



getPokemon(url, renderPokemonList);
