
// firebase-auth.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
// Obtén estos valores de tu proyecto en Firebase Console
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
const auth = firebase.auth();
const db = firebase.firestore();

// Get redirect URL from query parameters
function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('redirect') || 'index.html';
}

// Check if user is already logged in
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is already logged in, redirect to intended page
        const redirectUrl = getRedirectUrl();
        window.location.href = redirectUrl;
    }
});

// Handle login
async function handleLogin(email, password) {
    try {
        showLoading();
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Get redirect URL
        const redirectUrl = getRedirectUrl();
        
        // Redirect to intended page or home
        window.location.href = redirectUrl;
        
    } catch (error) {
        hideLoading();
        console.error('Error en login:', error);
        
        let errorMessage = 'Error al iniciar sesión';
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Contraseña incorrecta';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos. Intenta más tarde';
                break;
        }
        
        showAlert(errorMessage, 'error');
    }
}

// Handle signup
async function handleSignup(email, password, displayName) {
    try {
        showLoading();
        
        // Create user
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await user.updateProfile({
            displayName: displayName
        });
        
        // Create user document in Firestore
        await db.collection('users').doc(user.uid).set({
            displayName: displayName,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Get redirect URL
        const redirectUrl = getRedirectUrl();
        
        // Redirect to intended page or home
        window.location.href = redirectUrl;
        
    } catch (error) {
        hideLoading();
        console.error('Error en registro:', error);
        
        let errorMessage = 'Error al crear cuenta';
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Este email ya está registrado';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Email inválido';
                break;
            case 'auth/weak-password':
                errorMessage = 'La contraseña debe tener al menos 6 caracteres';
                break;
        }
        
        showAlert(errorMessage, 'error');
    }
}

// Show/Hide Loading
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('active');
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.remove('active');
}

// Show Alert
function showAlert(message, type) {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;
    
    alertBox.textContent = message;
    alertBox.className = `alert ${type} active`;
    
    setTimeout(() => {
        alertBox.classList.remove('active');
    }, 5000);
}

// Form submission handlers
document.addEventListener('DOMContentLoaded', function() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(email, password);
        });
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            handleSignup(email, password, name);
        });
    }
    
    // Show redirect message if coming from another page
    const redirectUrl = getRedirectUrl();
    if (redirectUrl !== 'index.html') {
        showAlert('Inicia sesión para continuar con tu pedido', 'info');
    }
});
