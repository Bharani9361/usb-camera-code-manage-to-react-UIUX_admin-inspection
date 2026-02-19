import React, { useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Label, Input, ListGroup, ListGroupItem, Card, CardBody, Spinner } from "reactstrap";
import { Layout, Menu, Typography  } from "antd";
import { FaArrowLeft, FaEdit, FaInfo, FaTrash, FaCog  } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Swal from 'sweetalert2';

import { makeHeaderBtn } from "store/actions";
import SensorSetup from "./SensorOp/SensorSetup";
import SensorOperation from "./SensorOp/SensorOperations";
import { AppContext } from "./contexts/Context"
import SocketProvider from "./contexts/SocketContext";
import { GraphRefContext } from "./contexts/GraphRefContext";
import { MasteringContext } from "./contexts/MasteringContext";

import './MultiMeasurement.css'
import './SensorOp/SensorSetup.css'
import GraphPlotting from "./GraphOp/GraphPlotting";
import SettingsModal from "./Settings/SettingsModal";

import MasteringStatus from "./GraphOp/MasteringStatus";
import { RegionsProvider } from "./contexts/RegionsContext";
import urlSocket from "pages/AdminInspection/urlSocket";
import { executeSensorAction } from "./services/sensorApi";
import MasteredDataInformation from "./MasteredDataInfo/MasteredDataInformation";
import { post } from "./services/apiService";
import Breadcrumbs from "components/Common/Breadcrumb";
import { MetaTags } from "react-meta-tags";

const { Content, Sider } = Layout;
const { Title } = Typography;

// const sensorData = [
//   {
//     "_id": "67810faae099c62a4d99f252",
//     "brand_name": "Wenglor",
//     "id": 1,
//     "measurements": [],
//     "model_name": "MLSL123",
//     "name": "W1",
//   },
//   {
//     "_id": "67810fbae099c62a4d99f253",
//     "brand_name": "ScanControl",
//     "id": 2,
//     "measurements": [],
//     "model_name": "2600-100",
//     "name": "S1",
//   }
// ]

// const measurementData = [
//   {
//     "_id": "677e6af0a6ddb4d7e946aec7",
//     "comp_id": "6756ed5af6e8a0a3eff9e154",
//     "id": 1736338137093,
//     "mastering_status": "completed",
//     "name": "Measurement 1",
//     "regions": [
//       {
//         "id": "4a359266-8b82-45e0-9794-965497345b40",
//         "max_tolerance": 2,
//         "min_tolerance": 0,
//         "name": "region_0",
//         "runout": 0.76,
//       }
//     ],
//     "sensorId": "67810faae099c62a4d99f252", // used to map with sensor measurements.
//   },
//   {
//     "_id": "677e6b09a6ddb4d7e946aef8",
//     "comp_id": "6756ed5af6e8a0a3eff9e154",
//     "id": 1736338164101,
//     "name": "Measurement 2",
//     "mastering_status": "completed",
//     "regions": [
//       {
//         "id": "c6423c3f-de23-46f4-82bc-1db95d5a499d",
//         "max_tolerance": 5,
//         "min_tolerance": 0,
//         "name": "region_0",
//         "runout": 0.365,
//       },
//       {
//         "id": "c6423c3f-de23-46f4-82bc-1db95d5a499d",
//         "max_tolerance": 5,
//         "min_tolerance": 0,
//         "name": "region_1",
//         "runout": 0.365,
//       },
//       {
//         "id": "c6423c3f-de23-46f4-82bc-1db95d5a499d",
//         "max_tolerance": 5,
//         "min_tolerance": 0,
//         "name": "region_2",
//         "runout": 0.365,
//       },
//     ],
//     "sensorId": "67810faae099c62a4d99f252", // used to map with sensor measurements.
//   },
//   {
//     "_id": "6780c77fa321e6a826fc7b55",
//     "comp_id": "6756ed5af6e8a0a3eff9e154",
//     "id": 1736492903275,
//     "name": "Measurement 3",
//     "mastering_status": "completed",
//     "regions": [
//       {
//         "id": "b8a1e08b-fa62-4469-9421-1606ee9aec59",
//         "max_tolerance": 1,
//         "min_tolerance": 0,
//         "name": "region_0",
//         "runout": 0.53,
//       }
//     ],
//     "sensorId": "67810fbae099c62a4d99f253", // used to map with sensor measurements.
//   }
// ]

