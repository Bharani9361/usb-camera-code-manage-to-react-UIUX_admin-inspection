import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import io from 'socket.io-client';
import { socketUrl } from '../urls';

// Assuming socket server is running at localhost:4000
const socket = io(socketUrl);

// // Function to convert intensity to RGB
// const intensityToRGB = (intensity) => {
//     // Assuming intensity is in 10-bit range (0-1023)
//     const normalized = Math.min(Math.max(intensity / 1023, 0), 1); // Normalize to [0, 1]

//     // Color gradient
//     const r = Math.floor(255 * normalized); // Red channel
//     const g = Math.floor(255 * normalized); // Green channel
//     const b = Math.floor(255 * normalized); // Blue channel can vary

//     return `rgb(${r}, ${g}, ${b})`; // Return the RGB string
// };

// const GraphComponent = () => {
//     const [graphData, setGraphData] = useState([]);

//     useEffect(() => {
//         // Listen for data from the socket
//         socket.on('newData', (data) => {
//             const { scan_no, roiWidthX, roiHeightZ, intensity } = data;

//             // Convert intensity values to RGB colors
//             const rgbColors = intensity.map(intensityToRGB);

//             // Create new data entry
//             const newDataEntry = {
//                 x: roiWidthX,   // X-axis values
//                 y: roiHeightZ,  // Y-axis values
//                 z: Array(roiWidthX.length).fill(scan_no), // Using scan_no for the z-axis
//                 mode: 'markers', // Points only
//                 type: 'scatter3d',
//                 marker: {
//                     color: rgbColors, // Use RGB colors generated from intensity
//                     size: 5, // Size of the points
//                     opacity: 0.8, // Make points slightly transparent
//                     showscale: true, // Show color scale for reference
//                 },
//                 name: `Scan ${scan_no}`, // Name for the legend
//             };

//             // Append the new data entry to graphData
//             setGraphData((prevData) => [...prevData, newDataEntry]);
//         });

//         // Cleanup socket connection when component unmounts
//         return () => {
//             socket.off('newData');
//         };
//     }, []);

//     return (
//         <Plot
//             data={graphData}
//             layout={{
//                 title: '3D Scatter Plot with RGB Colors from Intensity',
//                 autosize: true,
//                 scene: {
//                     xaxis: { title: 'X (roiWidthX)' },
//                     yaxis: { title: 'Z (roiHeightZ)' },
//                     zaxis: { title: 'Scan Number (Y)' },
//                 },
//                 margin: { l: 0, r: 0, b: 0, t: 50 }, // Adjust margins
//                 height: 600, // Adjust height as needed
//             }}
//             style={{ width: '100%', height: '100%' }}
//         />
//     );
// };

// export default GraphComponent;

// -----------------------------------------

// // Helper function to convert intensity to RGB color
// const intensityToRGB = (intensity) => {
//     // Map intensity to a grayscale RGB value, where R=G=B=intensity
//     return `rgb(${intensity}, ${intensity}, ${intensity})`;
// };

// const GraphComponent = () => {
//     const [graphData, setGraphData] = useState([]);

//     useEffect(() => {
//         // Listen for data from the socket
//         socket.on('newData', (data) => {
//             const { scan_no, roiWidthX, roiHeightZ, intensity } = data;

//             // Convert intensity array to corresponding RGB colors
//             const rgbColors = intensity.map(intensityToRGB);

//             // Append the new data line to graphData
//             setGraphData((prevData) => [
//                 ...prevData,
//                 {
//                     x: roiWidthX,   // X-axis values
//                     y: roiHeightZ,  // Y-axis values
//                     z: Array(roiWidthX.length).fill(scan_no), // Using scan_no for the z-axis
//                     mode: 'markers', // Points only
//                     type: 'scatter3d',
//                     marker: {
//                         color: rgbColors, // Color each point based on its RGB color
//                         size: 5, // Size of the points
//                         showscale: false, // Disable the color scale since we are using RGB colors
//                     },
//                     name: `Scan ${scan_no}`, // Name for the legend
//                 }
//             ]);
//         });

//         // Cleanup socket connection when component unmounts
//         return () => {
//             socket.off('newData');
//         };
//     }, []);

//     return (
//         <Plot
//             data={graphData}
//             layout={{
//                 title: '3D Scatter Plot with RGB Colors',
//                 autosize: true,
//                 scene: {
//                     xaxis: { title: 'X (roiWidthX)' },
//                     yaxis: { title: 'Z (roiHeightZ)' },
//                     zaxis: { title: 'Scan Number (Y)' },
//                 },
//                 margin: { l: 0, r: 0, b: 0, t: 50 }, // Adjust margins
//                 height: 600, // Adjust height as needed
//             }}
//             style={{ width: '100%', height: '100%' }}
//         />
//     );
// };

// export default GraphComponent;
// -------------------------------------------------------------------------------

