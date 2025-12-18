const cartDrawer = document.getElementById("cartDrawer");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("cartOverlay");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const whatsappBtn = document.getElementById("whatsappBtn");

const cart = {};

function addToCart(id) {
  if (!cart[id]) {
    const product = products.find(p => p.id === id);
    cart[id] = { ...product, quantity: 1 };
  } else {
    cart[id].quantity++;
  }

  renderCart();
}

function removeFromCart(id) {
  if (!cart[id]) return;

  cart[id].quantity--;

  if (cart[id].quantity <= 0) {
    delete cart[id];
  }

  renderCart();
}

function renderCart() {
  cartItemsContainer.innerHTML = "";

  let total = 0;
  let count = 0;

  if (Object.keys(cart).length === 0) {
    cartItemsContainer.innerHTML = "<p>Carrinho vazio!</p>";
  } else {

    Object.values(cart).forEach(item => {
      total += item.price * item.quantity;
      count += item.quantity;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <span>R$ ${item.price.toFixed(2)}</span>
        <div class="cart-item-actions">
          <button onclick="removeFromCart(${item.id})">−</button>
          <span>${item.quantity}</span>
          <button onclick="addToCart(${item.id})">+</button>
        </div>
      </div>
    `;

      cartItemsContainer.appendChild(div);
    });

    cartTotalEl.innerText = total.toFixed(2);
    cartCountEl.innerText = count;
  }

  cartBtn.addEventListener("click", () => {
    cartDrawer.classList.add("open");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  });

  function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    overlay.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  closeCart.addEventListener("click", closeCartDrawer);
  overlay.addEventListener("click", closeCartDrawer);

  const WHATSAPP_NUMBER = "5585988224901";

  function generateWhatsAppMessage() {
    let message = "Olá! Gostaria de fazer o pedido:%0A%0A";
    let total = 0;

    Object.values(cart).forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      message += `• ${item.name} (${item.quantity}x) - R$ ${subtotal.toFixed(2)}%0A`;
    });

    message += `%0ATotal: R$ ${total.toFixed(2)}`;

    return message;
  }

  whatsappBtn.addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    const message = generateWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    window.open(url, "_blank");
    closeCartDrawer();
  });
}
