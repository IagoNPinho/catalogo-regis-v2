console.log("loginForm:", document.getElementById("loginForm"));
console.log("adminPanel:", document.getElementById("adminPanel"));
console.log("AUTH:", auth);

import { db, storage, auth } from "../firebase-config.js";

/* ================= FIRESTORE ================= */
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ================= STORAGE ================= */
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

/* ================= AUTH ================= */
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ================= DOM ================= */
const loginForm = document.getElementById("loginForm");
const adminPanel = document.getElementById("adminPanel");
const backToCatalogBtn = document.getElementById("backToCatalog");

const adminProducts = document.getElementById("adminProducts");
const form = document.getElementById("productForm");
const loadMore = document.getElementById("loadMore");
const searchInput = document.getElementById("searchInput");

/* SALES */
const salesList = document.getElementById("salesList");
const totalSalesEl = document.getElementById("totalSales");
const totalCostEl = document.getElementById("totalCost");
const profitEl = document.getElementById("profit");

/* MODAL */
const editModal = document.getElementById("editModal");
const editName = document.getElementById("editName");
const editPrice = document.getElementById("editPrice");
const editCost = document.getElementById("editCost");
const editCategory = document.getElementById("editCategory");
const editSubCategory = document.getElementById("editSubCategory");
const editFamily = document.getElementById("editFamily");
const editFeatured = document.getElementById("editFeatured");
const editImage = document.getElementById("editImage");
const editImagePreview = document.getElementById("editImagePreview");
const saveEdit = document.getElementById("saveEdit");
const closeModal = document.getElementById("closeModal");

/* ================= AUTH ================= */
loginForm.addEventListener("submit", async e => {
  e.preventDefault();

  try {
    await signInWithEmailAndPassword(
      auth,
      email.value.trim(),
      password.value.trim()
    );
  } catch (err) {
    console.error("Erro de login:", err);

    await signOut(auth);

    alert("Login inválido. Verifique email e senha.");

    // Limpa somente a senha (UX melhor)
    password.value = "";
    password.focus();

    // Garante que o painel não apareça
    adminPanel.style.display = "none";
    loginForm.style.display = "flex";
  }
});

backToCatalogBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/index.html";
});

onAuthStateChanged(auth, user => {
  if (user) {
    alert("USUÁRIO LOGADO");

    loginForm.style.display = "none";
    adminPanel.style.display = "block";

    loadProducts(true);
    loadSales();
  } else {
    alert("NÃO LOGADO");

    adminPanel.style.display = "none";
    loginForm.style.display = "block";
  }
});


/* ================= FIRESTORE REFS ================= */
const productsRef = collection(db, "products");
const salesRef = collection(db, "sales");

/* ================= PAGINAÇÃO ================= */
let lastVisible = null;
let isLoading = false;
let isLastPage = false;
let currentProductId = null;
const PAGE_SIZE = 20;

/* ================= CREATE PRODUCT ================= */
form.addEventListener("submit", async e => {
  e.preventDefault();

  const file = imageFile.files[0];
  if (!file) return alert("Imagem obrigatória");

  const storageRef = ref(storage, `products/${Date.now()}`);
  await uploadBytes(storageRef, file);
  const imageURL = await getDownloadURL(storageRef);

  await addDoc(productsRef, {
    name: name.value,
    price: Number(price.value),
    cost: Number(cost.value),
    category: category.value,
    subCategory: subCategory.value,
    family: family.value || "",
    image: imageURL,
    featured: featured.checked,
    createdAt: serverTimestamp()
  });

  form.reset();
  loadProducts(true);
});

/* ================= LOAD PRODUCTS ================= */
async function loadProducts(reset = false) {
  if (isLoading) return;
  isLoading = true;

  if (reset) {
    adminProducts.innerHTML = "";
    lastVisible = null;
    isLastPage = false;
  }

  const q = lastVisible
    ? query(productsRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(PAGE_SIZE))
    : query(productsRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    isLastPage = true;
    isLoading = false;
    return;
  }

  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  snapshot.forEach(renderProduct);
  isLoading = false;
}

