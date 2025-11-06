// profile-manager.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, updateProfile, deleteUser } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
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
const db = getFirestore(app);

let currentUser = null;

// Cargar perfil del usuario
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserProfile(user);
    } else {
        window.location.href = 'login.html';
    }
});

async function loadUserProfile(user) {
    // Actualizar header
    const names = user.displayName ? user.displayName.split(' ') : ['Usuario'];
    const firstName = names[0] || 'Usuario';
    
    document.getElementById('profileName').textContent = user.displayName || 'Usuario';
    document.getElementById('profileEmail').textContent = user.email;

    // Cargar datos de Firestore
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        // Llenar formulario
        document.getElementById('firstName').value = userData.firstName || firstName;
        document.getElementById('lastName').value = userData.lastName || (names[1] || '');
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = userData.phone || '';
    } catch (error) {
        console.error('Error cargando perfil:', error);
    }
}

// Función para guardar perfil
window.saveProfile = async function(e) {
    e.preventDefault();
    
    if (!currentUser) return;

    const profileData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        updatedAt: new Date().toISOString()
    };

    try {
        // Guardar en Firestore
        await setDoc(doc(db, 'users', currentUser.uid), profileData, { merge: true });

        // Actualizar displayName en Auth
        const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
        await updateProfile(currentUser, { displayName: fullName });

        // Actualizar UI
        document.getElementById('profileName').textContent = fullName;

        showMessage('¡Perfil actualizado exitosamente!', 'success');
    } catch (error) {
        console.error('Error guardando perfil:', error);
        showMessage('Error al guardar el perfil. Intenta de nuevo.', 'error');
    }
}

// Función para eliminar cuenta
window.deleteAccount = async function() {
    if (!currentUser) return;

    const confirmation = confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
    
    if (confirmation) {
        const finalConfirmation = prompt('Escribe "ELIMINAR" para confirmar:');
        
        if (finalConfirmation === 'ELIMINAR') {
            try {
                await deleteUser(currentUser);
                alert('Tu cuenta ha sido eliminada.');
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error eliminando cuenta:', error);
                alert('Error al eliminar la cuenta. Por favor, vuelve a iniciar sesión e intenta de nuevo.');
            }
        }
    }
}

// Función para mostrar mensajes
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}