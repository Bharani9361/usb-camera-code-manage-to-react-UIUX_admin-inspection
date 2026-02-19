// loadOpenCv.js
let cvLoaded = false;
let cvLoadPromise = null;

export const loadOpenCv = () => {
    if (cvLoaded) {
        return Promise.resolve();
    }

    if (!cvLoadPromise) {
        cvLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/js/opencv.js'; // Local path to OpenCV.js
            script.async = true;
            script.onload = () => {
                const checkOpenCvReady = setInterval(() => {
                    if (window.cv && window.cv.imread) {
                        clearInterval(checkOpenCvReady);
                        cvLoaded = true;
                        resolve();
                    }
                }, 100);
            };
            script.onerror = () => {
                reject(new Error('Failed to load OpenCV.js'));
            };
            document.body.appendChild(script);
        });
    }

    return cvLoadPromise;
};