// Firebase Configuration
// Replace these values with your Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyDjElCiSGJNkMMhlDruX6N9FiTYUay0hr0",
    authDomain: "fir-proyect-johan.firebaseapp.com",
    projectId: "fir-proyect-johan",
    storageBucket: "fir-proyect-johan.firebasestorage.app",
    messagingSenderId: "1088410162010",
    appId: "1:1088410162010:web:cb5545f742bcb501bc1963"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global variables
let products = [];
let wishlist = {};

// Load products from Firebase
async function loadProductsFromFirebase() {
    try {
        const snapshot = await db.collection('items')
            .orderBy('createdAt', 'desc')
            .limit(4) // Only get 4 most recent products for homepage
            .get();

        products = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            products.push({
                id: doc.id,
                name: data.name,
                type: data.type || 'jewelry',
                price: data.price,
                oldPrice: data.originalPrice,
                discount: data.originalPrice && data.originalPrice > data.price
                    ? `-${Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)}%`
                    : null,
                color: data.color,
                image: data.imageUrl,
                sizes: data.options && data.options.length > 0 ? data.options : ['Talla Única']
            });
        });

        // Update hero section with most recent product
        updateHeroSection();

        // Render products in grid
        renderProducts();

    } catch (error) {
        console.error('Error al cargar productos desde Firebase:', error);
        // Keep default hardcoded products if Firebase fails
    }
}

// Update hero section with the newest product
function updateHeroSection() {
    if (products.length > 0) {
        const newestProduct = products[0];

        // Update hero image
        const heroImage = document.querySelector('.hero-image img');
        if (heroImage) {
            heroImage.src = newestProduct.image;
            heroImage.alt = newestProduct.name;
        }

        // Update hero title
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.innerHTML = newestProduct.name;
        }

        // Update hero subtitle
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = 'Nuevo Producto';
        }

        // Update CTA button link (optional - could link to product detail)
        const ctaButton = document.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.href = 'store.html';
        }
    }
}

// Render products in the grid
function renderProducts() {
    const productGrid = document.querySelector('.product-grid');

    if (!productGrid) {
        console.error('Elemento de cuadrícula de productos no encontrado');
        return;
    }

    // Clear existing products
    productGrid.innerHTML = '';

    if (products.length === 0) {
        productGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No se encontraron productos</div>';
        return;
    }

    // Render each product
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const priceHTML = product.oldPrice
            ? `<span class="original-price">$${product.oldPrice.toFixed(2)}</span>
               <span class="price">$${product.price.toFixed(2)}</span>
               <span class="discount">${product.discount}</span>`
            : `<span class="price">$${product.price.toFixed(2)}</span>`;

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                <button class="wishlist-btn ${wishlist[product.id] ? 'active' : ''}" onclick="toggleWishlist('${product.id}')">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                </button>
            </div>
            <div class="product-info">
                <div class="product-title">${product.name}</div>
                <div class="price-section">
                    ${priceHTML}
                </div>
                <div class="color-label">${product.color}</div>
                <select class="size-select">
                    <option>Por favor seleccione</option>
                    ${product.sizes.map(size => `<option>${size}</option>`).join('')}
                </select>
                <button class="add-to-bag" onclick="addToBag('${product.id}')">Agregar al Carrito</button>
            </div>
        `;

        productGrid.appendChild(card);
    });
}

// Toggle wishlist
function toggleWishlist(productId) {
    wishlist[productId] = !wishlist[productId];
    // Save to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    renderProducts();
}

// Add to bag
function addToBag(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        alert(`¡${product.name} agregado a tu carrito!`);
        // Here you can add logic to actually add to a shopping cart
    }
}

// Load wishlist from localStorage
function loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    loadWishlist();
    loadProductsFromFirebase();
});

// Refresh products every 30 seconds to get new items
setInterval(loadProductsFromFirebase, 30000);