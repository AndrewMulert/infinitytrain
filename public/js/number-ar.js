document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('webcam');
    const canvasElement = document.getElementById('ar-canvas');
    if (!videoElement || !canvasElement) return;

    function generateInitialPassengerNumber() {
        const isStandardPassenger = Math.random() < 0.7;
        return isStandardPassenger ? Math.floor(Math.random() * 271) +80 : Math.floor(Math.random() * 649) + 351;
    }

    let passengerNumber = localStorage.getItem('infinity_train_number');
    if (!passengerNumber) {
        passengerNumber = Math.floor(Math.random() * 850) + 115;
        localStorage.setItem('infinity_train_number', passengerNumber);
    }
})