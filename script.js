document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PANTALLA DE CARGA ---
    setTimeout(() => {
        document.getElementById('loader').classList.remove('active');
        document.getElementById('welcome-screen').classList.add('active');
    }, 2000); // Simula 2 segundos de carga para crear expectativa

    // --- 2. CURSOR PERSONALIZADO ---
    const cursor = document.getElementById('cursor');
    const trail = document.getElementById('cursor-trail');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        
        // Retraso para el trail
        setTimeout(() => {
            trail.style.left = (e.clientX - 7.5) + 'px';
            trail.style.top = (e.clientY - 7.5) + 'px';
        }, 50);
    });

    // Efecto al hacer click (Microanimación haptica visual)
    document.addEventListener('mousedown', () => {
        cursor.style.transform = 'scale(0.5)';
        trail.style.transform = 'scale(1.5)';
        trail.style.borderColor = 'var(--pink-strong)';
    });
    document.addEventListener('mouseup', () => {
        cursor.style.transform = 'scale(1)';
        trail.style.transform = 'scale(1)';
        trail.style.borderColor = 'var(--pink-pastel)';
    });

    // --- 3. REPRODUCTOR DE MÚSICA ---
    const audio = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const musicIcon = document.getElementById('music-icon');
    let isPlaying = false;

    musicBtn.addEventListener('click', () => {
        if(isPlaying) {
            audio.pause();
            musicIcon.textContent = '▶';
        } else {
            audio.play().catch(e => console.log("Audio requiere interacción previa"));
            musicIcon.textContent = '⏸';
        }
        isPlaying = !isPlaying;
        
        // Efecto vibración visual en el botón
        musicBtn.style.transform = 'scale(0.9)';
        setTimeout(() => musicBtn.style.transform = 'scale(1)', 150);
    });

    // --- 4. NAVEGACIÓN ENTRE PANTALLAS (APP FEEL) ---
    window.navigateTo = function(targetId) {
        // Vibración si estás en móvil (requiere Haptic Feedback API, fallback a visual)
        if (navigator.vibrate) navigator.vibrate(50);

        // Ocultar todas las pantallas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Mostrar la solicitada con un pequeño retraso para permitir la transición CSS
        setTimeout(() => {
            document.getElementById(targetId).classList.add('active');
        }, 50); // 50ms es suficiente para que el navegador registre el cambio
    };

    // --- 5. MOTOR DE PARTÍCULAS (Fondo dinámico y Sorpresa) ---
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let isSurpriseActive = false;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    class Particle {
        constructor(isConfetti = false) {
            this.x = Math.random() * canvas.width;
            this.y = isConfetti ? -10 : Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            
            // Para el fondo normal flota hacia arriba, el confeti cae
            this.speedY = isConfetti ? (Math.random() * 3 + 2) : (Math.random() * -1 - 0.5);
            this.speedX = (Math.random() - 0.5) * 1.5;
            
            this.isConfetti = isConfetti;
            
            // Colores: Rosa pastel, Rosa fuerte, Blanco, Morado
            const colors = ['#ffd1dc', '#ff1493', '#ffffff', '#2b0f38'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            // Rotación para pétalos/confeti
            this.angle = Math.random() * 360;
            this.spin = (Math.random() - 0.5) * 5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.spin;

            // Re-aparición en bordes
            if (!this.isConfetti) {
                if (this.y < 0) this.y = canvas.height;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
            } else {
                // Si es confeti y llega abajo, que vuelva a caer si la sorpresa sigue activa
                if (this.y > canvas.height && isSurpriseActive) {
                    this.y = -10;
                    this.x = Math.random() * canvas.width;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle * Math.PI / 180);
            
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            
            // Dibuja pequeños círculos (estrellas) o rectángulos (pétalos/confeti)
            if(this.size < 2 && !this.isConfetti) {
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size/2, -this.size, this.size, this.size * 2);
            }
            
            ctx.restore();
        }
    }

    function initParticles(count = 50, isConfetti = false) {
        if(!isConfetti) particlesArray = []; // Limpia si es inicialización base
        for (let i = 0; i < count; i++) {
            particlesArray.push(new Particle(isConfetti));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    // Iniciar estrellas y luces de fondo
    initParticles(70, false);
    animateParticles();

    // --- 6. SORPRESA FINAL ---
    window.triggerSurprise = function() {
        isSurpriseActive = true;
        
        // Pantalla completa (si el navegador lo permite)
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        }

        // Mostrar Modal
        const modal = document.getElementById('final-surprise');
        modal.classList.remove('overlay-hidden');
        setTimeout(() => modal.classList.add('active'), 10);

        // Explosión de partículas (Confeti y flores)
        initParticles(150, true);
        
        // Haptic Feedback intenso
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    };

    window.closeSurprise = function() {
        isSurpriseActive = false;
        const modal = document.getElementById('final-surprise');
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('overlay-hidden');
            // Limpiar confeti dejando solo el fondo
            particlesArray = particlesArray.filter(p => !p.isConfetti);
        }, 500);
        
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    };
});