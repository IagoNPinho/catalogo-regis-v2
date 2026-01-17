let clicks = 0;

/* =========================
   ADMIN ACCESS
========================= */
document.getElementById("admin").addEventListener("click", () => {
  clicks++;
  if (clicks === 5) {
    window.location.href = "./admin.html";
  }
});

/* =========================
   VALOR POR KM
========================= */
const valorPorKm = 3.0;
const valorKmEl = document.getElementById("valorKm");
if (valorKmEl) {
  valorKmEl.innerText = valorPorKm.toFixed(2);
}

/* =========================
   TYPE FILTER (PROD / SERV)
========================= */
const filterButtons = document.querySelectorAll(".type-filter button");
const serviceBanner = document.querySelector(".banner-top");
const productsSection = document.querySelector(".products");

if (serviceBanner) serviceBanner.style.display = "none";

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (btn.dataset.type === "services") {
      if (serviceBanner) serviceBanner.style.display = "block";
      if (productsSection) productsSection.style.display = "none";
    } else {
      if (serviceBanner) serviceBanner.style.display = "none";
      if (productsSection) productsSection.style.display = "block";
    }
  });
});

/* =========================
   CLICK NO BANNER → WHATSAPP
========================= */
/* =========================
   SERVICE MODAL LOGIC
========================= */
const serviceModal = document.getElementById("serviceModal");
const nameInput = document.getElementById("serviceName");
const phoneInput = document.getElementById("servicePhone");
const originInput = document.getElementById("serviceOrigin");
const destinationInput = document.getElementById("serviceDestination");

const cancelBtn = document.getElementById("cancelService");
const confirmBtn = document.getElementById("confirmService");

const WHATSAPP_SERVICE_NUMBER = "5585988224901";

/* Abrir modal ao clicar no banner */
if (serviceBanner) {
  serviceBanner.addEventListener("click", () => {
    serviceModal.style.display = "flex";
  });
}

/* Cancelar */
cancelBtn.addEventListener("click", () => {
  serviceModal.style.display = "none";
});

/* Confirmar e enviar para WhatsApp */
confirmBtn.addEventListener("click", () => {
  if (
    !nameInput.value ||
    !phoneInput.value ||
    !originInput.value ||
    !destinationInput.value
  ) {
    alert("Preencha todos os campos.");
    return;
  }

  const message = `
Olá! Gostaria de solicitar um *motorista particular* 🚗

👤 Nome: ${nameInput.value}
📞 Telefone: ${phoneInput.value}
📍 Origem: ${originInput.value}
🏁 Destino: ${destinationInput.value}

💰 Valor: R$ ${valorPorKm.toFixed(2)} por km
  `.trim();

  const url = `https://wa.me/${WHATSAPP_SERVICE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");

  serviceModal.style.display = "none";

  /* Limpa campos */
  nameInput.value = "";
  phoneInput.value = "";
  originInput.value = "";
  destinationInput.value = "";
});

