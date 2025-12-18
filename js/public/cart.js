const cartDrawer = document.getElementById("cartDrawer");
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("cartOverlay");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const whatsappBtn = document.getElementById("whatsappBtn");

const cart = {};

function addToCart(product) {
  if (typeof product !== "object") {
    console.error("Produto inválido:", product);
    return;
  }

  if (!cart[product.id]) {
    cart[product.id] = {
      ...product,
      quantity: 1
    };
  } else {
    cart[product.id].quantity++;
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
      const price = Number(item.price) || 0;
      const subtotal = price * item.quantity;

      total += subtotal;
      count += item.quantity;

      const div = document.createElement("div");
      div.className = "cart-item";

      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>R$ ${price.toFixed(2)}</span>
          <div class="cart-item-actions">
            <button onclick="removeFromCart('${item.id}')">−</button>
            <span>${item.quantity}</span>
            <button onclick="addToCart(cart['${item.id}'])">+</button>
          </div>
        </div>
      `;

      cartItemsContainer.appendChild(div);
    });
  }

  cartTotalEl.innerText = total.toFixed(2);
  cartCountEl.innerText = count;
}

// OPEN CART
cartBtn.addEventListener("click", () => {
  cartDrawer.classList.add("open");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
});

// CLOSE CART
function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "auto";
}

// LISTENERS
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", closeCartDrawer);


// WHATSAPP
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


window.addToCart = addToCart;
window.removeFromCart = removeFromCart;