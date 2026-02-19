import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js';
import { 
    Card, CardBody, CardTitle, Row, Col, Button, Label, Progress,
    Offcanvas,
    OffcanvasHeader,
    OffcanvasBody,
    Form,
    Input,

 } from 'reactstrap';
import { FaPlus } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';

import MasteringStatus from './MasteringStatus';
import useSocket from '../contexts/useSocket';
import { AppContext } from '../contexts/Context';
import { RegionsContext } from '../contexts/RegionsContext';
import { MasteringContext } from '../contexts/MasteringContext';
import { post } from '../services/apiService';

import './ProgressBar.css'
import RunoutModal from './RunoutModal';
import { toastSuccess } from '../customToast';
import MasteringResults from './MasteringResults';
import { DynamicResults } from './DynamicResults';

const GraphPlotting = forwardRef((props, ref) => {
    const { socket, data } = useSocket();
    // to find selected sensor and measurement
    const { 
        selectedKeys, setRotationStatus, 
        settings, selectedSensor, componentDetails, updateComponentDetails
    } = useContext(AppContext);
    // to get the selected measurement regions
    const { selectedRegions, updateRegions, setSelectedMeasurement, selectedMeasurement, setPointDataExist } = useContext(RegionsContext);
    // stop plotting and dont open runout result window when user clicks stop master.
    const { sharedState, stopFunction } = useContext(MasteringContext);

    const plotRef = useRef(null);

    const [childData, setChildData] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [layout, setLayout] = useState({
        plot_bgcolor: '#e0e0e0',
        paper_bgcolor: '#ffffff',
        margin: { l: 50, r: 50, t: 50, b: 50, },
        xaxis: {
            title: 'Width',
            range: [-150, 150],
        },
        yaxis: {
            title: 'Height',
            range: [0, 300],
        },
        shapes: [],
    });
    const [keyValues, setKeyValues] = useState([]);
    const [selectedRectangles, setSelectedRectangles] = useState([]);
    const [boxes, setBoxes] = useState([]);
    const nextRegionIndex = useRef(1); // Keep track of the next unique index for region names

    const [scanNo, setScanNo] = useState(0);
    const [totalProfileCount, setTotalProfileCount] = useState(0);
    const [showProgress, setShowProgress] = useState(false);

    // Store intermediate progress value without triggering re-renders
    const progressRef = useRef(0);

    const [fileId, setFileId] = useState('');
    const [showRunout, setShowRunout] = useState(false);
    const [runoutValue, setRunoutValue] = useState([]);

    const [openEditCanvas, setOpenEditCanvas] = useState(false);    // open offcanvas
    const [selectedRegionData, setSelectedRegionData] = useState({
        index: null,
        layout: null,
        annotation: null,
        rectangle: null,
    });
    const [showReset, setShowReset] = useState(false);              // reset-offcanvas
    const [regionNameError, setRegionNameError] = useState('');
    const [regionNameEmpty, setRegionNameEmpty] = useState('');
    const [regionHeightEmpty, setRegionHeightEmpty] = useState('')
    const [regionWidthEmpty, setRegionWidthEmpty] = useState('');

    const [measurement, setMeasurement] = useState({});

    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    useEffect(() => {
        if (socket) {
            // Listen to specific events for this child
            socket.on('child_event', (payload) => {
                setChildData(payload);
            });

            socket.on('triggers', (payload) => {
                console.log('triggers ', payload);
                const updated_data = {
                    x: payload.roiX,
                    y: payload.roiZ,
                    text: payload.roiX.map((_, index) => index + 1),
                    mode: 'markers',
                    marker: { size: 5, color: 'blue' },
                    type: 'scatter',
                }
                setGraphData(updated_data);
                setPointDataExist(true)
                // setChildData(payload);
            });
            
            socket.on('get_mastered_profile', (payload) => {
                console.log('get_mastered_profile ', payload)
                const newData = payload.pointData;
                const updated_data = {
                    x: newData?.map(point => point.roiWidthX),
                    y: newData?.map(point => point.roiHeightZ),
                    text: newData?.map((_, index) => index + 1),
                    mode: 'markers',
                    marker: { size: 5, color: 'blue' },
                    type: 'scatter',
                }
                // setScanNo(payload.scan_no);
                setGraphData(updated_data);
                setPointDataExist(true)
            });

            return () => {
                if(socket) {
                    // Cleanup the event listener
                    socket.off('child_event');
                    socket.off('triggers');
                    socket.off('get_mastered_profile');
                }
            };
        }

    }, [socket]);

    // useEffect(() => {
    //   console.log('selectedMeasurement changed ', selectedMeasurement)
    // }, [selectedMeasurement])
    

    useEffect(() => {
        if(!selectedMeasurement._id) {
            setGraphData([]);
            setPointDataExist(false)
        }
        if(selectedMeasurement?.mastering_status !== "completed") {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
        }
    }, [selectedMeasurement])
    
    useEffect(() => {
        if(!sharedState.isMasterRunning) {

            socket.off('capturing_completed');
            socket.off('scan_data');
            socket.off('plotting_completed');

            setShowRunout(false);
            setRotationStatus(0);
            setShowProgress(false);
            setTotalProfileCount(0);
            setScanNo(0);
            setIsButtonDisabled(true);
        } else if (sharedState.isMasterRunning){

            console.log('scan_data inside else ', sharedState.isMasterRunning)
            socket.on('capturing_completed', handleCaptureCompleted);
            socket.on('scan_data', handleScanData);
            socket.on('plotting_completed', handlePlottingCompleted);
            setIsButtonDisabled(false);
        }

        return () => {
            if(socket) {
                socket.off('capturing_completed');
                socket.off('scan_data');
                socket.off('plotting_completed');
            }
        };
    }, [sharedState.isMasterRunning])


    useEffect(() => {
        if(sharedState?.isCapturing) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    }, [sharedState.isCapturing])

    const handleCaptureCompleted = (payload) => {
        console.log('___zzz___ capture_completed', payload, sharedState);
        if(payload.sessionId === sharedState?.currentMasteringId) {
            // {
            //     "status": "complete",
            //     "file_id": "6773d139dabcdef29c74f342",
            //     "profile_count": 402,
            //     "comp_id": "6756ed5af6e8a0a3eff9e154"
            // }
            
            setTotalProfileCount(payload.profile_count);
            plottingMasterData(payload);
            setShowProgress(true);
    
            // file_id used in /filter_region_points
            setFileId(payload.file_id);
        }
    }

    const handleScanData = (payload) => {
        console.log('___zzz___ scan_data ', payload, sharedState);
        if(payload.sessionId === sharedState?.currentMasteringId) {
            const newData = payload.pointData;
            const updated_data = {
                x: newData?.map(point => point.roiWidthX),
                y: newData?.map(point => point.roiHeightZ),
                text: newData?.map((_, index) => index + 1),
                mode: 'markers',
                marker: { size: 5, color: 'blue' },
                type: 'scatter',
            }
            // setScanNo(payload.scan_no);
            setGraphData(updated_data);
            setPointDataExist(true)
            setScanNo(payload.scan_no);
        }
    }

    const handlePlottingCompleted = async (payload) => {
        console.log('___zzz___, plotting_completed', payload, sharedState);
        if(payload.sessionId === sharedState?.currentMasteringId) {
            await calculateRunout();
            setShowRunout(true)
        }
    }

    useEffect(() => {
        // Ensure we don't start progress before receiving valid totalProfileCount
        if (totalProfileCount > 0 && scanNo > 0) {
            const targetProgress = Math.round((scanNo / totalProfileCount) * 100);
            progressRef.current = targetProgress;
        } else {
            progressRef.current = 0;
        }
    }, [scanNo, totalProfileCount]); 

    useEffect(() => {
        setLayout((prev) => ({
            ...prev,
            shapes: [],
            annotations: []
        }));
        if (selectedRegions.length >= 0) {
            const newRectangles = selectedRegions.map((region) => ({
                id: region.id,
                name: region.name,
                x: region.x,
                y: region.y,
                profile_data: [],
                color: region.color,
            }));
            setSelectedRectangles([...selectedRegions]);
            setBoxes([...selectedRegions]);


            if (selectedRegions.length == 0) {
                setLayout((prev) => ({
                    ...prev,
                    shapes: [],
                    annotations: []
                }));
            } else {
                const newShapes = selectedRegions.map((region) => ({
                    type: 'rect',
                    xref: 'x',
                    yref: 'y',
                    x0: region.x[0],
                    y0: region.y[0],
                    x1: region.x[1],
                    y1: region.y[1],
                    line: {
                        color: 'rgba(0, 0, 0, 1)',
                        width: 2,
                    },
                    fillcolor: 'rgba(100, 150, 200, 0.3)',
                }));
                const newAnnotation = selectedRegions.map((region) => ({
                    x: (region.x[0] + region.x[1]) / 2, // Position annotation in the middle of the rectangle (x-axis)
                    y: region.y[1] + 0.1, // Slightly above the rectangle (y-axis)
                    xref: 'x',
                    yref: 'y',
                    text: region.name, // Region name from region
                    showarrow: false, // No arrow, just text
                    font: {
                        size: 12,
                        color: 'black',
                    },
                    align: 'center', // Center the text
                    bgcolor: 'white', // 'rgba(255, 255, 255, 0.5)', // Optional background for better visibility
                    bordercolor: 'black', // Border color
                    borderwidth: 1,
                    borderpad: 4,
                }))

                setLayout((prev) => ({
                    ...prev,
                    shapes: [...prev.shapes, ...newShapes],
                    annotations: [...prev.annotations, ...newAnnotation],
                }));
            }


            // Find the highest index from the existing region names
            const maxIndex = selectedRegions.reduce((max, region) => {
                const match = region.name.match(/region_(\d+)/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    return index > max ? index : max;
                }
                return max;
            }, -1);
            // Update the nextRegionIndex to start from the next available index
            nextRegionIndex.current = maxIndex + 1;
        }


        
    }, [selectedRegions, selectedKeys]);
    
    // useEffect(() => {
    //     console.log('selectedRectangles __change', selectedRectangles)
    //     updateRegions(selectedRectangles);
    // }, [selectedRectangles]);

    // sample api call from services/apiService
    const createData = async () => {
        try {
            const data = await post('/api/normal-endpoint', { key: 'value' });
            console.log('Data created:', data);
        } catch (error) {
            console.error('Error creating data:', error);
        }
    };

    // api call for master data plot
    const plottingMasterData = async (payload) => {
        // // Wait for componentDetails to be populated
        // while (!componentDetails || Object.keys(componentDetails).length === 0) {
        //     console.log("Waiting for componentDetails...", componentDetails);
        //     await new Promise((resolve) => setTimeout(resolve, 100)); // Polling mechanism
        // }
        payload.comp_id = componentDetails?._id;
        try {
            const response = await post('/retrieve_and_process_data', payload);
            console.log('/retrieve_and_process_data ', response);
            // if(response == 'completed') {
            //     calculateRunout();
            // }
        } catch (error) {
            console.error('Error /retrieve_and_process_data:', error);
        }
    };

    // api for calculate runout using regions and file_id
    const calculateRunout = async () => {
        let updatedRectangles = []
        let file_id = ''
        setSelectedRectangles((prevRectangles) => {
            updatedRectangles = [...prevRectangles];
            return updatedRectangles;
        });
        setFileId((prevFileId) => {
            file_id = prevFileId;
            return file_id;
        })
        const data = {
            captured_file_id: file_id, 
            regions: updatedRectangles
        }
        try {
            const response = await post('/filter_region_points', data);
            console.log('/filter_region_points ', response);
            setRunoutValue(response);
        } catch (error) {
            console.error('Error /filter_region_points ', error);
        }
    };
    
    const getRandomColor = () => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const a = 0.5; // Very low opacity value between 0 and 1
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    // change graph mode to select (to create region)
    const handleBoxSelect = () => {
        if (plotRef.current) {
            Plotly.relayout(plotRef.current, { 'dragmode': 'select' });
        }
    };

    // to draw region in graph
    const handleBoxEnd = async (event) => {

        if (event?.range) {
            // Increment the index to ensure uniqueness for the next region
            nextRegionIndex.current += 1;

            // Update selectedRectangles state
            setSelectedRectangles((prevRectangles) => {
                const existingNumbers = new Set(
                    (prevRectangles || []).map((m) => {
                        const match = m.name.match(/region_(\d+)/);
                        return match ? parseInt(match[1], 10) : 0;
                    })
                );

                let newNumber = 1;
                while (existingNumbers.has(newNumber)) {
                    newNumber++;
                }
                // Create a new range object with a unique name based on the next available index
                const newRange = {
                    id: uuidv4(),
                    name: `region_${newNumber}`, // Use the next available index for the name
                    x: event.range.x,
                    y: event.range.y,
                    profile_data: [],
                    color: getRandomColor(),
                    measurement_type: []
                };

                const updatedRectangles = [...prevRectangles, newRange];

                // Ensure boxes prop update happens right after selectedRectangles
                setBoxes(updatedRectangles); // Assuming setBoxes should mirror selectedRectangles
                updateRegions(updatedRectangles)
                return updatedRectangles;
            });

            // // Create a new rectangle shape for layout
            // const newRectangle = {
            //     type: 'rect',
            //     xref: 'x',
            //     yref: 'y',
            //     x0: newRange.x[0],
            //     y0: newRange.y[0],
            //     x1: newRange.x[1],
            //     y1: newRange.y[1],
            //     line: {
            //         color: 'rgba(0, 0, 0, 1)',
            //         width: 2,
            //     },
            //     fillcolor: 'rgba(100, 150, 200, 0.3)',
            //     editable: true, // Enable editing
            //     dragmode: 'move', // Allow dragging
            //     'zoom2d': false
            // };

            // // Create a new annotation to show the region name above the shape
            // const newAnnotation = {
            //     x: (newRange.x[0] + newRange.x[1]) / 2, // Position annotation in the middle of the rectangle (x-axis)
            //     y: newRange.y[1] + 0.1, // Slightly above the rectangle (y-axis)
            //     xref: 'x',
            //     yref: 'y',
            //     text: newRange.name, // Region name from newRange
            //     showarrow: false, // No arrow, just text
            //     font: {
            //         size: 12,
            //         color: 'black',
            //     },
            //     align: 'center', // Center the text
            //     bgcolor: 'white', // 'rgba(255, 255, 255, 0.5)', // Optional background for better visibility
            //     bordercolor: 'black', // Border color
            //     borderwidth: 1,
            //     borderpad: 4,
            // };

            // // Update layout with the new shape
            // setLayout((prevLayout) => ({
            //     ...prevLayout,
            //     shapes: [...prevLayout.shapes, newRectangle],
            //     annotations: [...(prevLayout.annotations || []), newAnnotation],
            // }));
        }
    };

    const handleShapeUpdate = (event) => {
        // Initialize an empty object to store grouped shape data by index
        const shapeDataByIndex = {};

        // Loop through the event object keys
        Object.keys(event).forEach((key) => {
            // Use regex to extract the index and property (e.g., "shapes[6].x0" -> index: 6, property: x0)
            const match = key.match(/shapes\[(\d+)\]\.(x0|y0|x1|y1)/);

            if (match) {
                const shapeIndex = match[1]; // Extracted index (e.g., "6")
                const property = match[2]; // Extracted property (e.g., "x0", "y1")

                // Initialize the shape object for this index if it doesn't exist
                if (!shapeDataByIndex[shapeIndex]) {
                    shapeDataByIndex[shapeIndex] = {};
                }

                // Assign the value to the appropriate property in the shape object
                shapeDataByIndex[shapeIndex][property] = event[key];
            }
        });

        // Now that the shape data is grouped by index, we can update the corresponding rectangles and annotations
        const updatedRectangles = [];
        const updatedAnnotations = [];

        // Iterate over the shapeDataByIndex to process each shape
        Object.keys(shapeDataByIndex).forEach((index) => {
            const shape = shapeDataByIndex[index];

            // Ensure the shape has the required properties before updating the rectangle
            if (shape.x0 !== undefined && shape.x1 !== undefined && shape.y0 !== undefined && shape.y1 !== undefined) {

                // Update rectangles and move region name with it
                setSelectedRectangles((prevRectangles) => {
                    const updatedRectangles = prevRectangles.map((rect, id) => {
                        if (id == index) {

                            // Update the rectangle's coordinates based on the new shape dimensions (resize/drag)
                            return {
                                ...rect,
                                x: [shape.x0, shape.x1], // Update x coordinates
                                y: [shape.y0, shape.y1], // Update y coordinates
                                fillcolor: id == index ? 'rgba(255, 0, 0, 0.3)' : 'rgba(100, 150, 200, 0.3)', // Highlight with a red fill if selected
                                line: {
                                    ...rect.line,
                                    color: id == index ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 0, 1)', // Highlight with a red border if selected
                                },
                            };
                        }
                        return rect; // Return unchanged rectangle if not a match
                    });

                    // Update annotations (region names) corresponding to the updated rectangles
                    setLayout((prevLayout) => {
                        const updatedAnnotations = (prevLayout.annotations || []).map((annotation, id) => {
                            if (id == index) {
                                return {
                                    ...annotation,
                                    x: (shape.x0 + shape.x1) / 2, // Re-center annotation in the middle of the rectangle (x-axis)
                                    y: shape.y1 + 0.1, // Move the annotation slightly above the updated rectangle (y-axis)
                                };
                            }
                            return annotation; // Return unchanged annotation if not a match
                        });

                        // Return the new layout with updated annotations
                        return {
                            ...prevLayout,
                            annotations: updatedAnnotations,
                        };
                    });

                    // Also update the `setBoxes` state with the new positions
                    setBoxes(updatedRectangles);
                    updateRegions(updatedRectangles)
                    return updatedRectangles;
                });

                // setIsUpdate(true);
            } else {
                console.warn('Shape does not have valid coordinates:', shape);
            }
        });

        // // Update boxes and selectedRectangles with the new positions
        // if (updatedRectangles.length > 0) {
        //     console.log('updatedRectangles765', updatedRectangles);
        //     setBoxes(updatedRectangles);
        //     // setIsUpdate(true);
        // }
    };

    const logRegions = () => {
        // console.log(selectedRectangles, componentDetails, runoutValue, selectedSensor)
        // console.log(selectedSensor, selectedKeys)
        console.log('data577', selectedRectangles)
    }

    const addRegionToMeasurement = (data, measurementId, regionData) => {
        const measurement1 = data.measurements.find(m => m.id === measurementId);
        measurement1.regions = regionData.regions;
        return measurement1;
    };

    const closeModel = () => {
        setShowRunout(false);
        setRotationStatus(0);
        setShowProgress(false);
        setTotalProfileCount(0);
        setScanNo(0);
        setRunoutValue([]);
        stopFunction();
    }

    const hideRunoutWindow = async (values) => {
        setShowRunout(false);
        setRotationStatus(0);
        setShowProgress(false);
        setTotalProfileCount(0);
        setScanNo(0);
        const newValue = {
            ...values,
            mastering_status: "completed",
            exposure_time: settings.exposureTime,
            measuring_rate: settings.measuringRate,
            captured_file_id: fileId,
            time_duration: settings.timeDuration,
            no_of_rotation: settings.numRotation,
            insp_based_on: settings.inspectionType,
            lead_time: settings.leadTime,
        }
        let newmeasurements = addRegionToMeasurement(selectedSensor, selectedKeys[1], values);
        // console.log('newmeasurements ', newmeasurements)
        let data = {
            'comp_id': componentDetails._id,
            'comp_name': componentDetails.comp_name,
            'comp_code': componentDetails.comp_code,
            'sensorId': selectedSensor._id,
            "mastering_status": "completed",
            'id': selectedKeys[1],
            "name": selectedMeasurement.name,
            'regions': values.regions,
            // '_id': measurement._id ? measurement._id : selectedKeys[2] ? selectedKeys[2] : undefined
            '_id': selectedMeasurement?._id || undefined,
            "captured_file_id": fileId,

            // 'settings': {
            //     "insp_based_on": settings.inspectionType,
            //     "lead_time": settings.leadTime,
            //     "no_of_rotation": settings.numRotation,
            //     "time_duration": settings.timeDuration,
            //     "exposure_time": settings.exposureTime,
            //     "measuring_rate": settings.measuringRate,
            // }

            'comp_mastering_status': componentDetails?.mastering_status,
            'settings': {
                "insp_based_on": settings.inspectionType,
                "lead_time": settings.leadTime,
                "no_of_rotation": settings.numRotation,
                "time_duration": settings.timeDuration,
            }
        }

        if (selectedSensor?.brand_name == "Wenglor") {
            data.exposure_time = settings.exposureTime
            data.measuring_rate = settings.measuringRate
        }
        try {
            const res = await post('/tolerance_Setting', data);
            console.log('res /tolerance_Setting ', res)
            if (res.message == 'Record inserted successfully') {
                toastSuccess(`Tolerance values set! You can now proceed.`)
                setSelectedMeasurement({ ...selectedMeasurement, "_id": res.inserted_record._id, "mastering_status": "completed" })
                // setSelectedMeasurement([res.inserted_record._id])
            }
            else if (res.message == 'Record updated successfully') {
                toastSuccess(`Tolerance values updated. Ready to go!`)
                setSelectedMeasurement({ ...selectedMeasurement, "_id": res.updated_record._id, "mastering_status": "completed" })
                // setSelectedMeasurement([res.updated_record._id])
            }
            setMeasurement(res.inserted_record);
            if (res.status == 'success') {
                updateComponentDetails(true)
            }
        } catch (error) {
            console.log('error', error)
        }

        setRunoutValue([]);
        stopFunction();
    }

    // offcanvas functionalities
    const openOffCanvas = (index) => {
        const updatedShapes = layout.shapes.map((shape, id) => ({
            ...shape,
            fillcolor: id === index ? 'rgba(255, 99, 71, 0.5)' : 'rgba(100, 150, 200, 0.3)',
        }));
        const oldAnnotations = layout.annotations.map((annotation) => ({
            ...annotation,
        }));
        setLayout((prevLayout) => ({
            ...prevLayout,
            shapes: updatedShapes,
            annotations: oldAnnotations,
        }));
        const rectanlges = [...selectedRectangles];
        // Consolidate selected data
        setSelectedRegionData({
            index,
            layout: _.cloneDeep(updatedShapes[index]),
            annotation: _.cloneDeep(oldAnnotations[index]),
            rectangle: _.cloneDeep(rectanlges[index]),
        });
        
        setOpenEditCanvas(true);
        // const updatedShapes = layout.shapes.map((shape, id) => ({
        //     ...shape,
        //     fillcolor: id == index ? 'rgba(255, 99, 71, 0.5)' : 'rgba(100, 150, 200, 0.3)'
        // }))
        // const oldAnnotations = layout.annotations.map((annotation, id) => ({
        //     ...annotation,
        // }))
        // setLayout((prevLayout) => ({
        //     ...prevLayout,
        //     shapes: updatedShapes,
        //     annotations: oldAnnotations,
        // }));
        // setSelectedLayout(_.cloneDeep(updatedShapes[index]));
        // setSelectedAnnotation(_.cloneDeep(oldAnnotations[index]))
        // const rectanlges = [...selectedRectangles];
        // setSelectedRegData(_.cloneDeep(rectanlges[index]));
        // setSelectedRegion(index)
        
    }


    const closeOffCanvas = () => {
        setOpenEditCanvas(false);
        handleReset();
    }

    const handleInputChange = (index, key, value) => {
        const newData = [...selectedRectangles];
        const selectedRegion = selectedRegionData.index;

        if (key === 'name') {
            // Check if the new name already exists
            const existingRegionIndex = newData.findIndex(
                (region, id) => region.name === value && selectedRegion !== id
            );

            // If the name exists, display an error message
            if (existingRegionIndex !== -1) {
                setRegionNameError('Region Name Already Exists');
                setRegionNameEmpty('');
                newData[selectedRegion][key] = value;
            } else {
                // If the name doesn't exist, update the selected region's name
                if (value) {
                    newData[selectedRegion][key] = value;
                    setRegionNameError('');
                    setRegionNameEmpty('');
                } else {
                    // If the name is empty, show an error
                    newData[selectedRegion][key] = value;
                    setRegionNameEmpty('Region Name should not be Empty');
                    setRegionNameError('');
                }
            }

            // Update rectangles with the new name
            setSelectedRectangles(newData);
            setBoxes(newData);
            updateRegions(newData);

            // Update layout annotations for the region name
            const updatedAnnotations = [...layout.annotations];
            updatedAnnotations[selectedRegion] = {
                ...updatedAnnotations[selectedRegion],
                text: value, // Update the annotation text with the new region name
            };

            // Update layout with the new annotations
            setLayout((prevLayout) => ({
                ...prevLayout,
                annotations: updatedAnnotations,
            }));

        } else {
            const decimalPart = value.toString().split('.')[1];
            let numericValue = parseFloat(value); // Convert to number initially

            if (key === "x") {
                if (!value) {
                    setRegionWidthEmpty('*valid width value required');
                    return;
                } else if (decimalPart && decimalPart.length > 14) {
                    numericValue = parseFloat(numericValue.toFixed(14));
                } else {
                    setRegionWidthEmpty('');
                }
            }

            if (key === "y") {
                if (!value) {
                    setRegionHeightEmpty('*valid height value required');
                    return;
                } else if (decimalPart && decimalPart.length > 14) {
                    numericValue = parseFloat(numericValue.toFixed(14));
                } else {
                    setRegionHeightEmpty('');
                }
            }

            // Update the selected rectangle
            newData[selectedRegion][key][index] = numericValue; // Ensure numeric value
            setSelectedRectangles(newData);
            setBoxes(newData);
            updateRegions(newData);

            // Update the corresponding shape in the layout
            const newShapes = layout.shapes.map((shape, idx) =>
                idx === selectedRegion
                    ? {
                        ...shape,
                        [`${key}${index}`]: numericValue, // Assign as number
                    }
                    : shape
            );

            // Update the layout with the new shapes
            setLayout((prevLayout) => ({
                ...prevLayout,
                shapes: newShapes,
            }));

            // Reposition the annotation (region name) based on the new rectangle size
            const updatedAnnotations = layout.annotations.map((annotation, idx) =>
                idx === selectedRegion
                    ? {
                        ...annotation,
                        x: (newShapes[selectedRegion].x0 + newShapes[selectedRegion].x1) / 2, // Number computation
                        y: newShapes[selectedRegion].y1 + 0.1, // Number computation
                    }
                    : annotation
            );

            // Update layout with the new annotations
            setLayout((prevLayout) => ({
                ...prevLayout,
                annotations: updatedAnnotations,
            }));

            // Final validation
            // console.log('Updated layout:', layout);

        }

        // Trigger UI updates
        setShowReset(true);
    };
    
    const handleReset = () => {
        setShowReset(false);

        const newShapes = _.cloneDeep(layout.shapes); // Clone to avoid mutation
        newShapes[selectedRegionData.index] = _.cloneDeep(selectedRegionData.layout); // Restore original shape

        const newAnnotations = _.cloneDeep(layout.annotations); // Clone to avoid mutation
        newAnnotations[selectedRegionData.index] = _.cloneDeep(selectedRegionData.annotation); // Restore original annotation

        const rectangles = _.cloneDeep(selectedRectangles); // Clone to avoid mutation
        rectangles[selectedRegionData.index] = _.cloneDeep(selectedRegionData.rectangle); // Restore original rectangle data

        setLayout((prevLayout) => ({
            ...prevLayout,
            shapes: newShapes,
            annotations: newAnnotations,
        }));

        setSelectedRectangles(rectangles);
        setBoxes(rectangles);
        updateRegions(rectangles);

        setRegionNameEmpty('');
        setRegionNameError('');
        setRegionWidthEmpty('');
        setRegionHeightEmpty('');
    };

    const resetWithToast = () => {
        handleReset();
        toastSuccess("Reset Successful");
    }

    const handleSubmit = () => {
        if (regionNameError === '' && regionNameEmpty === '' &&
            regionWidthEmpty === '' && regionHeightEmpty === ''
        ) {
            // setOpenEditCanvas(false);
            // setSelectedRegionData({
            //     index: null,
            //     layout: null,
            //     annotation: null,
            //     rectangle: null,
            // });
            // // setIsUpdate(true);
            
            setShowReset(false);

            toastSuccess("Region Data Updated");

            const index = selectedRegionData.index;
            const updatedShapes = layout.shapes.map((shape, id) => ({
                ...shape,
                fillcolor: id === index ? 'rgba(255, 99, 71, 0.5)' : 'rgba(100, 150, 200, 0.3)',
            }));
            const oldAnnotations = layout.annotations.map((annotation) => ({
                ...annotation,
            }));
            setLayout((prevLayout) => ({
                ...prevLayout,
                shapes: updatedShapes,
                annotations: oldAnnotations,
            }));
            const rectanlges = [...selectedRectangles];
            setSelectedRegionData({
                index,
                layout: _.cloneDeep(updatedShapes[index]),
                annotation: _.cloneDeep(oldAnnotations[index]),
                rectangle: _.cloneDeep(rectanlges[index]),
            });
        }
    };

    const deleteRegion = (index) => {
        // Correcting the layout update
        setLayout((prevLayout) => {
            const newShapes = prevLayout.shapes.filter((_, id) => id !== index);
            const newAnnotations = prevLayout.annotations.filter((_, id) => id !== index);
            return {
                ...prevLayout,
                shapes: newShapes,
                annotations: newAnnotations,
            };
        });
        // Correcting the selectedRectangles and boxes update
        setSelectedRectangles((prevRectangles) => {
            const updatedRectangles = prevRectangles.filter((_, id) => id !== index);
            setSelectedRectangles(updatedRectangles);
            setBoxes(updatedRectangles); // Update boxes based on the new rectangles
            return updatedRectangles;
        });
    };
    
    const renderEditRegionOffcanvas = () => {
        const buttonStyles = {
            submit: {
                backgroundColor: '#28a745',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
            },
            reset: {
                backgroundColor: '#007bff',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
            },
            cancel: {
                backgroundColor: '#dc3545',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
            },
        };
        return (
            <Offcanvas
                isOpen={openEditCanvas}
                direction="end"
                toggle={() => setOpenEditCanvas(false)}
                scrollable
                backdrop="static"
            >
                <OffcanvasHeader toggle={closeOffCanvas}>
                    <div style={{ fontWeight: 'bold' }}>Region Data</div>
                </OffcanvasHeader>
                <OffcanvasBody>
                    <Form>
                        <div className="mb-3">
                            <Label>Name</Label>
                            <Input
                                type="text"
                                value={selectedRectangles[selectedRegionData.index].name}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/\s+/g, ''); // Removes white spaces
                                    if (newValue.length <= 8) {
                                        handleInputChange(0, "name", newValue); // Allow only 8 characters
                                    }
                                }}
                            />
                            {
                                regionNameError !== '' && (
                                    <p className="error-message" style={{ color: "red" }}>
                                        {regionNameError}
                                    </p>)
                            }
                            {
                                regionNameEmpty !== '' && (
                                    <p className="error-message" style={{ color: "red" }}>
                                        {regionNameEmpty}
                                    </p>)
                            }
                        </div>
                        <div className="mb-3">
                            <Label>Height</Label>
                            <Input
                                type="number"
                                value={selectedRectangles[selectedRegionData.index].y[1]}
                                step="0.1"
                                onChange={(e) => handleInputChange(1, "y", e.target.value)}
                            />
                            {
                                regionHeightEmpty !== '' && (
                                    <p className="error-message" style={{ color: "red" }}>
                                        {regionHeightEmpty}
                                    </p>)
                            }
                        </div>
                        <div className="mb-3">
                            <Label>Width</Label>
                            <Input
                                type="number"
                                value={selectedRectangles[selectedRegionData.index].x[1]}
                                step="0.1"
                                onChange={(e) => handleInputChange(1, "x", e.target.value)}
                            />
                            {
                                regionWidthEmpty !== '' && (
                                    <p className="error-message" style={{ color: "red" }}>
                                        {regionWidthEmpty}
                                    </p>)
                            }
                        </div>
                        {
                            showReset &&
                            <div className='d-flex justify-content-between'>
                                <Button color="primary" onClick={handleSubmit}>
                                    Update
                                </Button>

                                <Button color="info" onClick={resetWithToast}>
                                    Reset
                                </Button>
                                {/* <Button color="dark" onClick={closeOffCanvas}>
                                    Cancel
                                </Button> */}
                            </div>
                        }
                    </Form>
                </OffcanvasBody>
            </Offcanvas>
        )
    }
    
    useImperativeHandle(ref, () => ({
        handleBoxSelect,
        openOffCanvas,
        deleteRegion,
    }));

    return (
        <>
        {
            openEditCanvas ?
                renderEditRegionOffcanvas()
                : null
        }
        {
            showRunout & runoutValue?.region_data?.length > 0 ?
            <DynamicResults
                visible={showRunout}
                toggle={hideRunoutWindow}
                data={runoutValue.region_data}
                selectedUnit={componentDetails?.selected_unit}
                closeModel={()=>{closeModel()}}
            />
            : null
        }
        {
            showProgress && totalProfileCount > 0 && progressRef.current > 0 ? (
                <Row className="mb-1">
                    <Col>
                        <Progress value={progressRef.current}>
                            {progressRef.current}%
                        </Progress>
                    </Col>
                </Row>
            ) : null
        }
            {
                selectedKeys?.length == 2 ?
                    <div style={{ height: '80vh' }}>
                        {/* <Button onClick={logRegions}>Log Regions</Button> */}
                        {
                            graphData &&
                            <>
                                <Plot
                                    ref={plotRef}
                                    data={[graphData]}
                                    layout={{ ...layout }}
                                    onInitialized={(figure, graphDiv) => {
                                        plotRef.current = graphDiv;
                                        graphDiv.on('plotly_selected', handleBoxEnd);
                                        // Listen for shape updates
                                        graphDiv.on('plotly_relayout', handleShapeUpdate);
                                    }}
                                    style={{ width: '100%', height: '100%', maxHeight: '75vh', borderRadius: '10px' }}
                                    // style={{ width: '100%', height: '70%', borderRadius: '10px' }}
                                    config={{
                                        displayModeBar: true,
                                        responsive: true,
                                        scrollZoom: true,
                                        staticPlot: false,
                                        displaylogo: false,
                                        editable: isButtonDisabled, // true !isButtonDisabled(), Control overall editability
                                        edits: {
                                            titleText: false, // Disable title text editing to prevent placeholders
                                            axisTitleText: false, // Disable axis title text editing to remove placeholders
                                            shapePosition: isButtonDisabled, // true !isButtonDisabled(), Allows shape dragging and editing only if editable
                                            annotationText: false,
                                        },
                                        modeBarButtonsToRemove: [
                                            'lasso2d',
                                            'select2d',
                                        ],
                                    }}
                                />
                            </>
                        }
                        {/* <h4></h4> */}
                        {/* <p>Shared Data: {JSON.stringify(data)}</p>
        <p>Child-Specific Data: {JSON.stringify(childData)}</p> */}

                    </div>
                    :
                    <></>
            }
        </>
    );
})

GraphPlotting.displayName = "GraphPlotting";

export default GraphPlotting;