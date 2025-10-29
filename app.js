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

// ImgBB API Key
const IMGBB_API_KEY = "ca0d0fd2b4335a17b960b903b57a43d9";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const form = document.getElementById('productForm');
const fileInput = document.getElementById('productImage');
const fileName = document.getElementById('fileName');
const productGrid = document.getElementById('productGrid');
const submitBtn = document.getElementById('submitBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const alertBox = document.getElementById('alertBox');

// Preview Elements
const previewTitle = document.getElementById('previewTitle');
const previewPrice = document.getElementById('previewPrice');
const previewOriginalPrice = document.getElementById('previewOriginalPrice');
const previewDiscount = document.getElementById('previewDiscount');
const previewColor = document.getElementById('previewColor');
const previewSelect = document.getElementById('previewSelect');
const previewImage = document.getElementById('previewImage');
const placeholder = document.querySelector('.placeholder');

// Live Preview Updates
document.getElementById('productName').addEventListener('input', (e) => {
    previewTitle.textContent = e.target.value || 'Example Product';
});

document.getElementById('price').addEventListener('input', (e) => {
    previewPrice.textContent = e.target.value ? `£${parseFloat(e.target.value).toFixed(2)}` : '£0.00';
    updateDiscount();
});

document.getElementById('originalPrice').addEventListener('input', (e) => {
    if (e.target.value) {
        previewOriginalPrice.textContent = `£${parseFloat(e.target.value).toFixed(2)}`;
        previewOriginalPrice.style.display = 'inline';
    } else {
        previewOriginalPrice.style.display = 'none';
    }
    updateDiscount();
});

document.getElementById('color').addEventListener('input', (e) => {
    previewColor.textContent = e.target.value || 'Color';
});

document.getElementById('options').addEventListener('input', (e) => {
    const options = e.target.value.split(',').map(o => o.trim()).filter(o => o);
    previewSelect.innerHTML = '<option>Please select</option>' + 
        options.map(opt => `<option>${opt}</option>`).join('');
});

// Update discount calculation
function updateDiscount() {
    const price = parseFloat(document.getElementById('price').value) || 0;
    const originalPrice = parseFloat(document.getElementById('originalPrice').value) || 0;
    
    if (originalPrice > price && price > 0) {
        const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
        previewDiscount.textContent = `(-${discount}%)`;
        previewDiscount.style.display = 'inline';
    } else {
        previewDiscount.style.display = 'none';
    }
}

// File Input Handler
fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        fileName.textContent = '📎 ' + file.name;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            previewImage.src = event.target.result;
            previewImage.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    } else {
        fileName.textContent = '';
        previewImage.style.display = 'none';
        placeholder.style.display = 'block';
    }
});

// Show/Hide Loading Overlay
function showLoading() {
    loadingOverlay.classList.add('active');
    submitBtn.disabled = true;
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
    submitBtn.disabled = false;
}

// Show Alert Messages
function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type} active`;
    setTimeout(() => {
        alertBox.classList.remove('active');
    }, 5000);
}

// Upload Image to ImgBB
async function uploadImageToImgBB(file) {
    try {
        // Convert file to base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove data URL prefix (e.g., "data:image/png;base64,")
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        // Create form data
        const formData = new FormData();
        formData.append('image', base64);
        formData.append('key', IMGBB_API_KEY);

        // Upload to ImgBB
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image to ImgBB');
        }

        const data = await response.json();
        
        if (data.success) {
            return data.data.url; // Returns the direct image URL
        } else {
            throw new Error('ImgBB upload failed');
        }
    } catch (error) {
        console.error('Error uploading to ImgBB:', error);
        throw new Error('Failed to upload image');
    }
}

// Add Product to Firestore
async function addProductToFirestore(productData) {
    try {
        const docRef = await db.collection('products').add({
            ...productData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding product:', error);
        throw new Error('Failed to save product to database');
    }
}

// Form Submit Handler
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    showLoading();
    
    try {
        // Get form data
        const imageFile = fileInput.files[0];
        if (!imageFile) {
            throw new Error('Please select an image');
        }

        // Validate image size (max 5MB for ImgBB)
        if (imageFile.size > 5 * 1024 * 1024) {
            throw new Error('Image size must be less than 5MB');
        }

        // Upload image to ImgBB
        const imageUrl = await uploadImageToImgBB(imageFile);
        
        // Prepare product data
        const options = document.getElementById('options').value
            .split(',').map(o => o.trim()).filter(o => o);
        
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('price').value),
            originalPrice: parseFloat(document.getElementById('originalPrice').value) || null,
            color: document.getElementById('color').value,
            options: options,
            imageUrl: imageUrl
        };

        // Add to Firestore
        const productId = await addProductToFirestore(productData);
        
        // Add product card to display
        addProductCard({ ...productData, id: productId });
        
        // Show success message
        showAlert('Product uploaded successfully!', 'success');
        
        // Reset form
        form.reset();
        previewImage.style.display = 'none';
        placeholder.style.display = 'block';
        fileName.textContent = '';
        previewTitle.textContent = 'Example Product';
        previewPrice.textContent = '£0.00';
        previewOriginalPrice.style.display = 'none';
        previewDiscount.style.display = 'none';
        previewColor.textContent = 'Color';
        previewSelect.innerHTML = '<option>Please select</option>';
        
    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message || 'Failed to upload product', 'error');
    } finally {
        hideLoading();
    }
});

// Create Product Card
function addProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.productId = product.id;
    
    let pricingHTML = '';
    if (product.originalPrice && product.originalPrice > product.price) {
        const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        pricingHTML = `
            <span class="original-price">£${product.originalPrice.toFixed(2)}</span>
            <span class="product-price">£${product.price.toFixed(2)}</span>
            <span class="discount">(-${discount}%)</span>
        `;
    } else {
        pricingHTML = `<span class="product-price">£${product.price.toFixed(2)}</span>`;
    }
    
    const optionsHTML = product.options && product.options.length > 0 
        ? product.options.map(opt => `<option>${opt}</option>`).join('')
        : '';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.imageUrl}" alt="${product.name}">
            <button class="favorite-btn">♡</button>
        </div>
        <div class="product-info">
            <div class="product-title">${product.name}</div>
            <div class="product-pricing">${pricingHTML}</div>
            <div class="product-color">${product.color}</div>
            <select class="product-select">
                <option>Please select</option>
                ${optionsHTML}
            </select>
            <button class="add-to-bag-btn">ADD TO BAG</button>
        </div>
    `;
    
    productGrid.appendChild(card);
}

// Load Existing Products from Firebase
async function loadProducts() {
    try {
        const snapshot = await db.collection('products')
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();
        
        snapshot.forEach(doc => {
            const product = { id: doc.id, ...doc.data() };
            addProductCard(product);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Load products when page loads
window.addEventListener('DOMContentLoaded', loadProducts);