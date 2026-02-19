import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import Plot from 'react-plotly.js';
import Plotly from 'plotly.js';
import io from 'socket.io-client';
import 'assets/css/admin_ui.css';
import No_data from 'assets/images/nodata/loss.gif';
import PropTypes from 'prop-types';
import { Button, Table, Card, CardTitle, CardBody, Input, Collapse, Offcanvas, OffcanvasHeader, OffcanvasBody, Label, Form, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter, Progress } from 'reactstrap';
import urlSocket from 'pages/AdminInspection/urlSocket';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { socketUrl } from './urls';

const PointCloudPlot = forwardRef(({
  comp_id,
  regions,
  setBoxes,
  stopIntervalShot,
  is_mastering,
  changeContTrigger,
  no_of_rotation,
  counter,
  compInfo,
  changeProfileNo,
  setDoneRotation,
  setIsRotationStarted,
  capturedFileId,
  completePlotting,
  isLoadingProfile,
  exposureTime,
  measuringRate,
  timeDuration,
  noOfRotation,
  leadTime,
  inspBasedOn,

  start1Dtest,
  stop_mastering_process,
  toggleStopMastering,
  isButtonDisabled
}, ref) => {
  const [data, setData] = useState([]);
  const [orgData, setOrgData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedRegData, setSelectedRegData] = useState({});
  const [selectedLayout, setSelectedLayout] = useState({});
  const [selectedAnnotation, setSelectedAnnotation] = useState({});
  const [isRightCanvas, setIsRightCanvas] = useState(false);
  const [status, setStatus] = useState(false);
  const [selectedRectangles, setSelectedRectangles] = useState([]);
  const [showRunout, setShowRunout] = useState(false);
  const [runoutValue, setRunoutValue] = useState([]);
  const [newRunoutRange, setnewRunoutRange] = useState([]);
  const [errors, setErrors] = useState({});
  const [openPopConfirms, setOpenPopConfirms] = useState({});
  const [droppedBoxes, setDroppedBoxes] = useState([]);
  const [pointsInsideBoxes, setPointsInsideBoxes] = useState({});
  const [scanNo, setScanNo] = useState(null);
  const nextRegionIndex = useRef(1); // Keep track of the next unique index for region names
  const [isUpdate, setIsUpdate] = useState(false);
  const [isCreatedRegion, setCreatedRegion] = useState(false);
  const [showReset,setShowReset] = useState(false);
  const [regionNameError,setRegionNameError] = useState('');
  const [regionNameEmpty,setRegionNameEmpty] = useState('');
  
  const [regionHeightEmpty, setRegionHeightEmpty] = useState('')
  const [regionWidthEmpty, setRegionWidthEmpty] = useState('')

  const [layout, setLayout] = useState({
    plot_bgcolor: '#e0e0e0',
    paper_bgcolor: '#ffffff',
    margin: { l: 50, r: 50, t: 50, b: 50, },
    xaxis: {
      title: 'Width',
      range: [-300, 300],
    },
    yaxis: {
      title: 'Height',
      range: [-300, 300],
    },
    shapes: [],
  });
  const socketRef = useRef(null);
  const plotRef = useRef(null);
  const capturedFileIdRef = useRef(capturedFileId);
  const [profileTotalCount, setProfileTotalCount] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const SOCKET_SERVER_URL = socketUrl;
  // const SOCKET_SERVER_URL = "https://172.16.1.91:5002";

  useEffect(() => {
    const plotMasteredData = async (comp_value) => {
      try {
        if (comp_value?.mastering_status == 'completed') {
          const response = await urlSocket.post("/plot_mastered_data", {
            'comp_id': comp_value._id,
            'captured_file_id': comp_value.captured_file_id
          }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

          const newData = response.data.pointData;
          const updated_data = {
            x: newData.map(point => point.roiWidthX),
            y: newData.map(point => point.roiHeightZ),
            text: newData.map((_, index) => index + 1),
            mode: 'markers',
            marker: { size: 5, color: 'blue' },
            type: 'scatter',
          }
          setData(updated_data);
        }
      } catch (error) {
        console.log(error)
      }
    }
    plotMasteredData(compInfo);
  }, []);
  
  useEffect(() => {
    // Create a socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socketRef.current.on("triggers", (data) => {
      console.log(data.scan_no)
      const newData = data.pointData;
      const updated_data = {
        x: newData.map(point => point.roiWidthX),
        y: newData.map(point => point.roiHeightZ),
        text: newData.map((_, index) => index + 1),
        mode: 'markers',
        marker: { size: 5, color: 'blue' },
        type: 'scatter',
      }
      setData(updated_data);
    });

    socketRef.current.on("scan_data", (data) => {
      console.log('_', data.scan_no)
      const newData = data.pointData;
      const updated_data = {
        x: newData.map(point => point.roiWidthX),
        y: newData.map(point => point.roiHeightZ),
        text: newData.map((_, index) => index + 1),
        mode: 'markers',
        marker: { size: 5, color: 'blue' },
        type: 'scatter',
      }
      setData(updated_data);
      setOrgData(newData);
      changeProfileNo(data.scan_no);
      setScanNo(data.scan_no);
    });

    socketRef.current.on("scan_data_batch", (data) => {
      // Function to process and display each profile one by one
      const processProfilesSequentially = (batch) => {
        for (let i = 0; i < batch.length; i++) {
          const profile = batch[i];
          const newData = profile.pointData;
          // Create the updated data object for the current profile
          const updated_data = {
            x: newData.map(point => point.roiWidthX),
            y: newData.map(point => point.roiHeightZ),
            text: newData.map((_, idx) => idx + 1),
            mode: 'markers',
            marker: { size: 5, color: 'blue' },
            type: 'scatter',
          };
          // Update the state with the new data for the current profile
          setData((prevData) => ({
            ...prevData,
            ...updated_data,
          }));
          setOrgData(newData);
          console.log('first254', profile.scan_no)
          // Update the state to reflect the profile number
          changeProfileNo(profile.scan_no);
          setScanNo(profile.scan_no);
        }
      };
      // Start processing the received batch
      processProfilesSequentially(data.batch);
    });
    socketRef.current.on("scan_complete", (data) => {
      stopIntervalShot();
    });
    socketRef.current.on("status", (data) => {
      if (data === "plotting_completed") {
        console.log('plotting_status ', data);
        filterRegionPoints(capturedFileIdRef.current);
      }
    });
    socketRef.current.on("profile_count", (data) => {
      if (data) {
        setProfileTotalCount(data);
      }
    });
    // Cleanup on component unmount
    return () => {
      socketRef.current.disconnect();
      socketRef.current.off("scan_data");
    };
  }, []);

  useEffect(() => {
    if(stop_mastering_process) {
      console.log('mastering_stopped______________________')
      setProfileTotalCount(0);
      setProgressValue(0);
      setErrors({});
      setScanNo('');
      setnewRunoutRange([]);
      setDoneRotation(0);
      setShowRunout(false);

      socketRef.current.off("scan_data");

      // toggleStopMastering();
    } else {
      socketRef.current.on("scan_data", (data) => {
        console.log('_', data.scan_no)
        const newData = data.pointData;
        const updated_data = {
          x: newData.map(point => point.roiWidthX),
          y: newData.map(point => point.roiHeightZ),
          text: newData.map((_, index) => index + 1),
          mode: 'markers',
          marker: { size: 5, color: 'blue' },
          type: 'scatter',
        }
        setData(updated_data);
        setOrgData(newData);
        changeProfileNo(data.scan_no);
        setScanNo(data.scan_no);
      });
    }
  }, [stop_mastering_process])

  useEffect(() => {
    if (regions.length >= 0) {
      const newRectangles = regions.map((region) => ({
        id: region.id,
        name: region.name,
        x: region.x,
        y: region.y,
        profile_data: [],
        color: region.color,
      }));
      setSelectedRectangles(newRectangles);
      setBoxes(newRectangles);


      if(regions.length == 0) {
        setLayout((prev) => ({
          ...prev,
          shapes: [],
          annotations: []
        }));
      } else {
        const newShapes = regions.map((region) => ({
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
        const newAnnotation = regions.map((region) => ({
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
      const maxIndex = regions.reduce((max, region) => {
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
  }, [regions]);

  
  useEffect(() => {
    const value = Math.round((scanNo / profileTotalCount) * 100);
    if (!value) {
      setProgressValue(0)
    } else {
      setProgressValue(value)
    }
  }, [scanNo, profileTotalCount]);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("photo_sensor", (data) => {
        console.log("Received scan data137:", data, no_of_rotation);
        if (data.count === 0) {
          setIsRotationStarted(1);
          setProfileTotalCount(0);
          setProgressValue(0);
          setErrors({});
          setScanNo(0);
          setDoneRotation(0);
          changeContTrigger('master');
          setStatus(true);
        } else if (data.count == no_of_rotation) { //  && is_mastering
          setIsRotationStarted(2);
          setStatus(false);
        }
        else {
          console.log('is mastering data:', is_mastering);
        }
        setDoneRotation(data?.count);
      });
      return () => {
        if (socketRef.current) {
          socketRef.current.off("photo_sensor");
        }
      };
    }
  }, [is_mastering, no_of_rotation])

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on("photo_sensor_1d", (data) => {
        console.log("Received scan data309:", data, no_of_rotation);
        if (data.count === 0) {    
          setDoneRotation(0);
          start1Dtest();
          // setStatus(true);
        } else if (data.count == no_of_rotation) { //  && is_mastering
          setIsRotationStarted(2);
          setStatus(false);
          // changeContTrigger('master');
          // completeMastering();
        }
        else {
          console.log('is mastering data:', is_mastering);
          // changeContTrigger('master');
        }
        setDoneRotation(data?.count);
      });
      return () => {
        if (socketRef.current) {
          socketRef.current.off("photo_sensor_1d");
        }
      };
    }
  }, [is_mastering, no_of_rotation])

  useEffect(() => {
    if (counter) {
      setProfileTotalCount(0);
      setProgressValue(0);
      setErrors({});
      setScanNo(0);
      setStatus(true);
    } else {
      setStatus(false);
    }
  }, [counter])

  useEffect(() => {
    if (status || droppedBoxes.length > 0) {
      filterPointsInsideBoxes(orgData);
    }
  }, [status, orgData, droppedBoxes]);

  useEffect(() => {
    capturedFileIdRef.current = capturedFileId;
  }, [capturedFileId]);

  const filterRegionPoints = async (capturedFileId) => {
    // only using backend
    if (!capturedFileId) {
      console.log("capturedFileId is missing");
      return;
    }
    
    let updatedRectangles = []
    setSelectedRectangles((prevRectangles) => {
      updatedRectangles = [...prevRectangles];
      return updatedRectangles;
    });

    const response = await urlSocket.post("/filter_region_points", {
      'comp_id': compInfo._id,
      'captured_file_id': capturedFileId,
      'regions': updatedRectangles
    }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
    console.log('***** ', response)
    setRunoutValue(response.data.region_data);
    setShowRunout(true);
  }

  const filterPointsInsideBoxes = (data) => {
    console.log('filterPointsInsideBoxes');
    const newPointsInsideBoxes = {};
    const isDropped = droppedBoxes.length > 0;
    setSelectedRectangles(prevRectangles =>
      prevRectangles.map((rect, id) => {
        const xMin = Math.min(...rect.x);
        const xMax = Math.max(...rect.x);
        const yMin = Math.min(...rect.y);
        const yMax = Math.max(...rect.y);
        // Filter the data based on the rectangle bounds
        const insideBox = data.filter(point =>
          point.roiWidthX >= xMin && point.roiWidthX <= xMax &&
          point.roiHeightZ >= yMin && point.roiHeightZ <= yMax
        );
        const updatedProfileData = Array.isArray(rect.profile_data) ? rect.profile_data : [];
        if (status && socketRef.current) {
          socketRef.current.emit('update', {
            'comp_id': comp_id, 'region_name': rect['name'], 'prof_data': insideBox
          });
        }
        if (isDropped) { newPointsInsideBoxes[rect.id] = insideBox; }
        return {
          ...rect,
        };
      })
    );
    if (isDropped) { setPointsInsideBoxes(newPointsInsideBoxes); }
  };

  const changeStatus = async () => {
    const isStop = status;
    setStatus(!status);
    if (!isStop) {
      console.log('insert region info')
      const formData = new FormData();
      formData.append('_id', comp_id);
      formData.append('region_datas', JSON.stringify(selectedRectangles));
      const response = await urlSocket.post('/region_datas', formData, {
        headers: {
          'content-type': 'multipart/form-data'
        },
        mode: 'no-cors'
      });
      console.log('region_datas :: 20')
    } else if (isStop) {
      const response = await urlSocket.post('/complete_mastering', { 'comp_id': comp_id }, { mode: "no-cors" });
      console.log('mastering completed ', response);
      setRunoutValue(response.data);
      setShowRunout(true);
    }
  }

  const confirmRange = async () => {
    setProfileTotalCount(0);
    setProgressValue(0);
    setErrors({});
    setScanNo('');
    const newRange = newRunoutRange;
    console.log('newRunoutRange ', newRunoutRange, runoutValue)
    let newErrors = {};
    // Iterate over newRunoutRange to check for empty values or missing fields
    runoutValue.forEach((item, index) => {
      // console.log('item.min_tolerenceRange,', item.min_tolerenceRange,item.max_tolerenceRange,typeof(item.min_tolerenceRange),typeof(item.max_tolerenceRange)),
      newErrors[index] = {
        // Check if the field is missing or has a falsy value
        min_tolerenceRange: !('min_tolerenceRange' in item) || item.min_tolerenceRange === null || item.min_tolerenceRange === undefined,
        max_tolerenceRange: !('max_tolerenceRange' in item) || item.max_tolerenceRange === null || item.max_tolerenceRange === undefined
      };
    });
    // Check if any errors exist
    const hasErrors = Object.values(newErrors).some(
      (err) => err.min_tolerenceRange || err.max_tolerenceRange
    );

    if (hasErrors) {
      setErrors(newErrors);
      console.log('Errors found:', newErrors);
    } else {
      setErrors({}); // Clear errors if none are found
      console.log('No errors', runoutValue, newRange, hasErrors, newErrors);
      let comp_data;
      try {
        const response = await urlSocket.post("/tolerance_Setting", 
          { 
            'comp_id': comp_id, 
            'runoutValue': runoutValue,
            'exposure_time': exposureTime,
            'measuring_rate': measuringRate,
            'timeDuration': timeDuration,
            'noOfRotation': noOfRotation,
            'leadTime': leadTime,
            'inspBasedOn': inspBasedOn,
            'captured_file_id': capturedFileId,
          }, {
          headers: {
            "content-type": "multipart/form-data",
          },
          mode: "no-cors",
        });
        let reset = response.data;
        comp_data = reset.comp_data;
        console.log("Sensor reset sts: ", reset);
        setnewRunoutRange([]);
        setDoneRotation(0);
        if (reset.status === 'success') {
          Swal.fire({
            title: 'Tolerance value set',
            text: 'Ready to Test',
            icon: 'success',
            timer: 2000, // 2 seconds
            timerProgressBar: true,
            didClose: () => Swal.stopTimer()
          });
        }
      } catch (error) {
        console.log("error", error);
      }
      setShowRunout(false);
      completePlotting(1, comp_data);
      setIsRotationStarted(0);
    }
  };

  const cancelAssignRange = async () => {
    setProfileTotalCount(0);
    setProgressValue(0);
    setErrors({});
    setScanNo('');
    setShowRunout(false);
    completePlotting(0);
    setIsRotationStarted(0);
    setDoneRotation(0);
  }

  const range = (e, index, type) => {
    console.log('e.target.value , index', e.target.value, index)
    let newRunoutrange = runoutValue;
    if (type === 'min_tolerenceRange') {
      newRunoutrange[index].min_tolerenceRange = Number(e.target.value)
    }
    else {
      newRunoutrange[index].max_tolerenceRange = Number(e.target.value)
    }
    console.log('newRunoutrange788', newRunoutrange)
    setnewRunoutRange(newRunoutrange)
  }

  const getRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const a = 0.5; // Very low opacity value between 0 and 1
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  const toggleRightCanvas = async (e, item, index) => {
    const updatedShapes = layout.shapes.map((shape, id) => ({
      ...shape,
      fillcolor: id == index ? 'rgba(255, 99, 71, 0.5)' : 'rgba(100, 150, 200, 0.3)'
    }))
    const oldAnnotations = layout.annotations.map((annotation, id) => ({
      ...annotation,
    }))
    setLayout((prevLayout) => ({
      ...prevLayout,
      shapes: updatedShapes,
      annotations: oldAnnotations,
    }));
    setSelectedLayout(_.cloneDeep(updatedShapes[index]));
    setSelectedAnnotation(_.cloneDeep(oldAnnotations[index]))
    const rectanlges = [...selectedRectangles];
    setSelectedRegData(_.cloneDeep(rectanlges[index]));
    setSelectedRegion(index)
    setIsRightCanvas(!isRightCanvas);
  }

  const closeRightCanvas = () => {
    setIsRightCanvas(false);
    handleReset();
  }

  const deleteRegion = (e, item, index) => {
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
    setIsUpdate(true);
    // Closing any pop confirm
    setOpenPopConfirms({});
  };

  // Handle form submission
  const handleSubmit = () => {
    if (regionNameError === '' && regionNameEmpty === '' &&
      regionWidthEmpty === '' && regionHeightEmpty === ''
    ) {
      setIsRightCanvas(false);
      setSelectedRegion(null);
      setIsUpdate(true);
      setShowReset(false)
    }
  };

  const handleReset = () => {
    setShowReset(false);
    const newShapes = _.cloneDeep(layout.shapes); // Clone to avoid mutation
    newShapes[selectedRegion] = _.cloneDeep(selectedLayout); // Restore original shape
    const newAnnotations = _.cloneDeep(layout.annotations); // Clone to avoid mutation
    newAnnotations[selectedRegion] = _.cloneDeep(selectedAnnotation); // Restore original shape


    const rectangles = _.cloneDeep(selectedRectangles); // Clone to avoid mutation
    rectangles[selectedRegion] = _.cloneDeep(selectedRegData); // Restore original rectangle data
    setLayout((prevLayout) => ({
      ...prevLayout,
      shapes: newShapes,
      annotations: newAnnotations,
    }));
    setSelectedRectangles(rectangles);
    setBoxes(rectangles);
    
    setRegionNameEmpty('')
    setRegionNameError('')
    setRegionWidthEmpty('')
    setRegionHeightEmpty('')
    // setIsUpdate(true);
  }


  const handleInputChange = (index, key, value) => {
    const newData = [...selectedRectangles];

    if (key === 'name') {
      // Check if the new name already exists
      const existingRegionIndex = newData.findIndex(
        (region, id) => region.name === value && selectedRegion !== id
      );
      console.log('existingRegionIndex ', existingRegionIndex, newData);

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
      if (key == "x") {
        console.log('value ', key, value)
        if (!value) {
          setRegionWidthEmpty('*valid width value required')
        } else if (decimalPart && decimalPart.length > 14) {
          const updatedValue = parseFloat(value).toFixed(14);
          console.log('Updated value with 14 decimal places:', updatedValue);
          value = updatedValue;
        } else {
          setRegionWidthEmpty('')
        }
      }
      if (key == "y") {
        console.log('value ', key, value)
        if (!value) {
          setRegionHeightEmpty('*valid height value required')
        } else if (decimalPart && decimalPart.length > 14) {
          const updatedValue = parseFloat(value).toFixed(14);
          console.log('Updated value with 14 decimal places:', updatedValue);
          value = updatedValue;
        } else {
          setRegionHeightEmpty('')
        }
      }

      // If adjusting width/height (x/y values), update the selected rectangle
      newData[selectedRegion][key][index] = value// parseFloat(value);
      setSelectedRectangles(newData);
      setBoxes(newData);

      // Update the corresponding shape in the layout
      const newShapes = [...layout.shapes];
      newShapes[selectedRegion] = {
        ...newShapes[selectedRegion],
        [`${key}${index}`]: parseFloat(value),
      };

      // Update the layout with the new shapes
      setLayout((prevLayout) => ({
        ...prevLayout,
        shapes: newShapes,
      }));

      // Also, reposition the annotation (region name) based on the new rectangle size
      const updatedAnnotations = [...layout.annotations];
      const updatedRect = newShapes[selectedRegion];

      updatedAnnotations[selectedRegion] = {
        ...updatedAnnotations[selectedRegion],
        x: (updatedRect.x0 + updatedRect.x1) / 2, // Reposition the name in the middle of the rectangle (x-axis)
        y: updatedRect.y1 + 0.1, // Reposition slightly above the rectangle (y-axis)
      };

      // Update layout with the new annotations (repositioned name)
      setLayout((prevLayout) => ({
        ...prevLayout,
        annotations: updatedAnnotations,
      }));
    }

    // Trigger UI updates
    setShowReset(true);
  };
  
  
  const toggleDeleteConfirm = (index, val) => {
    setOpenPopConfirms({
      [index]: val == 0 ? true : false
    })
  }

  const handleBoxSelect = () => {
    if (plotRef.current) {
      Plotly.relayout(plotRef.current, { 'dragmode': 'select' });
    }
  };


  const handleBoxEnd = async (event) => {
    console.log('event*********', event);

    if (event?.range) {
      // Create a new range object with a unique name based on the next available index
      const newRange = {
        id: uuidv4(),
        name: `region_${nextRegionIndex.current}`, // Use the next available index for the name
        x: event.range.x,
        y: event.range.y,
        profile_data: [],
        color: getRandomColor(),
      };

      // Increment the index to ensure uniqueness for the next region
      nextRegionIndex.current += 1;

      // Update selectedRectangles state
      setSelectedRectangles((prevRectangles) => {
        const updatedRectangles = [...prevRectangles, newRange];

        // Ensure boxes prop update happens right after selectedRectangles
        setBoxes(updatedRectangles); // Assuming setBoxes should mirror selectedRectangles
        console.log('updatedRectangles670', updatedRectangles)
        return updatedRectangles;
      });
      setIsUpdate(true);

      // Create a new rectangle shape for layout
      const newRectangle = {
        type: 'rect',
        xref: 'x',
        yref: 'y',
        x0: newRange.x[0],
        y0: newRange.y[0],
        x1: newRange.x[1],
        y1: newRange.y[1],
        line: {
          color: 'rgba(0, 0, 0, 1)',
          width: 2,
        },
        fillcolor: 'rgba(100, 150, 200, 0.3)',
        editable: true, // Enable editing
        dragmode: 'move', // Allow dragging
        'zoom2d':false
      };

      // Create a new annotation to show the region name above the shape
      const newAnnotation = {
        x: (newRange.x[0] + newRange.x[1]) / 2, // Position annotation in the middle of the rectangle (x-axis)
        y: newRange.y[1] + 0.1, // Slightly above the rectangle (y-axis)
        xref: 'x',
        yref: 'y',
        text: newRange.name, // Region name from newRange
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
      };

      // Update layout with the new shape
      setLayout((prevLayout) => ({
        ...prevLayout,
        shapes: [...prevLayout.shapes, newRectangle],
        annotations: [...(prevLayout.annotations || []), newAnnotation],
      }));
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
              console.log('id, index, rect', id, index, rect, shape)

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
          return updatedRectangles;
        });

        setIsUpdate(true);
      } else {
        console.warn('Shape does not have valid coordinates:', shape);
      }
    });

    // Update boxes and selectedRectangles with the new positions
    if (updatedRectangles.length > 0) {
      console.log('updatedRectangles765', updatedRectangles);
      setBoxes(updatedRectangles);
      setIsUpdate(true);
    }
  };
  
  useImperativeHandle(ref, () => ({
    toggleRightCanvas,
    deleteRegion,
    toggleDeleteConfirm,
    handleBoxSelect,
    changeStatus,
    getSomeState: () => openPopConfirms,  // Allow access to the state if needed
  }));

  const handleMeasurementTypeChange = (e) => {
    const selectedUnit = e.target.value;
    const updatedRunoutValue = runoutValue.map(item => {
      const baseMax = item.originalMax || item.max_deviation;
      const baseMin = item.originalMin || item.min_deviation;
      const baseRunout = item.originalRunout || item.runout;

      // Preserve original values if not already set
      if (!item.originalMax) {
        item.originalMax = baseMax;
        item.originalMin = baseMin;
        item.originalRunout = baseRunout;
      }

      // Update values based on the selected unit
      let updatedItem = { ...item };
      switch (selectedUnit) {
        case "cm":
          updatedItem.max_deviation = (baseMax / 10).toFixed(3);
          updatedItem.min_deviation = (baseMin / 10).toFixed(3);
          updatedItem.runout = (baseRunout / 10).toFixed(3);
          break;
        case "inch":
          updatedItem.max_deviation = (baseMax / 25.4).toFixed(3);
          updatedItem.min_deviation = (baseMin / 25.4).toFixed(3);
          updatedItem.runout = (baseRunout / 25.4).toFixed(3);
          break;
        case "mm":
          updatedItem.max_deviation = baseMax.toFixed(3);
          updatedItem.min_deviation = baseMin.toFixed(3);
          updatedItem.runout = baseRunout.toFixed(3);
          break;
        default:
          break;
      }

      updatedItem.measurementType = selectedUnit;
      return updatedItem;
    });

    setRunoutValue(updatedRunoutValue); // Update the state with new values
  };


  return (
    <div className="chart-container">
      {/* {
        isLoadingProfile &&
        <div className="d-flex align-items-center">
          <Progress
            className="progress-xl"
            value={progressValue}
            color="success"
            style={{ width: '100%' }}
            animated
          >
            {`${progressValue}%`}
          </Progress>
        </div>
      } */}
      {data.length !== 0 ? (
        <React.Fragment>
          {
            scanNo && isFinite(progressValue) ?
              <div>
                <p className='mt-1 ms-2' style={{ fontWeight: 'bold' }}>No. of Profiles Taken: {scanNo}</p>
              </div> : null
          }
          {
            isLoadingProfile &&
            <div className="d-flex align-items-center">
              <Progress
                className="progress-xl"
                value={progressValue}
                color="success"
                style={{ width: '100%' }}
                animated
              >
                {`${progressValue}%`}
              </Progress>
            </div>
          }
          <Plot
            ref={plotRef}
            data={[data]}
            layout={{ ...layout }}
            onInitialized={(figure, graphDiv) => {
              plotRef.current = graphDiv;
              graphDiv.on('plotly_selected', handleBoxEnd);
              // Listen for shape updates
              graphDiv.on('plotly_relayout', handleShapeUpdate);
            }}
            style={{ width: '100%', height: '70%' }}
            config={{
              displayModeBar: true,
              responsive: true,
              scrollZoom: true,
              staticPlot: false,
              displaylogo: false,
              editable: !isButtonDisabled(), // Control overall editability
              edits: {
                titleText: false, // Disable title text editing to prevent placeholders
                axisTitleText: false, // Disable axis title text editing to remove placeholders
                shapePosition: !isButtonDisabled(), // Allows shape dragging and editing only if editable
              },
              modeBarButtonsToRemove: [
                'lasso2d',
                'select2d',
              ],
            }}
          />
         
        </React.Fragment>
      ) 
      // :      
      //   isLoadingProfile ? (
      //     <div
      //       className="progress-container"
      //       style={{
      //         position: 'relative',
      //         width: '100%',
      //         height: 'auto',
      //       }}
      //     >
      //       <div
      //         style={{
      //           position: 'absolute',
      //           top: '10%',
      //           left: '50%',
      //           transform: 'translate(-50%, -50%)',
      //           width: '98%',
      //           textAlign: 'center',
      //         }}
      //       >
      //         <Progress
      //           className="progress-xl mx-2"
      //           value={progressValue}
      //           color="primary"
      //           style={{
      //             width: '99%', 
      //             fontSize: 'clamp(12px, 14px, 16px)',
      //             padding: '0',
      //             margin: '0',
      //             border: '2px solid #007bff',
      //           }}

      //         >
      //           {`${progressValue}%`}
      //         </Progress>
      //       </div>
      //     </div>
      //   )
      :      
      
      (
        <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
          <div className="text-center">
            <img src={No_data} className="img-fluid h-auto" alt="No Data" style={{ width: '21%' }} />
            <h6 className='text-secondary'>No data Found</h6>
          </div>
        </div>
    
    
    )}

  


      {/* {isLoadingProfile &&
        <footer
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            backgroundColor: "#fff",
            minHeight: "50px",
            borderTop: "1px solid #dedede",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          {!isLoadingProfile && (
            <div
              style={{
                width: "80%",
                maxWidth: "800px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Progress
                className="progress-xl"
                value={progressValue || 50}
                color="primary"
                style={{
                  width: "100%",
                  fontSize: "clamp(12px, 14px, 16px)",
                  padding: "0",
                  margin: "0",
                }}
              // animated
              >
                {`${progressValue || 50}%`}
              </Progress>
            </div>
          )}
        </footer>
      } */}


    

{/* <footer
  style={{
    position: "fixed",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    height: "50px",
    borderTop: "1px solid #dedede",
    zIndex: 9998,
    display: "flex",
    justifyContent: "center", // Centers the content horizontally
    alignItems: "center", // Centers the content vertically
  }}
>
  {isLoadingProfile && (
    <div
      style={{
        width: "100%", 
        maxWidth: "1200px",
        padding: "0 10px", 
        display: "flex",
        alignItems: "center",
      }}
    >
      <Progress
        className="progress-xl"
        value={progressValue}
        color="success"
        style={{ width: "100%" }}
        animated
      >
        {`${progressValue}%`}
      </Progress>
    </div>
  )}
</footer> */}







      {isRightCanvas &&
        selectedRegion !== null &&
        selectedRectangles.length > 0 &&
        <Offcanvas
          isOpen={isRightCanvas}
          direction="start"
          toggle={closeRightCanvas}
          scrollable
          backdrop={true}
        >
          <OffcanvasHeader toggle={closeRightCanvas}>
            <div style={{ fontWeight: 'bold' }}>Region Data</div>
          </OffcanvasHeader>
          <OffcanvasBody>
            <Form>
              <div className="mb-3">
                <Label>Name</Label>
                <Input
                  type="text"
                  value={selectedRectangles[selectedRegion].name}
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
                  value={selectedRectangles[selectedRegion].y[1]}
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
                  value={selectedRectangles[selectedRegion].x[1]}
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
              <div className='d-flex justify-content-between'>
                <Button color="primary" onClick={handleSubmit}>
                  Submit
                </Button>
                {
                  showReset &&
                  <Button color="dark" onClick={handleReset}>
                    Reset
                  </Button>
                }
              </div>
            </Form>
          </OffcanvasBody>
        </Offcanvas>
      }
      <Modal isOpen={showRunout} style={{
        maxWidth: '70%',
        width: '70%',
        zIndex: 995
      }}>
        <Row className='mx-3 mt-2'>
          <Col md={6} lg={6}>
            <h5 style={{ fontWeight: 'bold' }}>
              No. of Profiles Taken: {scanNo}
            </h5>
          </Col>
          <Col>
            <h5 style={{ fontWeight: "bold" }}>Measurement Type</h5>
            <br></br>
            <Input
              type="select"
              onChange={handleMeasurementTypeChange} // Removed index parameter
              defaultValue={"mm"}
              // value={item.measurementType || "mm"}
              style={{ width: '150px', textAlign: 'center', marginBottom: "10px" }}
            >
              <option value="mm">Select</option>
              <option value="cm">cm</option>
              <option value="inch">inch</option>
              <option value="mm">mm</option>
            </Input>

          </Col>
          <Col md={6} lg={6}>
            {
              inspBasedOn === "rotation" &&
              <h5 style={{ fontWeight: 'bold' }}>
                {`Rotation Completed: ${compInfo.no_of_rotation}`}
              </h5>
            }
          </Col>
        </Row>
        <ModalBody>
          <Table striped responsive>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Name</th>
                <th>Max value</th>
                <th>Min value</th>
                <th>Run-Out</th>
                <th>Acceptable Runout for OK Max and Min</th>
              </tr>
            </thead>
            <tbody>
              {runoutValue.map((item, index) => (
                <tr key={index}>
                  <th scope="row">{index + 1}</th>
                  <td>{item.name}</td>
                  {
                    item.is_points_taken ?
                      <>
                        <td>{item.max_deviation}</td>
                        <td>{item.min_deviation}</td>
                        <td>{item.runout}</td>
                        <td width="30%">
                          <Card style={{
                            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
                            padding: '5px', // Example padding
                            background: '#ffffff',
                          }}>
                            <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Range</CardTitle>
                            <CardBody>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: '1', marginRight: '5px' }}>
                                  <Input
                                    type="number"
                                    placeholder="Min Range"
                                    step={0.01}
                                    max={item.runout}
                                    onChange={(e) => range(e, index, 'min_tolerenceRange')}
                                    // value={item.min_tolerenceRange || ''}
                                    style={{ width: '100%', borderColor: errors[index]?.min_tolerenceRange ? 'red' : '' }}
                                  />
                                  {errors[index]?.min_tolerenceRange &&
                                    <p className='danger' style={{ fontSize: '12px', color: 'red' }}>*Please Enter Minimum Tolerance Value</p>
                                  }
                                </div>
                                <div style={{ alignItems: 'center' }}>To</div>
                                <div style={{ flex: '1', marginLeft: '5px' }}>
                                  <Input
                                    type="number"
                                    placeholder="Max Range"
                                    step={0.01}
                                    min={item.runout}
                                    onChange={(e) => range(e, index, 'max_tolerenceRange')}
                                    // value={item.max_tolerenceRange || ''}
                                    style={{ width: '100%', borderColor: errors[index]?.max_tolerenceRange ? 'red' : '' }}
                                  />
                                  {errors[index]?.max_tolerenceRange &&
                                    <p className='danger' style={{ fontSize: '12px', color: 'red' }}>*Please Enter Maximum Tolerance Value</p>
                                  }
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        </td>
                      </>
                      :
                      <td colSpan={4} style={{ fontWeight: 'bold', color: 'red' }}>* Incomplete data: No Data Points Taken for this Region</td>
                  }
                </tr>
              ))}
            </tbody>
          </Table>
          <div className='d-flex justify-content-center'>
            {
              runoutValue.some(item => !item.is_points_taken) &&
              <p className='my-1' style={{ fontWeight: 'bold', color: 'black' }}>
                {`* Ensure all regions have data points before accepting.`}
              </p>
            }
          </div>
          <div className='d-flex justify-content-center'>
            {
              runoutValue.some(item => !item.is_points_taken) ?
                null :
                <Button
                  color='success'
                  onClick={() => confirmRange()}
                  style={{ marginRight: '10px' }} // Adjusts spacing
                >
                  Accept
                </Button>
            }
            <Button
              color='danger'
              className='ms-3'
              onClick={() => cancelAssignRange()}
            >
              Cancel
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
        </ModalFooter>
      </Modal>
    </div>
  );
});

