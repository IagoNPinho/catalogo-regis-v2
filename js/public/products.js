const grid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const featuredTrack = document.getElementById("featuredTrack");

function renderProducts(list) {
  grid.innerHTML = "";
  list.forEach(p => {
    grid.innerHTML += `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <div class="product-content">
          <h3>${p.name}</h3>
          <p>R$ ${p.price.toFixed(2)}</p>
          <button onclick="addToCart(${p.id})">Adicionar</button>
        </div>      
      </div>
    `;
  });
}

function renderFeaturedProducts(list) {
  featuredTrack.innerHTML = "";

  const loopProducts = [...list, ...list];

  loopProducts.forEach(product => {
    const card = document.createElement("div");
    card.className = "featured-card";

    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <div class="featured-card-content">
        <h3>${product.name}</h3>
        <span>R$ ${product.price.toFixed(2)}</span>
        <button onclick="addToCart(${product.id})">Adicionar</button>
      </div>
    `;

    featuredTrack.appendChild(card);
  });
}

function sortProducts(list, order) {
  return [...list].sort((a, b) => {
    if (order === "name-asc") return a.name.localeCompare(b.name);
    if (order === "name-desc") return b.name.localeCompare(a.name);
    if (order === "price-asc") return a.price - b.price;
    if (order === "price-desc") return b.price - a.price;
    return 0;
  });
}

function filterAndRender() {
  const text = searchInput.value.toLowerCase();
  const order = sortSelect.value;

  let filtered = products.filter(p => p.name.toLowerCase().includes(text));

  filtered = sortProducts(filtered, order);
  renderProducts(filtered);
}

let scrollSpeed = 0.35;

function autoScrollFeatured() {
  featuredTrack.scrollLeft += scrollSpeed;

  if (featuredTrack.scrollLeft >= featuredTrack.scrollWidth / 2) {
    featuredTrack.scrollLeft = 0;
  }

  requestAnimationFrame(autoScrollFeatured);
}


searchInput.addEventListener("input", filterAndRender);
sortSelect.addEventListener("change", filterAndRender);


filterAndRender();

const featuredProducts = products.filter(p => p.featured);
renderFeaturedProducts(featuredProducts);
autoScrollFeatured();
