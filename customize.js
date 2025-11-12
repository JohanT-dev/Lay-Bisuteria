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
const auth = firebase.auth();


let productData = null;
let currentUser = null;

// Check authentication status
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        // Auto-fill user information
        autoFillUserData(user);
    } else {
        // Redirect to login if not authenticated
        alert('Debes iniciar sesión para personalizar un producto');
        window.location.href = `login.html?redirect=customize.html?id=${getProductIdFromUrl()}`;
    }
});

// Auto-fill user data from Firebase Auth
function autoFillUserData(user) {
    // Fill name
    const nameField = document.getElementById('customerName');
    if (nameField) {
        nameField.value = user.displayName || '';
        nameField.readOnly = true;
        nameField.style.background = '#f0f0f0';
    }
    
    // Fill email
    const emailField = document.getElementById('customerEmail');
    if (emailField) {
        emailField.value = user.email || '';
        emailField.readOnly = true;
        emailField.style.background = '#f0f0f0';
    }
    
    // Fill phone if available (from user profile in Firestore)
    loadUserProfile(user.uid);
}

// Load additional user data from Firestore
async function loadUserProfile(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const phoneField = document.getElementById('customerPhone');
            if (phoneField && userData.phone) {
                phoneField.value = userData.phone;
                phoneField.readOnly = true;
                phoneField.style.background = '#f0f0f0';
            }
        }
    } catch (error) {
        console.error('Error al cargar perfil de usuario:', error);
    }
}

// Get product ID from URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load product data from Firebase
async function loadProductData() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        showAlert('No se encontró el producto', 'error');
        setTimeout(() => window.location.href = 'store.html', 2000);
        return;
    }

    try {
        const doc = await db.collection('items').doc(productId).get();
        
        if (doc.exists) {
            productData = { id: doc.id, ...doc.data() };
            displayProduct();
        } else {
            showAlert('Producto no encontrado', 'error');
            setTimeout(() => window.location.href = 'store.html', 2000);
        }
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        showAlert('Error al cargar el producto', 'error');
    }
}

// Display product information
function displayProduct() {
    if (!productData) return;

    document.getElementById('productImage').src = productData.imageUrl;
    document.getElementById('productImage').alt = productData.name;
    document.getElementById('productName').textContent = productData.name;
    document.getElementById('productPrice').textContent = `$${productData.price.toFixed(2)}`;
    document.getElementById('summaryProduct').textContent = productData.name;
}

// Color selection
const colorOptions = document.querySelectorAll('.color-option');
colorOptions.forEach(option => {
    option.addEventListener('click', function() {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        const color = this.dataset.color;
        document.getElementById('selectedColor').value = color;
        document.getElementById('summaryColor').textContent = color;
    });
});

// Size selection
const sizeOptions = document.querySelectorAll('.size-option');
sizeOptions.forEach(option => {
    option.addEventListener('click', function() {
        sizeOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        const size = this.dataset.size;
        document.getElementById('selectedSize').value = size;
        document.getElementById('summarySize').textContent = size;
    });
});

// Quantity selection
document.getElementById('quantity').addEventListener('change', function() {
    document.getElementById('summaryQuantity').textContent = this.value + ' pieza(s)';
});

// Show/Hide Loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Show Alert
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert ${type} active`;
    setTimeout(() => {
        alertBox.classList.remove('active');
    }, 5000);
}

// Send email with order details
async function sendOrderEmail(orderData) {
    // EmailJS template parameters
    const templateParams = {
        to_email: 'tu-email@ejemplo.com', // REPLACE WITH YOUR EMAIL
        product_name: orderData.productName,
        product_price: orderData.productPrice,
        color: orderData.color,
        size: orderData.size,
        quantity: orderData.quantity,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        special_requests: orderData.specialRequests || 'Ninguna',
        product_image: orderData.productImage
    };

    try {
        // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your EmailJS credentials
        const response = await emailjs.send(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            templateParams
        );
        
        console.log('Email enviado:', response);
        return true;
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw error;
    }
}

// Form submission
document.getElementById('customizationForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate selections
    const color = document.getElementById('selectedColor').value;
    const size = document.getElementById('selectedSize').value;
    
    if (!color) {
        showAlert('Por favor selecciona un color', 'error');
        return;
    }
    
    if (!size) {
        showAlert('Por favor selecciona un tamaño', 'error');
        return;
    }
    
    showLoading();
    
    try {
        const orderData = {
            productName: productData.name,
            productPrice: `$${productData.price.toFixed(2)}`,
            productImage: productData.imageUrl,
            color: color,
            size: size,
            quantity: document.getElementById('quantity').value,
            customerName: document.getElementById('customerName').value,
            customerEmail: document.getElementById('customerEmail').value,
            customerPhone: document.getElementById('customerPhone').value,
            specialRequests: document.getElementById('specialRequests').value
        };
        
        // Send email
        await sendOrderEmail(orderData);
        
        hideLoading();
        showAlert('¡Pedido enviado exitosamente! Nos pondremos en contacto contigo pronto.', 'success');
        
        // Reset form after 3 seconds and redirect
        setTimeout(() => {
            window.location.href = 'store.html';
        }, 3000);
        
    } catch (error) {
        hideLoading();
        showAlert('Error al enviar el pedido. Por favor intenta de nuevo o contáctanos directamente.', 'error');
        console.error('Error:', error);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProductData();
});