/* ================= RENDER PRODUCT ================= */
function renderProduct(docSnap) {
  const p = docSnap.data();

  const lucro = (p.price || 0) - (p.cost || 0);

  const card = document.createElement("div");
  card.className = "admin-card";
  card.dataset.name = p.name.toLowerCase();
  card.dataset.category = p.category;

  card.innerHTML = `
    <img src="${p.image}">
    <div class="admin-info">
      <strong>${p.name}</strong>
      <span>Venda: R$ ${p.price.toFixed(2)}</span>
      <span>Custo: R$ ${(p.cost || 0).toFixed(2)}</span>
      <span style="color:${lucro >= 0 ? '#4CAF50' : '#F44336'}">
        Lucro: R$ ${lucro.toFixed(2)}
      </span>
    </div>

    <div class="admin-actions">
      <button class="edit">Editar</button>
      <button class="delete">Excluir</button>
    </div>
  `;

  card.querySelector(".edit").onclick = () => openEditModal(docSnap.id);
  card.querySelector(".delete").onclick = async () => {
    if (!confirm("Excluir produto?")) return;
    await deleteDoc(doc(db, "products", docSnap.id));
    loadProducts(true);
  };

  adminProducts.appendChild(card);
}


/* ================= EDIT ================= */
async function openEditModal(id) {
  currentProductId = id;
  const snap = await getDoc(doc(db, "products", id));
  const p = snap.data();

  editName.value = p.name;
  editPrice.value = p.price;
  editCost.value = p.cost || 0;
  editCategory.value = p.category;
  editSubCategory.value = p.subCategory;
  editFamily.value = p.family || "";
  editFeatured.checked = p.featured;
  editImagePreview.src = p.image;

  editModal.style.display = "flex";
}

saveEdit.onclick = async () => {
  await updateDoc(doc(db, "products", currentProductId), {
    name: editName.value,
    price: Number(editPrice.value),
    cost: Number(editCost.value),
    category: editCategory.value,
    subCategory: editSubCategory.value,
    family: editFamily.value,
    featured: editFeatured.checked
  });

  editModal.style.display = "none";
  loadProducts(true);
};

closeModal.onclick = () => editModal.style.display = "none";

/* ================= SALES ================= */
async function loadSales() {
  const snapshot = await getDocs(query(salesRef, orderBy("createdAt", "desc")));

  let totalSales = 0;
  let totalCost = 0;
  salesList.innerHTML = "";

  snapshot.forEach(docSnap => {
    const s = docSnap.data();
    totalSales += s.totalSale;
    totalCost += s.totalCost;

    salesList.innerHTML += `
      <div class="sale-item">
        <strong>${s.name}</strong>
        <span>${s.quantity}x - R$ ${s.totalSale.toFixed(2)}</span>
        <button onclick="deleteSale('${docSnap.id}')">Excluir</button>
      </div>
    `;
  });

  totalSalesEl.innerText = totalSales.toFixed(2);
  totalCostEl.innerText = totalCost.toFixed(2);
  profitEl.innerText = (totalSales - totalCost).toFixed(2);
}

window.deleteSale = async id => {
  await deleteDoc(doc(db, "sales", id));
  loadSales();
};

loadMore.onclick = () => loadProducts();

searchInput.oninput = e => {
  const v = e.target.value.toLowerCase();
  document.querySelectorAll(".admin-card").forEach(c => {
    c.style.display = c.dataset.name.includes(v) ? "flex" : "none";
  });
};

/* ================= FILTER ================= */

const categoryFilter = document.getElementById("categoryFilter");

function applyFilters() {
  const nameValue = searchInput.value.toLowerCase();
  const categoryValue = categoryFilter.value;

  document.querySelectorAll(".admin-card").forEach(card => {
    const matchName = card.dataset.name.includes(nameValue);
    const matchCategory =
      !categoryValue || card.dataset.category === categoryValue;

    card.style.display = matchName && matchCategory ? "flex" : "none";
  });
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
