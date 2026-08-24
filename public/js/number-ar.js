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
        this.textureCanvas.width = 768;
        this.textureCanvas.height = 768;
        this.textureCtx = this.textureCanvas.getContext('2d');
        this.dynamicTexture = new THREE.CanvasTexture(this.textureCanvas);

        this.initFontAndDraw();
        this.scheduleNextNumberTick();
    }

    initFontAndDraw() {
        document.fonts.load('240px Raleway').then(() => {
            this.updateTexture(this.currentPassengerNumber);
        }).catch(() => {
            this.updateTexture(this.currentPassengerNumber);
        });
    }

    drawBracketPaths(ctx) {
        ctx.beginPath();
        ctx.moveTo(144, 240);
        ctx.lineTo(144, 192);
        ctx.lineTo(624, 192);
        ctx.lineTo(624, 240);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(624, 528);
        ctx.lineTo(624, 576);
        ctx.lineTo(144, 576);
        ctx.lineTo(144, 528);
        ctx.stroke();
    }

    updateTexture(num, blurAmount = 0, blurDirectionY = 1) {
        const ctx = this.textureCtx;
        ctx.clearRect(0, 0, 768, 768);

        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';

        ctx.filter = 'drop-shadow(0px 0px 30px #00ff66) drop-shadow(0px 0px 60px #00ff66)';
        ctx.shadowColor = '#00ff66';
        ctx.shadowBlur = 30;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 20;
        this.drawBracketPaths(ctx);

        const yOffset = blurAmount * blurDirectionY * 0.5;
        ctx.filter = `blur(0px ${blurAmount.toFixed(1)}px) drop-shadow(0px 0px 30px #00ff66) drop-shadow(0px 0px 60px #00ff66)`;

        ctx.fillStyle = '#ffffff';
        ctx.font = '240px Raleway, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(num.toString(), 384, 384 + yOffset);
        ctx.filter = 'none';

        this.dynamicTexture.needsUpdate = true;
    }

    animateNumberChange(fromNum, toNum) {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }

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
            const velocity = 6 * progress * (1 - progress);
            const maxRatePerSecond = (totalDistance / (duration / 1000)) * 1.5;
            const blurAmount = Math.min(velocity * (maxRatePerSecond * 0.35), 24);

            if (currentVal !== this.currentDisplayNumber || Math.abs(blurAmount - this.lastBlurAmount) > 0.5) {
                this.currentDisplayNumber = currentVal;
                this.lastBlurAmount = blurAmount;
                this.updateTexture(currentVal, blurAmount, isGoingDown ? 1 : -1);
            }

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

    dispose() {
        if (this.tickTimerId) {
            clearTimeout(this.tickTimerId);
            this.tickTimerId = null;
        }
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.dynamicTexture) {
            this.dynamicTexture.dispose();
        }
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
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
    });

    const MAX_MISSED_FRAMES = 8;
    const maxSupportedHands = 4;

    let trackedSlots = Array.from({ length: maxSupportedHands }, (_, idx) => ({
        id: idx + 1,
        lastPosition: null,
        velocity: new THREE.Vector3(0, 0, 0),
        missedFrames: MAX_MISSED_FRAMES,
        passenger: new PassengerInstance(idx + 1),
        mesh: null,
        material: null
    }));

    trackedSlots.forEach((slot) => {
        const material = new THREE.MeshBasicMaterial({
            map: slot.passenger.dynamicTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 1.0
        });
        slot.mesh = new THREE.Mesh(geometry, material);
        slot.mesh.visible = false;
        scene.add(slot.mesh);
    });

    const scratchVecA = new THREE.Vector3();
    const scratchVecB = new THREE.Vector3();
    const scratchNormal = new THREE.Vector3();
    const scratchVecC = new THREE.Vector3();
    const scratchVecD = new THREE.Vector3();
    const scratchVecE = new THREE.Vector3();
    const scratchVecF = new THREE.Vector3();
    const scratchVecUp = new THREE.Vector3();
    const scratchVecX = new THREE.Vector3();
    const scratchPos = new THREE.Vector3();
    const scratchPosIndex = new THREE.Vector3();
    const scratchPosPinky = new THREE.Vector3();
    const scratchMatrix = new THREE.Matrix4();

    hands.onResults((results) => {
        const currentFrameHands = [];

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const rawLandmarks = results.multiHandLandmarks[i];
                const handednessObj = results.multiHandedness?.[i];
                const handedness = handednessObj?.label;

                if (handedness !== 'Left') continue;

                const wrist = rawLandmarks[0];
                const thumbCMC = rawLandmarks[1];
                const indexMCP = rawLandmarks[5];
                const middleMCP = rawLandmarks[9];
                const pinkyMCP = rawLandmarks[17];

                const palmX = (wrist.x + indexMCP.x + pinkyMCP.x) /3;
                const palmY = (wrist.y + indexMCP.y + pinkyMCP.y) /3;

                const vHandX = scratchVecA.set(indexMCP.x - pinkyMCP.x, -(indexMCP.y - pinkyMCP.y), indexMCP.z - pinkyMCP.z);
                const vHandY = scratchVecB.set(middleMCP.x - wrist.x, -(middleMCP.y - wrist.y), middleMCP.z - wrist.z);
                const normal = scratchNormal.crossVectors(vHandX, vHandY).normalize();

                const isPalmFacing = normal.z > 0.1;
                if (!isPalmFacing) continue;

                const vPinkyToThumb = scratchVecC.set(thumbCMC.x - pinkyMCP.x, -(thumbCMC.y - pinkyMCP.y), thumbCMC.z - pinkyMCP.z);
                const thumbProjection = vPinkyToThumb.dot(vHandX);
                if (thumbProjection <= 0) continue;

                scratchVecD.set((palmX * 2) - 1, -(palmY * 2) + 1, 0.5).unproject(camera);
                const dir = scratchVecD.sub(camera.position).normalize();
                scratchPos.copy(camera.position).add(dir.multiplyScalar(-camera.position.z / dir.z));

                scratchVecE.set((indexMCP.x * 2) - 1, -(indexMCP.y * 2) + 1, 0.5).unproject(camera);
                const dirIndex = scratchVecE.sub(camera.position).normalize();
                scratchPosIndex.copy(camera.position).add(dirIndex.multiplyScalar(-camera.position.z / dirIndex.z));

                scratchVecF.set((pinkyMCP.x * 2) - 1, -(pinkyMCP.y * 2) + 1, 0.5).unproject(camera);
                const dirPinky = scratchVecF.sub(camera.position).normalize();
                scratchPosPinky.copy(camera.position).add(dirPinky.multiplyScalar(-camera.position.z / dirPinky.z));

                const physicalHandWidth = scratchPosIndex.distanceTo(scratchPosPinky);
                const upVector = scratchVecUp.copy(vHandY).normalize();
                const xAxis = scratchVecX.crossVectors(upVector, normal).normalize();

                scratchMatrix.makeBasis(xAxis, upVector, normal);

                currentFrameHands.push({ 
                    pos: scratchPos.clone(), 
                    matrix: scratchMatrix.clone(), 
                    scale: physicalHandWidth
                 });
            }
        }
        
        const claimedSlotIds = new Set();

        currentFrameHands.forEach((handData) => {
            let bestSlot = null;
            let minDistance = Infinity;

            trackedSlots.forEach((slot) => {
                if (claimedSlotIds.has(slot.id)) return;
                if (slot.lastPosition) {
                    const dist = slot.lastPosition.distanceTo(handData.pos);
                    if (dist < minDistance && dist < 2.0) {
                        minDistance = dist;
                        bestSlot = slot;
                    }
                }
            });

            if (!bestSlot) {
                bestSlot = trackedSlots.find(s => !claimedSlotIds.has(s.id) && s.missedFrames >= MAX_MISSED_FRAMES);
            }
            if (!bestSlot) {
                bestSlot = trackedSlots.find(s => !claimedSlotIds.has(s.id));
            }
            if (bestSlot) {
                claimedSlotIds.add(bestSlot.id);

                if (bestSlot.lastPosition) {
                    bestSlot.velocity.subVectors(handData.pos, bestSlot.lastPosition);
                }

                if (!bestSlot.lastPosition || bestSlot.missedFrames >= MAX_MISSED_FRAMES) {
                    bestSlot.mesh.position.copy(handData.pos);
                } else {
                    bestSlot.mesh.position.lerp(handData.pos, 0.45);
                }

                bestSlot.lastPosition = bestSlot.mesh.position.clone();
                bestSlot.mesh.rotation.setFromRotationMatrix(handData.matrix);
                bestSlot.mesh.scale.setScalar(handData.scale);

                bestSlot.missedFrames = 0;
                bestSlot.material.opacity = 1.0;
                bestSlot.mesh.visible = true;
            }
        });

        trackedSlots.forEach((slot) => {
            if (!claimedSlotIds.has(slot.id)) {
                slot.missedFrames += 1;

                if (slot.missedFrames < MAX_MISSED_FRAMES && slot.lastPosition) {
                    slot.velocity.multiplyScalar(0.75);
                    slot.mesh.position.add(slot.velocity);
                    slot.lastPosition.copy(slot.mesh.position);

                    slot.material.opacity = 1.0 - (slot.missedFrames / MAX_MISSED_FRAMES);
                    slot.mesh.visible = true;
                } else {
                    slot.mesh.visible = false;
                    slot.lastPosition = null;
                    slot.velocity.set(0, 0, 0);
                }
            }
        });

        renderer.render(scene, camera);
    });

    let currentFacingMode = 'user';
    let cameraUtils = null;

    async function startCamera(facingMode) {
        if (cameraUtils) {
            cameraUtils.stop();
        }

        if (videoElement.srcObject) {
            const stream = videoElement.srcObject;
            if (stream.getTracks) {
                stream.getTracks().forEach(track => track.stop());
            }
        }

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

        const captureWidth = videoElement.videoWidth || 480;
        const captureHeight = videoElement.videoHeight || 640;

        captureCanvas.width = captureWidth;
        captureCanvas.height = captureHeight;

        const ctx = captureCanvas.getContext('2d');

        if (currentFacingMode === 'user') {
            ctx.translate(captureWidth, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(videoElement, 0, 0, captureWidth, captureHeight);
        renderer.render(scene, camera);
        ctx.drawImage(canvasElement, 0, 0, captureWidth, captureHeight);
        
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