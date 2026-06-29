/* =========================================================================
   CONFIGURATION 
   Edit the values below to customize the celebration website.
   ========================================================================= */
   const CONFIG = {
    // 1. Personal Details
    birthdayPerson: "Alice",
    personalMessage: "To the most amazing person, may your day be as bright and beautiful as your smile. Here's to another year of wonderful adventures!",
    customSignature: "With all my love, Sam",

    // 2. Typing Effect Messages
    typingWishes: [
        "Wishing you a magical day...",
        "May all your dreams come true...",
        "Let's celebrate your special day!",
        "Happy Birthday!"
    ],

    // 3. Timeline Memories
    timeline: [
        { year: "2018", title: "The Beginning", description: "The day we first met and started this amazing journey." },
        { year: "2020", title: "Unforgettable Trip", description: "That crazy summer trip to the mountains we'll never forget." },
        { year: "2023", title: "Major Milestone", description: "Celebrating your graduation and all your hard work." },
        { year: "Today", title: "New Chapter", description: "Cheers to creating even more beautiful memories." }
    ],

    // 4. Wish Cards
    wishCards: [
        "May this year bring you endless joy and success.",
        "Stay as awesome and kind-hearted as you always are.",
        "Wishing you health, wealth, and boundless happiness."
    ],

    // 5. Surprise Popup
    surpriseMessage: "I have a special gift waiting for you in real life! 🎁",

    // 6. Media & Audio
    musicSrc: "01-Monk-Turner-Fascinoma-Its-Your-Birthday(chosic.com).mp3",
    
    // 7. Styling & Animation
    colors: {
        primary: "#ff2a85",
        secondary: "#8a2387",
        balloons: ["#ff2a85", "#8a2387", "#ffd700", "#00d2ff", "#a18cd1"]
    },
    countdownDuration: 3 // Countdown in seconds before reveal
};

/* =========================================================================
   INITIALIZATION & SETUP
   ========================================================================= */

// Apply Colors
document.documentElement.style.setProperty('--primary-color', CONFIG.colors.primary);
document.documentElement.style.setProperty('--secondary-color', CONFIG.colors.secondary);

// Populate Text Content
document.getElementById('birthday-name').innerText = CONFIG.birthdayPerson;
document.getElementById('personal-message').innerText = CONFIG.personalMessage;
document.getElementById('footer-name').innerText = CONFIG.birthdayPerson;
document.getElementById('custom-signature').innerText = CONFIG.customSignature;
document.getElementById('surprise-message').innerText = CONFIG.surpriseMessage;
document.getElementById('audio-source').src = CONFIG.musicSrc;
document.getElementById('bg-music').load();

/* =========================================================================
   DYNAMIC IMAGE AUTO-DISCOVERY (No hardcoding)
   ========================================================================= */

const specialMomentImages = [
    "./WhatsApp Image 2026-06-30 at 12.32.47 AM.jpeg",
    "./WhatsApp Image 2026-06-30 at 12.32.48 AM (1).jpeg",
    "./WhatsApp Image 2026-06-30 at 12.32.48 AM (2).jpeg",
    "./WhatsApp Image 2026-06-30 at 12.32.48 AM.jpeg",
    "./WhatsApp Image 2026-06-30 at 12.32.49 AM.jpeg"
];


let specialMomentTimer = null;

function renderSpecialMomentGallery() {
    const img = document.getElementById('special-moment-image');
    if (!img) return;

    if (specialMomentImages.length === 0) {
        img.style.display = 'none';
        return;
    }

    // Use the first image as requested (switch to one)
    img.src = specialMomentImages[0];
}


// Helper to discover images placed in assets/images/ without modifying code.
// Looks for gallery-1.jpg, gallery-2.jpg ... and slide-1.jpg, slide-2.jpg ...
async function loadDynamicImages(prefix, maxAttempts = 15) {
    const validImages = [];
    for (let i = 1; i <= maxAttempts; i++) {
        const url = `assets/images/${prefix}-${i}.jpg`;
        const exists = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
        if (exists) validImages.push(url);
        else break; // Stop checking when sequence breaks
    }
    return validImages;
}

async function renderImages() {
    // 1. Load Slideshow Images
    const slides = await loadDynamicImages("slide");
    const sliderWrapper = document.getElementById('slideshow-wrapper');
    if (slides.length > 0) {
        sliderWrapper.innerHTML = slides.map(src => `<img src="${src}" class="slide-img" alt="Memory">`).join('');
        startSlideshow(slides.length);
    } else {
        document.getElementById('slideshow-section').classList.add('hidden');
    }

    // 1b. Render the special moment gallery with the uploaded photos
    renderSpecialMomentGallery();

    // Special moment cards use absolute paths in the filenames, but images are expected in the project root.
    // So convert to relative paths so they load even if assets/images/ doesn't exist.
    // (Files uploaded by you are currently in the project root.)


    // 2. Load Gallery Images
    const gallery = await loadDynamicImages("gallery");
    const galleryContainer = document.getElementById('gallery-container');
    if (gallery.length > 0) {
        galleryContainer.innerHTML = gallery.map(src => `<img src="${src}" class="gallery-item glass-panel" alt="Gallery photo">`).join('');
    } else {
        document.getElementById('gallery-section').classList.add('hidden');
    }
}


