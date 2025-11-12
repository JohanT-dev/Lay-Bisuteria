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
let filteredProducts = [];
let wishlist = {};

// Load products from Firebase
async function loadProductsFromFirebase() {
    try {
        const snapshot = await db.collection('items')
            .orderBy('createdAt', 'desc')
            .get();
        
        products = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            products.push({
                id: doc.id,
                name: data.name,
                type: data.type || 'jewelry', // Use type from Firebase or default to 'jewelry'
                price: data.price,
                oldPrice: data.originalPrice,
                discount: data.originalPrice && data.originalPrice > data.price 
                    ? `-${Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100)}%`
                    : null,
                color: data.color,
                material: 'crystal', // Default material, you can add this to your upload form
                image: data.imageUrl,
                sizes: data.options && data.options.length > 0 ? data.options : ['One Size']
            });
        });
        
        filteredProducts = [...products];
        renderProducts();
    } catch (error) {
        console.error('Error al cargar productos desde Firebase:', error);
        // Fall back to empty array if there's an error
        products = [];
        filteredProducts = [];
        renderProducts();
    }
}

// Render products to the grid
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    
    if (!grid) {
        console.error('Products grid element not found');
        return;
    }
    
    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No products found</div>';
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        const priceHTML = product.oldPrice
            ? `<span class="old-price">£${product.oldPrice.toFixed(2)}</span>
               <span class="price">£${product.price.toFixed(2)}</span>
               <span class="discount">${product.discount}</span>`
            : `<span class="price">£${product.price.toFixed(2)}</span>`;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-type">${product.type.charAt(0).toUpperCase() + product.type.slice(1)}</div>
                <div class="price-container">
                    ${priceHTML}
                </div>
                <div class="color-label">${product.color}</div>
                <select class="size-select">
                    <option>Please select size</option>
                    ${product.sizes.map(size => `<option>${size}</option>`).join('')}
                </select>
                <button class="add-to-bag" onclick="addToBag('${product.id}')">Ordenar</button>
            </div>
        `;

        grid.appendChild(card);
    });
}


// Add to bag
function addToBag(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        alert(`Placed and order for ${product.name} in ${product.color}`);
        // Here you can add logic to actually add to a shopping cart
    }
}

// Apply filters
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const material = document.getElementById('materialFilter').value;
    const price = document.getElementById('priceFilter').value;
    const sort = document.getElementById('sortFilter').value;

    filteredProducts = products.filter(product => {
        let matchCategory = category === 'all' || product.type === category;
        let matchMaterial = material === 'all' || product.material === material;
        let matchPrice = true;

        if (price !== 'all') {
            if (price === '0-20') matchPrice = product.price <= 20;
            else if (price === '20-40') matchPrice = product.price > 20 && product.price <= 40;
            else if (price === '40-60') matchPrice = product.price > 40 && product.price <= 60;
            else if (price === '60+') matchPrice = product.price > 60;
        }

        return matchCategory && matchMaterial && matchPrice;
    });

    // Apply sorting
    if (sort === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
        // Already sorted by createdAt from Firebase query
    }

    renderProducts();
}

// Initialize filters
function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const materialFilter = document.getElementById('materialFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (materialFilter) materialFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
}

// Load wishlist from localStorage
function loadWishlist() {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadWishlist();
    initializeFilters();
    loadProductsFromFirebase();
});

// Refresh products every 30 seconds to get new items
setInterval(loadProductsFromFirebase, 30000);