// Function to animate text letter by letter
function animateText(element, delay = 0) {
    const text = element.textContent;
    element.textContent = '';
    element.classList.add('animating');

    // Split text into letters and spaces
    const letters = text.split('');

    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.className = 'fade-in-letter';
        span.style.animationDelay = `${delay + (index * 0.05)}s`;
        element.appendChild(span);
    });
}

// Wait for page to load
window.addEventListener('load', function () {
    // Animate subtitle after 0.3s
    const subtitle = document.querySelector('.hero-subtitle');
    setTimeout(() => {
        animateText(subtitle, 0);
    }, 300);

    // Animate title after 0.8s
    const title = document.querySelector('.hero-title');
    setTimeout(() => {
        animateText(title, 0);
    }, 800);

    // Fade in button after 2s
    const button = document.querySelector('.cta-button');
    setTimeout(() => {
        button.style.opacity = '0';
        button.style.transition = 'opacity 0.8s';
        setTimeout(() => {
            button.style.opacity = '1';
        }, 50);
    }, 2000);
});

//carrusel
// JavaScript del carrusel en el index
        document.addEventListener('DOMContentLoaded', () => {
            const slides = document.querySelector('.carousel-slides');
            const slideCount = document.querySelectorAll('.carousel-slide').length;
            let currentIndex = 0;

            function nextSlide() {
                // Incrementa el índice y vuelve a 0 si llega al final
                currentIndex = (currentIndex + 1) % slideCount;
                updateCarousel();
            }

            function updateCarousel() {
                // Mueve el contenedor de slides hacia la izquierda
                const offset = -currentIndex * 100;
                slides.style.transform = `translateX(${offset}%)`;
            }

            // Inicia el intervalo para mover el carrusel automáticamente
            setInterval(nextSlide, 1); // Cambia de imagen cada 3 segundos (3000 milisegundos)
        });