function generateInitialPassengerNumber() {
    const isStandardPassenger = Math.random() < 0.7;
    return isStandardPassenger ? Math.floor(Math.random() * 271) + 80 : Math.floor(Math.random() * 649) + 351;
}

function loadPassengerNumber() {
    const stored = localStorage.getItem('infinity_train_number');
    let currentPassengerNumber;
    if (!stored) {
        currentPassengerNumber = generateInitialPassengerNumber();
        localStorage.setItem('infinity_train_number', currentPassengerNumber.toString());
    } else {
        const parsed = parseInt(stored, 10);
        currentPassengerNumber = isNaN(parsed) ? generateInitialPassengerNumber() : Math.min(Math.max(1, parsed), 9999);
    }
    return currentPassengerNumber;
}

class PassengerInstance {
    constructor(slotId = 1) {
        this.slotId = slotId;
        this.isPrimary = slotId === 1;
        this.currentPassengerNumber = this.isPrimary ? loadPassengerNumber() : generateInitialPassengerNumber();
        this.currentDisplayNumber = this.currentPassengerNumber;
        this.animationFrameId = null;
        this.tickTimerId = null;

        this.textureCanvas = document.createElement('canvas');
        this.textureCanvas.width = 1024;
        this.textureCanvas.height = 1024;
        this.textureCtx = this.textureCanvas.getContext('2d');
        this.dynamicTexture = new THREE.CanvasTexture(this.textureCanvas);

        this.initFontAndDraw();
        this.scheduleNextNumberTick();
    }

    initFontAndDraw() {
        document.fonts.ready.then(() => {
            this.updateTexture(this.currentPassengerNumber);
        });
    }

    drawBracketPaths(ctx) {
        ctx.beginPath();
        ctx.moveTo(192, 320);
        ctx.lineTo(192, 256);
        ctx.lineTo(832, 256);
        ctx.lineTo(832, 320);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(832, 704);
        ctx.lineTo(832, 768);
        ctx.lineTo(192, 768);
        ctx.lineTo(192, 704);
        ctx.stroke();
    }

    updateTexture(num, blurAmount = 0, blurDirectionY = 1) {
        const ctx = this.textureCtx;
        ctx.clearRect(0, 0, 1024, 1024);

        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';

        ctx.filter = 'drop-shadow(0px 0px 45px #00ff66) drop-shadow(0px 0px 90px #00ff66)';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 40;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 28;
        this.drawBracketPaths(ctx);

        const yOffset = blurAmount * blurDirectionY * 0.5;
        ctx.filter = `blur(0px ${blurAmount.toFixed(1)}px) drop-shadow(0px 0px 45px #00ff66) drop-shadow(0px 0px 90px #00ff66)`;

        ctx.fillStyle = '#ffffff';
        ctx.font = '320px Raleway, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(num.toString(), 512, 512 + yOffset);
        ctx.filter = 'none';

        this.dynamicTexture.needsUpdate = true;
    }

    animateNumberChange(fromNum, toNum) {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        const startTime = performance.now();
        const isGoingDown = toNum < fromNum;
        const totalDistance = Math.abs(toNum - fromNum);

        const msPerNumber = 80;
        const duration = Math.min(Math.max(totalDistance * msPerNumber, 400), 6000);

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeInOut = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const currentVal = Math.round(fromNum + (toNum - fromNum) * easeInOut);
            this.currentDisplayNumber = currentVal;

            const velocity = 6 * progress * (1 - progress);
            const maxRatePerSecond = (totalDistance / (duration / 1000)) * 1.5;
            const blurAmount = Math.min(velocity * (maxRatePerSecond * 0.35), 24);

            this.updateTexture(currentVal, blurAmount, isGoingDown ? 1 : -1);

            if (progress < 1) {
                this.animationFrameId = requestAnimationFrame(step);
            }
        };

        this.animationFrameId = requestAnimationFrame(step);
    }

    scheduleNextNumberTick() {
        const nextInterval = Math.floor(Math.random() * (75000 - 20000 + 1)) + 20000;

        this.tickTimerId = setTimeout(() => {
            const roll = Math.random();
            let delta = 0;
            let isProgress = true;

            if (roll < 0.35) {
                delta = Math.floor(Math.random() * 16) + 3;
                isProgress = true;
            } else if (roll < 0.80) {
                delta = Math.floor(Math.random() * 21) + 4;
                isProgress = false;
            } else {
                delta = Math.floor(Math.random() * 151) + 50;
                isProgress = Math.random() < 0.50;
            }

            const startNum = this.currentPassengerNumber;
            if (isProgress) {
                this.currentPassengerNumber = Math.max(1, this.currentPassengerNumber - delta);
            } else {
                this.currentPassengerNumber = Math.min(9999, this.currentPassengerNumber + delta);
            }

            if (this.isPrimary) {
                localStorage.setItem('infinity_train_number', this.currentPassengerNumber.toString());
            }

            this.animateNumberChange(startNum, this.currentPassengerNumber);
            this.scheduleNextNumberTick();
        }, nextInterval);
    }
}