// Slideshow Logic
function startSlideshow(count) {
    let currentIndex = 0;
    const wrapper = document.getElementById('slideshow-wrapper');
    setInterval(() => {
        currentIndex = (currentIndex + 1) % count;
        wrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    }, 3000);
}

/* =========================================================================
   UI GENERATION
   ========================================================================= */
function buildUI() {
    // Timeline
    const timelineContainer = document.getElementById('timeline-container');
    timelineContainer.innerHTML = CONFIG.timeline.map(item => `
        <div class="timeline-item">
            <div class="glass-panel">
                <h3 style="color: var(--primary-color)">${item.year} - ${item.title}</h3>
                <p class="subtitle mt-2">${item.description}</p>
            </div>
        </div>
    `).join('');

    // Wishes
    const wishesContainer = document.getElementById('wishes-container');
    wishesContainer.innerHTML = CONFIG.wishCards.map(wish => `
        <div class="wish-card glass-panel">
            <p>"${wish}"</p>
        </div>
    `).join('');
}

/* =========================================================================
   INTERACTIVE LOGIC (Audio, Countdown, Typing)
   ========================================================================= */
const entryScreen = document.getElementById('entry-screen');
const mainContent = document.getElementById('main-content');
const startBtn = document.getElementById('start-btn');
const countdownDisplay = document.getElementById('countdown-display');
const countdownTimer = document.getElementById('countdown-timer');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

let isMusicPlaying = false;
let audioContext = null;
let gainNode = null;
let fallbackOscillator = null;

function updateMusicButton() {
    musicToggle.innerText = isMusicPlaying ? '🎵 Pause' : '🎵 Play';
}

function ensureAudioContext() {
    if (!audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
    }
    return audioContext;
}

function startFallbackMusic() {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    if (!gainNode) {
        gainNode = ctx.createGain();
        gainNode.gain.value = 0.03;
        gainNode.connect(ctx.destination);
    }

    if (!fallbackOscillator) {
        fallbackOscillator = ctx.createOscillator();
        fallbackOscillator.type = 'sine';
        fallbackOscillator.frequency.value = 440;
        fallbackOscillator.connect(gainNode);
        fallbackOscillator.start();
    }

    gainNode.gain.setTargetAtTime(0.03, ctx.currentTime, 0.05);
}

function stopFallbackMusic() {
    const ctx = ensureAudioContext();
    if (!ctx || !gainNode) return;

    gainNode.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
    setTimeout(() => {
        if (fallbackOscillator) {
            fallbackOscillator.stop();
            fallbackOscillator.disconnect();
            fallbackOscillator = null;
        }
    }, 120);
}

function playMusic() {
    if (isMusicPlaying) return;

    bgMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicButton();
    }).catch(() => {
        startFallbackMusic();
        isMusicPlaying = true;
        updateMusicButton();
    });
}

function pauseMusic() {
    if (!isMusicPlaying) return;

    if (!bgMusic.paused) {
        bgMusic.pause();
    }
    stopFallbackMusic();
    isMusicPlaying = false;
    updateMusicButton();
}

startBtn.addEventListener('click', () => {
    startBtn.classList.add('hidden');
    document.getElementById('entry-title').classList.add('hidden');
    countdownDisplay.classList.remove('hidden');
    
    // Play audio safely after interaction
    playMusic();

    let timeleft = CONFIG.countdownDuration;
    countdownTimer.innerText = timeleft;
    
    const cd = setInterval(() => {
        timeleft--;
        countdownTimer.innerText = timeleft;
        if (timeleft <= 0) {
            clearInterval(cd);
            entryScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            initCelebration();
        }
    }, 1000);
});

musicToggle.addEventListener('click', () => {
    if (isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
});

// Typing Effect
function startTypingEffect() {
    const element = document.getElementById('typing-text');
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentText = CONFIG.typingWishes[textIndex];
        
        if (isDeleting) {
            element.innerText = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            element.innerText = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            speed = 2000; // Pause at end of sentence
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % CONFIG.typingWishes.length;
            speed = 500; // Pause before new sentence
        }
        setTimeout(type, speed);
    }
    type();
}

/* =========================================================================
   CAKE, GIFT & ANIMATIONS
   ========================================================================= */
const flame = document.getElementById('candle-flame');
const giftBox = document.getElementById('gift-box');
const surpriseModal = document.getElementById('surprise-modal');

flame.addEventListener('click', () => {
    flame.style.opacity = '0';
    setTimeout(() => { flame.style.display = 'none'; }, 300);
    fireConfetti();
});