PointCloudPlot.propTypes = {
  comp_id: PropTypes.string.isRequired,
  regions: PropTypes.any.isRequired,

  boxes: PropTypes.any.isRequired,
  draggingBoxId: PropTypes.any.isRequired,
  isDragging: PropTypes.any.isRequired,
  setBoxes: PropTypes.any.isRequired,
  setDraggingBoxId: PropTypes.any.isRequired,
  setIsDragging: PropTypes.any.isRequired,
  stopIntervalShot: PropTypes.any.isRequired,

  is_mastering: PropTypes.any.isRequired,
  changeContTrigger: PropTypes.any.isRequired,
  disable_end_testing: PropTypes.any.isRequired,
  no_of_rotation: PropTypes.any.isRequired,
  counter: PropTypes.any.isRequired,
  end_testing: PropTypes.any.isRequired,
  compInfo: PropTypes.any.isRequired,
  onTimeup: PropTypes.any.isRequired,
  startLeadTime: PropTypes.any.isRequired,
  onTimeup1: PropTypes.any.isRequired,
  changeProfileNo: PropTypes.any.isRequired,
  done_rotation: PropTypes.any.isRequired,
  isRotationStarted: PropTypes.any.isRequired,
  setDoneRotation: PropTypes.any.isRequired,
  setIsRotationStarted: PropTypes.any.isRequired,

  capturedFileId: PropTypes.any.isRequired,
  completePlotting: PropTypes.any.isRequired,
  isLoadingProfile: PropTypes.any.isRequired,
  exposureTime: PropTypes.any.isRequired,
  measuringRate: PropTypes.any.isRequired,

  timeDuration: PropTypes.any.isRequired,
  noOfRotation: PropTypes.any.isRequired,
  leadTime: PropTypes.any.isRequired,
  inspBasedOn: PropTypes.any.isRequired,

  start1Dtest: PropTypes.any.isRequired,
  stop_mastering_process: PropTypes.any.isRequired,
  toggleStopMastering: PropTypes.any.isRequired,
  isButtonDisabled: PropTypes.any.isRequired,
};

