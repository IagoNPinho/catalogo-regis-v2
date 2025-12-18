import { productStore } from "./productStore.js";

const productsGrid = document.getElementById("productsGrid");
const featuredTrack = document.getElementById("featuredTrack");
const searchInput = document.getElementById("searchInput");

async function initCatalog() {
  const products = await productStore.load();

  renderCatalog(products);
  renderFeatured(productStore.getFeatured());
}

initCatalog();

function renderCatalog(products) {
  productsGrid.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <img src="${p.image || '/assets/placeholder.webp'}" alt="${p.name}">
      <div class="product-content">
        <h3>${p.name}</h3>
        <span class="price">R$ ${p.price.toFixed(2)}</span>
        <button onclick='addToCart(${JSON.stringify(p)})'>Adicionar</button>
      </div>
    `;

    productsGrid.appendChild(card);
  });
}

function renderFeatured(products) {
  featuredTrack.innerHTML = "";

  products.forEach(p => {
    const card = document.createElement("div");
    card.className = "featured-card";

    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="featured-card-content">
        <h3>${p.name}</h3>
        <span>R$ ${p.price.toFixed(2)}</span>
        <button onclick='addToCart(${JSON.stringify(p)})'>Adicionar</button>
      </div>
    `;

    featuredTrack.appendChild(card);
  });
}

// Busca em front-end
let timer;

searchInput.addEventListener(
  "input",
  debounce(() => {
    const term = searchInput.value.toLowerCase().trim();
    const result = productStore.search(term);
    renderCatalog(result);
  }, 250)
);

function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
