// Debug utility for multi-camera outline functionality
// This file helps debug the capture outline image and data retrieval issues

export const debugMultiCameraOutline = {
    
    // Debug function to test API call
    testApiCall: async (urlSocket, stageInfo, camera, outlineType = '3') => {
        console.log('🧪 Testing API call for camera:', camera.label);
        
        try {
            // Create test FormData
            const formData = new FormData();
            formData.append('_id', stageInfo._id);
            formData.append('parent_comp_id', stageInfo.parent_comp_id);
            formData.append('camera_label', camera.label);
            formData.append('outline_type', outlineType);
            formData.append('zoom_value', JSON.stringify({ zoom: 1, center: { x: 0.5, y: 0.5 } }));
            
            // Create a dummy image blob for testing
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, 640, 480);
            ctx.fillStyle = 'white';
            ctx.fillRect(100, 100, 440, 280);
            
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            formData.append('imgName', blob, `${camera.label.replace(/\s+/g, '_')}_test_outline.png`);
            
            console.log('📤 Sending test API request...');
            const response = await urlSocket.post('/addMultiCameraOutline_stg', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            console.log('📥 API Response:', response.data);
            return response.data;
            
        } catch (error) {
            console.error('❌ API Test Failed:', error);
            return null;
        }
    },
    
    // Debug function to analyze stage data structure
    analyzeStageData: (stageData) => {
        console.log('🔍 Analyzing stage data structure...');
        console.log('Stage ID:', stageData._id);
        console.log('Camera selection mode:', stageData.camera_selection?.mode);
        console.log('Number of cameras:', stageData.camera_selection?.cameras?.length);
        
        // Check datasets structure
        console.log('📁 Datasets structure:');
        if (stageData.datasets) {
            Object.keys(stageData.datasets).forEach(key => {
                console.log(`  ${key}:`, stageData.datasets[key]);
            });
        } else {
            console.log('  No datasets found');
        }
        
        // Check for camera-specific keys at root level
        console.log('🔑 Root level camera keys:');
        Object.keys(stageData).forEach(key => {
            if (key.includes('_white_path') || key.includes('_image_path') || key.includes('_zoom_value')) {
                console.log(`  ${key}:`, stageData[key]);
            }
        });
        
        // Analyze each camera
        if (stageData.camera_selection?.cameras) {
            console.log('📷 Camera analysis:');
            stageData.camera_selection.cameras.forEach(camera => {
                const cameraPosition = camera.label.replace(/\s+/g, '_').toLowerCase();
                console.log(`  Camera: ${camera.label} (${cameraPosition})`);
                
                // Check in datasets
                const datasetData = stageData.datasets?.[cameraPosition];
                console.log(`    In datasets: ${datasetData ? 'Found' : 'Not found'}`);
                if (datasetData) {
                    console.log(`      white_path: ${datasetData.white_path || 'None'}`);
                    console.log(`      image_path: ${datasetData.image_path || 'None'}`);
                }
                
                // Check at root level
                const whitePathKey = `${cameraPosition}_white_path`;
                const imagePathKey = `${cameraPosition}_image_path`;
                const zoomValueKey = `${cameraPosition}_zoom_value`;
                
                console.log(`    At root level:`);
                console.log(`      ${whitePathKey}: ${stageData[whitePathKey] || 'None'}`);
                console.log(`      ${imagePathKey}: ${stageData[imagePathKey] || 'None'}`);
                console.log(`      ${zoomValueKey}: ${stageData[zoomValueKey] || 'None'}`);
            });
        }
    },
    
    // Debug function to test image URL construction
    testImageUrls: (stageData, showImageFunction, imgUrl) => {
        console.log('🖼️ Testing image URL construction...');
        console.log('Base img_url:', imgUrl);
        
        if (stageData.camera_selection?.cameras) {
            stageData.camera_selection.cameras.forEach(camera => {
                const cameraPosition = camera.label.replace(/\s+/g, '_').toLowerCase();
                console.log(`\n📷 Camera: ${camera.label}`);
                
                // Test dataset paths
                const datasetData = stageData.datasets?.[cameraPosition];
                if (datasetData?.white_path) {
                    const url = showImageFunction(datasetData.white_path);
                    console.log(`  Dataset white_path URL: ${url}`);
                }
                if (datasetData?.image_path) {
                    const url = showImageFunction(datasetData.image_path);
                    console.log(`  Dataset image_path URL: ${url}`);
                }
                
                // Test root level paths
                const whitePathKey = `${cameraPosition}_white_path`;
                const imagePathKey = `${cameraPosition}_image_path`;
                
                if (stageData[whitePathKey]) {
                    const url = showImageFunction(stageData[whitePathKey]);
                    console.log(`  Root ${whitePathKey} URL: ${url}`);
                }
                if (stageData[imagePathKey]) {
                    const url = showImageFunction(stageData[imagePathKey]);
                    console.log(`  Root ${imagePathKey} URL: ${url}`);
                }
            });
        }
    },
    
    // Debug function to validate camera configuration
    validateCameraConfig: (stageData) => {
        console.log('✅ Validating camera configuration...');
        
        const issues = [];
        
        if (!stageData.camera_selection) {
            issues.push('No camera_selection found in stage data');
        } else {
            if (!stageData.camera_selection.mode) {
                issues.push('No camera mode specified');
            }
            if (!stageData.camera_selection.cameras || stageData.camera_selection.cameras.length === 0) {
                issues.push('No cameras configured');
            } else {
                stageData.camera_selection.cameras.forEach((camera, index) => {
                    if (!camera.label) {
                        issues.push(`Camera ${index} missing label`);
                    }
                    if (!camera.originalLabel) {
                        issues.push(`Camera ${index} missing originalLabel`);
                    }
                });
            }
        }
        
        if (issues.length === 0) {
            console.log('✅ Camera configuration is valid');
        } else {
            console.log('❌ Camera configuration issues:');
            issues.forEach(issue => console.log(`  - ${issue}`));
        }
        
        return issues.length === 0;
    }
};

// Usage example:
// import { debugMultiCameraOutline } from './debugMultiCameraOutline';
// 
// // In your component:
// debugMultiCameraOutline.analyzeStageData(mngstateInfo);
// debugMultiCameraOutline.validateCameraConfig(mngstateInfo);
// debugMultiCameraOutline.testImageUrls(mngstateInfo, showImage, img_url);