const MultiMeasurement = ({ dispatch }) => {

  // alert for navigation back
  const history = useHistory();
  
  const [sensorConnected, setSensorConnected] = useState({
    status: false,
    sensorName: "",
    sensorId: "",
  });
  const [compSensorData, setCompSensorData] = useState([])

  const sensorRef = useRef(sensorConnected);

  const [compinfoLoading, setCompinfoLoading] = useState(true);
  const [componentDetails, setComponentDetails] = useState({});
  const [masterAvailable, setMasterAvailable] = useState(false);
  // to select show selected sensor operations (connect, disconnect, single shot, start capturing)
  const [selectedSensor, setSelectedObject] = useState(null);
  const [settings, setSettings] = useState({
    inspectionType: "time-based",
    numRotation: 5,
    timeDuration: 2,
    leadTime: 2,
    // ip_address: "172.16.1.100",
    // port: 8080,
    exposureTime: 100,
    measuringRate: 1000,
  });

  // to select sensor and measurement (ex. [3, 1735129574196])
  const [selectedKeys, setSelectedKeys] = useState([]);

  
  // graph (plotly) ref
  const graphRef = useRef();
  
  const [showSettings, setShowSettings] = useState(false);

  // rotation status, 0(not started), 1(in progress), 2(completed);
  const [rotationStatus, setRotationStatus] = useState(0);

  // for socket emit receiving, initially true, then based on start and stop mastering
  const [sharedState, setSharedState] = useState({
    isMasterRunning: false,
    currentMasteringId: null,
    isCapturing: false,
  });

  

  const [openMasterInfo, setOpenMasterInfo] = useState(false);
  const [sensorData, setSensorData] = useState([])
  const [measurementData, setMeasurementData] = useState([]);

  const [waitResponse, setWaitResponse] = useState({});

  // useEffect functions
  useEffect(() => {
    const sessionData = JSON.parse(sessionStorage.getItem("manageData"));
    const getCompData = async () => {
      try {
        const response = await post('/get_comp_data', { 'id': sessionData.compInfo._id });
        // const response = sessionData.compInfo;
        // console.log('componentDetails263 ', response, sessionData.compInfo)
        setComponentDetails(response);
        if (response?.mastering_status == "completed") {
          setMasterAvailable(true);
        } else {
          setMasterAvailable(false);
        }
        setSettings((prevSettings) => {
          return {
            ...prevSettings,
            inspectionType: response?.insp_based_on ? response?.insp_based_on : prevSettings.inspectionType,
            numRotation: response?.no_of_rotation ? response?.no_of_rotation : prevSettings.numRotation,
            timeDuration: response?.time_duration ? response?.time_duration : prevSettings.timeDuration,
            leadTime: response?.lead_time ? response?.lead_time : prevSettings.leadTime,
          }
        });


        // get component sensor measurement info
        if(response?._id) {
          const comp_sensor_data = await getCompSensorMeasurementData(response?._id);
          setCompSensorData(comp_sensor_data)
        }


        setCompinfoLoading(false);
      } catch (error) {
        console.error(error);
        setCompinfoLoading(false);
      }
    }

    dispatch(makeHeaderBtn(true));

    // Call the async function
    if (sessionData?.compInfo?._id) {
      getCompData();
    }
  }, []);

  useEffect(() => {
    return () => {
      dispatch(makeHeaderBtn(false));
    };
  }, [dispatch]);

  // Update the ref whenever sensorConnected changes
  useEffect(() => {
    sensorRef.current = sensorConnected;
  }, [sensorConnected]);

  useEffect(() => {
    const unblock = history.block((location, action) => {
      if (sensorConnected?.status) {
        const confirmLeave = window.confirm("Changes you made may not be saved.");
        // const confirmLeave = window.confirm("Sensor Disconnected. Are you sure you want to leave?");
        
        if (confirmLeave) {
          disconnectSensor(); // Only disconnect if user confirms
          return true;
        } else {
          return false; // Prevent navigation and keep sensor connected
        }
      }
      return undefined; // Allows navigation if sensor is not connected
    });
  
    return () => unblock();
  }, [sensorConnected, history]);

  useEffect(() => {

    // Attach the `beforeunload` event listener
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up event listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  
  const updateSelectedSensor = (obj) => {
    setSelectedObject(obj);
  };

  // Define the start and stop master function for emit
  const startFunction = (sessionId) => {
    setSharedState((prevState) => ({
      ...prevState,
      isMasterRunning: true,
      currentMasteringId: sessionId,
    }));
  };

  const stopFunction = () => {
    setSharedState((prevState) => ({
      ...prevState,
      isMasterRunning: false,
      currentMasteringId: null,
    }));
    
  };

  const startCapturing = () => {
    setSharedState((prevState) => ({
      ...prevState,
      isCapturing: true,
    }));
  }
  
  const stopCapturing = () => {
    setSharedState((prevState) => ({
      ...prevState,
      isCapturing: false,
    }));
  }

  const setConnectedSensor = (obj) => {
    setSensorConnected((prevState) => ({
      ...prevState,
      status: obj.status,
      sensorName: obj?.sensor ? `${obj.sensor.name}-${obj.sensor.model_name}` : null,
      sensorType: obj?.sensor ? obj.sensor.type : null,
      sensorInfo: obj?.sensor ? obj.sensor : null
    }))
  }
  
  const closeSettingsModal = () => { //updatedSettings
    // console.log("Updated Settings:", updatedSettings);
    // setSettings(updatedSettings); // Save the updated settings
    setShowSettings(false); // Close the modal
  };

  const getMasteredData = async (key) => {
    console.log('clicked')
    if(waitResponse[key]) {
      return;
    }
    setWaitResponse({ ...waitResponse, [key]: true });

    const compSensorData = await getCompSensorMeasurementData(componentDetails?._id);
    console.log('compSensorData ', compSensorData);

    setWaitResponse({ ...waitResponse, [key]: false });

    setSensorData(compSensorData);
    setMeasurementData([]);
    setOpenMasterInfo(true);


    // try {
    //   const sensor_Data = await post('/getSensorList');
    //   const measurement_Data = await post('/getMeasurementList', { comp_id: componentDetails._id });

    //   setSensorData(sensor_Data.sensor);
    //   setMeasurementData(measurement_Data.measurement_list);
    //   setOpenMasterInfo(true);

    //   console.log('getSensorList, getMeasurementList ', sensor_Data, measurement_Data)
    // } 
    // catch (error) {
    //   console.log(error)
    // } 
    // finally {
    //   setWaitResponse({ ...waitResponse, [key]: false })
    // }
  }

  const getCompSensorMeasurementData = async (comp_id) => {
    try {
      const comp_sensor_measuement_data = await post('/get_comp_sensor_measurement', { comp_id: comp_id });
      console.log('/get_comp_sensor_measurement ', comp_sensor_measuement_data);

      return comp_sensor_measuement_data;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  const toggleSettingsWindow = () => {
    setShowSettings(true);
  }

  const changeTextType = (inputText) => {
    if (inputText.includes("-")) {
      const words = inputText.split("-");
      const capitalizedWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
      return capitalizedWords.join(" "); // Join with spaces
    }
  }

  const renderComponentDetails = () => (
    <>
      <div>
        <Label>Component Name:</Label>
        <div className="mb-2">{componentDetails?.comp_name}</div>
      </div>
      <div>
        <Label>Component Code:</Label>
        <div className="mb-2">{componentDetails?.comp_code}</div>
      </div>
      <div className="mb-2">
      <Label>Mastered Data: </Label>
      { masterAvailable ? ( // componentDetails?.mastering_status == "completed"
          <div>
            <span>Available</span>
            <Button
              key="mastered_data"
              color="info"
              size="sm"
              onClick={() => {
                if(!waitResponse["mastered_data"]) {
                  getMasteredData("mastered_data")
                }
              }}
              style={{ marginLeft: '10px' }}
              disabled={sharedState.isMasterRunning || sharedState?.isCapturing}
            >
              <span className="d-flex align-items-center">
              {
                waitResponse["mastered_data"] ?
                <Spinner className="me-2" size="sm"/>
                : <FaInfo className="me-2"/>
              }
               {"Info"}
              </span>
            </Button>
          </div>
        ) : (
          <div>
            <span>Not Available</span>
          </div>
        )}
      </div>
      <div>
        <Label>Capture Master Data:</Label>
        <div className="mb-2">
          {changeTextType(settings?.inspectionType)}
        </div>
      </div>
      <div>
        <Button
          color="primary"
          size="md"
          onClick={() => {
            if(!(sharedState.isMasterRunning) && !sharedState?.isCapturing) {
              toggleSettingsWindow()
            }
          }}
          style={{ 
            cursor: !(sharedState.isMasterRunning) && !sharedState?.isCapturing ? 'pointer' : 'not-allowed', 
            opacity: !(sharedState.isMasterRunning) && !sharedState?.isCapturing ? 1 : 0.3
          }}
          // disabled={sharedState.isMasterRunning || !sensorConnected?.status}
        >
          <FaCog /><span className="ms-2">Settings</span>
        </Button>
      </div>
    </>
  );

  

  // prevent user navigation, refresh and page closing
  const handleBeforeUnload = (event) => {
    disconnectSensor();
    // Standard browser behavior for showing the confirmation dialog
    event.preventDefault();
    event.returnValue = ""; // This is required for modern browsers.
    return ""; // Required for some older browsers.
  };

  const disconnectSensor = async () => {
    try {
      const sensor = sensorRef.current; // Access the latest value
      if (sensor.status) {
        // // type used here for connecting sensors.
        // const type = sensor.sensorType || "sensorB";
        // const result = await executeSensorAction(type, "disconnect", {});
        
        // brand and model name used for connecting sensors.
        const brand_model_name = `${sensor.sensorInfo.brand_name}_${sensor.sensorInfo.model_name}`
        const result = await executeSensorAction(brand_model_name, "disconnect", {});

        // console.log(`Disconnect successful: ${JSON.stringify(result)}`);
        setSensorConnected({
          status: false,
          sensorName: "",
          sensorId: "",
        });
      }
    } catch (error) {
      console.log(`Error executing Disconnect: ${error.message}`);
    }
  };

  const navigateToCompInfo = async () => {
    if(sensorConnected?.status) {
      await Swal.fire({
        title: `Are You Sure?`,
        html: `<strong>${sensorConnected?.sensorName}</strong> will be disconnected.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          disconnectSensor();
          setSensorConnected({})
          history.push('/comp_admin'); 
        }
      });
      // return;
    } else {
      history.push('/comp_admin'); 
    }
  }

  // func for updating mastering status
  const updateComponentDetails = (obj) => {
    // setComponentDetails({})
    setMasterAvailable(obj)
    // setComponentDetails((prevCompData) => {
    //   return {
    //     ...prevCompData,
    //     mastering_status: obj
    //   }
    // })
  }

  return (
    <AppContext.Provider
      value={{
        selectedSensor,
        updateSelectedSensor,
        settings,
        setSettings,
        selectedKeys,
        setSelectedKeys,
        componentDetails,
        updateComponentDetails,
        rotationStatus,
        setRotationStatus,
        sensorConnected, 
        setConnectedSensor,
        masterAvailable,
        compSensorData,
      }}
    >
      <SocketProvider>
        <GraphRefContext.Provider value={graphRef}>
          <RegionsProvider>
            <MasteringContext.Provider value={{ sharedState, stopFunction, startFunction, startCapturing, stopCapturing }}>
              {
                openMasterInfo ? (
                  <MasteredDataInformation
                    open={openMasterInfo}
                    toggle={() => setOpenMasterInfo(false)} // Correct function reference
                    sensorData={sensorData}
                    measurementData={measurementData}
                  />
                ) : null
              }
              

              <Layout className="page-content scroll-design" style={{ minHeight: "100vh" }}>
                <MetaTags>
                  <title>Measurement Mastering Process | RunOut Admin</title>
                </MetaTags>
                <Breadcrumbs title="MEASUREMENT MASTERING PROCESS" isBackButtonEnable={!sharedState?.isMasterRunning && !sharedState?.isCapturing} gotoBack={navigateToCompInfo} />
                <Layout>
                  {
                    compinfoLoading ?
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '75vh' }}> {/* Center the spinner */}
                        <Spinner color="primary"  />
                        <h5 className="mt-3">
                          <strong>Loading component details...</strong>
                        </h5>
                      </div>
                    : 
                    <>
                        {
                          showSettings ?
                            <SettingsModal
                              open={showSettings}
                              // initialValues={settings}
                              onClose={closeSettingsModal}
                            />
                            : null
                        }
                        {/* Left Sidebar */}
                        <Sider width={250} style={{ background: "#fff" }}> {/* , padding: "10px" */}
                          <Card className="scroll-design" style={{ border: '1px solid #e9e9e9', maxHeight: '100vh', height: '100%', overflowY: 'auto' }}>
                            <CardBody>
                              {renderComponentDetails()}
                              <hr />
                              <SensorOperation />
                            </CardBody>
                          </Card>
                        </Sider>

                        <Sider width={300} style={{ background: "#fff" }}>
                          {
                            componentDetails?._id ?
                              <SensorSetup />
                              : null
                          }
                        </Sider>

                        <Content className="mx-1" style={{ background: "#fff" }}>
                          {/* <CountDownComp /> */}
                          {/* , padding: "20px"  */}
                          {/* <ChildComponent1 /> */}

                          {
                            componentDetails?._id ?
                              // selectedKeys?.length == 2 ?
                              <Card>
                                <CardBody>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="me-2">Graph Plotting</h5>
                                    {sensorConnected?.status ? (
                                      <div
                                        className="badge badge-soft-success"
                                        style={{    // Dark green text
                                          fontSize: "14px",
                                          fontWeight: "bold",
                                          padding: "0.5rem 1rem",
                                        }}
                                      >
                                        <span>Connected Sensor: </span>
                                        <span>{sensorConnected.sensorName}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                  <MasteringStatus />
                                  <GraphPlotting ref={graphRef} />
                                </CardBody>
                              </Card>
                              // : null
                              : null
                          }
                        </Content>
                    </>
                  }
                  

                  
                </Layout>
              </Layout>
            </MasteringContext.Provider>
          </RegionsProvider>
        </GraphRefContext.Provider>
      </SocketProvider>
    </AppContext.Provider>

    
  );
};

MultiMeasurement.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
const mapStateToProps = state => {
  const { layoutType, showRightSidebar } = state.Layout;
  return { layoutType, showRightSidebar };
}

export default connect(mapStateToProps)(MultiMeasurement);
