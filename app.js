const PRODUCTS = [
  { id: 1, name: 'Litro Mango Fuego', category: 'Litros', badge: 'Top', desc: 'Mango, chamoy, limón y escarchado picosito.', price: 125, icon: '🥭🍺', art: 'art-litros' },
  { id: 2, name: 'Litro Azul Eléctrico', category: 'Litros', badge: 'Nuevo', desc: 'Mezcla tropical azul con toque cítrico.', price: 135, icon: '🫐⚡', art: 'art-litros' },
  { id: 3, name: 'Litro Fresa Party', category: 'Litros', badge: 'Popular', desc: 'Fresa natural y dulzor balanceado.', price: 130, icon: '🍓🎉', art: 'art-litros' },
  { id: 4, name: 'Nachos Explosivos', category: 'Snacks', badge: 'Snack', desc: 'Queso, jalapeño y carne sazonada.', price: 95, icon: '🧀🌶️', art: 'art-snacks' },
  { id: 5, name: 'Papas Xtreme', category: 'Snacks', badge: 'Snack', desc: 'Papas crujientes con aderezo especial.', price: 85, icon: '🍟🔥', art: 'art-snacks' },
  { id: 6, name: 'Combo Night Out', category: 'Combos', badge: 'Ahorro', desc: '2 litros + snack para compartir.', price: 320, icon: '🍻🍿', art: 'art-combos' },
  { id: 7, name: 'Combo Crew', category: 'Combos', badge: 'Ahorro', desc: '4 litros + 2 snacks + topping extra.', price: 590, icon: '🎊🥳', art: 'art-combos' }
];

const WHATSAPP = '5210000000000';
const DELIVERY_FEE = 25;

const state = {
  filter: 'Todos',
  query: '',
  cart: {}
};

const grid = document.getElementById('productGrid');
const chips = document.getElementById('categoryChips');
const template = document.getElementById('productTemplate');
const searchInput = document.getElementById('searchInput');
const cartItems = document.getElementById('cartItems');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const installBtn = document.getElementById('installBtn');

const price = (n) => `$${n}`;

function buildChips() {
  const categories = ['Todos', ...new Set(PRODUCTS.map((p) => p.category))];
  chips.innerHTML = '';

  categories.forEach((category) => {
    const button = document.createElement('button');
    button.className = `chip${state.filter === category ? ' active' : ''}`;
    button.type = 'button';
    button.textContent = category;
    button.addEventListener('click', () => {
      state.filter = category;
      buildChips();
      renderProducts();
    });
    chips.appendChild(button);
  });
}

function getFilteredProducts() {
  const query = state.query.trim().toLowerCase();
  return PRODUCTS.filter((product) => {
    const byCategory = state.filter === 'Todos' || product.category === state.filter;
    const byQuery = !query || `${product.name} ${product.desc}`.toLowerCase().includes(query);
    return byCategory && byQuery;
  });
}

function addToCart(productId) {
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  renderCart();
}

function updateQty(productId, delta) {
  const nextQty = (state.cart[productId] || 0) + delta;
  if (nextQty <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = nextQty;
  }
  renderCart();
}

function renderProducts() {
  const list = getFilteredProducts();
  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = '<p class="empty">No encontramos productos con esos filtros.</p>';
    return;
  }

  list.forEach((product) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.product-illustration').classList.add(product.art);
    node.querySelector('.product-icon').textContent = product.icon;
    node.querySelector('.badge').textContent = `${product.badge} • ${product.category}`;
    node.querySelector('.title').textContent = product.name;
    node.querySelector('.desc').textContent = product.desc;
    node.querySelector('.price').textContent = price(product.price);
    node.querySelector('button').addEventListener('click', () => addToCart(product.id));
    grid.appendChild(node);
  });
}

function renderCart() {
  const entries = Object.entries(state.cart);
  cartItems.innerHTML = '';

  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty">Agrega algo rico del menú 🍻</p>';
  }

  let subtotal = 0;

  entries.forEach(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === Number(id));
    if (!product) return;

    subtotal += product.price * qty;

    const item = document.createElement('article');
    item.className = 'cart-item';
    item.innerHTML = `
      <div>
        <strong>${product.name}</strong>
        <small>${price(product.price)} c/u</small>
      </div>
      <div class="qty">
        <button type="button" aria-label="Quitar uno">−</button>
        <span>${qty}</span>
        <button type="button" aria-label="Agregar uno">+</button>
      </div>
    `;

    const [minus, plus] = item.querySelectorAll('button');
    minus.addEventListener('click', () => updateQty(product.id, -1));
    plus.addEventListener('click', () => updateQty(product.id, 1));
    cartItems.appendChild(item);
  });

  const total = subtotal + DELIVERY_FEE;
  subtotalEl.textContent = price(subtotal);
  deliveryEl.textContent = price(DELIVERY_FEE);
  totalEl.textContent = price(total);

  checkoutBtn.disabled = subtotal === 0;
}

function checkoutWhatsApp() {
  const entries = Object.entries(state.cart);
  if (!entries.length) return;

  const lines = entries.map(([id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === Number(id));
    return `- ${qty}x ${product.name} (${price(product.price)})`;
  });

  const message = encodeURIComponent([
    'Hola REALITROS 👋, quiero pedir:',
    ...lines,
    `Subtotal: ${subtotalEl.textContent}`,
    `Envío: ${deliveryEl.textContent}`,
    `Total: ${totalEl.textContent}`
  ].join('\n'));

  window.open(`https://wa.me/${WHATSAPP}?text=${message}`, '_blank', 'noopener');
}

function setupPWAInstall() {
  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installBtn.hidden = false;
  });

  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.hidden = true;
  });
}

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderProducts();
});

checkoutBtn.addEventListener('click', checkoutWhatsApp);

buildChips();
renderProducts();
renderCart();
setupPWAInstall();
registerSW();