giftBox.addEventListener('click', () => {
    giftBox.classList.add('open');
    setTimeout(() => {
        surpriseModal.classList.remove('hidden');
        fireConfetti();
    }, 800);
});

document.getElementById('close-modal').addEventListener('click', () => {
    surpriseModal.classList.add('hidden');
    giftBox.classList.remove('open');
});

// Scroll Observer for Fade-ins
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1 });

function initCelebration() {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    startTypingEffect();
    spawnBalloons();
    spawnHearts();
    startFireworks();
}


/* =========================================================================
   PARTICLE ENGINES (Fireworks, Confetti, Floating Objects)
   ========================================================================= */

// Balloons & Hearts
function spawnBalloons() {
    const container = document.getElementById('floating-elements');
    setInterval(() => {
        if(document.querySelectorAll('.balloon').length > 10) return;
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.left = Math.random() * 90 + 'vw';
        balloon.style.background = CONFIG.colors.balloons[Math.floor(Math.random() * CONFIG.colors.balloons.length)];
        balloon.style.animationDuration = (8 + Math.random() * 5) + 's';
        container.appendChild(balloon);
        setTimeout(() => balloon.remove(), 12000);
    }, 2000);
}

function spawnHearts() {
    const container = document.getElementById('floating-elements');
    setInterval(() => {
        if(document.querySelectorAll('.heart').length > 15) return;
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 90 + 'vw';
        heart.style.animationDuration = (6 + Math.random() * 4) + 's';
        heart.style.fontSize = (1 + Math.random()) + 'rem';
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 10000);
    }, 1500);
}

// Canvas Fireworks & Confetti
const canvasFW = document.getElementById('fireworks-canvas');
const ctxFW = canvasFW.getContext('2d');
const canvasConfetti = document.getElementById('confetti-canvas');
const ctxConfetti = canvasConfetti.getContext('2d');

let cw = window.innerWidth, ch = window.innerHeight;
canvasFW.width = canvasConfetti.width = cw;
canvasFW.height = canvasConfetti.height = ch;

window.addEventListener('resize', () => {
    cw = window.innerWidth; ch = window.innerHeight;
    canvasFW.width = canvasConfetti.width = cw;
    canvasFW.height = canvasConfetti.height = ch;
});

// Fireworks System
const fwParticles = [];
function createFirework(x, y) {
    const colors = [CONFIG.colors.primary, CONFIG.colors.secondary, '#ffd700', '#ffffff'];
    for(let i=0; i<40; i++) {
        fwParticles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * (Math.random() * 10),
            vy: (Math.random() - 0.5) * (Math.random() * 10),
            alpha: 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 1
        });
    }
}

function updateFireworks() {
    ctxFW.clearRect(0, 0, cw, ch);
    for(let i = fwParticles.length - 1; i >= 0; i--) {
        let p = fwParticles[i];
        p.vy += 0.05; // gravity
        p.x += p.vx; p.y += p.vy;
        p.alpha -= 0.015;
        
        if (p.alpha <= 0) { fwParticles.splice(i, 1); continue; }
        
        ctxFW.globalAlpha = p.alpha;
        ctxFW.fillStyle = p.color;
        ctxFW.beginPath();
        ctxFW.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctxFW.fill();
    }
    requestAnimationFrame(updateFireworks);
}

function startFireworks() {
    updateFireworks();
    setInterval(() => {
        createFirework(Math.random() * cw, Math.random() * (ch/2));
    }, 1500);
}

// Confetti System
const confettis = [];
function fireConfetti() {
    const colors = [CONFIG.colors.primary, CONFIG.colors.secondary, '#ffd700', '#00d2ff'];
    for(let i=0; i<100; i++) {
        confettis.push({
            x: cw / 2, y: ch / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - 10,
            w: Math.random() * 10 + 5,
            h: Math.random() * 5 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 10
        });
    }
    if(confettis.length <= 100) updateConfetti();
}

function updateConfetti() {
    ctxConfetti.clearRect(0, 0, cw, ch);
    let active = false;
    for(let i=0; i<confettis.length; i++) {
        let p = confettis[i];
        if (p.y > ch) continue;
        active = true;
        p.vy += 0.3; // gravity
        p.x += p.vx; p.y += p.vy;
        p.rot += p.rotSpeed;
        
        ctxConfetti.save();
        ctxConfetti.translate(p.x, p.y);
        ctxConfetti.rotate(p.rot * Math.PI / 180);
        ctxConfetti.fillStyle = p.color;
        ctxConfetti.fillRect(-p.w/2, -p.h/2, p.w, p.h);
        ctxConfetti.restore();
    }
    if (active) requestAnimationFrame(updateConfetti);
    else confettis.length = 0;
}

/* =========================================================================
   BOOTSTRAP
   ========================================================================= */
window.onload = () => {
    buildUI();
    renderImages();
    updateMusicButton();
};