PointCloudPlot.displayName = "PointCloudPlot"

export default PointCloudPlot;












// Before - 23-12-24
// import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
// import Plot from 'react-plotly.js';
// import Plotly from 'plotly.js';
// import io from 'socket.io-client';
// import 'assets/css/admin_ui.css';
// import No_data from 'assets/images/nodata/loss.gif';
// import PropTypes from 'prop-types';
// import { Button, Table, Card, CardTitle, CardBody, Input, Collapse, Offcanvas, OffcanvasHeader, OffcanvasBody, Label, Form, Col, Row, Modal, ModalHeader, ModalBody, ModalFooter, Progress } from 'reactstrap';
// import urlSocket from 'pages/AdminInspection/urlSocket';
// import Swal from 'sweetalert2';
// import { v4 as uuidv4 } from 'uuid';
// import _ from 'lodash';
// import { socketUrl } from './urls';

// const PointCloudPlot = forwardRef(({
//   comp_id,
//   regions,
//   setBoxes,
//   stopIntervalShot,
//   is_mastering,
//   changeContTrigger,
//   no_of_rotation,
//   counter,
//   compInfo,
//   changeProfileNo,
//   setDoneRotation,
//   setIsRotationStarted,
//   capturedFileId,
//   completePlotting,
//   isLoadingProfile,
//   exposureTime,
//   measuringRate,
//   timeDuration,
//   noOfRotation,
//   leadTime,
//   inspBasedOn,

