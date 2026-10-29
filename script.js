
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
        
        const label = document.createElement('div');
        label.className = 'orb-label';
        label.textContent = node.title;
        orb.appendChild(label);

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
    statusIndicator.textContent = `// FOCUSED: ${workNodes[index].title.toUpperCase()}`;

    orbElements.forEach((orb, i) => {
        orb.classList.remove('active-orb', 'hard-impact-shake', 'warp-blink');
        if (i === index) {
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
}

function releaseOrb() {
    activeOrbIndex = -1;
    statusIndicator.textContent = '// ALL ORBS ORBITING';
    orbElements.forEach(orb => {
        orb.classList.remove('active-orb', 'hard-impact-shake', 'warp-blink');
    });
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
    currentAngle += 0.005 * orbitSpeed;
    updateOrbPositions();
    requestAnimationFrame(animate);
}

stageContainer.addEventListener('click', (e) => {
    if (e.target === stageContainer || e.target.closest('.figure-aura')) {
        releaseOrb();
    }
});

sliderSpeed.addEventListener('input', (e) => {
    orbitSpeed = parseFloat(e.target.value);
    speedVal.textContent = `${orbitSpeed.toFixed(1)}x`;
    speedIndicator.textContent = `Orbit Speed: ${orbitSpeed.toFixed(1)}x`;
});

btnRelease.addEventListener('click', releaseOrb);

window.onload = () => {
    createOrbs();
    updateOrbPositions();
    animate();
};
