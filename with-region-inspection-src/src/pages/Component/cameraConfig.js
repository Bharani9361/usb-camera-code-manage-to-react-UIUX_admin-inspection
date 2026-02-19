// cameraConfig.js

export const CAMERA_RESOLUTIONS = {
    '4K': {
        '16_9': { width: 3840, height: 2160 },
        '4_3': { width: 2880, height: 2160 }, // height fixed, width adjusted
    },
    '1440p': {
        '16_9': { width: 2560, height: 1440 },
        '4_3': { width: 1920, height: 1440 },
    },
    '1080p': {
        '16_9': { width: 1920, height: 1080 },
        '4_3': { width: 1440, height: 1080 },
    },
    '720p': {
        '16_9': { width: 1280, height: 720 },
        '4_3': { width: 960, height: 720 },
    },
};

// Optional: set your default resolution
export const DEFAULT_RESOLUTION = CAMERA_RESOLUTIONS['1080p']['4_3'];
