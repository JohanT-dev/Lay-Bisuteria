// auth-state.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyDjElCiSGJNkMMhlDruX6N9FiTYUay0hr0",
    authDomain: "fir-proyect-johan.firebaseapp.com",
    projectId: "fir-proyect-johan",
    storageBucket: "fir-proyect-johan.firebasestorage.app",
    messagingSenderId: "1088410162010",
    appId: "1:1088410162010:web:cb5545f742bcb501bc1963"
};// IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase


// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Función para actualizar el botón de login/usuario
function updateAuthButton(user) {
    const loginBtn = document.querySelector('.login-btn');
    
    if (!loginBtn) return;
    
    if (user) {
        // Usuario ha iniciado sesión
        const displayName = user.displayName || user.email.split('@')[0];
        
        // Reemplazar el botón de login por el menú de usuario
        loginBtn.outerHTML = `
            <div class="user-menu">
                <button class="user-btn" onclick="toggleUserDropdown()">
                    <span class="user-name">${displayName}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="user-dropdown" id="userDropdown">
                    <a href="profile.html" class="dropdown-item">
                        Mi Perfil
                    </a>
                    <div class="dropdown-divider"></div>
                    <button onclick="handleLogout()" class="dropdown-item logout-btn">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        `;
    } else {
        // Usuario no ha iniciado sesión - mostrar botón de login
        if (!loginBtn.classList.contains('login-btn')) {
            const header = document.querySelector('header');
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.outerHTML = '<a href="login.html" class="login-btn">Login</a>';
            }
        }
    }
}

// Función para toggle del dropdown
window.toggleUserDropdown = function() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

// Cerrar dropdown si se hace clic fuera
document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && userMenu && !userMenu.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Función para cerrar sesión
window.handleLogout = async function() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Intenta de nuevo.');
    }
}

// Escuchar cambios en el estado de autenticación
onAuthStateChanged(auth, (user) => {
    updateAuthButton(user);
});


/* ============================================
   CSS PARA AGREGAR AL ARCHIVO PRINCIPAL
   ============================================

   Agrega estos estilos a tu archivo CSS principal o en un <style> tag en el <head>
*/

const styles = `
/* User Menu Styles */
.user-menu {
    position: relative;
    margin-left: auto;
}

.user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: white;
    border: 2px solid #f0e6d4;
    border-radius: 25px;
    font-size: 13px;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Georgia', serif;
    color: #04080F;
}

.user-btn:hover {
    border-color: #04080F;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.user-name {
    font-weight: 500;
    text-transform: capitalize;
}

.dropdown-arrow {
    font-size: 10px;
    transition: transform 0.3s ease;
}

.user-btn:hover .dropdown-arrow {
    transform: rotate(180deg);
}

.user-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    background: white;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1000;
    overflow: hidden;
}

.user-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-item {
    display: block;
    padding: 15px 20px;
    color: #04080F;
    text-decoration: none;
    font-size: 13px;
    letter-spacing: 1px;
    transition: background 0.2s ease;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    font-family: 'Georgia', serif;
}

.dropdown-item:hover {
    background: #f0e6d4;
}

.dropdown-divider {
    height: 1px;
    background: #f0e6d4;
    margin: 5px 0;
}

.logout-btn {
    color: #c62828;
}

.logout-btn:hover {
    background: #ffebee;
}
`;

// Inyectar estilos automáticamente
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);