function initAR() {
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('ar-canvas');
    if (!videoElement || !canvasElement) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    function syncCanvasDimensions() {
        if (!videoElement.clientWidth || !videoElement.clientHeight) return;
        const width = videoElement.clientWidth || window.innerWidth;
        const height = videoElement.clientHeight || window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
    }

    videoElement.addEventListener('loadedmetadata', syncCanvasDimensions);
    window.addEventListener('resize', syncCanvasDimensions);

    const geometry = new THREE.PlaneGeometry(1.6, 1.6);

    const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 4,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    const maxSupportedHands = 4;
    let trackedSlots = Array.from({ length: maxSupportedHands }, (_, idx) => ({
        id: idx + 1,
        lastPosition: null,
        passenger: new PassengerInstance(idx + 1),
        mesh: null
    }));

    trackedSlots.forEach((slot) => {
        const material = new THREE.MeshBasicMaterial({
            map: slot.passenger.dynamicTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        slot.mesh = new THREE.Mesh(geometry, material);
        slot.mesh.visible = false;
        scene.add(slot.mesh);
    });

    hands.onResults((results) => {
        trackedSlots.forEach(s => s.mesh.visible = false);

        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            renderer.render(scene, camera);
            return;
        }

        const isFrontCamera = currentFacingMode === 'user';
        const currentFrameHands = [];

        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const rawLandmarks = results.multiHandLandmarks[i];
            const handednessObj = results.multiHandedness?.[i];
            const handedness = handednessObj?.label;

            const expectedHandLabel = isFrontCamera ? 'Left' : 'Right';
            if (handedness !== 'Left') continue;

            const landmarks = rawLandmarks.map(pt => ({
                x: pt.x,
                y: pt.y,
                z: pt.z
            }));

            const wrist = landmarks[0];
            const thumbCMC = landmarks[1];
            const indexMCP = landmarks[5];
            const middleMCP = landmarks[9];
            const pinkyMCP = landmarks[17];

            const palmX = (wrist.x + indexMCP.x + pinkyMCP.x) /3;
            const palmY = (wrist.y + indexMCP.y + pinkyMCP.y) /3;

            const vHandX = new THREE.Vector3(indexMCP.x - pinkyMCP.x, -(indexMCP.y - pinkyMCP.y), indexMCP.z - pinkyMCP.z);
            const vHandY = new THREE.Vector3(middleMCP.x - wrist.x, -(middleMCP.y - wrist.y), middleMCP.z - wrist.z);
            const normal = new THREE.Vector3().crossVectors(vHandX, vHandY).normalize();

            const isPalmFacing = normal.z > 0.1;
            if (!isPalmFacing) continue;

            const vPinkyToThumb = new THREE.Vector3(thumbCMC.x - pinkyMCP.x, -(thumbCMC.y - pinkyMCP.y), thumbCMC.z - pinkyMCP.z);
            const thumbProjection = vPinkyToThumb.dot(vHandX);
            if (thumbProjection <= 0) continue;

            const vector = new THREE.Vector3((palmX * 2) - 1, -(palmY * 2) + 1, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const pos = camera.position.clone().add(dir.multiplyScalar(-camera.position.z / dir.z));

            const vIndex = new THREE.Vector3((indexMCP.x * 2) - 1, -(indexMCP.y * 2) + 1, 0.5).unproject(camera);
            const posIndex = camera.position.clone().add(vIndex.sub(camera.position).normalize().multiplyScalar(-camera.position.z / vIndex.z));

            const vPinky = new THREE.Vector3((pinkyMCP.x * 2) - 1, -(pinkyMCP.y * 2) + 1, 0.5).unproject(camera);
            const posPinky = camera.position.clone().add(vPinky.sub(camera.position).normalize().multiplyScalar(-camera.position.z / vPinky.z));

            const physicalHandWidth = posIndex.distanceTo(posPinky);

            const upVector = vHandY.clone().normalize();
            const xAxis = new THREE.Vector3().crossVectors(upVector, normal).normalize();

            const matrix = new THREE.Matrix4();
            matrix.makeBasis(xAxis, upVector, normal);

            currentFrameHands.push({ pos, matrix, scale: physicalHandWidth });
        }

        const filteredHands = [];
        for (const hand of currentFrameHands) {
            const isDuplicate = filteredHands.some(h => h.pos.distanceTo(hand.pos) < 1.0);
            if (!isDuplicate) filteredHands.push(hand);
        }

        const unassignedSlots = [...trackedSlots];

        filteredHands.forEach((handData) => {
            let bestSlotIndex = -1;
            let minDistance = Infinity;

            unassignedSlots.forEach((slot, index) => {
                if (slot.lastPosition) {
                    const dist = slot.lastPosition.distanceTo(handData.pos);
                    if (dist < minDistance && dist < 1.8) {
                        minDistance = dist;
                        bestSlotIndex = index;
                    }
                }
            });

            if (bestSlotIndex === -1) {
                bestSlotIndex = unassignedSlots.findIndex(s => s.id === 1);
                if (bestSlotIndex === -1) {
                    bestSlotIndex = unassignedSlots.findIndex(s => s.lastPosition === null);
                }
            }
            if (bestSlotIndex === -1) bestSlotIndex = 0;

            const slot = unassignedSlots.splice(bestSlotIndex, 1)[0];
            slot.lastPosition = handData.pos.clone();

            slot.mesh.position.copy(handData.pos);
            slot.mesh.rotation.setFromRotationMatrix(handData.matrix);
            slot.mesh.scale.setScalar(handData.scale);
            slot.mesh.visible = true;
        });

        unassignedSlots.forEach(s => s.lastPosition = null);

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

        captureCanvas.width = 480;
        captureCanvas.height = 640;

        const ctx = captureCanvas.getContext('2d');

        if (currentFacingMode === 'user') {
            ctx.translate(480, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(videoElement, 0, 0, 480, 640);
        ctx.drawImage(canvasElement, 0, 0, 480, 640);
        
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        const primaryNumber = trackedSlots[0].passenger.currentPassengerNumber;

        const link = document.createElement('a');
        link.download = `passenger-${primaryNumber}-infinity-train.png`;
        link.href = captureCanvas.toDataURL('image/png');
        link.click();
    });
}

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