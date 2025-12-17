import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("productForm");
const adminProducts = document.getElementById("adminProducts");

const productsRef = collection(db, "products");

// Criar produto
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = {
    name: name.value,
    price: Number(price.value),
    image: image.value,
    featured: featured.checked,
    createdAt: new Date()
  };

  await addDoc(productsRef, product);
  form.reset();
  loadProducts();
});

// Listar produtos
async function loadProducts() {
  adminProducts.innerHTML = "";
  const snapshot = await getDocs(productsRef);

  snapshot.forEach(docSnap => {
    const p = docSnap.data();

    adminProducts.innerHTML += `
      <div>
        <strong>${p.name}</strong> – R$ ${p.price.toFixed(2)}
        <label>
          <input type="checkbox"
            ${p.featured ? "checked" : ""}
            onchange="toggleFeatured('${docSnap.id}', this.checked)">
          Destaque
        </label>
        <button onclick="removeProduct('${docSnap.id}')">Excluir</button>
      </div>
    `;
  });
}

window.toggleFeatured = async (id, value) => {
  await updateDoc(doc(db, "products", id), {
    featured: value
  });
};

window.removeProduct = async (id) => {
  await deleteDoc(doc(db, "products", id));
  loadProducts();
};

loadProducts();