let currentPassengerNumber = 115;
let tickTimerId = null;

function generateInitialPassengerNumber() {
    const isStandardPassenger = Math.random() < 0.7;
    return isStandardPassenger ? Math.floor(Math.random() * 271) + 80 : Math.floor(Math.random() * 649) + 351;
}

function loadPassengerNumber() {
    const stored = localStorage.getItem('infinity_train_number');
    if (!stored) {
        currentPassengerNumber = generateInitialPassengerNumber();
        localStorage.setItem('infinity_train_number', currentPassengerNumber);
    } else {
        const parsed = parseInt(stored, 10);
        currentPassengerNumber = isNaN(parsed) ? generateInitialPassengerNumber() : Math.min(Math.max(1, parsed), 9999);
    }
    return currentPassengerNumber;
}

function scheduleNextNumberTick(onUpdate) {
    const nextInterval = Math.floor(Math.random() * (90000 - 15000 + 1)) + 15000;

    tickTimerId = setTimeout(() => {
        const roll = Math.random();
        let delta = 0;
        let isProgress = true;
        
        if (roll < 0.60) {
            delta = Math.floor(Math.random() * 4) + 1;
            isProgress = true;
        } else if (roll < 0.90) {
            delta = Math.floor(Math.random() * 6) + 1;
            isProgress = false;
        } else {
            delta = Math.floor(Math.random() * 11) + 8;
            isProgress = Math.random() < 0.5;
        }

        if (isProgress) {
            currentPassengerNumber = Math.max(1, currentPassengerNumber - delta);
        } else {
            currentPassengerNumber = Math.min(9999, currentPassengerNumber + delta);
        }

        localStorage.setItem('infinity_train_number', currentPassengerNumber);
        onUpdate(currentPassengerNumber);

        scheduleNextNumberTick(onUpdate);
    }, nextInterval);
}

function createTextureEngine() {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 512;
    textureCanvas.height = 512;
    const textureCtx = textureCanvas.getContext('2d');
    const dynamicTexture = new THREE.CanvasTexture(textureCanvas);

    function drawBracketPaths(ctx) {
        ctx.beginPath();
        ctx.moveTo(96, 128);
        ctx.lineTo(416, 128);
        ctx.moveTo(96, 128);
        ctx.lineTo(96, 160);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(96, 384);
        ctx.lineTo(416, 384);
        ctx.moveTo(416, 384);
        ctx.lineTo(416, 352);
        ctx.stroke();
    }

    function updateTexture(num) {
        textureCtx.clearRect(0, 0, 512, 512);

        textureCtx.shadowColor = '#00ff66';
        textureCtx.shadowBlur = 30;

        textureCtx.strokeStyle = 'rgba(0, 255, 102, 0.5)';
        textureCtx.lineWidth = 36;
        drawBracketPaths(textureCtx);

        textureCtx.strokeStyle = '#00ff66';
        textureCtx.lineWidth = 24;
        drawBracketPaths(textureCtx);

        textureCtx.shadowBlur = 15;
        textureCtx.strokeStyle = '#ffffff';
        textureCtx.lineWidth = 14;
        drawBracketPaths(textureCtx);

        textureCtx.shadowBlur = 25;
        textureCtx.fillStyle = '#ffffff';
        textureCtx.font = '160px Raleway, sans-serif';
        textureCtx.textAlign = 'center';
        textureCtx.textBaseline = 'middle';
        textureCtx.fillText(num.toString(), 256, 256);

        dynamicTexture.needsUpdate = true;
    }

    return { dynamicTexture, updateTexture };
}

function initAR() {
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('ar-canvas');
    if (!videoElement || !canvasElement) return;

    const initialNum = loadPassengerNumber();
    const { dynamicTexture, updateTexture } = createTextureEngine();
    updateTexture(initialNum);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 640 / 480, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setSize(640, 480);
    renderer.setPixelRatio(window.devicePixelRatio);

    const geometry = new THREE.PlaneGeometry(1.6, 1.6);
    const material = new THREE.MeshBasicMaterial({
        map: dynamicTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const numberMesh = new THREE.Mesh(geometry, material);
    numberMesh.visible = false;
    scene.add(numberMesh);

    scheduleNextNumberTick((updatedNumber) => {
        updateTexture(updatedNumber);
    });

    const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            const wrist = landmarks[0];
            const indexMCP = landmarks[5];
            const middleMCP = landmarks[9];
            const pinkyMCP = landmarks[17];

            const palmX = (wrist.x + indexMCP.x + pinkyMCP.x) / 3;
            const palmY = (wrist.y + indexMCP.y + pinkyMCP.y) / 3;

            const vector = new THREE.Vector3((palmX * 2) - 1, -(palmY * 2) + 1, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            const pos = camera.position.clone().add(dir.multiplyScalar(distance));

            numberMesh.position.copy(pos);

            const v1 = new THREE.Vector3(indexMCP.x - wrist.x, -(indexMCP.y - wrist.y), indexMCP.z - wrist.z);
            const v2 = new THREE.Vector3(pinkyMCP.x - wrist.x, -(pinkyMCP.y - wrist.y), pinkyMCP.z - wrist.z);
            const normal = new THREE.Vector3().crossVectors(v1, v2).normalize();

            numberMesh.lookAt(numberMesh.position.clone().add(normal));

            const handWidth = Math.hypot(indexMCP.x - pinkyMCP.x, indexMCP.y - pinkyMCP.y);
            numberMesh.scale.setScalar(handWidth * 3.2);

            numberMesh.visible = true;
        } else {
            numberMesh.visible = false;
        }

        renderer.render(scene, camera);
    });

    let currentFacingMode = 'user';
    let cameraUtils = null;

    async function startCamera(facingMode) {
        if (cameraUtils) cameraUtils.stop();
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {facingMode: facingMode }
            });
            videoElement.srcObject = stream;
        } catch (err) {
            console.error("Camera access denied or unavailable:", err);
            return;
        }

        const isUser = facingMode === 'user';
        videoElement.style.transform = isUser ? 'scaleX(-1)' : 'none';
        canvasElement.style.transform = isUser ? 'scaleX(-1)' : 'none';

        cameraUtils = new window.Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 640,
            height: 480,
            facingMode: facingMode
        });
        cameraUtils.start();
    }

    startCamera(currentFacingMode);

    document.getElementById('flip-camera-btn')?.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
        startCamera(currentFacingMode);
    });

    document.getElementById('capture-btn')?.addEventListener('click', () => {
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = 640;
        captureCanvas.height = 480;
        const ctx = captureCanvas.getContext('2d');

        if (currentFacingMode === 'user') {
            ctx.translate(640, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(videoElement, 0, 0, 640, 480);
        ctx.drawImage(canvasElement, 0, 0, 640, 480);

        const link = document.createElement('a');
        link.download = `passenger-${currentPassengerNumber}-infinity-train.png`;
        link.href = captureCanvas.toDataURL('image/png');
        link.click();
    });
};

function waitForDependenciesAndInit() {
    if (window.THREE && window.Hands && window.Camera) {
        initAR();
    } else {
        setTimeout(waitForDependenciesAndInit, 50);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForDependenciesAndInit);
} else {
    waitForDependenciesAndInit();
}