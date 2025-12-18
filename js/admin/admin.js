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
  startAfter
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

/* ================= STORAGE ================= */
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

/* ================= AUTH ================= */
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* =========================================================
   AUTH
========================================================= */
const loginForm = document.getElementById("loginForm");
const adminPanel = document.getElementById("adminPanel");
const logoutBtn = document.getElementById("logout");

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  await signInWithEmailAndPassword(auth, email.value, password.value);
});

logoutBtn.addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, async(user) => {
  if (user) {
    console.log(user.uid);
    loginForm.style.display = "none";
    adminPanel.style.display = "block";
    loadProducts(true);
  } else {
    adminPanel.style.display = "none";
    loginForm.style.display = "block";
  }
});

/* =========================================================
   VARIÁVEIS GLOBAIS
========================================================= */
const productsRef = collection(db, "products");
const adminProducts = document.getElementById("adminProducts");
const form = document.getElementById("productForm");

let lastVisible = null;
let isLastPage = false;
let isLoading = false;
let currentProductId = null;

const PAGE_SIZE = 20;

/* =========================================================
   CRIAR PRODUTO (COM IMAGEM)
========================================================= */
form.addEventListener("submit", async e => {
  e.preventDefault();

  const file = imageFile.files[0];
  if (!file) return alert("Imagem obrigatória");

  const storageRef = ref(
    storage,
    `products/${category.value}/${subCategory.value}/${Date.now()}`
  );

  await uploadBytes(storageRef, file);
  const imageURL = await getDownloadURL(storageRef);

  await addDoc(productsRef, {
    name: name.value.trim(),
    price: Number(price.value),
    category: category.value,
    subCategory: subCategory.value,
    family: family.value || "",
    image: imageURL,
    featured: featured.checked,
    createdAt: new Date()
  });

  form.reset();
  loadProducts(true);
});

/* =========================================================
   PAGINAÇÃO
========================================================= */
async function loadProducts(reset = false) {
  if (isLoading) return;
  isLoading = true;

  if (reset) {
    adminProducts.innerHTML = "";
    lastVisible = null;
    isLastPage = false;
  }

  if (isLastPage) {
    isLoading = false;
    return;
  }

  let q = query(
    productsRef,
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE)
  );

  if (lastVisible) {
    q = query(
      productsRef,
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(PAGE_SIZE)
    );
  }

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

/* =========================================================
   RENDER PRODUTO
========================================================= */
function renderProduct(docSnap) {
  const p = docSnap.data();

  const card = document.createElement("div");
  card.className = "admin-card";
  card.dataset.name = p.name.toLowerCase();

  card.innerHTML = `
    ${p.image ? `<img src="${p.image}">` : `<div class="no-image">Sem imagem</div>`}
    <strong>${p.name}</strong>
    <span>R$ ${p.price.toFixed(2)}</span>

    <label class="featured-toggle">
      <input type="checkbox" ${p.featured ? "checked" : ""}>
      Destaque
    </label>

    <div class="actions">
      <button class="edit">Editar</button>
      <button class="delete">Excluir</button>
    </div>
  `;

  /* Toggle destaque */
  card.querySelector("input").addEventListener("change", e =>
    updateDoc(doc(db, "products", docSnap.id), {
      featured: e.target.checked
    })
  );

  /* Editar */
  card.querySelector(".edit").addEventListener("click", () =>
    openEditModal(docSnap.id)
  );

  /* Excluir completo */
  card.querySelector(".delete").addEventListener("click", async () => {
    if (!confirm("Excluir produto?")) return;

    if (p.image) {
      await deleteObject(ref(storage, p.image));
    }

    await deleteDoc(doc(db, "products", docSnap.id));
    loadProducts(true);
  });

  adminProducts.appendChild(card);
}

/* =========================================================
   EDITAR PRODUTO
========================================================= */
async function openEditModal(id) {
  currentProductId = id;

  const snap = await getDoc(doc(db, "products", id));
  const p = snap.data();

  editName.value = p.name;
  editPrice.value = p.price;
  editCategory.value = p.category;
  editSubCategory.value = p.subCategory;
  editFamily.value = p.family || "";
  editFeatured.checked = p.featured;
  editImagePreview.src = p.image || "";

  editModal.style.display = "flex";
}

saveEdit.addEventListener("click", async () => {
  if (!currentProductId) return;

  const updates = {
    name: editName.value,
    price: Number(editPrice.value),
    category: editCategory.value,
    subCategory: editSubCategory.value,
    family: editFamily.value,
    featured: editFeatured.checked
  };

  if (editImage.files[0]) {
    const storageRef = ref(
      storage,
      `products/${updates.category}/${updates.subCategory}/${currentProductId}`
    );

    await uploadBytes(storageRef, editImage.files[0]);
    updates.image = await getDownloadURL(storageRef);
  }

  await updateDoc(doc(db, "products", currentProductId), updates);

  editModal.style.display = "none";
  loadProducts(true);
});

/* =========================================================
   IMPORTAÇÃO EM LOTE (SEM IMAGEM)
========================================================= */
importBtn.addEventListener("click", async () => {
  const file = jsonFile.files[0];
  if (!file) return alert("Selecione um arquivo");

  const data = JSON.parse(await file.text());

  for (const p of data) {
    await addDoc(productsRef, {
      name: p.name,
      price: Number(p.price),
      category: p.category,
      subCategory: p.subCategory,
      family: p.family || "",
      image: "",
      featured: false,
      createdAt: new Date()
    });
  }

  alert("Importação concluída com sucesso");
  loadProducts(true);
});

/* =========================================================
   LOAD MORE
========================================================= */
loadMore.addEventListener("click", () => loadProducts());

/* =========================================================
   BUSCA POR NOME (FRONTEND)
========================================================= */
searchInput.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  document.querySelectorAll(".admin-card").forEach(card => {
    card.style.display = card.dataset.name.includes(value)
      ? "flex"
      : "none";
  });
});