//   start1Dtest,
//   stop_mastering_process,
//   toggleStopMastering,
//   isButtonDisabled
// }, ref) => {
//   const [data, setData] = useState([]);
//   const [orgData, setOrgData] = useState([]);
//   const [selectedRegion, setSelectedRegion] = useState(null);
//   const [selectedRegData, setSelectedRegData] = useState({});
//   const [selectedLayout, setSelectedLayout] = useState({});
//   const [selectedAnnotation, setSelectedAnnotation] = useState({});
//   const [isRightCanvas, setIsRightCanvas] = useState(false);
//   const [status, setStatus] = useState(false);
//   const [selectedRectangles, setSelectedRectangles] = useState([]);
//   const [showRunout, setShowRunout] = useState(false);
//   const [runoutValue, setRunoutValue] = useState([]);
//   const [newRunoutRange, setnewRunoutRange] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [openPopConfirms, setOpenPopConfirms] = useState({});
//   const [droppedBoxes, setDroppedBoxes] = useState([]);
//   const [pointsInsideBoxes, setPointsInsideBoxes] = useState({});
//   const [scanNo, setScanNo] = useState(null);
//   const nextRegionIndex = useRef(1); // Keep track of the next unique index for region names
//   const [isUpdate, setIsUpdate] = useState(false);
//   const [isCreatedRegion, setCreatedRegion] = useState(false);
//   const [showReset,setShowReset] = useState(false);
//   const [regionNameError,setRegionNameError] = useState('');
//   const [regionNameEmpty,setRegionNameEmpty] = useState('');
  
//   const [regionHeightEmpty, setRegionHeightEmpty] = useState('')
//   const [regionWidthEmpty, setRegionWidthEmpty] = useState('')

//   const [layout, setLayout] = useState({
//     plot_bgcolor: '#e0e0e0',
//     paper_bgcolor: '#ffffff',
//     margin: { l: 50, r: 50, t: 50, b: 50, },
//     xaxis: {
//       title: 'Width',
//       range: [-300, 300],
//     },
//     yaxis: {
//       title: 'Height',
//       range: [-300, 300],
//     },
//     shapes: [],
//   });
//   const socketRef = useRef(null);
//   const plotRef = useRef(null);
//   const capturedFileIdRef = useRef(capturedFileId);
//   const [profileTotalCount, setProfileTotalCount] = useState(0);
//   const [progressValue, setProgressValue] = useState(0);
//   const SOCKET_SERVER_URL = socketUrl;
//   // const SOCKET_SERVER_URL = "https://172.16.1.91:5002";

//   useEffect(() => {
//     const plotMasteredData = async (comp_value) => {
//       try {
//         if (comp_value?.mastering_status == 'completed') {
//           const response = await urlSocket.post("/plot_mastered_data", {
//             'comp_id': comp_value._id,
//             'captured_file_id': comp_value.captured_file_id
//           }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });

//           const newData = response.data.pointData;
//           const updated_data = {
//             x: newData.map(point => point.roiWidthX),
//             y: newData.map(point => point.roiHeightZ),
//             text: newData.map((_, index) => index + 1),
//             mode: 'markers',
//             marker: { size: 5, color: 'blue' },
//             type: 'scatter',
//           }
//           setData(updated_data);
//         }
//       } catch (error) {
//         console.log(error)
//       }
//     }
//     plotMasteredData(compInfo);
//   }, []);
  
//   useEffect(() => {
//     // Create a socket connection
//     socketRef.current = io(SOCKET_SERVER_URL, {
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000
//     });

//     socketRef.current.on("triggers", (data) => {
//       console.log(data.scan_no)
//       const newData = data.pointData;
//       const updated_data = {
//         x: newData.map(point => point.roiWidthX),
//         y: newData.map(point => point.roiHeightZ),
//         text: newData.map((_, index) => index + 1),
//         mode: 'markers',
//         marker: { size: 5, color: 'blue' },
//         type: 'scatter',
//       }
//       setData(updated_data);
//     });

//     socketRef.current.on("scan_data", (data) => {
//       console.log('_', data.scan_no)
//       const newData = data.pointData;
//       const updated_data = {
//         x: newData.map(point => point.roiWidthX),
//         y: newData.map(point => point.roiHeightZ),
//         text: newData.map((_, index) => index + 1),
//         mode: 'markers',
//         marker: { size: 5, color: 'blue' },
//         type: 'scatter',
//       }
//       setData(updated_data);
//       setOrgData(newData);
//       changeProfileNo(data.scan_no);
//       setScanNo(data.scan_no);
//     });

//     socketRef.current.on("scan_data_batch", (data) => {
//       // Function to process and display each profile one by one
//       const processProfilesSequentially = (batch) => {
//         for (let i = 0; i < batch.length; i++) {
//           const profile = batch[i];
//           const newData = profile.pointData;
//           // Create the updated data object for the current profile
//           const updated_data = {
//             x: newData.map(point => point.roiWidthX),
//             y: newData.map(point => point.roiHeightZ),
//             text: newData.map((_, idx) => idx + 1),
//             mode: 'markers',
//             marker: { size: 5, color: 'blue' },
//             type: 'scatter',
//           };
//           // Update the state with the new data for the current profile
//           setData((prevData) => ({
//             ...prevData,
//             ...updated_data,
//           }));
//           setOrgData(newData);
//           console.log('first254', profile.scan_no)
//           // Update the state to reflect the profile number
//           changeProfileNo(profile.scan_no);
//           setScanNo(profile.scan_no);
//         }
//       };
//       // Start processing the received batch
//       processProfilesSequentially(data.batch);
//     });
//     socketRef.current.on("scan_complete", (data) => {
//       stopIntervalShot();
//     });
//     socketRef.current.on("status", (data) => {
//       if (data === "plotting_completed") {
//         console.log('plotting_status ', data);
//         filterRegionPoints(capturedFileIdRef.current);
//       }
//     });
//     socketRef.current.on("profile_count", (data) => {
//       if (data) {
//         setProfileTotalCount(data);
//       }
//     });
//     // Cleanup on component unmount
//     return () => {
//       socketRef.current.disconnect();
//       socketRef.current.off("scan_data");
//     };
//   }, []);

//   useEffect(() => {
//     if(stop_mastering_process) {
//       console.log('mastering_stopped______________________')
//       setProfileTotalCount(0);
//       setProgressValue(0);
//       setErrors({});
//       setScanNo('');
//       setnewRunoutRange([]);
//       setDoneRotation(0);
//       setShowRunout(false);

//       socketRef.current.off("scan_data");

//       // toggleStopMastering();
//     } else {
//       socketRef.current.on("scan_data", (data) => {
//         console.log('_', data.scan_no)
//         const newData = data.pointData;
//         const updated_data = {
//           x: newData.map(point => point.roiWidthX),
//           y: newData.map(point => point.roiHeightZ),
//           text: newData.map((_, index) => index + 1),
//           mode: 'markers',
//           marker: { size: 5, color: 'blue' },
//           type: 'scatter',
//         }
//         setData(updated_data);
//         setOrgData(newData);
//         changeProfileNo(data.scan_no);
//         setScanNo(data.scan_no);
//       });
//     }
//   }, [stop_mastering_process])

//   useEffect(() => {
//     if (regions.length >= 0) {
//       const newRectangles = regions.map((region) => ({
//         id: region.id,
//         name: region.name,
//         x: region.x,
//         y: region.y,
//         profile_data: [],
//         color: region.color,
//       }));
//       setSelectedRectangles(newRectangles);
//       setBoxes(newRectangles);


//       if(regions.length == 0) {
//         setLayout((prev) => ({
//           ...prev,
//           shapes: [],
//           annotations: []
//         }));
//       } else {
//         const newShapes = regions.map((region) => ({
//           type: 'rect',
//           xref: 'x',
//           yref: 'y',
//           x0: region.x[0],
//           y0: region.y[0],
//           x1: region.x[1],
//           y1: region.y[1],
//           line: {
//             color: 'rgba(0, 0, 0, 1)',
//             width: 2,
//           },
//           fillcolor: 'rgba(100, 150, 200, 0.3)',
//         }));
//         const newAnnotation = regions.map((region) => ({
//           x: (region.x[0] + region.x[1]) / 2, // Position annotation in the middle of the rectangle (x-axis)
//           y: region.y[1] + 0.1, // Slightly above the rectangle (y-axis)
//           xref: 'x',
//           yref: 'y',
//           text: region.name, // Region name from region
//           showarrow: false, // No arrow, just text
//           font: {
//             size: 12,
//             color: 'black',
//           },
//           align: 'center', // Center the text
//           bgcolor: 'white', // 'rgba(255, 255, 255, 0.5)', // Optional background for better visibility
//           bordercolor: 'black', // Border color
//           borderwidth: 1,
//           borderpad: 4,
//         }))
        
//         setLayout((prev) => ({
//           ...prev,
//           shapes: [...prev.shapes, ...newShapes],
//           annotations: [...prev.annotations, ...newAnnotation],
//         }));
//       }
      

//       // Find the highest index from the existing region names
//       const maxIndex = regions.reduce((max, region) => {
//         const match = region.name.match(/region_(\d+)/);
//         if (match) {
//           const index = parseInt(match[1], 10);
//           return index > max ? index : max;
//         }
//         return max;
//       }, -1);
//       // Update the nextRegionIndex to start from the next available index
//       nextRegionIndex.current = maxIndex + 1;
//     }
//   }, [regions]);

