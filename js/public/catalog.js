import { db } from "../firebase-config.js";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const productsGrid = document.getElementById("productsGrid");
const featuredTrack = document.getElementById("featuredTrack");


const productsRef = collection(db, "products");
const q = query(productsRef, orderBy("createdAt", "desc"));

let allProducts = [];

// 🔥 Escuta em tempo real
onSnapshot(q, (snapshot) => {

  allProducts = [];

  snapshot.forEach(docSnap => {
    allProducts.push({
      id: docSnap.id,
      ...docSnap.data()
    });
  });
  renderCatalog(allProducts);
  renderFeatured(allProducts.filter(p => p.featured));
});

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
        <button onclick="addToCart('${p.id}')">Adicionar</button>
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
      </div>
    `;

    featuredTrack.appendChild(card);
  });
}

// Busca em front-end
const searchInput = document.getElementById("searchInput");
let timer;

searchInput.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    const term = searchInput.value.toLowerCase().trim();
    const filtered = allProducts.filter(p =>
      p.name.toLowerCase().includes(term)
    );
    renderCatalog(filtered);
  }, 200);
});