const GraphComponent = () => {
    const [graphData, setGraphData] = useState([]);

    useEffect(() => {
        // Listen for data from the socket
        socket.on('newData', (data) => {
            const { scan_no, roiWidthX, roiHeightZ, intensity } = data;

            // Append the new data line to graphData
            setGraphData((prevData) => [
                ...prevData,
                {
                    x: roiWidthX,   // X-axis values
                    y: roiHeightZ,  // Y-axis values
                    z: Array(roiWidthX.length).fill(scan_no), // Using scan_no for the z-axis
                    mode: 'markers', // Points only
                    type: 'scatter3d',
                    marker: {
                        color: intensity, // Color points based on intensity
                        colorscale: 'Greys', // Use a continuous colorscale 'Viridis'
                        type: 'heatmap',
                        size: 5, // Size of the points
                        showscale: true, // Show the color scale
                        colorbar: {
                            title: 'Intensity', // Colorbar title
                            thickness: 15,
                            len: 0.5,
                            xanchor: 'left',
                            titleside: 'right'
                        }
                    },
                    name: `Scan ${scan_no}`, // Name for the legend
                }
            ]);
        });

        // Cleanup socket connection when component unmounts
        return () => {
            socket.off('newData');
        };
    }, []);

    return (
        <Plot
            data={graphData}
            layout={{
                title: '3D Scatter Plot with Intensity',
                autosize: true,
                scene: {
                    xaxis: { title: 'X (roiWidthX)' },
                    yaxis: { title: 'Z (roiHeightZ)' },
                    zaxis: { title: 'Scan Number (Y)' },
                },
                margin: { l: 0, r: 0, b: 0, t: 50 }, // Adjust margins
                height: 600, // Adjust height as needed
            }}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default GraphComponent;
// -----------------------------------------------
// const GraphComponent = () => {
//     const [graphData, setGraphData] = useState([]);

//     useEffect(() => {
//         // Listen for data from the socket
//         socket.on('newData', (data) => {
//             const { scan_no, roiWidthX, roiHeightZ, intensity } = data;

//             // Append the new data line to graphData
//             setGraphData((prevData) => [
//                 ...prevData,
//                 {
//                     x: roiWidthX,  // X-axis (1280 values)
//                     y: roiHeightZ, // Y-axis (1280 values)
//                     z: Array(roiWidthX.length).fill(scan_no), // Scan_no as constant z-axis
//                     mode: 'markers', // You can use 'markers+lines' if you want lines between points
//                     type: 'scatter3d',
//                     marker: {
//                         color: intensity, // Use intensity to color the points
//                         colorscale: 'Viridis', // You can choose any Plotly colorscale
//                         size: 5, // You can adjust point size here
//                         colorbar: {
//                             title: 'Intensity' // Colorbar label
//                         }
//                     },
//                     name: `Scan ${scan_no}`,
//                 }
//             ]);
//         });

//         // Cleanup socket connection when component unmounts
//         return () => {
//             socket.off('newData');
//         };
//     }, []);

//     return (
//         <Plot
//             data={graphData}
//             layout={{
//                 title: '3D Line Plot with Intensity',
//                 autosize: true,
//                 scene: {
//                     xaxis: { title: 'X (roiWidthX)' },
//                     yaxis: { title: 'Z (roiHeightZ)' },
//                     zaxis: { title: 'Scan Number (Y)' }
//                 }
//             }}
//             style={{ width: '100%', height: '100%' }}
//         />
//     );
// };

// export default GraphComponent;
//--------------------------
// const GraphComponent = () => {
//   const [graphData, setGraphData] = useState([]);

//   useEffect(() => {
//     // Listen for data from the socket
//     socket.on('newData', (data) => {
//       const { scan_no, roiWidthX, roiHeightZ } = data;
//       console.log('data -- ', data)

//       // Append the new data line to graphData
//       setGraphData((prevData) => [
//         ...prevData,
//         {
//           x: roiWidthX, // X-axis (1280 values)
//           y: roiHeightZ, // Z-axis (1280 values)
//           z: Array(roiWidthX.length).fill(scan_no), // Y-axis is scan_no (same value for each point in this line)
//           mode: 'lines',
//           type: 'scatter3d', // 3D plot
//           name: `Scan ${scan_no}`,
//         }
//       ]);
//     });

//     // Cleanup socket connection when component unmounts
//     return () => {
//       socket.off('newData');
//     };
//   }, []);

//   return (
//     <Plot
//       data={graphData}
//       layout={{
//         title: '3D Line Plot',
//         autosize: true,
//         scene: {
//           xaxis: { title: 'X (roiWidthX)' },
//           yaxis: { title: 'Z (roiHeightZ)' },
//           zaxis: { title: 'Scan Number (Y)' }
//         }
//       }}
//       style={{ width: '100%', height: '100%' }}
//     />
//   );
// };

// export default GraphComponent;