//   // useEffect(() => {
//   //   if (isUpdate) {
//   //     const updateRectanglesInDatabase = async () => {
//   //       try {
//   //         const formData = new FormData();
//   //         formData.append('_id', comp_id);
//   //         formData.append('region_datas', JSON.stringify(selectedRectangles));
//   //         const response = await urlSocket.post('/region_datas', formData, {
//   //           headers: {
//   //             'Content-Type': 'multipart/form-data',
//   //           },
//   //         });
//   //         if (response.status === 200) {
//   //           console.log('Successfully updated regions in the database');
//   //         } else {
//   //           console.error('Failed to update regions in the database', response);
//   //         }
//   //       } catch (error) {
//   //         console.error('An error occurred while updating regions:', error);
//   //       }
//   //       setIsUpdate(false);
//   //     };
//   //     if (selectedRectangles.length >= 0) {
//   //       updateRectanglesInDatabase();
//   //     }
//   //   }
//   // }, [selectedRectangles, isUpdate]);

//   useEffect(() => {
//     const value = Math.round((scanNo / profileTotalCount) * 100);
//     if (!value) {
//       setProgressValue(0)
//     } else {
//       setProgressValue(value)
//     }
//   }, [scanNo, profileTotalCount]);

//   useEffect(() => {
//     if (socketRef.current) {
//       socketRef.current.on("photo_sensor", (data) => {
//         console.log("Received scan data137:", data, no_of_rotation);
//         if (data.count === 0) {
//           setIsRotationStarted(1);
//           setProfileTotalCount(0);
//           setProgressValue(0);
//           setErrors({});
//           setScanNo(0);
//           setDoneRotation(0);
//           changeContTrigger('master');
//           setStatus(true);
//         } else if (data.count == no_of_rotation) { //  && is_mastering
//           setIsRotationStarted(2);
//           setStatus(false);
//         }
//         else {
//           console.log('is mastering data:', is_mastering);
//         }
//         setDoneRotation(data?.count);
//       });
//       return () => {
//         if (socketRef.current) {
//           socketRef.current.off("photo_sensor");
//         }
//       };
//     }
//   }, [is_mastering, no_of_rotation])

//   useEffect(() => {
//     if (socketRef.current) {
//       socketRef.current.on("photo_sensor_1d", (data) => {
//         console.log("Received scan data309:", data, no_of_rotation);
//         if (data.count === 0) {
//           // setIsRotationStarted(1);
//           // // cancelAssignRange();
//           // setProfileTotalCount(0);
//           // setProgressValue(0);
//           // setErrors({});
//           // setScanNo(0);
//           setDoneRotation(0);
//           start1Dtest();
//           // setStatus(true);
//         } else if (data.count == no_of_rotation) { //  && is_mastering
//           setIsRotationStarted(2);
//           setStatus(false);
//           // changeContTrigger('master');
//           // completeMastering();
//         }
//         else {
//           console.log('is mastering data:', is_mastering);
//           // changeContTrigger('master');
//         }
//         setDoneRotation(data?.count);
//       });
//       return () => {
//         if (socketRef.current) {
//           socketRef.current.off("photo_sensor_1d");
//         }
//       };
//     }
//   }, [is_mastering, no_of_rotation])

//   useEffect(() => {
//     if (counter) {
//       setProfileTotalCount(0);
//       setProgressValue(0);
//       setErrors({});
//       setScanNo(0);
//       setStatus(true);
//     } else {
//       setStatus(false);
//     }
//   }, [counter])

//   useEffect(() => {
//     if (status || droppedBoxes.length > 0) {
//       filterPointsInsideBoxes(orgData);
//     }
//   }, [status, orgData, droppedBoxes]);

//   useEffect(() => {
//     capturedFileIdRef.current = capturedFileId;
//   }, [capturedFileId]);

//   const filterRegionPoints = async (capturedFileId) => {
//     // only using backend
//     if (!capturedFileId) {
//       console.log("capturedFileId is missing");
//       return;
//     }
    
//     let updatedRectangles = []
//     setSelectedRectangles((prevRectangles) => {
//       updatedRectangles = [...prevRectangles];
//       return updatedRectangles;
//     });

//     const response = await urlSocket.post("/filter_region_points", {
//       'comp_id': compInfo._id,
//       'captured_file_id': capturedFileId,
//       'regions': updatedRectangles
//     }, { headers: { "content-type": "multipart/form-data" }, mode: "no-cors" });
//     console.log('***** ', response)
//     setRunoutValue(response.data.region_data);
//     setShowRunout(true);
//   }

//   const filterPointsInsideBoxes = (data) => {
//     console.log('filterPointsInsideBoxes');
//     const newPointsInsideBoxes = {};
//     const isDropped = droppedBoxes.length > 0;
//     setSelectedRectangles(prevRectangles =>
//       prevRectangles.map((rect, id) => {
//         const xMin = Math.min(...rect.x);
//         const xMax = Math.max(...rect.x);
//         const yMin = Math.min(...rect.y);
//         const yMax = Math.max(...rect.y);
//         // Filter the data based on the rectangle bounds
//         const insideBox = data.filter(point =>
//           point.roiWidthX >= xMin && point.roiWidthX <= xMax &&
//           point.roiHeightZ >= yMin && point.roiHeightZ <= yMax
//         );
//         const updatedProfileData = Array.isArray(rect.profile_data) ? rect.profile_data : [];
//         if (status && socketRef.current) {
//           socketRef.current.emit('update', {
//             'comp_id': comp_id, 'region_name': rect['name'], 'prof_data': insideBox
//           });
//         }
//         if (isDropped) { newPointsInsideBoxes[rect.id] = insideBox; }
//         return {
//           ...rect,
//         };
//       })
//     );
//     if (isDropped) { setPointsInsideBoxes(newPointsInsideBoxes); }
//   };

//   const changeStatus = async () => {
//     const isStop = status;
//     setStatus(!status);
//     if (!isStop) {
//       console.log('insert region info')
//       const formData = new FormData();
//       formData.append('_id', comp_id);
//       formData.append('region_datas', JSON.stringify(selectedRectangles));
//       const response = await urlSocket.post('/region_datas', formData, {
//         headers: {
//           'content-type': 'multipart/form-data'
//         },
//         mode: 'no-cors'
//       });
//       console.log('region_datas :: 20')
//     } else if (isStop) {
//       const response = await urlSocket.post('/complete_mastering', { 'comp_id': comp_id }, { mode: "no-cors" });
//       console.log('mastering completed ', response);
//       setRunoutValue(response.data);
//       setShowRunout(true);
//     }
//   }

//   const confirmRange = async () => {
//     setProfileTotalCount(0);
//     setProgressValue(0);
//     setErrors({});
//     setScanNo('');
//     const newRange = newRunoutRange;
//     console.log('newRunoutRange ', newRunoutRange, runoutValue)
//     let newErrors = {};
//     // Iterate over newRunoutRange to check for empty values or missing fields
//     runoutValue.forEach((item, index) => {
//       // console.log('item.min_tolerenceRange,', item.min_tolerenceRange,item.max_tolerenceRange,typeof(item.min_tolerenceRange),typeof(item.max_tolerenceRange)),
//       newErrors[index] = {
//         // Check if the field is missing or has a falsy value
//         min_tolerenceRange: !('min_tolerenceRange' in item) || item.min_tolerenceRange === null || item.min_tolerenceRange === undefined,
//         max_tolerenceRange: !('max_tolerenceRange' in item) || item.max_tolerenceRange === null || item.max_tolerenceRange === undefined
//       };
//     });
//     // Check if any errors exist
//     const hasErrors = Object.values(newErrors).some(
//       (err) => err.min_tolerenceRange || err.max_tolerenceRange
//     );

//     if (hasErrors) {
//       setErrors(newErrors);
//       console.log('Errors found:', newErrors);
//     } else {
//       setErrors({}); // Clear errors if none are found
//       console.log('No errors', runoutValue, newRange, hasErrors, newErrors);
//       let comp_data;
//       try {
//         const response = await urlSocket.post("/tolerance_Setting", 
//           { 
//             'comp_id': comp_id, 
//             'runoutValue': runoutValue,
//             'exposure_time': exposureTime,
//             'measuring_rate': measuringRate,
//             'timeDuration': timeDuration,
//             'noOfRotation': noOfRotation,
//             'leadTime': leadTime,
//             'inspBasedOn': inspBasedOn,
//             'captured_file_id': capturedFileId,
//           }, {
//           headers: {
//             "content-type": "multipart/form-data",
//           },
//           mode: "no-cors",
//         });
//         let reset = response.data;
//         comp_data = reset.comp_data;
//         console.log("Sensor reset sts: ", reset);
//         setnewRunoutRange([]);
//         setDoneRotation(0);
//         if (reset.status === 'success') {
//           Swal.fire({
//             title: 'Tolerance value set',
//             text: 'Ready to Test',
//             icon: 'success',
//             timer: 2000, // 2 seconds
//             timerProgressBar: true,
//             didClose: () => Swal.stopTimer()
//           });
//         }
//       } catch (error) {
//         console.log("error", error);
//       }
//       setShowRunout(false);
//       completePlotting(1, comp_data);
//       setIsRotationStarted(0);
//     }
//   };

//   const cancelAssignRange = async () => {
//     setProfileTotalCount(0);
//     setProgressValue(0);
//     setErrors({});
//     setScanNo('');
//     setShowRunout(false);
//     completePlotting(0);
//     setIsRotationStarted(0);
//     setDoneRotation(0);
//   }

//   const range = (e, index, type) => {
//     console.log('e.target.value , index', e.target.value, index)
//     let newRunoutrange = runoutValue;
//     if (type === 'min_tolerenceRange') {
//       newRunoutrange[index].min_tolerenceRange = Number(e.target.value)
//     }
//     else {
//       newRunoutrange[index].max_tolerenceRange = Number(e.target.value)
//     }
//     console.log('newRunoutrange788', newRunoutrange)
//     setnewRunoutRange(newRunoutrange)
//   }

//   const getRandomColor = () => {
//     const r = Math.floor(Math.random() * 256);
//     const g = Math.floor(Math.random() * 256);
//     const b = Math.floor(Math.random() * 256);
//     const a = 0.5; // Very low opacity value between 0 and 1
//     return `rgba(${r}, ${g}, ${b}, ${a})`;
//   };

//   const toggleRightCanvas = async (e, item, index) => {
//     const updatedShapes = layout.shapes.map((shape, id) => ({
//       ...shape,
//       fillcolor: id == index ? 'rgba(255, 99, 71, 0.5)' : 'rgba(100, 150, 200, 0.3)'
//     }))
//     const oldAnnotations = layout.annotations.map((annotation, id) => ({
//       ...annotation,
//     }))
//     setLayout((prevLayout) => ({
//       ...prevLayout,
//       shapes: updatedShapes,
//       annotations: oldAnnotations,
//     }));
//     setSelectedLayout(_.cloneDeep(updatedShapes[index]));
//     setSelectedAnnotation(_.cloneDeep(oldAnnotations[index]))
//     const rectanlges = [...selectedRectangles];
//     setSelectedRegData(_.cloneDeep(rectanlges[index]));
//     setSelectedRegion(index)
//     setIsRightCanvas(!isRightCanvas);
//   }

//   const closeRightCanvas = () => {
//     setIsRightCanvas(false);
//     handleReset();
//   }

//   const deleteRegion = (e, item, index) => {
//     // Correcting the layout update
//     setLayout((prevLayout) => {
//       const newShapes = prevLayout.shapes.filter((_, id) => id !== index);
//       const newAnnotations = prevLayout.annotations.filter((_, id) => id !== index);
//       return {
//         ...prevLayout,
//         shapes: newShapes,
//         annotations: newAnnotations,
//       };
//     });
//     // Correcting the selectedRectangles and boxes update
//     setSelectedRectangles((prevRectangles) => {
//       const updatedRectangles = prevRectangles.filter((_, id) => id !== index);
//       setSelectedRectangles(updatedRectangles);
//       setBoxes(updatedRectangles); // Update boxes based on the new rectangles
//       return updatedRectangles;
//     });
//     setIsUpdate(true);
//     // Closing any pop confirm
//     setOpenPopConfirms({});
//   };

//   // Handle form submission
//   const handleSubmit = () => {
//     if (regionNameError === '' && regionNameEmpty === '' &&
//       regionWidthEmpty === '' && regionHeightEmpty === ''
//     ) {
//       setIsRightCanvas(false);
//       setSelectedRegion(null);
//       setIsUpdate(true);
//       setShowReset(false)
//     }
//   };

