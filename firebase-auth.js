
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Función para manejar el inicio de sesión
export async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showSuccess('¡Inicio de sesión exitoso!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showError(getErrorMessage(error.code));
    }
}

// Función para manejar el registro
export async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        showSuccess('¡Cuenta creada exitosamente!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showError(getErrorMessage(error.code));
    }
}

// Función para manejar el inicio de sesión con Google
export async function handleGoogleLogin() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        showSuccess('¡Inicio de sesión con Google exitoso!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        showError(getErrorMessage(error.code));
    }
}

// Función para mostrar mensajes de error
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Función para mostrar mensajes de éxito
function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

// Función para traducir códigos de error de Firebase
function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/invalid-email': 'Email inválido',
        'auth/operation-not-allowed': 'Operación no permitida',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
        'auth/user-not-found': 'No existe una cuenta con este email',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-credential': 'Credenciales inválidas',
        'auth/popup-closed-by-user': 'Ventana de autenticación cerrada'
    };
    return messages[code] || 'Ha ocurrido un error. Intenta de nuevo.';
}

// Hacer las funciones disponibles globalmente
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleGoogleLogin = handleGoogleLogin;