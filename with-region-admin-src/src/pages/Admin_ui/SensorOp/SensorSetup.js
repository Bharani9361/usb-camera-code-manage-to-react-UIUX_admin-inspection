import React, { useState, useContext, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Card, CardBody, CardTitle } from "reactstrap";
import { Tree, Button, Input, Modal, Radio, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { productsData, sensorData } from "./data";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Multiselect from 'multiselect-react-dropdown';
import * as Yup from 'yup';
import toastr from "toastr";
import Swal from 'sweetalert2';
// import PropTypes from "prop-types";

// components
import SettingsModal from "../Settings/SettingsModal";
import MasteringStatus from "../GraphOp/MasteringStatus";
import NotifyUser from "../customToast";

// contexts
import { AppContext } from "../contexts/Context";
import { RegionsContext } from "../contexts/RegionsContext";
import { GraphRefContext } from "../contexts/GraphRefContext";

// services
import { post } from "../services/apiService";

// css
import './SensorSetup.css'
import { MasteringContext } from "../contexts/MasteringContext";

const SensorSetup = () => { // { products, selectedItems,  handleRemove }
    const history = useHistory();

    const { 
        selectedSensor, updateSelectedSensor, selectedKeys, setSelectedKeys,
        sensorConnected, setConnectedSensor, componentDetails, updateComponentDetails,
        compSensorData
     } = useContext(AppContext);

    // to update selected measurement regions
    const { 
        selectedRegions, updateRegions, setSelectedMeasurement, selectedMeasurement,
        setSelectedRegions
    } = useContext(RegionsContext);

    const { sharedState }  = useContext(MasteringContext);

    // to graph related functionalities
    const graphRef = useContext(GraphRefContext);

    const [treeData, setTreeData] = useState([]); // sensorData
    const [isEditing, setIsEditing] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);
    
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [openTree, setOpenTree] = useState("close");
    // const [selectedKeys, setSelectedKeys] = useState([]);

    const [showSettings, setShowSettings] = useState(false);

    // open delete confirmation
    const [openPopConfirms, setOpenPopConfirms] = useState({});

    const [measurement_Id, setMeasurementId] = useState(null);

    const [notifyUser, setNotifyUser] = useState(false);
    const [notifyMessage, setNotifyMessage] = useState("");

    const [disableAll, setDisableAll] = useState(false);

    const sensorSelected = useRef(selectedSensor);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.ant-popover') && !event.target.closest('.anticon-delete')) {
                setOpenPopConfirms({});
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        if (compSensorData?.length > 0) {
            console.log('data74 ', compSensorData)
            setTreeData(compSensorData);
            // const getSensorList = async () => {
            //     try {
            //         const data = await post('/getSensorList');
            //         const data1 = await post('/getMeasurementList');
            //         if (data1.measurement_list.length > 0) {
            //             const sensor = data.sensor.map((sensor) => {
            //                 const measurements = data1.measurement_list
            //                 .filter((measurement) => measurement.sensorId === sensor._id && measurement.comp_id === componentDetails._id)
            //                 .map((measurement) => {
            //                     return measurement
            //                     // {
            //                     //     _id: measurement._id,
            //                     //     id: measurement.id,
            //                     //     name: measurement.name,
            //                     //     regions: measurement.regions
            //                     // }
            //                 })
            //                 return {
            //                     ...sensor,
            //                     measurements
            //                 }
            //             })
            //             setTreeData(sensor)
            //         }
            //         else {
            //             setTreeData(data.sensor)
            //         }

            //         console.log('sensordata132 ', data)

            //     } catch (error) {
            //         console.error('Error creating data:', error);
            //     }
            // };
            // getSensorList();
        }
        
    }, [compSensorData]);
    
    useEffect(() => {
        if (sensorSelected.current) {
            sensorSelected.current = selectedSensor
        }
    }, [selectedSensor]);

    useEffect(() => {
        // updating drawn regions of graph to the specific measurement.
        if(selectedKeys.length == 2) {
            const [sensorId, measurementId] = selectedKeys;
            setTreeData((prevData) =>
                prevData.map((sensor) =>
                    sensor.id === sensorId
                        ? {
                            ...sensor,
                            measurements: sensor.measurements?.map((measurement) =>
                                measurement.id === measurementId
                                    ? {
                                        ...measurement,
                                        regions: selectedRegions
                                    }
                                    : measurement
                            )
                        }
                        : sensor
                )
            );
            updateSelectedSensor(treeData.find(sensor => sensor.id === sensorId ))

            setExpandedKeys((prevKeys) => [...prevKeys, measurementId]);
        }
    }, [selectedRegions]);

    useEffect(() => {
        // console.log('selectedMeasurement123 ',selectedMeasurement);
        setTreeData((prevData) => 
            prevData.map((sensor) => 
                sensor.id == selectedKeys[0] 
                    ? {
                        ...sensor,
                        measurements: sensor.measurements?.map((measurement) => 
                            measurement.id == selectedMeasurement?.id
                            ? {
                                ...measurement,
                                mastering_status: selectedMeasurement.mastering_status,
                                _id: selectedMeasurement?._id
                            }
                            : measurement
                        )
                    }
                    : sensor
            )
        )
    }, [selectedMeasurement]);

    useEffect(() => {
        if (!sharedState.isMasterRunning && !sharedState?.isCapturing) {
            setDisableAll(false)
        } else if (sharedState.isMasterRunning || sharedState?.isCapturing) {
            setDisableAll(true)
        }
    }, [sharedState]);

    const closeSettingsModal = () => { //updatedSettings
        // console.log("Updated Settings:", updatedSettings);
        // setSettings(updatedSettings); // Save the updated settings
        setShowSettings(false); // Close the modal
    };

    const toastWarning = (title, message = "") => {
        toastr.options.closeDuration = 2000
        toastr.options.positionClass = "toast-top-right"
        toastr.warning(message, title)
    }

    const handleSelectSensor = (obj) => {
        // if(sensor.current && sensorConnected?.sensorName != `${sensor.current.name}-${sensor.current.model_name}`) {

        // }
        if(sensorConnected.sensorName && sensorConnected.sensorName != `${obj.name}-${obj.model_name}`) {
            // toastWarning(`${sensorConnected.sensorName} is Already Connected.`);
            return;
        }
        updateSelectedSensor(obj);
        setSelectedKeys([obj.id]); // Select sensor node
    };

    // Add Measurement
    const addMeasurement = (sensorId) => {
        // setTreeData((prevData) =>
        //     prevData.map((sensor) =>
        //         sensor.id === sensorId
        //             ? {
        //                 ...sensor,
        //                 measurements: [
        //                     ...(sensor.measurements || []), // Initialize as empty array if undefined
        //                     {
        //                         id: Date.now(),
        //                         name: `Measurement ${(sensor.measurements?.length || 0) + 1}`,
        //                         regions: [],
        //                     },
        //                 ],
        //             }
        //             : sensor
        //     )
        // );

        console.log('')
        // allow user to create measurement only if all measurements have mastering completed.
        const allCompleted = !treeData
            .find(sensor => sensor.id === sensorId)
            ?.measurements?.some(measurement => measurement?.mastering_status !== 'completed');

        console.log('allCompleted ', allCompleted);

        if (!allCompleted) {
            const message = treeData
                .find(sensor => sensor.id === sensorId)
                ?.measurements?.filter(measurement => measurement?.mastering_status !== 'completed')
            console.log(message, 'message')
            setNotifyMessage(message[0].name)
            setNotifyUser(true)
            return;
        }
        
        setTreeData((prevData) =>
            prevData.map((sensor) => {
                if (sensor.id !== sensorId) return sensor;

                const existingNumbers = new Set(
                    (sensor.measurements || []).map((m) => {
                        const match = m.name.match(/Measurement (\d+)/);
                        return match ? parseInt(match[1], 10) : 0;
                    })
                );

                let newNumber = 1;
                while (existingNumbers.has(newNumber)) {
                    newNumber++;
                }

                return {
                    ...sensor,
                    measurements: [
                        ...(sensor.measurements || []), // Initialize as empty array if undefined
                        {
                            id: Date.now(),
                            name: `Measurement ${newNumber}`,
                            regions: [],
                        },
                    ],
                };
            })
        );
        
        setExpandedKeys((prevKeys) => [...prevKeys, sensorId]);
    };

    // Add Region
    const addRegion = (sensorId, measurementId) => {
        setTreeData((prevData) =>
            prevData.map((sensor) =>
                sensor.id === sensorId
                    ? {
                        ...sensor,
                        measurements: sensor.measurements.map((measurement) =>
                            measurement.id === measurementId
                                ? {
                                    ...measurement,
                                    regions: [
                                        ...measurement.regions,
                                        {
                                            id: Date.now(),
                                            name: `Region ${measurement.regions.length + 1}`
                                        }
                                    ]
                                }
                                : measurement
                        )
                    }
                    : sensor
            )
        );

        setExpandedKeys((prevKeys) => [...prevKeys, measurementId]);
    };

    // Edit Item
    const editItem = (type, sensorId, measurementId, regionId) => {
        setOpenPopConfirms({})
        
        const target = treeData.find((sensor) => sensor.id === sensorId);
        if (type === "measurement") {
            const measurement = target.measurements.find((m) => m.id === measurementId);
            console.log('mastering_status295 ', measurement.mastering_status);
            if(measurement?.mastering_status == "completed") {
                Swal.fire({
                    title: 'Re-Master Required',
                    html: `Mastering is already completed for <strong>"${measurement.name}"</strong>. Are you sure you want to edit it?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Edit',
                    cancelButtonText: 'Cancel',
                }).then((result) => {
                    if (result.isConfirmed) {
                        
                        setTreeData((prevData) =>
                            prevData.map((sensor) =>
                                sensor.id === sensorId
                                    ? {
                                        ...sensor,
                                        measurements: sensor.measurements?.map((measurement) => {
                                            if (type === "measurement" && measurement.id === measurementId) {
                                                const updatedValue = {
                                                    ...measurement,
                                                    mastering_status: "not_started"
                                                }
                                                setSelectedMeasurement(updatedValue)
                                                return updatedValue;
                                            }
                                            return measurement;
                                        }),
                                    }
                                    : sensor
                            )
                        );

                        setCurrentEdit({ type, item: measurement, sensorId });
                        setIsEditing(true);
                    }
                });
                return;
            }
            setCurrentEdit({ type, item: measurement, sensorId });
        } else if (type === "region") {
            const measurement = target.measurements.find((m) => m.id === measurementId);
            const region = measurement.regions.find((r) => r.id === regionId);
            setCurrentEdit({ type, item: region, sensorId, measurementId });
        }
        setIsEditing(true);
    };


    // // Save Edits
    // const saveEdit = (name) => {
    //     const { type, sensorId, measurementId, item } = currentEdit;
    //     setTreeData((prevData) =>
    //         prevData.map((sensor) =>
    //             sensor.id === sensorId
    //                 ? {
    //                     ...sensor,
    //                     measurements: sensor.measurements.map((measurement) => {
    //                         if (type === "measurement" && measurement.id === item.id) {
    //                             return { ...measurement, name };
    //                         }
    //                         if (type === "region" && measurement.id === measurementId) {
    //                             return {
    //                                 ...measurement,
    //                                 regions: measurement.regions.map((region) =>
    //                                     region.id === item.id ? { ...region, name } : region
    //                                 )
    //                             };
    //                         }
    //                         return measurement;
    //                     })
    //                 }
    //                 : sensor
    //         )
    //     );
    //     setIsEditing(false);
    //     setCurrentEdit(null);
    // };

    const saveEdit = (name) => {
        const { type, sensorId, measurementId, item } = currentEdit;

        setTreeData((prevData) =>
            prevData.map((sensor) =>
                sensor.id === sensorId
                    ? {
                        ...sensor,
                        measurements: sensor.measurements?.map((measurement) => {
                            if (type === "measurement" && measurement.id === item.id) {
                                console.log('measurementvalue ', measurement, name);
                                const updatedValue = { 
                                    ...measurement, 
                                    name,
                                    mastering_status: "not_started"
                                }
                                setSelectedMeasurement(updatedValue)
                                return updatedValue;
                            } else if (type === "region" && measurement.id === measurementId) {
                                return {
                                    ...measurement,
                                    regions: measurement.regions.map((region) =>
                                        region.id === item.id ? { ...region, name } : region
                                    ),
                                };
                            }
                            return measurement;
                        }),
                    }
                    : sensor
            )
        );

        setIsEditing(false);
        setCurrentEdit(null);
    };

    // Delete Item
    const deleteItem = (type, sensorId, measurementId, regionId) => {
        setTreeData((prevData) =>
            prevData.map((sensor) =>
                sensor.id === sensorId
                    ? {
                        ...sensor,
                        measurements: sensor.measurements?.filter((measurement) =>
                            type === "measurement"
                                ? measurement.id !== measurementId
                                : true
                        ).map((measurement) =>
                            type === "region"
                                ? {
                                    ...measurement,
                                    regions: measurement.regions.filter((region) => region.id !== regionId)
                                }
                                : measurement
                        )
                    }
                    : sensor
            )
        );
    };

    const handleExpand = (expandedKeysValue) => {
        setExpandedKeys(expandedKeysValue);
    };

    // Function to open all nodes
    const openAllNodes = () => {
        const keys = [];
        // Traverse all the tree data and collect all keys
        const collectKeys = (data) => {
            data.forEach((item) => {
                keys.push(item.id);
                if (item?.measurements) {
                    collectKeys(item.measurements);
                }
            });
        };
        collectKeys(treeData); // Start from root
        setExpandedKeys(keys);
    };

    // Function to close all nodes
    const closeAllNodes = () => {
        setExpandedKeys([]); // Clear the expandedKeys to collapse all
    };

    const handleTreeOpen = (value) => {
        setOpenTree(value);
        if (value === "open") {
            openAllNodes(); // Open all nodes when 'Open All' is selected
        } else if (value === "close") {
            closeAllNodes(); // Close all nodes when 'Close All' is selected
        }
    }

    // // Handle measurement selection
    // const handleSelectMeasurement = async (sensorId, measurementId, measurement) => {
    //     try {
    //         const response = await post(
    //             '/getMeasurementId',
    //             { 
    //                 'measurementId': measurementId, 
    //                 'sensorId': sensorId 
    //             }
    //         );
    //         // if (response._id != null || response._id != "'NoneType' object is not subscriptable") {
    //         //     setSelectedMeasurement(response); // Select measurement node
    //         //     console.log('selectedMeasurement if _id', response)
    //         // }
    //         if(response == 'not_available') {
    //             setSelectedMeasurement(measurement)
    //         } else {
    //             response.name = measurement?.name
    //             setSelectedMeasurement(response); // Select measurement node
    //         }
    //         console.log('measurementvalue ', response, measurement)
    //     }
    //     catch (error) {
    //         console.error('Error getting measurement:', error);
    //     }
    //     setSelectedKeys([sensorId, measurementId]); // Select measurement node
    //     updateRegions(measurement?.regions);
    // };

    // Handle measurement selection
    const handleSelectMeasurement = async (sensorId, measurementId, measurement) => {
        if(measurement?.mastering_status === "completed") {
            try {
                const response = await post('/getMeasurementId',
                    { 'measurementId': measurementId, 'sensorId': sensorId });
                if (response == 'not_available') {
                    setSelectedMeasurement(measurement)
                } else {
                    response.name = measurement?.name
                    setSelectedMeasurement(response); // Select measurement node
                }
                console.log('measurementvalue ', response, measurement)
            }
            catch (error) {
                console.error('Error getting measurement:', error);
            }
        }
        else {
            setSelectedMeasurement(measurement);
        }
        
        setSelectedKeys([sensorId, measurementId]); // Select measurement node
        updateRegions(measurement?.regions);
    };

    // Handle tree selection
    const handleSelect = (selectedKeysValue) => {
        setSelectedKeys(selectedKeysValue);
    };

    // Function to apply custom styles for selected nodes
    const getNodeStyle = (obj, child_id, selected_child_id) => {
        const isHighlight = child_id && selected_child_id === child_id;
        return {
            // Your existing styles
            cursor: sensorConnected.sensorName && sensorConnected.sensorName != `${obj.name}-${obj.model_name}` ? 'not-allowed' : 'pointer', // Show "not-allowed" cursor based on condition
            opacity: sensorConnected.sensorName && sensorConnected.sensorName != `${obj.name}-${obj.model_name}` ? 0.5 : 1, // Optionally make it look disabled
            padding: isHighlight ? '2px' : '',
            borderRadius: isHighlight ? '4px' : '',
            color: isHighlight ? '#556ee6' : '',
            // background: isHighlight ? '#d6d9f9' : '',
            display: isHighlight ? 'flex' : '',
            alignItems: isHighlight ? 'center' : '',
            gap: isHighlight ? '5px' : '',
            border: isHighlight ? '1px solid #556ee6' : ''
        };
        // return selectedKeys.includes(key)
        //     ? {
        //           backgroundColor: "rgba(85, 110, 230, 0.18)", // Background color for selected node
        //       }
        //     : {};
    };
    
    const editRegionValues = (sid, mid, rid) => {
        setOpenPopConfirms({});
        if(graphRef?.current) {
            graphRef.current?.openOffCanvas(rid)
        }
    }

    const togglePopConfirm = (index, val) => {
        if(val == 1) {
            setOpenPopConfirms({})
        } else {
            setOpenPopConfirms({ [index]: true })
        }
        // setOpenPopConfirms((prev) => ({
        //     ...prev,
        //     [index]: val === 0,
        // }));
    };

    const handleDelete = (index, sensor, measurement, region) => {
        deleteItem("region", sensor.id, measurement.id, region.id);
        if(graphRef?.current) {
            graphRef.current?.deleteRegion(index)
        }

        setSelectedRegions((prevRegions) => {
            return prevRegions.filter((r) => r.id !== region.id); // Remove deleted region from the state
        });

        togglePopConfirm(region.id, 1); // Close Popconfirm after delete
    };

    const deleteMeasurement = async (sensorId, measurementId, _id, measurement, sensor_name) => {
        const measurement_name = measurement.name;
        const [selectedSensorId, selectedMeasurementId] = selectedKeys;
        console.log(componentDetails, "componentDetails")

        if (_id) {
            try {
                const response = await post('/deleteMeasurement', {
                    'measurementId': _id, 'comp_id': componentDetails._id,
                    'comp_name': componentDetails.comp_name, "comp_code": componentDetails.comp_code,
                    "measurement_name": measurement_name, 'sensor_name': sensor_name
                });
                console.log('responsedelete ', response)
                if (response?.status == "not_started") {
                    updateComponentDetails(false);
                }
                deleteItem("measurement", sensorId, measurementId);
                if (measurementId == selectedMeasurementId) {
                    updateRegions([]);
                    setSelectedKeys([sensorId])
                }
            } catch (error) {
                console.error('Error deleting measurement:', error);
            }
        } else {
            deleteItem("measurement", sensorId, measurementId);
            if (measurementId == selectedMeasurementId) {
                updateRegions([]);
            }
        }
        setSelectedKeys([sensorId])
    }

    // const renderTreeNodes = (data) =>
    //     data.map((sensor) => ({
    //         title: (
    //             <span onClick={() => handleSelectSensor(sensor)}>
    //                 {sensor.name}{" "}
    //                 <Button size="small" onClick={() => addMeasurement(sensor.id)}>
    //                     Add Measurement
    //                 </Button>
    //             </span>
    //         ),
    //         key: sensor.id,
    //         children: sensor.measurements.map((measurement) => ({
    //             title: (
    //                 <span >
    //                     {measurement.name}{" "}
    //                     <EditOutlined onClick={() => editItem("measurement", sensor.id, measurement.id)} />{" "}
    //                     <DeleteOutlined
    //                         onClick={() => deleteItem("measurement", sensor.id, measurement.id)}
    //                     />{" "}
    //                     <Button
    //                         size="small"
    //                         icon={<PlusOutlined />}
    //                         onClick={() => addRegion(sensor.id, measurement.id)}
    //                     >
    //                         Add Region
    //                     </Button>
    //                 </span>
    //             ),
    //             key: measurement.id,
    //             children: measurement.regions.map((region) => ({
    //                 title: (
    //                     <span>
    //                         {region.name}{" "}
    //                         <EditOutlined
    //                             onClick={() =>
    //                                 editItem("region", sensor.id, measurement.id, region.id)
    //                             }
    //                         />{" "}
    //                         <DeleteOutlined
    //                             onClick={() =>
    //                                 deleteItem("region", sensor.id, measurement.id, region.id)
    //                             }
    //                         />
    //                     </span>
    //                 ),
    //                 key: region.id
    //             }))
    //         }))
    //     }));

    // const renderTreeNodes = (data) =>
    //     data.map((sensor) => ({
    //         title: (
    //             <span
    //                 style={getNodeStyle(sensor)} // Apply styles dynamically
    //                 onClick={() => {
    //                     if (!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`) handleSelectSensor(sensor);
    //                 }}
    //             >
    //                 {`${sensor.name}-${sensor.model_name} `}
    //                 <Button
    //                     size="small"
    //                     onClick={() => {
    //                         if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`) addMeasurement(sensor.id)
    //                     }}
    //                 >
    //                     Add Measurement
    //                 </Button>
    //             </span>
    //             // <span 
    //             //     style={getNodeStyle(sensor.id)} // Apply styles for selected sensor
    //             //     onClick={() => handleSelectSensor(sensor)}
    //             // >
    //             //     {`${sensor.name}-${sensor.model_name}  `}
    //             //     {}{" "}{}
    //             //     <Button size="small" onClick={() => addMeasurement(sensor.id)}>
    //             //         Add Measurement
    //             //     </Button>
    //             // </span>
    //         ),
    //         key: sensor.id,
    //         children: sensor.measurements.map((measurement) => ({
    //             title: (
    //                 <span 
    //                     style={getNodeStyle(sensor)} // Apply styles for selected measurement
    //                     onClick={() => {
    //                         if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`) 
    //                             handleSelectMeasurement(sensor.id, measurement.id, measurement)
    //                     }}
    //                 >
    //                     {measurement.name}{" "}
    //                     <EditOutlined
    //                         onClick={() => {
    //                             if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
    //                                 editItem("measurement", sensor.id, measurement.id)
    //                         }}
    //                     />{" "}
    //                     <DeleteOutlined
    //                         onClick={() => {
    //                             if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
    //                                 deleteItem("measurement", sensor.id, measurement.id)
    //                         }}
    //                     />{" "}
    //                     {/* <Button
    //                         size="small"
    //                         icon={<PlusOutlined />}
    //                         onClick={() => addRegion(sensor.id, measurement.id)}
    //                     >
    //                         Add Region
    //                     </Button> */}
    //                 </span>
    //             ),
    //             key: measurement.id,
    //             children: measurement.regions.map((region, rid) => ({
    //                 title: (
    //                     <span>
    //                         {region.name}{" "}
    //                         <EditOutlined
    //                             onClick={() => {
    //                                 if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
    //                                     editRegionValues(sensor.id, measurement.id, rid)
    //                             }
    //                                 // editItem("region", sensor.id, measurement.id, region.id)
    //                             }
    //                         />{" "}
    //                         <Popconfirm
    //                             placement="rightBottom"
    //                             title="Delete this region?"
    //                             onConfirm={() => handleDelete(rid, sensor, measurement, region)}
    //                             onCancel={() => togglePopConfirm(region.id, 1)}
    //                             okText="Yes"
    //                             cancelText="No"
    //                             open={openPopConfirms[region.id]}
    //                         >
    //                             <DeleteOutlined
    //                                 onClick={() => {
    //                                     if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
    //                                         togglePopConfirm(region.id, 0)
    //                                 }}
    //                             />
    //                         </Popconfirm>
    //                         {/* <DeleteOutlined
    //                             onClick={() =>
    //                                 deleteItem("region", sensor.id, measurement.id, region.id)
    //                             }
    //                         /> */}
    //                     </span>
    //                 ),
    //                 key: region.id
    //             }))
    //         }))
    //     }));

    const renderTreeNodes = (data) => {
        // Helper function to handle the condition check
        const canInteractWithSensor = (sensor) => {
            return !(sensorConnected.sensorName && sensorConnected.sensorName !== `${sensor.name}-${sensor.model_name}`);
        };

        // Helper function to prevent button click from triggering span click
        const handleButtonClick = (e, callback) => {
            e.stopPropagation();
            callback();
        };

        const [sensorId, measurementId] = selectedKeys;

        return data.map((sensor) => ({
            title: (
                <span
                    style={getNodeStyle(sensor)} // Apply styles dynamically
                    onClick={() => {
                        if (canInteractWithSensor(sensor) && !disableAll) {
                            handleSelectSensor(sensor);
                        }
                    }}
                >
                    {`${sensor.name}-${sensor.model_name} `}
                    <Button
                        size="small"
                        style={{
                            cursor: canInteractWithSensor(sensor) ? 'pointer' : 'not-allowed', // Apply cursor style dynamically
                            opacity: canInteractWithSensor(sensor) ? 1 : 0.5, // Optional: Dim the button when disabled
                        }}
                        onClick={(e) => handleButtonClick(e, () => {
                            if (canInteractWithSensor(sensor)) {
                                addMeasurement(sensor.id);
                            }
                        })}
                        disabled={!canInteractWithSensor(sensor) || disableAll} // Disable the button based on condition
                    >
                        Add Measurement
                    </Button>
                </span>
            ),
            key: sensor.id,
            children: sensor.measurements?.map((measurement) => ({
                title: (
                    <span
                        style={getNodeStyle(sensor, measurement.id, measurementId)} // Apply styles for selected measurement
                    >
                        <span
                            onClick={() => {
                                if (canInteractWithSensor(sensor) && !disableAll) {
                                    handleSelectMeasurement(sensor.id, measurement.id, measurement);
                                }
                            }}
                        >{measurement.name}{" "}</span>
                        {
                            // selectedKeys && sensor.id == selectedKeys[0] ?
                            sensorConnected?.status && selectedKeys?.length > 1 && measurement.id == selectedKeys[1] && !disableAll ?
                                <>
                                    <EditOutlined
                                        style={{
                                            cursor: canInteractWithSensor(sensor) ? 'pointer' : 'not-allowed', // Apply cursor style dynamically
                                            opacity: canInteractWithSensor(sensor) ? 1 : 0.5, // Optional: Dim the button when disabled
                                        }}
                                        onClick={() => {
                                            if (canInteractWithSensor(sensor)) {
                                                editItem("measurement", sensor.id, measurement.id);
                                                // setShowSettings(true)
                                            }
                                        }}
                                    />{" "}
                                    <Popconfirm
                                        placement="rightBottom"
                                        title={
                                            measurement.mastering_status === 'completed'
                                                ? "This is already mastered, Are you sure you want to delete this measurement?."
                                                : "Are you sure you want to delete this measurement?"
                                        }
                                        onConfirm={() => deleteMeasurement(sensor.id, measurement.id, measurement?._id, measurement, sensor.name)}
                                        onCancel={() => togglePopConfirm(measurement.id, 1)}
                                        okText="Yes"
                                        cancelText="No"
                                        open={openPopConfirms[measurement.id]}
                                    >
                                        <DeleteOutlined
                                            style={{
                                                cursor: canInteractWithSensor(sensor) ? 'pointer' : 'not-allowed', // Apply cursor style dynamically
                                                opacity: canInteractWithSensor(sensor) ? 1 : 0.5, // Optional: Dim the button when disabled
                                            }}
                                            onClick={() => {
                                                if (canInteractWithSensor(sensor)) {
                                                    togglePopConfirm(measurement.id, 0);
                                                }
                                            }}
                                        />
                                    </Popconfirm>
                                    {" "}
                                </>
                                : null
                        }
                        <span className={`badge ms-1 ${measurement?.mastering_status == "completed" ? "bg-success" : "bg-danger"} rounded-circle`}>
                            <i className={`${measurement?.mastering_status == "completed" ? "bx bx-check" : "bx bx-x"}`}></i>
                        </span>
                    </span>
                ),
                key: measurement.id,
                children: measurement.regions?.map((region, rid) => ({
                    title: (
                        <span
                            style={getNodeStyle(sensor)}
                        >
                            {region.name}{" "}
                            {
                                 sensorConnected?.status && selectedKeys?.length > 1 && measurement.id == selectedKeys[1] && !disableAll
                                    && measurement?.mastering_status != "completed"
                                    ?
                                    <>
                                        <EditOutlined
                                            style={{
                                                cursor: canInteractWithSensor(sensor) ? 'pointer' : 'not-allowed', // Apply cursor style dynamically
                                                opacity: canInteractWithSensor(sensor) ? 1 : 0.5, // Optional: Dim the button when disabled
                                            }}
                                            onClick={() => {
                                                if (canInteractWithSensor(sensor)) {
                                                    editRegionValues(sensor.id, measurement.id, rid);
                                                }
                                            }}
                                        />{" "}
                                        <Popconfirm
                                            placement="rightBottom"
                                            title="Delete this region?"
                                            onConfirm={() => handleDelete(rid, sensor, measurement, region)}
                                            onCancel={() => togglePopConfirm(region.id, 1)}
                                            okText="Yes"
                                            cancelText="No"
                                            open={openPopConfirms[region.id]}
                                        >
                                            <DeleteOutlined
                                                style={{
                                                    cursor: canInteractWithSensor(sensor) ? 'pointer' : 'not-allowed', // Apply cursor style dynamically
                                                    opacity: canInteractWithSensor(sensor) ? 1 : 0.5, // Optional: Dim the button when disabled
                                                }}
                                                onClick={(e) => handleButtonClick(e, () => {
                                                    if (canInteractWithSensor(sensor)) {
                                                        togglePopConfirm(region.id, 0);
                                                    }
                                                })}
                                            />
                                        </Popconfirm>
                                        <Multiselect
                                            isObject={false}
                                            onKeyPressFn={multiSelectOnKeyPressFn}
                                            onRemove={(e) => multiSelectOnSelect(e, "region", sensor.id, measurement.id, region.id)}
                                            onSearch={multiSelectOnSearch}
                                            onSelect={(e) => multiSelectOnSelect(e, "region", sensor.id, measurement.id, region.id)}
                                            options={[
                                                'runout',
                                                'diameter',
                                            ]}
                                            placeholder="+ Add Measurement type"
                                            hidePlaceholder={true}
                                            closeOnSelect={true}
                                            selectedValues={region.measurement_type}
                                            // hideSelectedList={true}
                                        />
                                    </>
                                    : null
                            }
                        </span>
                    ),
                    key: region.id,
                    // children: region?.measurement_type.map((region_type) => ({
                    //     title: (
                    //         <span>
                    //             <span>{region_type}</span>
                    //         </span>
                    //     )
                    // }))
                }))
            }))
        }));
    };

    const multiSelectOnKeyPressFn = (obj) => {
        console.log('multiSelectOnKeyPressFn ', obj)
    }

    const multiSelectOnRemove = (obj) => {
        console.log('multiSelectOnRemove ', obj)
    }
    const multiSelectOnSearch = (obj) => {
        console.log('multiSelectOnSearch ', obj)
    }
    const multiSelectOnSelect = (obj, type, sensorId, measurementId, regionId) => {
        console.log('multiSelectOnSelect ', obj);

        setTreeData((prevData) => {
            let updatedRegions = [];

            const newData = prevData.map((sensor) => {
                if (sensor.id === sensorId) {
                    return {
                        ...sensor,
                        measurements: sensor.measurements?.map((measurement) => {
                            if (measurement.id === measurementId) {
                                const newRegions = measurement.regions?.map((region) => {
                                    if (region.id === regionId) {
                                        return {
                                            ...region,
                                            measurement_type: obj
                                        };
                                    }
                                    return region;
                                }) || [];

                                // Store updated regions
                                updatedRegions = newRegions;

                                return {
                                    ...measurement,
                                    regions: newRegions
                                };
                            }
                            return measurement;
                        })
                    };
                }
                return sensor;
            });

            // Update the context variable with new regions
            updateRegions(updatedRegions);

            return newData;
        });
             
    }

    

    const handleNavigateToSensorInfo = () => {
        history.push('/sensor-list'); // Replace with your correct route
    };

    const validateName = (sensorId, name) => {
        const sensor = treeData.find((sensor) => sensor.id === sensorId);
        if (!sensor) return false;

        return sensor.measurements.some(
            (measurement) =>
                measurement.name === name && measurement.id !== currentEdit.item.id // Exclude the current measurement ID
        );
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Name is required')
            .max(15,'Name must be at most 15 Characters')
            .test(
                'unique-name',
                'This name already exists in the measurements list',
                (value) => !validateName(currentEdit.sensorId, value)
            )
    });

    const toggleNotify = () => {
        setNotifyUser(false);
        setNotifyMessage("");
    }

    console.log(treeData, selectedKeys);
    
    return (
        <div >
            {
                notifyUser ?
                    <NotifyUser
                        message={`Complete Mastering for "${notifyMessage}" to continue...`}
                        toggleNotify={toggleNotify}
                    />
                    : null
            }
            <SettingsModal
                open={showSettings}
                onClose={closeSettingsModal}
            />
            {/* className="scrollable-container" */}
            {
                treeData?.length > 0 ?
                    <Card className="scroll-design" style={{ border: '1px solid #e9e9e9', maxHeight: '100vh', height: '100vh', overflowY: 'auto' }}>
                        <CardBody>
                            <CardTitle>Sensor Setup</CardTitle>
                            <Button.Group style={{ marginBottom: 10 }}>
                                <Button onClick={() => handleTreeOpen("open")}>
                                    Expand
                                </Button>
                                <Button onClick={() => handleTreeOpen("close")}>
                                    Collapse
                                </Button>
                            </Button.Group>
                            <Tree
                                treeData={renderTreeNodes(treeData)}
                                showLine
                                // selectedKeys={selectedKeys} // Highlight selected node
                                // onSelect={handleSelect} // Handle selection changes
                                expandedKeys={expandedKeys}
                                onExpand={handleExpand}
                            // defaultExpandAll={true}
                            />
                        </CardBody>
                    </Card>
                    : 
                    <div className="no-sensor-message" style={{ textAlign: 'center', marginTop: '20px' }}>
                        <h5 className="fw-bold">Sensor list is not available</h5>
                        <p>Add sensor to continue...</p>
                        <Button color="primary" onClick={handleNavigateToSensorInfo}>
                            Go to Sensor Info Page
                        </Button>
                    </div>
            }


            {/* to edit measurement and region name ==> reference code */}
            {/* <Modal
                title="Edit Item"
                open={isEditing}
                onOk={() => saveEdit(currentEdit.item.name)}
                onCancel={() => setIsEditing(false)}
            >
                <Input
                    value={currentEdit?.item.name}
                    onChange={(e) =>
                        setCurrentEdit((prev) => ({
                            ...prev,
                            item: { ...prev.item, name: e.target.value }
                        }))
                    }
                />
            </Modal> */}
            {/* <Modal
                title="Edit Item"
                open={isEditing}
                onCancel={() => setIsEditing(false)}
                footer={null} // Custom footer using Formik's submit/cancel
            >
                <Formik
                    key={currentEdit?.item.id} // Force reinitialization with a unique key
                    initialValues={{ name: currentEdit?.item.name || '' }}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        saveEdit(values.name); // Call the saveEdit function
                    }}
                    validateOnChange={false}
                    validateOnBlur={false}
                >
                    {({ handleSubmit, handleReset }) => (
                        <Form>
                            <div>
                                <label htmlFor="name">Name:</label>
                                <Field
                                    id="name"
                                    name="name"
                                    as={Input}
                                    placeholder="Enter name"
                                />
                                <ErrorMessage
                                    name="name"
                                    component="div"
                                    style={{ color: 'red', marginTop: '5px' }}
                                />
                            </div>
                            <div style={{ marginTop: '20px', textAlign: 'right' }}>
                                <Button
                                    type="default"
                                    onClick={() => {
                                        handleReset();
                                        setIsEditing(false); // Close the modal
                                    }}
                                    style={{ marginRight: '10px' }}
                                >
                                    Cancel
                                </Button>
                                <Button type="primary" onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal> */}
            <Modal
                title="Edit Item"
                open={isEditing}
                onCancel={() => {
                    setIsEditing(false);
                }}
                footer={null} // Custom footer using Formik's submit/cancel
            >
                <Formik
                    enableReinitialize={true} // Reinitialize the form when initialValues change
                    initialValues={{ name: currentEdit?.item.name || "" }}
                    validationSchema={validationSchema}
                    onSubmit={values => {
                        saveEdit(values.name); // Call the saveEdit function
                    }}
                    validateOnChange={false}
                    validateOnBlur={false}
                >
                    {({ handleSubmit, handleReset, resetForm, values }) => {
                        // UseEffect to reset the form when currentEdit changes
                        useEffect(() => {
                            resetForm(); // Reset form whenever currentEdit is updated
                        }, [currentEdit]);

                        return (
                            <Form>
                                <div>
                                    <label htmlFor="name">Name:</label>
                                    <Field
                                        id="name"
                                        name="name"
                                        as={Input}
                                        placeholder="Enter name"
                                        maxLength = {15}
                                    />
                                    <ErrorMessage
                                        name="name"
                                        component="div"
                                        style={{ color: "red", marginTop: "5px" }}
                                    />
                                </div>
                                <div style={{ marginTop: "20px", textAlign: "right" }}>
                                    <Button
                                        type="default"
                                        onClick={() => {
                                            resetForm(); // Reset form manually if needed
                                            setIsEditing(false); // Close the modal
                                        }}
                                        style={{ marginRight: "10px" }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="primary" onClick={handleSubmit}>
                                        Submit
                                    </Button>
                                </div>
                            </Form>
                        );
                    }}
                </Formik>
            </Modal>

        </div>
    );
};

// SensorSetup.propTypes = {
//   products: PropTypes.array.isRequired, 
//   selectedItems: PropTypes.array.isRequired,
//   handleRemove: PropTypes.func.isRequired,
// };

export default SensorSetup;