//   const handleReset = () => {
//     setShowReset(false);
//     const newShapes = _.cloneDeep(layout.shapes); // Clone to avoid mutation
//     newShapes[selectedRegion] = _.cloneDeep(selectedLayout); // Restore original shape
//     const newAnnotations = _.cloneDeep(layout.annotations); // Clone to avoid mutation
//     newAnnotations[selectedRegion] = _.cloneDeep(selectedAnnotation); // Restore original shape


//     const rectangles = _.cloneDeep(selectedRectangles); // Clone to avoid mutation
//     rectangles[selectedRegion] = _.cloneDeep(selectedRegData); // Restore original rectangle data
//     setLayout((prevLayout) => ({
//       ...prevLayout,
//       shapes: newShapes,
//       annotations: newAnnotations,
//     }));
//     setSelectedRectangles(rectangles);
//     setBoxes(rectangles);
    
//     setRegionNameEmpty('')
//     setRegionNameError('')
//     setRegionWidthEmpty('')
//     setRegionHeightEmpty('')
//     // setIsUpdate(true);
//   }

//   // const handleInputChange = (index, key, value) => {
//   //   const newData = [...selectedRectangles];

//   //   if (key === 'name') {
//   //     // Check if the new name already exists
//   //     const existingRegionIndex = newData.findIndex(
//   //       (region, id) => region.name === value && selectedRegion !== id
//   //     );
//   //     console.log('existingRegionIndex ', existingRegionIndex, newData);

//   //     // If the name exists, display an error message
//   //     if (existingRegionIndex !== -1) {
//   //       setRegionNameError('Region Name Already Exists');
//   //       setRegionNameEmpty('');
//   //       newData[selectedRegion][key] = value;
//   //     } else {
//   //       // If the name doesn't exist, update the selected region's name
//   //       if (value) {
//   //         newData[selectedRegion][key] = value;
//   //         setRegionNameError('');
//   //         setRegionNameEmpty('');
//   //       } else {
//   //         // If the name is empty, show an error
//   //         newData[selectedRegion][key] = value;
//   //         setRegionNameEmpty('Region Name should not be Empty');
//   //         setRegionNameError('');
//   //       }
//   //     }

//   //     // Update rectangles with the new name
//   //     setSelectedRectangles(newData);
//   //     setBoxes(newData);

//   //     // Update layout annotations for the region name
//   //     const updatedAnnotations = [...layout.annotations];
//   //     updatedAnnotations[selectedRegion] = {
//   //       ...updatedAnnotations[selectedRegion],
//   //       text: value, // Update the annotation text with the new region name
//   //     };

//   //     // Update layout with the new annotations
//   //     setLayout((prevLayout) => ({
//   //       ...prevLayout,
//   //       annotations: updatedAnnotations,
//   //     }));

//   //   } else {
//   //     // If adjusting width/height (x/y values), update the selected rectangle
//   //     newData[selectedRegion][key][index] = parseFloat(value);
//   //     setSelectedRectangles(newData);
//   //     setBoxes(newData);

//   //     // Update the corresponding shape in the layout
//   //     const newShapes = [...layout.shapes];
//   //     newShapes[selectedRegion] = {
//   //       ...newShapes[selectedRegion],
//   //       [`${key}${index}`]: parseFloat(value),
//   //     };

//   //     // Update the layout with the new shapes
//   //     setLayout((prevLayout) => ({
//   //       ...prevLayout,
//   //       shapes: newShapes,
//   //     }));

//   //     // Also, reposition the annotation (region name) based on the new rectangle size
//   //     const updatedAnnotations = [...layout.annotations];
//   //     const updatedRect = newShapes[selectedRegion];

//   //     updatedAnnotations[selectedRegion] = {
//   //       ...updatedAnnotations[selectedRegion],
//   //       x: (updatedRect.x0 + updatedRect.x1) / 2, // Reposition the name in the middle of the rectangle (x-axis)
//   //       y: updatedRect.y1 + 0.1, // Reposition slightly above the rectangle (y-axis)
//   //     };

//   //     // Update layout with the new annotations (repositioned name)
//   //     setLayout((prevLayout) => ({
//   //       ...prevLayout,
//   //       annotations: updatedAnnotations,
//   //     }));
//   //   }

//   //   // Trigger UI updates
//   //   setShowReset(true);
//   // };

//   const handleInputChange = (index, key, value) => {
//     const newData = [...selectedRectangles];

//     if (key === 'name') {
//       // Check if the new name already exists
//       const existingRegionIndex = newData.findIndex(
//         (region, id) => region.name === value && selectedRegion !== id
//       );
//       console.log('existingRegionIndex ', existingRegionIndex, newData);

//       // If the name exists, display an error message
//       if (existingRegionIndex !== -1) {
//         setRegionNameError('Region Name Already Exists');
//         setRegionNameEmpty('');
//         newData[selectedRegion][key] = value;
//       } else {
//         // If the name doesn't exist, update the selected region's name
//         if (value) {
//           newData[selectedRegion][key] = value;
//           setRegionNameError('');
//           setRegionNameEmpty('');
//         } else {
//           // If the name is empty, show an error
//           newData[selectedRegion][key] = value;
//           setRegionNameEmpty('Region Name should not be Empty');
//           setRegionNameError('');
//         }
//       }

//       // Update rectangles with the new name
//       setSelectedRectangles(newData);
//       setBoxes(newData);

//       // Update layout annotations for the region name
//       const updatedAnnotations = [...layout.annotations];
//       updatedAnnotations[selectedRegion] = {
//         ...updatedAnnotations[selectedRegion],
//         text: value, // Update the annotation text with the new region name
//       };

//       // Update layout with the new annotations
//       setLayout((prevLayout) => ({
//         ...prevLayout,
//         annotations: updatedAnnotations,
//       }));

//     } else {
//       const decimalPart = value.toString().split('.')[1];
//       if (key == "x") {
//         console.log('value ', key, value)
//         if (!value) {
//           setRegionWidthEmpty('*valid width value required')
//         } else if (decimalPart && decimalPart.length > 14) {
//           const updatedValue = parseFloat(value).toFixed(14);
//           console.log('Updated value with 14 decimal places:', updatedValue);
//           value = updatedValue;
//         } else {
//           setRegionWidthEmpty('')
//         }
//       }
//       if (key == "y") {
//         console.log('value ', key, value)
//         if (!value) {
//           setRegionHeightEmpty('*valid height value required')
//         } else if (decimalPart && decimalPart.length > 14) {
//           const updatedValue = parseFloat(value).toFixed(14);
//           console.log('Updated value with 14 decimal places:', updatedValue);
//           value = updatedValue;
//         } else {
//           setRegionHeightEmpty('')
//         }
//       }

//       // If adjusting width/height (x/y values), update the selected rectangle
//       newData[selectedRegion][key][index] = value// parseFloat(value);
//       setSelectedRectangles(newData);
//       setBoxes(newData);

//       // Update the corresponding shape in the layout
//       const newShapes = [...layout.shapes];
//       newShapes[selectedRegion] = {
//         ...newShapes[selectedRegion],
//         [`${key}${index}`]: parseFloat(value),
//       };

//       // Update the layout with the new shapes
//       setLayout((prevLayout) => ({
//         ...prevLayout,
//         shapes: newShapes,
//       }));

//       // Also, reposition the annotation (region name) based on the new rectangle size
//       const updatedAnnotations = [...layout.annotations];
//       const updatedRect = newShapes[selectedRegion];

//       updatedAnnotations[selectedRegion] = {
//         ...updatedAnnotations[selectedRegion],
//         x: (updatedRect.x0 + updatedRect.x1) / 2, // Reposition the name in the middle of the rectangle (x-axis)
//         y: updatedRect.y1 + 0.1, // Reposition slightly above the rectangle (y-axis)
//       };

//       // Update layout with the new annotations (repositioned name)
//       setLayout((prevLayout) => ({
//         ...prevLayout,
//         annotations: updatedAnnotations,
//       }));
//     }

//     // Trigger UI updates
//     setShowReset(true);
//   };
  
  
//   const toggleDeleteConfirm = (index, val) => {
//     setOpenPopConfirms({
//       [index]: val == 0 ? true : false
//     })
//   }

//   const handleBoxSelect = () => {
//     if (plotRef.current) {
//       Plotly.relayout(plotRef.current, { 'dragmode': 'select' });
//     }
//   };

//   // const handleBoxEnd = async (event) => {
//   //   if (event?.range) {
//   //     // Create a new range object with a unique name based on the next available index
//   //     const newRange = {
//   //       id: uuidv4(),
//   //       name: `region_${nextRegionIndex.current}`, // Use the next available index for the name
//   //       x: event.range.x,
//   //       y: event.range.y,
//   //       profile_data: [],
//   //       color: getRandomColor(),
//   //     };
//   //     // Increment the index to ensure uniqueness for the next region
//   //     nextRegionIndex.current += 1;
//   //     // Update selectedRectangles state
//   //     setSelectedRectangles((prevRectangles) => {
//   //       const updatedRectangles = [...prevRectangles, newRange];
//   //       setBoxes(updatedRectangles); // Assuming setBoxes should mirror selectedRectangles
//   //       return updatedRectangles;
//   //     });
//   //     setIsUpdate(true);
//   //     // Create a new rectangle shape for layout
//   //     const newRectangle = {
//   //       type: 'rect',
//   //       xref: 'x',
//   //       yref: 'y',
//   //       x0: newRange.x[0],
//   //       y0: newRange.y[0],
//   //       x1: newRange.x[1],
//   //       y1: newRange.y[1],
//   //       line: {
//   //         color: 'rgba(0, 0, 0, 1)',
//   //         width: 2,
//   //       },
//   //       fillcolor: 'rgba(100, 150, 200, 0.3)',
//   //       editable: true,  // This makes the box editable (movable and resizable)
//   //     };
//   //     // Update layout with the new shape
//   //     setLayout((prevLayout) => ({
//   //       ...prevLayout,
//   //       shapes: [...prevLayout.shapes, newRectangle],
//   //     }));
//   //     setCreatedRegion(true)
//   //   }
//   // };



//   // const handleBoxEnd = async (event) => {
//   //   console.log('event*********', event);

//   //   if (event?.range) {
//   //     // Create a new range object with a unique name based on the next available index
//   //     const newRange = {
//   //       id: uuidv4(),
//   //       name: `region_${nextRegionIndex.current}`, // Use the next available index for the name
//   //       x: event.range.x,
//   //       y: event.range.y,
//   //       profile_data: [],
//   //       color: getRandomColor(),
//   //     };

//   //     // Increment the index to ensure uniqueness for the next region
//   //     nextRegionIndex.current += 1;

//   //     // Update selectedRectangles state
//   //     setSelectedRectangles((prevRectangles) => {
//   //       const updatedRectangles = [...prevRectangles, newRange];

//   //       // Ensure boxes prop update happens right after selectedRectangles
//   //       setBoxes(updatedRectangles); // Assuming setBoxes should mirror selectedRectangles

//   //       return updatedRectangles;
//   //     });
//   //     setIsUpdate(true);

//   //     // Create a new rectangle shape for layout
//   //     const newRectangle = {
//   //       type: 'rect',
//   //       xref: 'x',
//   //       yref: 'y',
//   //       x0: newRange.x[0],
//   //       y0: newRange.y[0],
//   //       x1: newRange.x[1],
//   //       y1: newRange.y[1],
//   //       line: {
//   //         color: 'rgba(0, 0, 0, 1)',
//   //         width: 2,
//   //       },
//   //       fillcolor: 'rgba(100, 150, 200, 0.3)',
//   //       editable:true
//   //     };

//   //     // Update layout with the new shape
//   //     setLayout((prevLayout) => ({
//   //       ...prevLayout,
//   //       shapes: [...prevLayout.shapes, newRectangle],
//   //     }));

//   //     // const formData = new FormData();
//   //     // formData.append('_id', comp_id);
//   //     // formData.append('region_datas', JSON.stringify(selectedRectangles));
//   //     // const response = await urlSocket.post('/region_datas', formData, {
//   //     //   headers: {
//   //     //     'content-type': 'multipart/form-data'
//   //     //   },
//   //     //   mode: 'no-cors'
//   //     // });
//   //   }
//   // };  




