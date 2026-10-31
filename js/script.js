
const workNodes = [
    { 
        id: 'freelance', 
        title: '2026 - Freelance',
        role: 'Front-End Developer',
        tech: 'HTML/CSS/JS // DNS // UI/UX',
        desc: 'Designed, photographed, and deployed custom static web apps and DNS routing for local businesses.'
    },
    { 
        id: 'back9', 
        title: '2025 - Back9 Parlor',
        role: 'Full-Stack Web Dev',
        tech: ' WordPress // Elementor',
        desc: 'Built custom frontend components and managed WooCommerce booking infrastructure & SEO.'
    },
    { 
        id: 'flutter', 
        title: '2023 - Freelance',
        role: 'Flutter Developer',
        tech: 'Flutter // Dart // SQL',
        desc: 'Built cross-platform mobile application prototype utilizing MVC architecture and SQL persistence.'
    },
    { 
        id: 'hex', 
        title: '2023 - Hexagon Mining',
        role: 'Software QA Engineer',
        tech: 'Python Scripting // UI Testing',
        desc: 'Conducted rigorous manual and automated quality assurance for operator safety interfaces.'
    },
    { 
        id: 'mining', 
        title: '2023 - Freelance',
        role: 'Python Developer',
        tech: 'Python // TestRail // openpyxl',
        desc: 'Automated test result reporting pipelines, cutting manual execution overhead by 20 hours.'
    },
    { 
        id: 'tyd', 
        title: '2019 - Tucson Youth Development',
        role: 'Android Developer',
        tech: 'Kotlin // Firebase',
        desc: 'Engineered cross-platform caseworker messaging app with custom Firebase backend architecture.'
    },

];

let currentAngle = 0;
let orbitSpeed = 1.0;
let activeOrbIndex = -1; // -1 means all are in orbit
let time = 0;
let isHovered = false;
const radiusX = 230;
const radiusY = 50;

const backOrbRing = document.getElementById('backOrbRing');
const frontOrbRing = document.getElementById('frontOrbRing');
const stageContainer = document.getElementById('stageContainer');
const sliderSpeed = document.getElementById('sliderSpeed') || { value: '1', addEventListener: () => {} };
const speedVal = document.getElementById('speedVal') || { textContent: '' };
const btnRelease = document.getElementById('btnRelease') || { addEventListener: () => {}, style: {} };

// Store stable references in an array so index 'i' never gets scrambled by DOM moves
let orbElements = [];

function createOrbs() {
    backOrbRing.innerHTML = '';
    frontOrbRing.innerHTML = '';
    orbElements = [];

    workNodes.forEach((node, index) => {
        const orb = document.createElement('div');
        orb.className = 'truth-orb pointer-events-auto';
        orb.dataset.index = index;
        
        const surfaceCanvas = document.createElement('canvas');
        surfaceCanvas.className = 'orb-surface-canvas';
        surfaceCanvas.width = 144;
        surfaceCanvas.height = 144;
        orb.appendChild(surfaceCanvas);

        // --- NEW: Holographic Dossier Container ---
        const dossier = document.createElement('div');
        dossier.className = 'orb-dossier';
        dossier.innerHTML = `
            <div class="dossier-header">${node.title}</div>
            <div class="dossier-role">${node.role}</div>
            <div class="dossier-tech">// ${node.tech}</div>
            <div class="dossier-desc">${node.desc}</div>
        `;
        orb.appendChild(dossier);
        // ------------------------------------------

        const label = document.createElement('div');
        label.className = 'orb-label';
        label.textContent = node.title;
        orb.appendChild(label);

        orb.addEventListener('mouseenter', () => { isHovered = true; });
        orb.addEventListener('mouseleave', () => { 
            if (activeOrbIndex === -1) { isHovered = false; }
        });

        orb.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeOrbIndex === index) {
                releaseOrb();
            } else {
                triggerWarpBlink(index);
            }
        });

        const angle = currentAngle + (index * (2 * Math.PI / workNodes.length));
        const z = Math.sin(angle);

        if (z < 0) {
            backOrbRing.appendChild(orb);
        } else {
            frontOrbRing.appendChild(orb);
        }

        orbElements.push(orb);
    });
}

function triggerWarpBlink(index) {
    activeOrbIndex = index;
    if (statusIndicator) {
        statusIndicator.textContent = `// FOCUSED: ${workNodes[index].title.toUpperCase()}`;
    }

    orbElements.forEach((orb, i) => {
        orb.classList.remove('active-orb', 'hard-impact-shake', 'warp-blink');
        if (i === index) {
            // Promote focused orb to the front ring for clear rendering & focus
            if (orb.parentNode !== frontOrbRing) {
                frontOrbRing.appendChild(orb);
            }
            orb.classList.add('warp-blink');
            
            setTimeout(() => {
                orb.classList.remove('warp-blink');
                orb.classList.add('active-orb', 'hard-impact-shake');
            }, 80);
        }
    });

    // Option: Trigger holographic dossier projection reveal here when ready
    // openDossier(workNodes[index]);
}

