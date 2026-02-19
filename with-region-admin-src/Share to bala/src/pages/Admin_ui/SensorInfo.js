import React, { useState, useEffect } from "react";
import { Button, Row, Col, Modal, Input, Switch, Typography, Select, Form } from "antd";
import { PlusOutlined, UnorderedListOutlined, AppstoreOutlined } from "@ant-design/icons";
import SensorList from "./SensorList";
import urlSocket from "pages/AdminInspection/urlSocket";
import { post } from "./services/apiService";
import { executeSensorAction } from "./services/sensorApi";
import { toastSuccess } from "./customToast";
import NoData from "assets/images/nodata/nodata_admin.jpg";
import Swal from "sweetalert2";
import { Spinner } from "reactstrap";

const { Title } = Typography;
const { Option } = Select;
const SensorInfo = () => {
  const [sensors, setSensors] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentSensor, setCurrentSensor] = useState({});
  const [newSensor, setNewSensor] = useState({});
  const [sensorData, setSensorData] = useState({});
  const [multisensor, setmultisensor] = useState([])
  const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newType, setNewType] = useState("");
  const [errors, setErrors] = useState({});
  const [isConnectionSuccessful, setIsConnectionSuccessful] = useState(false);
  const [connectionText, setConnectionText] = useState("");
  const [textColor, setTextColor] = useState("black");

  const [sensorchanges, setSensorChanges] = useState(true);

  const [sensorInfoLoading, setSensorInfoLoading] = useState(true);


  useEffect(() => {
    if (!isModalVisible) {
      setErrors({});
    }
  }, [isModalVisible]);
  
  
  useEffect(() => {
    const name = modalType === "add" ? newSensor.name : currentSensor.name;
    setNewSensor((prev) => ({ ...prev, type: sensorData[name]?.length === 1 ? sensorData[name][0] : "" }));
  }, [newSensor.name, currentSensor.name, modalType]);
  console.log(newSensor, "newSensorduhfguidfhgui");
  
  
  useEffect(() => {
    getSensorsAvailableBrandsModels();
  }, []);

  
  useEffect(() => {
    if (modalType === "edit" && currentSensor) {
      setNewSensor(currentSensor);
    } else {
      setNewSensor({});
    }
  }, [modalType, currentSensor]);

  const getSensorsAvailableBrandsModels = async () => {
    try {
      const response = await post("/sensors/available_brands_models");
      console.log("/sensors/available_brands_models ", response);

      // assigning available sensors
      setSensors(response.sensors)  // response.sensors
      const brandMapping = {};
      response.sensors.forEach((sensor) => {
        if (!brandMapping[sensor.name]) {
          brandMapping[sensor.name] = [];
        }
        if (sensor.type && !brandMapping[sensor.name].includes(sensor.type)) {
          brandMapping[sensor.name].push(sensor.type);
        }
      });
      setSensorData(brandMapping);
      
      // assigning brand models
      setmultisensor(response.brands_models);


    } catch (error) {
      console.error("Error /sensors/available_brands_models ", error);
    } finally {
      setSensorInfoLoading(false);
    }
    // await getBrandModel();
    // await sensorInfo();
  }

  const handleModalVisibility = (type, sensor = {}) => {
    console.log('sensor69', sensor)
    setModalType(type);
    setIsModalVisible(true);
    // setNewType(sensor.type)
    type === "edit" ? setCurrentSensor(sensor) : setNewSensor({});
  };

  const updateSensorState = (field, value) => {
    if (field === "ip_address") {
      const isValid = validateIPAddress(value);
      setErrors((prev) => ({
        ...prev,
        ip_address: isValid ? "" : "Invalid IP address",
      }));
    }

    if (field === "port_number") {
      const isValid = validatePortNumber(value);
      setErrors((prev) => ({
        ...prev,
        port_number: isValid ? "" : "Port number must be between 1 and 65535",
      }));
    }

    if (field === "name") {
      const isValid = value.trim().length > 0;
      setErrors((prev) => ({
        ...prev,
        name: isValid ? "" : "Sensor Name is required.",
      }));
      setNewSensor((prev) => ({ ...prev, [field]: value }));
    }

    if (modalType === "add") {
      setNewSensor((prev) => ({ ...prev, [field]: value }));
    } else {
      setCurrentSensor((prev) => ({ ...prev, [field]: value }));
    }
  };

  const checkSensorAction = async (sensorType, action, payload = {}) => {
    console.log(`Executing checkSensorAction with sensorType: ${sensorType}, action: ${action}, payload:`, payload);

    try {
      const result = await executeSensorAction(sensorType, action, payload);
      console.log(`Connection successful: ${JSON.stringify(result)}`);

      // Optionally check the result structure for more validation
      if (result && result.success) {
        return true;
      } else {
        console.log("Connection failed: Unexpected response structure", result);
        return false;
      }
    } catch (error) {
      console.log("Error executing Connection:", error.response || error.message);
      return false;
    }
  };
  
  const toggleNotification = (type, message) => {
    Modal[type === "Success" ? "success" : "error"]({
      title: type,
      content: message,
    });
  };
  
  const handleAddSensor = async () => {
    // Sanitize and validate input
    newSensor.name = newSensor.name.trim().toLowerCase();
    newSensor.ip_address = newSensor.ip_address.trim();
    newSensor.port_number = newSensor.port_number ? newSensor.port_number.trim() : "";

    if (errors.ip_address || errors.port_number || !newSensor.name || !newSensor.brand_name || !newSensor.model_name) {
      console.error("Validation failed");
      return;
    }

    if (!validateIPAddress(newSensor.ip_address)) {
      console.error("Invalid IP Address");
      return;
    }
    const newId = sensors.length ? sensors[sensors.length - 1].id + 1 : 1;

    setSensorChanges(false)

    const sensor = {
      name: newSensor.name,
      model_name: newSensor.model_name,
      id: newId,
      brand_name: newSensor.brand_name,
      ip_address: newSensor.ip_address,
      port_number: newSensor.port_number,
    };

    try {
      const response = await urlSocket.post(
        "/addSensorData",
        { sensor },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Response data:", response.data);

      setSensors(response.data.sensor);
      toastSuccess("Sensor added successfully", "", 3000)
    }
    catch (error) {
      console.error("Error adding sensor:", error.message);
    }
    finally {
      setSensorChanges(true)
    }

    const BRAND_MODEL = `${newSensor.brand_name}_${newSensor.model_name}`
    checkSensorAction(BRAND_MODEL, "disconnect");

    setIsModalVisible(false);
  };
  
  const handleUpdateSensor = async () => {

    if (!validateIPAddress(currentSensor.ip_address)) {
      console.error("Invalid IP Address");
      setErrors({ ip_address: "Invalid IP Address" });
      return;
    }

    console.log('currentSensor before update:', currentSensor);
    console.log('currentSensor', currentSensor)
    try {
      const response = await urlSocket.post(
        "/updateSensorData",
        { currentSensor },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("Response data:", response.data.sensor);
      setSensors(response.data.sensor);
      toastSuccess("Updated Successfully", "", 3000)
      const brandMapping = {};
      response.data.sensor.forEach((sensor) => {
        if (!brandMapping[sensor.name]) {
          brandMapping[sensor.name] = [];
        }
        if (sensor.type && !brandMapping[sensor.name].includes(sensor.type)) {
          brandMapping[sensor.name].push(sensor.type);
        }
      });
      setSensorData(brandMapping);
    } catch (error) {
      console.error("Error adding or updating sensor:", error.message);
    }

    const BRAND_MODEL = `${currentSensor.brand_name}_${currentSensor.model_name}`
    checkSensorAction(BRAND_MODEL, "disconnect");

    setIsModalVisible(false);
  };
  
  const handleDeleteSensor = async (id) => {
    const delsensor = sensors.filter((sensor) => sensor.id === id);
    console.log("delsensor", delsensor);
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this sensor from the sensor list?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed) {
      try {
        const response = await urlSocket.post(
          "/deleteSensorData",
          { currentSensor: delsensor[0] },
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log("Response data:", response.data);
        setSensors(response.data.sensor);


        const brandMapping = {};
        response.data.sensor.forEach((sensor) => {
          if (!brandMapping[sensor.name]) {
            brandMapping[sensor.name] = [];
          }
          if (sensor.type && !brandMapping[sensor.name].includes(sensor.type)) {
            brandMapping[sensor.name].push(sensor.type);
          }
        });
        setSensorData(brandMapping);
        Swal.fire({
          title: "Deleted!",
          text: "The sensor has been deleted.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error deleting sensor:", error.message);


        Swal.fire({
          title: "Error!",
          text: "An error occurred while deleting the sensor.",
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } else {

      Swal.fire({
        title: "Cancelled",
        text: "The sensor was not deleted.",
        icon: "info",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };
  
  const handleBrandChange = (brand_name, modalType) => {
    const selectedBrand = multisensor.find(sensor => sensor.brand_name === brand_name);
    console.log("Selected Brand:", selectedBrand);

    const defaultModel = selectedBrand?.models[0]?.modelName || ""; // Default model name
    const defaultType = selectedBrand?.models[0]?.type || ""; // Default type for the model

    setErrors((prevErrors) => ({
      ...prevErrors,
      brand_name: "", // Clear the error for brand_name
    }));

    if (modalType === "add") {
      setNewSensor(prev => ({
        ...prev,
        brand_name,
        model_name: defaultModel,
        type: defaultType,
      }));
    } else {
      setCurrentSensor(prev => ({
        ...prev,
        brand_name,
        model_name: defaultModel,
        type: defaultType,
      }));
    }

    console.log("Updated Sensor State:", modalType === "add" ? newSensor : currentSensor);
  };
  
  const handleModelChange = (modelName, modalType) => {
    const selectedBrand = modalType === "add" ? newSensor.brand_name : currentSensor.brand_name;

    const modelType = multisensor
      .find(sensor => sensor.brand_name === selectedBrand)
      ?.models.find(model => model.modelName === modelName)?.type || "";

    console.log("Model Name:", modelName, "Type:", modelType);

    if (modalType === "add") {
      setNewSensor(prev => ({
        ...prev,
        model_name: modelName,
        type: modelType, // Update the type based on the selected model
      }));
    } else {
      setCurrentSensor(prev => ({
        ...prev,
        model_name: modelName,
        type: modelType, // Update the type based on the selected model
      }));
    }
  };
  
  const handleAddBrandAndType = () => {
    if (newBrand && newType) {
      setSensorData((prev) => ({
        ...prev,
        [newBrand]: [...(prev[newBrand] || []), newType],
      }));
      setNewBrand("");
      setNewType("");
      setIsBrandModalVisible(false);
    }
  };
  
  const validateIPAddress = (ip) => {
    console.log(ip, "IP Address to Validate");

    if (typeof ip !== "string" || ip.trim() === "") {
      return false;
    }

    const trimmedIp = ip.trim();

    if (/[^0-9.]/.test(trimmedIp)) {
      return false;
    }

    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    return ipRegex.test(trimmedIp);
  };
  
  const validatePortNumber = (port) => {
    const portNum = Number(port);
    return portNum >= 1 && portNum <= 65535;
  };
  
  const validateInputs = () => {
    const newErrors = {};
    const sensorToValidate = modalType === "add" ? newSensor : currentSensor;

    // Check if sensorToValidate is defined
    if (!sensorToValidate) {
      console.error("No sensor data available for validation.");
      return false;
    }

    if (!sensorToValidate.name || !sensorToValidate.name.trim()) {
      newErrors.name = "Sensor Name is required.";
    }

    if (!sensorToValidate.brand_name || !sensorToValidate.brand_name.trim()) {
      newErrors.brand_name = "Brand is required.";
    }

    if (!sensorToValidate.model_name || !sensorToValidate.model_name.trim()) {
      newErrors.model_name = "Model is required.";
    }

    if (!sensorToValidate.ip_address || !sensorToValidate.ip_address.trim()) {
      newErrors.ip_address = "IP Address is required.";
    } else if (!validateIPAddress(sensorToValidate.ip_address)) {
      newErrors.ip_address = "Invalid IP Address.";
    }

    if (sensorToValidate?.brand_name && sensorToValidate?.brand_name !== "ScanControl") {
      if (!sensorToValidate.port_number || !sensorToValidate.port_number.trim()) {
        newErrors.port_number = "Port Number is required.";
      } else if (!validatePortNumber(sensorToValidate.port_number)) {
        newErrors.port_number = "Port Number must be between 1 and 65535.";
      }
    }
    const isNameExists = sensors.some(
      (sensor) =>
        sensor.name?.trim().toLowerCase() ===
        sensorToValidate.name?.trim().toLowerCase() &&
        sensor._id !== sensorToValidate._id
    );
    if (isNameExists) {
      newErrors.name = "Sensor Name already exists.";
    }
    const isIPExists = sensors.some(
      (sensor) =>
        sensor.ip_address?.trim() === sensorToValidate.ip_address?.trim() &&
        sensor._id !== sensorToValidate._id
    );
    if (isIPExists) {
      newErrors.ip_address = "IP Address already exists.";
    }
    const isPortExists = sensors.some(
      (sensor) =>
        sensor.port_number?.trim() === sensorToValidate.port_number?.trim() &&
        sensor._id !== sensorToValidate._id
    );
    if (isPortExists) {
      newErrors.port_number = "Port Number already exists.";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  
  const handleOk = () => {
    setErrors({});
    const isValid = validateInputs();
    if (!isValid) {
      console.error("Validation failed, cannot proceed");
      return;
    }
    if (modalType === "add") {
      handleAddSensor();
    } else {
      handleUpdateSensor();
    }
  };
  
  return (
    <div className="page-content">
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>

        <Title level={4}>Sensor Information</Title>
        <Button.Group>
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => setViewMode("grid")}
            type={viewMode === "grid" ? "primary" : "default"}
          >
            Grid View
          </Button>
          <Button
            icon={<UnorderedListOutlined />}
            onClick={() => setViewMode("list")}
            type={viewMode === "list" ? "primary" : "default"}
          >
            List View
          </Button>
          <Button type="primary" onClick={() => handleModalVisibility("add")}>
            <PlusOutlined /> Add Sensor
          </Button>
        </Button.Group>
      </Row>
      <div style={{ backgroundColor: 'white' }}>
        {
          sensorInfoLoading ?
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '75vh' }}> {/* Center the spinner */}
              <Spinner color="primary" />
              <h5 className="mt-3">
                <strong>Loading sensor details...</strong>
              </h5>
            </div>
            : 
            sensors?.length > 0 ?
              <SensorList
                sensors={sensors}
                viewMode={viewMode}
                onDelete={handleDeleteSensor}
                onEdit={sensor => handleModalVisibility("edit", sensor)}
              />
              :
              <div className="container" style={{ position: 'relative', minHeight: window.innerHeight }}>
                <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
                  <img src={NoData} className="img-sm h-auto" style={{ width: '20%' }} />
                  <h5 className="text-secondary">No Data Available</h5>
                </div>
              </div>
          }
      </div>



      <Modal
        title={modalType === "add" ? "Add New Sensor" : "Edit Sensor"}
        visible={isModalVisible}
        onOk={handleOk}
        // onCancel={() => setIsModalVisible(false)}
        onCancel={() => {
          if (isConnectionSuccessful) {
            const BRAND_MODEL = `${newSensor.brand_name}_${newSensor.model_name}`;
            checkSensorAction(BRAND_MODEL, "disconnect");
          }
          setIsModalVisible(false);
        }}
        okButtonProps={{ disabled: !isConnectionSuccessful || !sensorchanges }}
        afterClose={() => {
          setIsConnectionSuccessful(false);
          setConnectionText("");
          setTextColor("black");
        }}
      >
        {console.log(modalType, "modalType")}
        {/* Sensor Name */}
        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="sensorName"
            style={{ display: "block", marginBottom: 5 }}
          >
            Sensor Name:
          </label>

          <Input
            id="sensorName"
            placeholder="Enter Sensor Name"
            value={
              modalType === "add"
                ? newSensor.name || ""
                : currentSensor.name || ""
            }
            onChange={e => updateSensorState("name", e.target.value)}
            disabled={isConnectionSuccessful && !errors.name}
          />

          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="sensorBrand"
            style={{ display: "block", marginBottom: 5 }}
          >
            Brand:
          </label>
          <Select
            id="sensorBrand"
            placeholder="Select Sensor Brand"
            value={
              modalType === "add"
                ? newSensor.brand_name || ""
                : currentSensor.brand_name || ""
            }
            onChange={value => handleBrandChange(value, modalType)} // Pass modalType here
            disabled={isConnectionSuccessful && !errors.brand_name}
            style={{ width: "100%" }}
          >
            {multisensor.map((sensor, index) => (
              <Option key={index} value={sensor.brand_name}>
                {sensor.brand_name}
              </Option>
            ))}
          </Select>
          {errors.brand_name && (
            <p style={{ color: "red" }}>{errors.brand_name}</p>
          )}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="sensorModel"
            style={{ display: "block", marginBottom: 5 }}
          >
            Model:
          </label>
          <Select
            id="sensorModel"
            placeholder="Select Sensor Model"
            value={
              modalType === "add"
                ? newSensor.model_name || ""
                : currentSensor.model_name || ""
            }
            onChange={modelName => handleModelChange(modelName, modalType)} // Pass modalType here
            disabled={isConnectionSuccessful && !errors.model_name}
            style={{ width: "100%" }}
          >
            {multisensor
              .find(
                sensor =>
                  sensor.brand_name ===
                  (modalType === "add"
                    ? newSensor.brand_name
                    : currentSensor.brand_name)
              )
              ?.models.map((model, index) => (
                <Option key={index} value={model.modelName}>
                  {model.modelName}
                </Option>
              ))}
          </Select>
        </div>

        {/* IP Address */}
        <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="ip_address"
            style={{ display: "block", marginBottom: 5 }}
          >
            IP Address:
          </label>
          <Input
            id="ip_address"
            placeholder="Enter IP Address"
            value={
              modalType === "add"
                ? newSensor.ip_address || ""
                : currentSensor.ip_address || ""
            }
            onChange={e => updateSensorState("ip_address", e.target.value)}
            disabled={isConnectionSuccessful && !errors.ip_address}
          />
          {errors.ip_address && (
            <p style={{ color: "red" }}>{errors.ip_address}</p>
          )}
        </div>

        {/* Port Number */}
        {/* <div style={{ marginBottom: 10 }}>
          <label
            htmlFor="port_number"
            style={{ display: "block", marginBottom: 5 }}
          >
            Port Number:
          </label>
          <Input
            id="port_number"
            type="number"
            placeholder="Enter Port Number"
            value={
              modalType === "add"
                ? newSensor.port_number || ""
                : currentSensor.port_number || ""
            }
            onChange={e => updateSensorState("port_number", e.target.value)}
            disabled={isConnectionSuccessful && !errors.port_number}
          />
          
          {errors.port_number && (
            <p style={{ color: "red" }}>{errors.port_number}</p>
          )}
        </div> */}
        {newSensor.brand_name !== "ScanControl" && (
          <div style={{ marginBottom: 10 }}>
            <label
              htmlFor="port_number"
              style={{ display: "block", marginBottom: 5 }}
            >
              Port Number:
            </label>
            <Input
              id="port_number"
              type="number"
              placeholder="Enter Port Number"
              value={
                modalType === "add"
                  ? newSensor.port_number || ""
                  : currentSensor.port_number || ""
              }
              onChange={e => updateSensorState("port_number", e.target.value)}
              disabled={isConnectionSuccessful && !errors.port_number}
            />
            {errors.port_number && (
              <p style={{ color: "red" }}>{errors.port_number}</p>
            )}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          {!isConnectionSuccessful ? (
            <Button
              type="primary"
              onClick={async () => {
                const isValid = validateInputs(); // Validate the inputs

                if (!isValid) {
                  console.log('validation failed')
                  return;
                }

                const BRAND_MODEL =
                  modalType === "add"
                    ? `${newSensor.brand_name}_${newSensor.model_name}`
                    : `${currentSensor.brand_name}_${currentSensor.model_name}`;

                console.log("multisensor ", multisensor, BRAND_MODEL);

                // Construct payload conditionally
                const payloadConnect = {
                  ip_address: newSensor.ip_address,
                  ...(newSensor.brand_name !== "ScanControl" && {
                    port_number: newSensor.port_number,
                  }),
                };

                const able_to_connect = await checkSensorAction(
                  BRAND_MODEL,
                  "connect",
                  payloadConnect
                );

                if (able_to_connect) {
                  setIsConnectionSuccessful(true);
                  setConnectionText("Sensor Connected");
                  setTextColor("green");
                } else {
                  toggleNotification(
                    "Error",
                    "Unable to connect to the sensor. Ensure that the selected brand name and model name match the IP address."
                  );
                  setIsConnectionSuccessful(false);
                  setConnectionText("");
                }
              }}
            >
              Check Connection
            </Button>
          ) : (
            <Input
              value={connectionText}
              style={{ color: textColor }}
              disabled
            />
          )}
        </div>
      </Modal>

      <Modal
        title="Add New Sensor Brand and Type"
        visible={isBrandModalVisible}
        onCancel={() => setIsBrandModalVisible(false)}
        onOk={handleAddBrandAndType}
        okText="Add"
        cancelText="Cancel"
      >
        <Form layout="vertical">
          <Form.Item label="Brand Name">
            <Input
              placeholder="Enter Brand Name"
              value={newBrand}
              onChange={e => setNewBrand(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Sensor Type">
            <Input
              placeholder="Enter Sensor Type"
              value={newType}
              onChange={e => setNewType(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SensorInfo;

// import React, { useState, useEffect } from "react";
// import { Button, Row, Col, Modal, Input, Switch, Typography, Select, Form } from "antd";
// import { PlusOutlined, UnorderedListOutlined, AppstoreOutlined } from "@ant-design/icons";
// import SensorList from "./SensorList";
// import urlSocket from "pages/AdminInspection/urlSocket";
// import { post } from "./services/apiService";
// import { executeSensorAction } from "./services/sensorApi";
// import { toastSuccess } from "./customToast";
// import Swal from "sweetalert2";


// const { Title } = Typography;
// const { Option } = Select;

// const SensorInfo = () => {
//   const [sensors, setSensors] = useState([]);
//   const [viewMode, setViewMode] = useState("grid");
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [modalType, setModalType] = useState("");
//   const [currentSensor, setCurrentSensor] = useState({});
//   const [newSensor, setNewSensor] = useState({});
//   const [sensorData, setSensorData] = useState({});
//   const[multisensor,setmultisensor]=useState([])
//   const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
//   const [newBrand, setNewBrand] = useState("");
//   const [newType, setNewType] = useState("");
//   const [addOrUpdateSensor, setaddOrUpdateSensor] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isConnectionSuccessful, setIsConnectionSuccessful] = useState(false);
//   const [connectionText, setConnectionText] = useState("");
//   const [textColor, setTextColor] = useState("black"); 


//   useEffect(() => {
//     // Reset errors when the modal is closed
//     if (!isModalVisible) {
//       setErrors({});
//     }
//   }, [isModalVisible]);
 

//   useEffect(() => {
//     const name = modalType === "add" ?newSensor.name:currentSensor.name;
//     setNewSensor((prev) => ({ ...prev, type: sensorData[name]?.length === 1 ? sensorData[name][0] : "" }));
//   }, [newSensor.name, currentSensor.name, modalType]);
//   console.log(newSensor,"newSensorduhfguidfhgui")

//   useEffect(() => {
   
//     getBrandModel();
//     sensorInfo();
//   }, []);

//   useEffect(() => {
//     if (modalType === "edit" && currentSensor) {
//       setNewSensor(currentSensor);
//     } else {
//       setNewSensor({}); 
//     }
//   }, [modalType, currentSensor]);
  

//   const sensorInfo = async () => {
//     try {
//       const response = await urlSocket.post(
//         "/getSensorList",// Request payload
//         {
//           headers: { "Content-Type": "application/json" }, // Proper content type
//         }
//       );
//       console.log("Response data:", response.data);
//       setSensors(response.data.sensor)
//       const brandMapping = {};
//       response.data.sensor.forEach((sensor) => {
//         if (!brandMapping[sensor.name]) {
//           brandMapping[sensor.name] = [];
//         }
//         if (sensor.type && !brandMapping[sensor.name].includes(sensor.type)) {
//           brandMapping[sensor.name].push(sensor.type);
//         }
//       });
//       setSensorData(brandMapping);
//     } catch (error) {
//       console.error("Error adding or updating sensor:", error.message);
//     }
//   };

//   const handleModalVisibility = (type, sensor = {}) => {
//     console.log('sensor69', sensor)
//     setModalType(type);
//     setIsModalVisible(true);
//     // setNewType(sensor.type)
//     type === "edit" ? setCurrentSensor(sensor) : setNewSensor({});
//   };


//   const getBrandModel = async () => {
//     try {
//       const data = await post("/get_brand_model");
//       console.log("sensor Brand Model:", data);
//       setmultisensor(data)
      
//     } catch (error) {
//       console.error("Error creating data:", error);
//     }
//   };

  

//   const updateSensorState = (field, value) => {
//     if (field === "ip_address") {
//       const isValid = validateIPAddress(value);
//       setErrors((prev) => ({
//         ...prev,
//         ip_address: isValid ? "" : "Invalid IP address",
//       }));
//     }
  
//     if (field === "port_number") {
//       const isValid = validatePortNumber(value);
//       setErrors((prev) => ({
//         ...prev,
//         port_number: isValid ? "" : "Port number must be between 1 and 65535",
//       }));
//     }
  
//     if (field === "name") {
//       const isValid = value.trim().length > 0;
//     setErrors((prev) => ({
//       ...prev,
//       name: isValid ? "" : "Sensor Name is required.",
//     }));
//       setNewSensor((prev) => ({ ...prev, [field]: value }));
//     }
  
//     if (modalType === "add") {
//       setNewSensor((prev) => ({ ...prev, [field]: value }));
//     } else {
//       setCurrentSensor((prev) => ({ ...prev, [field]: value }));
//     }
//   };


//   const checkSensorAction = async (sensorType, action, payload={}) => {
//     try {
//       const result = await executeSensorAction(sensorType, action, payload);
//       console.log(`Connection successful: ${JSON.stringify(result)}`);
//       return true;
//     } catch (error) {
//       console.log(`Error executing Connection: ${error.message}`);
//       return false;
//     }
//   }
  
//   const toggleNotification = (type, message) => {
//     Modal[type === "Success" ? "success" : "error"]({
//       title: type,
//       content: message,
//     });
//   };
  
  
  
  
//   // const handleAddSensor = async () => {
//   //   newSensor.name = newSensor.name.trim().toLowerCase();
//   //   newSensor.ip_address = newSensor.ip_address.trim();
//   //   newSensor.port_number = newSensor.port_number.trim();
//   //   if (errors.ip_address || errors.port_number || !newSensor.name || !newSensor.brand_name || !newSensor.model_name) {
//   //     console.error("Validation failed");
  
//   //     return;
//   //   }

//   //   if (!validateIPAddress(newSensor.ip_address)) {
//   //     console.error("Invalid IP Address");
    
//   //     return; 
//   //   }
//   //   const modelType = multisensor
//   //   .find(sensor => sensor.brand_name === newSensor.brand_name)
//   //   ?.models.find(model => model.modelName === newSensor.model_name)?.type || "Type not found";

  
//   //   const newId = sensors.length ? sensors[sensors.length - 1].id + 1 : 1;
//   //   const sensor = {
//   //     name: newSensor.name,
//   //     model_name: newSensor.model_name,
//   //     id: newId,
//   //     type:modelType,
//   //     brand_name: newSensor.brand_name,
//   //     ip_address: newSensor.ip_address,
//   //     port_number: newSensor.port_number,
//   //   };
  
//   //   console.log(newSensor.name, "ghjkfsgdf",modelType);


  
//   //   try {
//   //     const response = await urlSocket.post(
//   //       "/addSensorData",
//   //       { sensor },
//   //       {
//   //         headers: { "Content-Type": "application/json" },
//   //       }
//   //     );
//   //     console.log("Response data:", response.data);
//   //     setSensors(response.data.sensor); // Update sensors state with new data
//   //     toggleNotification("Success", "Sensor added successfully.");
//   //   } catch (error) {
//   //     console.error("Error adding sensor:", error.message);
//   //     if(error.response && error.response.data.error){
//   //     toggleNotification("Error", error.response.data.error);
//   //     }
//   //     else{
//   //       toggleNotification(
//   //         "Error",
//   //         "Failed to add the sensor. Please try again."
//   //       );
//   //     }
//   //   }
  
//   //   setIsModalVisible(false); // Close modal after adding

//   //   checkSensorAction(modelType, "disconnect")
//   // };
  
//   const handleAddSensor = async () => {
//     // Sanitize and validate input
//     newSensor.name = newSensor.name.trim().toLowerCase();
//     newSensor.ip_address = newSensor.ip_address.trim();
//     newSensor.port_number = newSensor.port_number.trim();
  
//     if (errors.ip_address || errors.port_number || !newSensor.name || !newSensor.brand_name || !newSensor.model_name) {
//       console.error("Validation failed");
//       return;
//     }
  
//     if (!validateIPAddress(newSensor.ip_address)) {
//       console.error("Invalid IP Address");
//       return; 
//     }
  
//     // using type for connect the sensor
//     // const modelType = multisensor
//     //   .find(sensor => sensor.brand_name === newSensor.brand_name)
//     //   ?.models.find(model => model.modelName === newSensor.model_name)?.type || "Type not found";

//     // using brand and model name to connect the sensor
//     // const modelType = modalType === "add" ? `${newSensor.brand_name}_${newSensor.model_name}` : `${currentSensor.brand_name}_${currentSensor.model_name}`;
  
//     const newId = sensors.length ? sensors[sensors.length - 1].id + 1 : 1;
//     const sensor = {
//       name: newSensor.name,
//       model_name: newSensor.model_name,
//       id: newId,
//       brand_name: newSensor.brand_name,
//       ip_address: newSensor.ip_address,
//       port_number: newSensor.port_number,
//     };
  
//     try {
//       const response = await urlSocket.post(
//         "/addSensorData",
//         { sensor },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       console.log("Response data:", response.data);
  
//       // If the sensor is successfully added, update the sensors state
//       setSensors(response.data.sensor);
//       // toggleNotification("Success", "Sensor added successfully.");
//       toastSuccess("Sensor added successfully", "", 3000)
//     } catch (error) {
//       console.error("Error adding sensor:", error.message);
//     }
  
//     const BRAND_MODEL = `${newSensor.brand_name}_${newSensor.model_name}`
//     // Perform any additional actions like disconnecting the sensor if needed
//     checkSensorAction(BRAND_MODEL, "disconnect");
  
//     // Close modal after adding
//     setIsModalVisible(false);
//   };
  

//   const handleUpdateSensor = async () => {

//     if (!validateIPAddress(currentSensor.ip_address)) {
//       console.error("Invalid IP Address");
//       setErrors({ ip_address: "Invalid IP Address" }); 
//       return;
//     }
  
//     console.log('currentSensor before update:', currentSensor);
//     console.log('currentSensor', currentSensor)
//     try {
//       const response =  await urlSocket.post(
//         "/updateSensorData",
//         {currentSensor},
//         {
//           headers: { "Content-Type": "application/json" }, 
//         }
//       );
//       console.log("Response data:", response.data.sensor);
//       setSensors(response.data.sensor);
//       toastSuccess("Updated Successfully", "", 3000)
//       const brandMapping = {};
//         response.data.sensor.forEach((sensor) => {
//           if (!brandMapping[sensor.name]) {
//             brandMapping[sensor.name] = [];
//           }
//           if (sensor.type && !brandMapping[sensor.name].includes(sensor.type)) {
//             brandMapping[sensor.name].push(sensor.type);
//           }
//         });
//         setSensorData(brandMapping);
//     } catch (error) {
//       console.error("Error adding or updating sensor:", error.message);
//     }

//     // using type to connect the sensor
//     // checkSensorAction(currentSensor.type, "disconnect");

//     // using brand and model to connect the sensor
//     const BRAND_MODEL = `${currentSensor.brand_name}_${currentSensor.model_name}`
//     checkSensorAction(BRAND_MODEL, "disconnect");
  
//     setIsModalVisible(false);
//   };


//   const handleDeleteSensor = async (id) => {

//     const delsensor = sensors.filter((sensor) => sensor.id === id);
//     console.log("delsensor", delsensor);


//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "Do you really want to delete this sensor from the sensor list?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     });


//     if (result.isConfirmed) {
//       try {
//         const response = await urlSocket.post(
//           "/deleteSensorData",
//           { currentSensor: delsensor[0] },
//           {
//             headers: { "Content-Type": "application/json" },
//           }
//         );
//         console.log("Response data:", response.data);
//         setSensors(response.data.sensor);


//         const brandMapping = {};
//         response.data.sensor.forEach((sensor) => {
//           if (!brandMapping[sensor.name]) {
//             brandMapping[sensor.name] = [];
//           }
//           if (sensor.type && !brandMapping[sensor.name].includes(sensor.type)) {
//             brandMapping[sensor.name].push(sensor.type);
//           }
//         });
//         setSensorData(brandMapping);


//         Swal.fire({
//           title: "Deleted!",
//           text: "The sensor has been deleted.",
//           icon: "success",
//           timer: 2000,
//           showConfirmButton: false,
//         });
//       } catch (error) {
//         console.error("Error deleting sensor:", error.message);


//         Swal.fire({
//           title: "Error!",
//           text: "An error occurred while deleting the sensor.",
//           icon: "error",
//           timer: 3000,
//           showConfirmButton: false,
//         });
//       }
//     } else {

//       Swal.fire({
//         title: "Cancelled",
//         text: "The sensor was not deleted.",
//         icon: "info",
//         timer: 2000,
//         showConfirmButton: false,
//       });
//     }
//   };

  
  
  

  
//   const handleBrandChange = (brand_name, modalType) => {
//     const selectedBrand = multisensor.find(sensor => sensor.brand_name === brand_name);
//     console.log("Selected Brand:", selectedBrand);
  
//     const defaultModel = selectedBrand?.models[0]?.modelName || ""; // Default model name
//     const defaultType = selectedBrand?.models[0]?.type || ""; // Default type for the model

//     setErrors((prevErrors) => ({
//       ...prevErrors,
//       brand_name: "", // Clear the error for brand_name
//     }));
  
//     if (modalType === "add") {
//       setNewSensor(prev => ({
//         ...prev,
//         brand_name,
//         model_name: defaultModel, // Set the default model for the new brand
//         type: defaultType, // Set the corresponding type for the default model
//       }));
//     } else {
//       setCurrentSensor(prev => ({
//         ...prev,
//         brand_name,
//         model_name: defaultModel, // Set the default model for the selected brand
//         type: defaultType, // Set the corresponding type for the default model
//       }));
//     }
  
//     console.log("Updated Sensor State:", modalType === "add" ? newSensor : currentSensor);
//   };
//   const handleModelChange = (modelName, modalType) => {
//     const selectedBrand = modalType === "add" ? newSensor.brand_name : currentSensor.brand_name;
  
//     // Find the type of the selected model
//     const modelType = multisensor
//       .find(sensor => sensor.brand_name === selectedBrand)
//       ?.models.find(model => model.modelName === modelName)?.type || "";
  
//     console.log("Model Name:", modelName, "Type:", modelType);
  
//     if (modalType === "add") {
//       setNewSensor(prev => ({
//         ...prev,
//         model_name: modelName,
//         type: modelType, // Update the type based on the selected model
//       }));
//     } else {
//       setCurrentSensor(prev => ({
//         ...prev,
//         model_name: modelName,
//         type: modelType, // Update the type based on the selected model
//       }));
//     }
//   };
  
  
//   const handleAddBrandAndType = () => {
//     if (newBrand && newType) {
//       setSensorData((prev) => ({
//         ...prev,
//         [newBrand]: [...(prev[newBrand] || []), newType],
//       }));
//       setNewBrand("");
//       setNewType("");
//       setIsBrandModalVisible(false);
//     }
//   };
//   const validateIPAddress = (ip) => {
//     console.log(ip, "IP Address to Validate");
  
//     if (typeof ip !== "string" || ip.trim() === "") {
//       return false;
//     }
  
//     const trimmedIp = ip.trim();
  
//     if (/[^0-9.]/.test(trimmedIp)) {
//       return false;  
//     }
  
//     const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
//     return ipRegex.test(trimmedIp);
//   };
  
  
  
  
  
//   const validatePortNumber = (port) => {
//     const portNum = Number(port);
//     return portNum >= 1 && portNum <= 65535;
//   };

//   // const validateInputs = () => {
//   //   const newErrors = {};
//   //   const sensorToValidate = modalType === "add" ? newSensor : currentSensor;

//   //   if (!sensorToValidate.name?.trim()) {
//   //     newErrors.name = "Sensor Name is required.";
//   //   }
    
   
//   //   if (!sensorToValidate.brand_name?.trim()) {
//   //     newErrors.brand_name = "Brand is required.";
//   //   }

//   //   if (!sensorToValidate.model_name?.trim()) {
//   //     newErrors.model_name = "Model is required.";
//   //   }

//   //   if (!sensorToValidate.ip_address?.trim()) {
//   //     newErrors.ip_address = "IP Address is required.";
//   //   } else if (!validateIPAddress(sensorToValidate.ip_address)) {
//   //     newErrors.ip_address = "Invalid IP Address.";
//   //   }
   
//   //   if (!sensorToValidate.port_number?.trim()) {
//   //     newErrors.port_number = "Port Number is required.";
//   //   } else if (!validatePortNumber(sensorToValidate.port_number)) {
//   //     newErrors.port_number = "Port Number must be between 1 and 65535.";
//   //   }
  
//   //   setErrors(newErrors);
  
 
//   //   return Object.keys(newErrors).length === 0;
//   // };
  
//   const validateInputs = () => {
//     const newErrors = {};
//     const sensorToValidate = modalType === "add" ? newSensor : currentSensor;
  
//     // Check if sensorToValidate is defined
//     if (!sensorToValidate) {
//       console.error("No sensor data available for validation.");
//       return false;
//     }
  
//     // Check for required fields and add errors if necessary
//     if (!sensorToValidate.name || !sensorToValidate.name.trim()) {
//       newErrors.name = "Sensor Name is required.";
//     }
  
//     if (!sensorToValidate.brand_name || !sensorToValidate.brand_name.trim()) {
//       newErrors.brand_name = "Brand is required.";
//     }
  
//     if (!sensorToValidate.model_name || !sensorToValidate.model_name.trim()) {
//       newErrors.model_name = "Model is required.";
//     }
  
//     if (!sensorToValidate.ip_address || !sensorToValidate.ip_address.trim()) {
//       newErrors.ip_address = "IP Address is required.";
//     } else if (!validateIPAddress(sensorToValidate.ip_address)) {
//       newErrors.ip_address = "Invalid IP Address.";
//     }
  
//     if (!sensorToValidate.port_number || !sensorToValidate.port_number.trim()) {
//       newErrors.port_number = "Port Number is required.";
//     } else if (!validatePortNumber(sensorToValidate.port_number)) {
//       newErrors.port_number = "Port Number must be between 1 and 65535.";
//     }
  

//     const isNameExists = sensors.some(
//       (sensor) =>
//         sensor.name?.trim().toLowerCase() ===
//           sensorToValidate.name?.trim().toLowerCase() &&
//         sensor._id !== sensorToValidate._id
//     );
//     if (isNameExists) {
//       newErrors.name = "Sensor Name already exists.";
//     }
  

//     const isIPExists = sensors.some(
//       (sensor) =>
//         sensor.ip_address?.trim() === sensorToValidate.ip_address?.trim() &&
//         sensor._id !== sensorToValidate._id
//     );
//     if (isIPExists) {
//       newErrors.ip_address = "IP Address already exists.";
//     }
  
    
//     const isPortExists = sensors.some(
//       (sensor) =>
//         sensor.port_number?.trim() === sensorToValidate.port_number?.trim() &&
//         sensor._id !== sensorToValidate._id
//     );
//     if (isPortExists) {
//       newErrors.port_number = "Port Number already exists.";
//     }
  
//     setErrors(newErrors);

//     return Object.keys(newErrors).length === 0;
//   };
  
  

//   const handleOk = () => {
//     setErrors({}); 
  

//     const isValid = validateInputs();
  
//     if (!isValid) {
//       console.error("Validation failed, cannot proceed");
      
//       return; 
//     }
  
    
//     if (modalType === "add") {
//       handleAddSensor();
//     } else {
//       handleUpdateSensor();
//     }
//   };
  
  
  
  
  
//   return (
//     <div className="page-content">
//       <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
//         <Button type="primary" onClick={() => handleModalVisibility("add")}>
//           <PlusOutlined /> Add Sensor
//         </Button>
//         <Title level={3}>Sensor Information</Title>
//         <Button.Group>
//           <Button
//             icon={<AppstoreOutlined />}
//             onClick={() => setViewMode("grid")}
//             type={viewMode === "grid" ? "primary" : "default"}
//           >
//             Grid View
//           </Button>
//           <Button
//             icon={<UnorderedListOutlined />}
//             onClick={() => setViewMode("list")}
//             type={viewMode === "list" ? "primary" : "default"}
//           >
//             List View
//           </Button>
//         </Button.Group>
//       </Row>

//       <SensorList
//         sensors={sensors}
//         viewMode={viewMode}
//         onDelete={handleDeleteSensor}
//         onEdit={sensor => handleModalVisibility("edit", sensor)}
//       />

//       <Modal
//         title={modalType === "add" ? "Add New Sensor" : "Edit Sensor"}
//         visible={isModalVisible}
//         onOk={handleOk}
//         // onCancel={() => setIsModalVisible(false)}
//         onCancel={() => {
//           if (isConnectionSuccessful) {
//             // using type to connect the sensor
//             // const modelType = multisensor
//             //   .find(sensor => sensor.brand_name === newSensor.brand_name)
//             //   ?.models.find(model => model.modelName === newSensor.model_name)?.type;
      
//             // if (modelType) {
//             //   checkSensorAction(modelType, "disconnect");
//             // }

//             // using brand and model name to connect the sensor
//             const BRAND_MODEL = `${newSensor.brand_name}_${newSensor.model_name}`
//             checkSensorAction(BRAND_MODEL, "disconnect");
//           }
//           setIsModalVisible(false);
//         }}
//         okButtonProps={{ disabled: !isConnectionSuccessful }}
//         afterClose={() => {
//           setIsConnectionSuccessful(false);
//           setConnectionText("");
//           setTextColor("black");
//         }}
//       >
//         {console.log(modalType, "modalType")}
//         {/* Sensor Name */}
//         <div style={{ marginBottom: 10 }}>
//           <label
//             htmlFor="sensorName"
//             style={{ display: "block", marginBottom: 5 }}
//           >
//             Sensor Name:
//           </label>

//           <Input
//             id="sensorName"
//             placeholder="Enter Sensor Name"
//             value={
//               modalType === "add"
//                 ? newSensor.name || ""
//                 : currentSensor.name || ""
//             }
//             onChange={e => updateSensorState("name", e.target.value)}
//             disabled={isConnectionSuccessful  && !errors.name}
//           />

//           {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
//         </div>

//         <div style={{ marginBottom: 10 }}>
//           <label
//             htmlFor="sensorBrand"
//             style={{ display: "block", marginBottom: 5 }}
//           >
//             Brand:
//           </label>
//           <Select
//             id="sensorBrand"
//             placeholder="Select Sensor Brand"
//             value={
//               modalType === "add"
//                 ? newSensor.brand_name || ""
//                 : currentSensor.brand_name || ""
//             }
//             onChange={value => handleBrandChange(value, modalType)} // Pass modalType here
//             disabled={isConnectionSuccessful&& !errors.brand_name}
//             style={{ width: "100%" }}
//           >
//             {multisensor.map((sensor, index) => (
//               <Option key={index} value={sensor.brand_name}>
//                 {sensor.brand_name}
//               </Option>
//             ))}
//           </Select>
//           {errors.brand_name && (
//             <p style={{ color: "red" }}>{errors.brand_name}</p>
//           )}
//         </div>

//         <div style={{ marginBottom: 10 }}>
//           <label
//             htmlFor="sensorModel"
//             style={{ display: "block", marginBottom: 5 }}
//           >
//             Model:
//           </label>
//           <Select
//             id="sensorModel"
//             placeholder="Select Sensor Model"
//             value={
//               modalType === "add"
//                 ? newSensor.model_name || ""
//                 : currentSensor.model_name || ""
//             }
//             onChange={modelName => handleModelChange(modelName, modalType)} // Pass modalType here
//             disabled={isConnectionSuccessful && !errors.model_name}
//             style={{ width: "100%" }}
//           >
//             {multisensor
//               .find(
//                 sensor =>
//                   sensor.brand_name ===
//                   (modalType === "add"
//                     ? newSensor.brand_name
//                     : currentSensor.brand_name)
//               )
//               ?.models.map((model, index) => (
//                 <Option key={index} value={model.modelName}>
//                   {model.modelName}
//                 </Option>
//               ))}
//           </Select>
//         </div>

//         {/* IP Address */}
//         <div style={{ marginBottom: 10 }}>
//           <label
//             htmlFor="ip_address"
//             style={{ display: "block", marginBottom: 5 }}
//           >
//             IP Address:
//           </label>
//           <Input
//             id="ip_address"
//             placeholder="Enter IP Address"
//             value={
//               modalType === "add"
//                 ? newSensor.ip_address || ""
//                 : currentSensor.ip_address || ""
//             }
//             onChange={e => updateSensorState("ip_address", e.target.value)}
//             disabled={isConnectionSuccessful  && !errors.ip_address}
//           />
//           {errors.ip_address && (
//             <p style={{ color: "red" }}>{errors.ip_address}</p>
//           )}
//         </div>

//         {/* Port Number */}
//         <div style={{ marginBottom: 10 }}>
//           <label
//             htmlFor="port_number"
//             style={{ display: "block", marginBottom: 5 }}
//           >
//             Port Number:
//           </label>
//           <Input
//             id="port_number"
//             type="number"
//             placeholder="Enter Port Number"
//             value={
//               modalType === "add"
//                 ? newSensor.port_number || ""
//                 : currentSensor.port_number || ""
//             }
//             onChange={e => updateSensorState("port_number", e.target.value)}
//             disabled={isConnectionSuccessful && !errors.port_number}
//           />
          
//           {errors.port_number && (
//             <p style={{ color: "red" }}>{errors.port_number}</p>
//           )}
//         </div>
//         <div style={{ textAlign: "center", marginTop: 20 }}>
//   {!isConnectionSuccessful ? (
//     <Button
//       type="primary"
//       onClick={async () => {
//         const isValid = validateInputs(); // Validate the inputs

//         if (!isValid) {
//           // If validation fails, exit the function
        
//           return;
//         }


//         // const modelType = multisensor
//         //   .find(
//         //     sensor =>
//         //       sensor.brand_name ===
//         //       (modalType === "add"
//         //         ? newSensor.brand_name
//         //         : currentSensor.brand_name)
//         //   )
//         //   ?.models.find(
//         //     model =>
//         //       model.modelName ===
//         //       (modalType === "add"
//         //         ? newSensor.model_name
//         //         : currentSensor.model_name)
//         //   )?.type;

//         // console.log('multisensor ', multisensor, modelType)
//         // if (!modelType) {
//         //   console.error(
//         //     "Model type not found. Please select a valid brand and model."
//         //   );
//         //   toggleNotification(
//         //     "Error",
//         //     "Model type not found or invalid brand/model selection."
//         //   );
//         //   return;
//         // }

//         const BRAND_MODEL = modalType === "add" ? `${newSensor.brand_name}_${newSensor.model_name}` : `${currentSensor.brand_name}_${currentSensor.model_name}`;
//         console.log('multisensor ', multisensor, BRAND_MODEL);

//         const payloadConnect = {
//           'ip_address': newSensor.ip_address,
//           'port_number': newSensor.port_number
//         }
        
//         const able_to_connect = await checkSensorAction(BRAND_MODEL, "connect", payloadConnect);

//         if (able_to_connect) {
//           setIsConnectionSuccessful(true);
//           setConnectionText("Sensor Connected");
//           setTextColor("green");
//         } else {
//           toggleNotification(
//             "Error",
//             "Unable to connect to the sensor. Ensure that the selected brand name and model name match the IP address."
//           );
//           setIsConnectionSuccessful(false);
//           setConnectionText("");
//         }
//       }}
//     >
//       Check Connection
//     </Button>
//   ) : (
//     <Input
//       value={connectionText}
//       style={{ color: textColor }}
//       disabled
//     />
//   )}
// </div>

//       </Modal>

//       <Modal
//         title="Add New Sensor Brand and Type"
//         visible={isBrandModalVisible}
//         onCancel={() => setIsBrandModalVisible(false)}
//         onOk={handleAddBrandAndType}
//         okText="Add"
//         cancelText="Cancel"
//       >
//         <Form layout="vertical">
//           <Form.Item label="Brand Name">
//             <Input
//               placeholder="Enter Brand Name"
//               value={newBrand}
//               onChange={e => setNewBrand(e.target.value)}
//             />
//           </Form.Item>
//           <Form.Item label="Sensor Type">
//             <Input
//               placeholder="Enter Sensor Type"
//               value={newType}
//               onChange={e => setNewType(e.target.value)}
//             />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default SensorInfo;