//   const handleBoxEnd = async (event) => {
//     console.log('event*********', event);

//     if (event?.range) {
//       // Create a new range object with a unique name based on the next available index
//       const newRange = {
//         id: uuidv4(),
//         name: `region_${nextRegionIndex.current}`, // Use the next available index for the name
//         x: event.range.x,
//         y: event.range.y,
//         profile_data: [],
//         color: getRandomColor(),
//       };

//       // Increment the index to ensure uniqueness for the next region
//       nextRegionIndex.current += 1;

//       // Update selectedRectangles state
//       setSelectedRectangles((prevRectangles) => {
//         const updatedRectangles = [...prevRectangles, newRange];

//         // Ensure boxes prop update happens right after selectedRectangles
//         setBoxes(updatedRectangles); // Assuming setBoxes should mirror selectedRectangles
//         console.log('updatedRectangles670', updatedRectangles)
//         return updatedRectangles;
//       });
//       setIsUpdate(true);

//       // Create a new rectangle shape for layout
//       const newRectangle = {
//         type: 'rect',
//         xref: 'x',
//         yref: 'y',
//         x0: newRange.x[0],
//         y0: newRange.y[0],
//         x1: newRange.x[1],
//         y1: newRange.y[1],
//         line: {
//           color: 'rgba(0, 0, 0, 1)',
//           width: 2,
//         },
//         fillcolor: 'rgba(100, 150, 200, 0.3)',
//         editable: true, // Enable editing
//         dragmode: 'move', // Allow dragging
//         'zoom2d':false
//       };

//       // Create a new annotation to show the region name above the shape
//       const newAnnotation = {
//         x: (newRange.x[0] + newRange.x[1]) / 2, // Position annotation in the middle of the rectangle (x-axis)
//         y: newRange.y[1] + 0.1, // Slightly above the rectangle (y-axis)
//         xref: 'x',
//         yref: 'y',
//         text: newRange.name, // Region name from newRange
//         showarrow: false, // No arrow, just text
//         font: {
//           size: 12,
//           color: 'black',
//         },
//         align: 'center', // Center the text
//         bgcolor: 'white', // 'rgba(255, 255, 255, 0.5)', // Optional background for better visibility
//         bordercolor: 'black', // Border color
//         borderwidth: 1,
//         borderpad: 4,
//       };

//       // Update layout with the new shape
//       setLayout((prevLayout) => ({
//         ...prevLayout,
//         shapes: [...prevLayout.shapes, newRectangle],
//         annotations: [...(prevLayout.annotations || []), newAnnotation],
//       }));
//     }
//   };


//   //// Handle shape updates when dragged or resized
//   // const handleShapeUpdate = (event) => {
//   //   // Initialize an empty object to store grouped shape data by index
//   //   const shapeDataByIndex = {};

//   //   // Loop through the event object keys
//   //   Object.keys(event).forEach((key) => {
//   //     // Use regex to extract the index and property (e.g., "shapes[6].x0" -> index: 6, property: x0)
//   //     const match = key.match(/shapes\[(\d+)\]\.(x0|y0|x1|y1)/);

//   //     if (match) {
//   //       const shapeIndex = match[1]; // Extracted index (e.g., "6")
//   //       const property = match[2]; // Extracted property (e.g., "x0", "y1")

//   //       // Initialize the shape object for this index if it doesn't exist
//   //       if (!shapeDataByIndex[shapeIndex]) {
//   //         shapeDataByIndex[shapeIndex] = {};
//   //       }

//   //       // Assign the value to the appropriate property in the shape object
//   //       shapeDataByIndex[shapeIndex][property] = event[key];
//   //     }
//   //   });

//   //   // Now that the shape data is grouped by index, we can update the corresponding rectangles
//   //   const updatedRectangles = [];

//   //   // Iterate over the shapeDataByIndex to process each shape
//   //   Object.keys(shapeDataByIndex).forEach((index) => {
//   //     const shape = shapeDataByIndex[index];

//   //     // Ensure the shape has the required properties before updating the rectangle
//   //     if (shape.x0 !== undefined && shape.x1 !== undefined && shape.y0 !== undefined && shape.y1 !== undefined) {

//   //       // Find the rectangle by the matched index and update its coordinates
//   //       setSelectedRectangles((prevRectangles) => {
//   //         const updatedRectangles = prevRectangles.map((rect, id) => {
//   //           // console.log('id, index, rect', id, index, rect, shape)
//   //           // Check if the region index matches the shape index
//   //           if (id == index) {
//   //           console.log('id, index, rect', id, index, rect, shape)

//   //             // Update the rectangle's coordinates based on the new shape dimensions (resize/drag)
//   //             return {
//   //               ...rect,
//   //               x: [shape.x0, shape.x1], // Update x coordinates
//   //               y: [shape.y0, shape.y1], // Update y coordinates
//   //               fillcolor: id == index ? 'rgba(255, 0, 0, 0.3)' : 'rgba(100, 150, 200, 0.3)', // Highlight with a red fill if selected
//   //             line: {
//   //               ...rect.line,
//   //               color: id == index ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 0, 1)', // Highlight with a red border if selected
//   //             },
//   //             };
//   //           }
//   //           return rect; // Return unchanged rectangle if not a match
//   //         });

//   //         // Also update the `setBoxes` state with the new positions
//   //         setBoxes(updatedRectangles);        
//   //         return updatedRectangles;
//   //       });
//   //       setIsUpdate(true)
//   //     } else {
//   //       console.warn('Shape does not have valid coordinates:', shape);
//   //     }
//   //   });

//   //   // Update boxes and selectedRectangles with the new positions
//   //   if (updatedRectangles.length > 0) {
//   //     console.log('updatedRectangles765', updatedRectangles)
//   //     setBoxes(updatedRectangles);     
//   //     setIsUpdate(true);
//   //   }
//   // };


//   const handleShapeUpdate = (event) => {
//     // Initialize an empty object to store grouped shape data by index
//     const shapeDataByIndex = {};

//     // Loop through the event object keys
//     Object.keys(event).forEach((key) => {
//       // Use regex to extract the index and property (e.g., "shapes[6].x0" -> index: 6, property: x0)
//       const match = key.match(/shapes\[(\d+)\]\.(x0|y0|x1|y1)/);

//       if (match) {
//         const shapeIndex = match[1]; // Extracted index (e.g., "6")
//         const property = match[2]; // Extracted property (e.g., "x0", "y1")

//         // Initialize the shape object for this index if it doesn't exist
//         if (!shapeDataByIndex[shapeIndex]) {
//           shapeDataByIndex[shapeIndex] = {};
//         }

//         // Assign the value to the appropriate property in the shape object
//         shapeDataByIndex[shapeIndex][property] = event[key];
//       }
//     });

//     // Now that the shape data is grouped by index, we can update the corresponding rectangles and annotations
//     const updatedRectangles = [];
//     const updatedAnnotations = [];

//     // Iterate over the shapeDataByIndex to process each shape
//     Object.keys(shapeDataByIndex).forEach((index) => {
//       const shape = shapeDataByIndex[index];

//       // Ensure the shape has the required properties before updating the rectangle
//       if (shape.x0 !== undefined && shape.x1 !== undefined && shape.y0 !== undefined && shape.y1 !== undefined) {

//         // Update rectangles and move region name with it
//         setSelectedRectangles((prevRectangles) => {
//           const updatedRectangles = prevRectangles.map((rect, id) => {
//             if (id == index) {
//               console.log('id, index, rect', id, index, rect, shape)

//               // Update the rectangle's coordinates based on the new shape dimensions (resize/drag)
//               return {
//                 ...rect,
//                 x: [shape.x0, shape.x1], // Update x coordinates
//                 y: [shape.y0, shape.y1], // Update y coordinates
//                 fillcolor: id == index ? 'rgba(255, 0, 0, 0.3)' : 'rgba(100, 150, 200, 0.3)', // Highlight with a red fill if selected
//                 line: {
//                   ...rect.line,
//                   color: id == index ? 'rgba(255, 0, 0, 1)' : 'rgba(0, 0, 0, 1)', // Highlight with a red border if selected
//                 },
//               };
//             }
//             return rect; // Return unchanged rectangle if not a match
//           });

//           // Update annotations (region names) corresponding to the updated rectangles
//           setLayout((prevLayout) => {
//             const updatedAnnotations = (prevLayout.annotations || []).map((annotation, id) => {
//               if (id == index) {
//                 return {
//                   ...annotation,
//                   x: (shape.x0 + shape.x1) / 2, // Re-center annotation in the middle of the rectangle (x-axis)
//                   y: shape.y1 + 0.1, // Move the annotation slightly above the updated rectangle (y-axis)
//                 };
//               }
//               return annotation; // Return unchanged annotation if not a match
//             });

//             // Return the new layout with updated annotations
//             return {
//               ...prevLayout,
//               annotations: updatedAnnotations,
//             };
//           });

//           // Also update the `setBoxes` state with the new positions
//           setBoxes(updatedRectangles);
//           return updatedRectangles;
//         });

//         setIsUpdate(true);
//       } else {
//         console.warn('Shape does not have valid coordinates:', shape);
//       }
//     });

//     // Update boxes and selectedRectangles with the new positions
//     if (updatedRectangles.length > 0) {
//       console.log('updatedRectangles765', updatedRectangles);
//       setBoxes(updatedRectangles);
//       setIsUpdate(true);
//     }
//   };
  
//   useImperativeHandle(ref, () => ({
//     toggleRightCanvas,
//     deleteRegion,
//     toggleDeleteConfirm,
//     handleBoxSelect,
//     changeStatus,
//     getSomeState: () => openPopConfirms,  // Allow access to the state if needed
//   }));

//   const handleMeasurementTypeChange = (e) => {
//     const selectedUnit = e.target.value;
//     const updatedRunoutValue = runoutValue.map(item => {
//       const baseMax = item.originalMax || item.max_deviation;
//       const baseMin = item.originalMin || item.min_deviation;
//       const baseRunout = item.originalRunout || item.runout;

//       // Preserve original values if not already set
//       if (!item.originalMax) {
//         item.originalMax = baseMax;
//         item.originalMin = baseMin;
//         item.originalRunout = baseRunout;
//       }

//       // Update values based on the selected unit
//       let updatedItem = { ...item };
//       switch (selectedUnit) {
//         case "cm":
//           updatedItem.max_deviation = (baseMax / 10).toFixed(3);
//           updatedItem.min_deviation = (baseMin / 10).toFixed(3);
//           updatedItem.runout = (baseRunout / 10).toFixed(3);
//           break;
//         case "inch":
//           updatedItem.max_deviation = (baseMax / 25.4).toFixed(3);
//           updatedItem.min_deviation = (baseMin / 25.4).toFixed(3);
//           updatedItem.runout = (baseRunout / 25.4).toFixed(3);
//           break;
//         case "mm":
//           updatedItem.max_deviation = baseMax.toFixed(3);
//           updatedItem.min_deviation = baseMin.toFixed(3);
//           updatedItem.runout = baseRunout.toFixed(3);
//           break;
//         default:
//           break;
//       }

//       updatedItem.measurementType = selectedUnit;
//       return updatedItem;
//     });

//     setRunoutValue(updatedRunoutValue); // Update the state with new values
//   };


