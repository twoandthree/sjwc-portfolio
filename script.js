const workNodes = [
    { id: 'hexagon', title: '// 01. TYD 19\'' },
    { id: 'back9', title: '// 02. Python Freelance 23\'' },
    { id: 'tucson', title: '// 03. Hexagon Mining 23\'' },
    { id: 'flutter', title: '// 04. Flutter Freelance 23\'' },
    { id: 'baseten', title: '// 05. Full-Stack Back9 Parlor 25\'' },
    { id: 'systems', title: '// 06. Web Freelance 26\'' }
];

let currentAngle = 0;
let orbitSpeed = 1.0;
let activeOrbIndex = -1; // -1 means all are in orbit
let isHovered = false;
const radiusX = 230;
const radiusY = 50;

const backOrbRing = document.getElementById('backOrbRing');
const frontOrbRing = document.getElementById('frontOrbRing');
const stageContainer = document.getElementById('stageContainer');
const sliderSpeed = document.getElementById('sliderSpeed');
const speedVal = document.getElementById('speedVal');
const speedIndicator = document.getElementById('speedIndicator');
const statusIndicator = document.getElementById('statusIndicator');
const btnRelease = document.getElementById('btnRelease');

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
        
        // Localized surface particle canvas for the noise distortion wrap
        const surfaceCanvas = document.createElement('canvas');
        surfaceCanvas.className = 'orb-surface-canvas';
        surfaceCanvas.width = 144;  // High-DPI retina sharpness
        surfaceCanvas.height = 144;
        orb.appendChild(surfaceCanvas);

        const label = document.createElement('div');
        label.className = 'orb-label';
        label.textContent = node.title;
        orb.appendChild(label);

        // Hover events to pause orbital rotation while targeting
        orb.addEventListener('mouseenter', () => { 
            isHovered = true; 
        });
        
        orb.addEventListener('mouseleave', () => { 
            if (activeOrbIndex === -1) {
                isHovered = false; 
            }
        });

        orb.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeOrbIndex === index) {
                releaseOrb();
            } else {
                triggerWarpBlink(index);
            }
        });

        backOrbRing.appendChild(orb);
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
        statusIndicator.textContent = '// ALL ORBS ORBITING';
    }
    orbElements.forEach(orb => {
        orb.classList.remove('active-orb', 'hard-impact-shake', 'warp-blink');
    });

    // Option: Trigger dossier closure here when ready
    // closeDossier();
}

function updateOrbPositions() {
    const count = orbElements.length;
    const auraHalfWidth = 0; // Width threshold behind the white aura & torso

    orbElements.forEach((orb, i) => {
        if (i === activeOrbIndex) {
            if (orb.parentNode !== frontOrbRing) frontOrbRing.appendChild(orb);
            orb.style.transform = `translate3d(0px, 40px, 180px) scale(1.4)`;
            orb.style.zIndex = 100;
            orb.style.opacity = 1;
            orb.style.setProperty('--highlight-x', `50%`);
            orb.style.setProperty('--highlight-y', `35%`);
            return;
        }

        const angle = currentAngle + (i * (2 * Math.PI / count));
        const x = Math.cos(angle) * radiusX;
        const z = Math.sin(angle) * radiusX; 
        const y = Math.sin(angle) * radiusY;

        const depthScale = (z + radiusX) / (2 * radiusX);
        const scale = 0.65 + (depthScale * 0.45);

        let orbOpacity = 0.55 + (depthScale * 0.45);

        // Route between back ring (z < 0) and front ring (z >= 0)
        if (z < 0) {
            if (orb.parentNode !== backOrbRing) backOrbRing.appendChild(orb);
            
            // Fade out completely while passing directly behind the central aura/torso
            if (Math.abs(x) < auraHalfWidth) {
                orbOpacity = 0;
            }
        } else {
            if (orb.parentNode !== frontOrbRing) frontOrbRing.appendChild(orb);
        }

        const zIndex = Math.round(depthScale * 20);

        orb.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;
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
    orbitSpeed = parseFloat(e.target.value);
    if (speedVal) speedVal.textContent = `${orbitSpeed.toFixed(1)}x`;
    if (speedIndicator) speedIndicator.textContent = `Orbit Speed: ${orbitSpeed.toFixed(1)}x`;
});

btnRelease.addEventListener('click', releaseOrb);

window.onload = () => {
    createOrbs();
    initOrbSurfaces();
    updateOrbPositions();
    animate();
};