function releaseOrb() {
    activeOrbIndex = -1;
    isHovered = false;
    if (statusIndicator) {
        statusIndicator.textContent = 'HIGHLY MOTIVATED, AND READY TO GET CREATIVE';
    }
    orbElements.forEach(orb => {
        orb.classList.remove('active-orb', 'hard-impact-shake', 'warp-blink');
    });

    // Option: Trigger dossier closure here when ready
    closeDossier();
}

function updateOrbPositions() {
    const count = orbElements.length;

    orbElements.forEach((orb, i) => {
        if (i === activeOrbIndex) {
    if (orb.parentNode !== frontOrbRing) {
        frontOrbRing.appendChild(orb);
    }
    orb.classList.add('active-orb');
    orb.style.transform = ''; // Let CSS & keyframes handle transform entirely
    return;
}

        const angle = currentAngle + (i * (2 * Math.PI / count));
        
        // Ellipse coordinates
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        const z = Math.sin(angle); // Depth factor (-1 = deep back, +1 = close front)

        const depthScale = (z + 1) / 2;
        const scale = 0.65 + (depthScale * 0.45);
        let orbOpacity = 0.55 + (depthScale * 0.45);

        // --- DYNAMIC DOM RE-PARENTING ---
        // Dynamically shift nodes between back (behind avatar z-10) and front (in front z-30)
        const targetRing = (z < 0) ? backOrbRing : frontOrbRing;
        if (orb.parentNode !== targetRing) {
            targetRing.appendChild(orb);
        }

        if (z < 0) {
            orb.style.pointerEvents = 'none';
        } else {
            orb.style.pointerEvents = 'auto';
        }

        const zIndex = Math.round(depthScale * 100);

        orb.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
        orb.style.zIndex = zIndex;
        orb.style.opacity = orbOpacity;

        const hlX = 40 + (Math.cos(angle) * 20);
        const hlY = 35 + (Math.sin(angle) * 15);
        orb.style.setProperty('--highlight-x', `${hlX}%`);
        orb.style.setProperty('--highlight-y', `${hlY}%`);
    });
}

function animate() {
    // Rotation pauses when hovering an orb or when an orb is actively locked (-1 means inactive)
    if (!isHovered && activeOrbIndex === -1) {
        currentAngle += 0.005 * orbitSpeed;
    }
    
    updateOrbPositions();
    requestAnimationFrame(animate);
}

// Localized Surface Particle Shader Loop for Orb Hover Shells
function initOrbSurfaces() {
    const canvases = document.querySelectorAll('.orb-surface-canvas');
    
    canvases.forEach((canvas) => {
        const ctx = canvas.getContext('2d');
        const orb = canvas.closest('.truth-orb');
        let animationFrameId;
        let angle = 0;

        function render() {
            // Only animate if the parent orb is currently being hovered
            if (orb.matches(':hover')) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const radius = 54; // Scaled for 144x144 retina canvas
                
                angle += 0.03; // Rotation speed
                
                // Draw a grid of latitude/longitude points wrapped on a sphere
                const lats = 10;
                const lons = 16;
                
                for (let i = 0; i <= lats; i++) {
                    const lat = (i / lats) * Math.PI - Math.PI / 2;
                    const sinLat = Math.sin(lat);
                    const cosLat = Math.cos(lat);
                    
                    for (let j = 0; j < lons; j++) {
                        const lon = (j / lons) * Math.PI * 2 + angle;
                        
                        // Simulating noise displacement via multi-frequency sine waves
                        const noise = Math.sin(lat * 3 + angle * 2) * Math.cos(lon * 4 + angle) * 6;
                        const currentRadius = radius + noise;
                        
                        // 3D to 2D projection
                        const x = cx + currentRadius * cosLat * Math.sin(lon);
                        const y = cy + currentRadius * sinLat;
                        const z = cosLat * Math.cos(lon); // Depth sorting factor
                        
                        // Only render points facing the camera (z > -0.2)
                        if (z > -0.2) {
                            const alpha = Math.max(0.2, (z + 0.2) / 1.2);
                            const size = Math.max(1, (z * 1.5 + 2.2));
                            
                            ctx.fillStyle = `rgba(255, 30, 30, ${alpha})`;
                            ctx.fillRect(x - size/2, y - size/2, size, size);
                        }
                    }
                }
                animationFrameId = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        // Trigger loop on mouseenter
        orb.addEventListener('mouseenter', () => {
            cancelAnimationFrame(animationFrameId);
            render();
        });
    });
}

stageContainer.addEventListener('click', (e) => {
    if (e.target === stageContainer || e.target.closest('.figure-aura')) {
        releaseOrb();
    }
});

sliderSpeed.addEventListener('input', (e) => {
    orbitSpeed = orbitSpeed;
});

btnRelease.addEventListener('click', releaseOrb);

window.onload = () => {
    createOrbs();
    initOrbSurfaces();
    updateOrbPositions();
    animate();
};