//   return (
//     <div className="chart-container">
//       {
//         isLoadingProfile &&
//         <div className="d-flex align-items-center">
//           <Progress
//             className="progress-xl"
//             value={progressValue}
//             color="success"
//             style={{ width: '100%' }}
//             animated
//           >
//             {`${progressValue}%`}
//           </Progress>
//         </div>
//       }
//       {data.length !== 0 ? (
//         <React.Fragment>
//           {
//             scanNo && isFinite(progressValue) ?
//               <div>
//                 <p className='mt-1 ms-2' style={{ fontWeight: 'bold' }}>No. of Profiles Taken: {scanNo}</p>
//               </div> : null
//           }
//           <Plot
//             ref={plotRef}
//             data={[data]}
//             layout={{ ...layout }}
//             onInitialized={(figure, graphDiv) => {
//               plotRef.current = graphDiv;
//               graphDiv.on('plotly_selected', handleBoxEnd);
//               // Listen for shape updates
//               graphDiv.on('plotly_relayout', handleShapeUpdate);
//             }}
//             style={{ width: '100%', height: '70%', borderRadius: '10px' }}
//             config={{
//               displayModeBar: true,
//               responsive: true,
//               scrollZoom: true,
//               staticPlot: false,
//               displaylogo: false,
//               editable: !isButtonDisabled(), // Control overall editability
//               edits: {
//                 titleText: false, // Disable title text editing to prevent placeholders
//                 axisTitleText: false, // Disable axis title text editing to remove placeholders
//                 shapePosition: !isButtonDisabled(), // Allows shape dragging and editing only if editable
//               },
//               modeBarButtonsToRemove: [
//                 'lasso2d',
//                 'select2d',
//               ],
//             }}
//           />
//           {/* <Plot
//             ref={plotRef}
//             data={[data]}
//             layout={{ ...layout }}
//             onInitialized={(figure, graphDiv) => {
//               if (!isButtonDisabled()) {
//                 plotRef.current = graphDiv;
//                 graphDiv.on('plotly_selected', handleBoxEnd);
//                 // Listen for shape updates
//                 graphDiv.on('plotly_relayout', handleShapeUpdate);
//               }
//             }}
//             style={{ width: '100%', height: '70%', borderRadius: '10px' }}
//             config={{
//               displayModeBar: true,
//               responsive: true,
//               scrollZoom: true,
//               staticPlot: false,
//               displaylogo: false,
//               editable: !isButtonDisabled() ? true : false,
//               edits: {
//                 titleText: false, // Disable title text editing to prevent placeholders
//                 axisTitleText: false, // Disable axis title text editing to remove placeholders
//                 shapePosition: !isButtonDisabled() ? true : false, // Allows shape dragging and editing             
//               },
//               modeBarButtonsToRemove: [
//                 'lasso2d',
//                 'select2d',
//               ],
//             }}
//           /> */}
//         </React.Fragment>
//       ) : (
//         <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
//           <div className="text-center">
//             <img src={No_data} className="img-fluid h-auto" alt="No Data" style={{ width: '30%' }} />
//             <p>No data Available</p>
//           </div>
//         </div>
//       )}
//       {isRightCanvas &&
//         selectedRegion !== null &&
//         selectedRectangles.length > 0 &&
//         <Offcanvas
//           isOpen={isRightCanvas}
//           direction="start"
//           toggle={closeRightCanvas}
//           scrollable
//           backdrop={true}
//         >
//           <OffcanvasHeader toggle={closeRightCanvas}>
//             <div style={{ fontWeight: 'bold' }}>Region Data</div>
//           </OffcanvasHeader>
//           <OffcanvasBody>
//             <Form>
//               <div className="mb-3">
//                 <Label>Name</Label>
//                 <Input
//                   type="text"
//                   value={selectedRectangles[selectedRegion].name}
//                   onChange={(e) => {
//                     const newValue = e.target.value.replace(/\s+/g, ''); // Removes white spaces
//                     if (newValue.length <= 8) {
//                       handleInputChange(0, "name", newValue); // Allow only 8 characters
//                     }
//                   }}
//                 />
//                 {
//                   regionNameError !== '' && (
//                     <p className="error-message" style={{ color: "red" }}>
//                       {regionNameError}
//                     </p>)
//                 }
//                 {
//                   regionNameEmpty !== '' && (
//                     <p className="error-message" style={{ color: "red" }}>
//                       {regionNameEmpty}
//                     </p>)
//                 }
//               </div>
//               <div className="mb-3">
//                 <Label>Height</Label>
//                 <Input
//                   type="number"
//                   value={selectedRectangles[selectedRegion].y[1]}
//                   step="0.1"
//                   onChange={(e) => handleInputChange(1, "y", e.target.value)}
//                 />
//                 {
//                   regionHeightEmpty !== '' && (
//                     <p className="error-message" style={{ color: "red" }}>
//                       {regionHeightEmpty}
//                     </p>)
//                 }
//               </div>
//               <div className="mb-3">
//                 <Label>Width</Label>
//                 <Input
//                   type="number"
//                   value={selectedRectangles[selectedRegion].x[1]}
//                   step="0.1"
//                   onChange={(e) => handleInputChange(1, "x", e.target.value)}
//                 />
//                 {
//                   regionWidthEmpty !== '' && (
//                     <p className="error-message" style={{ color: "red" }}>
//                       {regionWidthEmpty}
//                     </p>)
//                 }
//               </div>
//               <div className='d-flex justify-content-between'>
//                 <Button color="primary" onClick={handleSubmit}>
//                   Submit
//                 </Button>
//                 {
//                   showReset &&
//                   <Button color="dark" onClick={handleReset}>
//                     Reset
//                   </Button>
//                 }
//               </div>
//             </Form>
//           </OffcanvasBody>
//         </Offcanvas>
//       }
//       <Modal isOpen={showRunout} style={{
//         maxWidth: '70%',
//         width: '70%',
//         zIndex: 995
//       }}>
//         <Row className='mx-3 mt-2'>
//           <Col md={6} lg={6}>
//             <h5 style={{ fontWeight: 'bold' }}>
//               No. of Profiles Taken: {scanNo}
//             </h5>
//           </Col>
//           <Col>
//             <h5 style={{ fontWeight: "bold" }}>Measurement Type</h5>
//             <br></br>
//             <Input
//               type="select"
//               onChange={handleMeasurementTypeChange} // Removed index parameter
//               defaultValue={"mm"}
//               // value={item.measurementType || "mm"}
//               style={{ width: '150px', textAlign: 'center', marginBottom: "10px" }}
//             >
//               <option value="mm">Select</option>
//               <option value="cm">cm</option>
//               <option value="inch">inch</option>
//               <option value="mm">mm</option>
//             </Input>

//           </Col>
//           <Col md={6} lg={6}>
//             {
//               inspBasedOn === "rotation" &&
//               <h5 style={{ fontWeight: 'bold' }}>
//                 {`Rotation Completed: ${compInfo.no_of_rotation}`}
//               </h5>
//             }
//           </Col>
//         </Row>
//         <ModalBody>
//           <Table striped responsive>
//             <thead>
//               <tr>
//                 <th>S.No.</th>
//                 <th>Name</th>
//                 <th>Max value</th>
//                 <th>Min value</th>
//                 <th>Run-Out</th>
//                 <th>Acceptable Runout for OK Max and Min</th>
//               </tr>
//             </thead>
//             <tbody>
//               {runoutValue.map((item, index) => (
//                 <tr key={index}>
//                   <th scope="row">{index + 1}</th>
//                   <td>{item.name}</td>
//                   {
//                     item.is_points_taken ?
//                       <>
//                         <td>{item.max_deviation}</td>
//                         <td>{item.min_deviation}</td>
//                         <td>{item.runout}</td>
//                         <td width="30%">
//                           <Card style={{
//                             boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.4)', // Adjust values as needed
//                             padding: '5px', // Example padding
//                             background: '#ffffff',
//                           }}>
//                             <CardTitle className="text-center" style={{ fontWeight: 'bold' }}>Range</CardTitle>
//                             <CardBody>
//                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                                 <div style={{ flex: '1', marginRight: '5px' }}>
//                                   <Input
//                                     type="number"
//                                     placeholder="Min Range"
//                                     step={0.01}
//                                     max={item.runout}
//                                     onChange={(e) => range(e, index, 'min_tolerenceRange')}
//                                     // value={item.min_tolerenceRange || ''}
//                                     style={{ width: '100%', borderColor: errors[index]?.min_tolerenceRange ? 'red' : '' }}
//                                   />
//                                   {errors[index]?.min_tolerenceRange &&
//                                     <p className='danger' style={{ fontSize: '12px', color: 'red' }}>*Please Enter Minimum Tolerance Value</p>
//                                   }
//                                 </div>
//                                 <div style={{ alignItems: 'center' }}>To</div>
//                                 <div style={{ flex: '1', marginLeft: '5px' }}>
//                                   <Input
//                                     type="number"
//                                     placeholder="Max Range"
//                                     step={0.01}
//                                     min={item.runout}
//                                     onChange={(e) => range(e, index, 'max_tolerenceRange')}
//                                     // value={item.max_tolerenceRange || ''}
//                                     style={{ width: '100%', borderColor: errors[index]?.max_tolerenceRange ? 'red' : '' }}
//                                   />
//                                   {errors[index]?.max_tolerenceRange &&
//                                     <p className='danger' style={{ fontSize: '12px', color: 'red' }}>*Please Enter Maximum Tolerance Value</p>
//                                   }
//                                 </div>
//                               </div>
//                             </CardBody>
//                           </Card>
//                         </td>
//                       </>
//                       :
//                       <td colSpan={4} style={{ fontWeight: 'bold', color: 'red' }}>* Incomplete data: No Data Points Taken for this Region</td>
//                   }
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//           <div className='d-flex justify-content-center'>
//             {
//               runoutValue.some(item => !item.is_points_taken) &&
//               <p className='my-1' style={{ fontWeight: 'bold', color: 'black' }}>
//                 {`* Ensure all regions have data points before accepting.`}
//               </p>
//             }
//           </div>
//           <div className='d-flex justify-content-center'>
//             {
//               runoutValue.some(item => !item.is_points_taken) ?
//                 null :
//                 <Button
//                   color='success'
//                   onClick={() => confirmRange()}
//                   style={{ marginRight: '10px' }} // Adjusts spacing
//                 >
//                   Accept
//                 </Button>
//             }
//             <Button
//               color='danger'
//               className='ms-3'
//               onClick={() => cancelAssignRange()}
//             >
//               Cancel
//             </Button>
//           </div>
//         </ModalBody>
//         <ModalFooter>
//         </ModalFooter>
//       </Modal>
//     </div>
//   );
// });

// PointCloudPlot.propTypes = {
//   comp_id: PropTypes.string.isRequired,
//   regions: PropTypes.any.isRequired,

//   boxes: PropTypes.any.isRequired,
//   draggingBoxId: PropTypes.any.isRequired,
//   isDragging: PropTypes.any.isRequired,
//   setBoxes: PropTypes.any.isRequired,
//   setDraggingBoxId: PropTypes.any.isRequired,
//   setIsDragging: PropTypes.any.isRequired,
//   stopIntervalShot: PropTypes.any.isRequired,

//   is_mastering: PropTypes.any.isRequired,
//   changeContTrigger: PropTypes.any.isRequired,
//   disable_end_testing: PropTypes.any.isRequired,
//   no_of_rotation: PropTypes.any.isRequired,
//   counter: PropTypes.any.isRequired,
//   end_testing: PropTypes.any.isRequired,
//   compInfo: PropTypes.any.isRequired,
//   onTimeup: PropTypes.any.isRequired,
//   startLeadTime: PropTypes.any.isRequired,
//   onTimeup1: PropTypes.any.isRequired,
//   changeProfileNo: PropTypes.any.isRequired,
//   done_rotation: PropTypes.any.isRequired,
//   isRotationStarted: PropTypes.any.isRequired,
//   setDoneRotation: PropTypes.any.isRequired,
//   setIsRotationStarted: PropTypes.any.isRequired,

//   capturedFileId: PropTypes.any.isRequired,
//   completePlotting: PropTypes.any.isRequired,
//   isLoadingProfile: PropTypes.any.isRequired,
//   exposureTime: PropTypes.any.isRequired,
//   measuringRate: PropTypes.any.isRequired,

//   timeDuration: PropTypes.any.isRequired,
//   noOfRotation: PropTypes.any.isRequired,
//   leadTime: PropTypes.any.isRequired,
//   inspBasedOn: PropTypes.any.isRequired,

//   start1Dtest: PropTypes.any.isRequired,
//   stop_mastering_process: PropTypes.any.isRequired,
//   toggleStopMastering: PropTypes.any.isRequired,
//   isButtonDisabled: PropTypes.any.isRequired,
// };

// export default PointCloudPlot;
