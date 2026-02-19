import React, { useState, useEffect } from "react";
import { Button, Row, Col, Modal, Input, Switch, Typography, Select, Form } from "antd";
import { PlusOutlined, UnorderedListOutlined, AppstoreOutlined } from "@ant-design/icons";
import SensorList from "./SensorList";
import urlSocket from "pages/AdminInspection/urlSocket";
import { post } from "./services/apiService";

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
  const [isBrandModalVisible, setIsBrandModalVisible] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newType, setNewType] = useState("");
  const [addOrUpdateSensor, setaddOrUpdateSensor] = useState(false);

  useEffect(() => {
    const name = modalType === "add" ? newSensor.name : currentSensor.name;
    setNewSensor((prev) => ({ ...prev, type: sensorData[name]?.length === 1 ? sensorData[name][0] : "" }));
  }, [newSensor.name, currentSensor.name, modalType]);

  useEffect(() => {
    const sensorInfo = async () => {
      try {
        const response = await urlSocket.post(
          "/getSensorList",// Request payload
          {
            headers: { "Content-Type": "application/json" }, // Proper content type
          }
        );
        const sensorBrandModelList = await post('/api/sensors');
        console.log('sensorBrandModelList ', sensorBrandModelList)
        console.log("Response data:", response.data);
        setSensors(response.data.sensor)
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
    };
  
    sensorInfo();
  }, []);

  const handleModalVisibility = (type, sensor = {}) => {
    setModalType(type);
    setIsModalVisible(true);
    // setNewType(sensor.type)
    type === "edit" ? setCurrentSensor(sensor) : setNewSensor({});
  };

  const updateSensorState = (key, value) => {
    modalType === "add"
      ? setNewSensor((prev) => ({ ...prev, [key]: value }))
      : setCurrentSensor((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSensor = async () => {
    const newId = sensors.length ? sensors[sensors.length - 1].id + 1 : 1;
    const sensor = { ...newSensor, id: newId }
    console.log('sensor', sensor)
    try {
        const response =  await urlSocket.post(
          "/addSensorData",
          {sensor}, // Request payload
          {
            headers: { "Content-Type": "application/json" }, // Proper content type
          }
        );
        console.log("Response data:", response.data);
        setSensors(response.data.sensor)
      } catch (error) {
        console.error("Error adding or updating sensor:", error.message);
      }
    setIsModalVisible(false);
  };

  const handleUpdateSensor = async () => {
    console.log('currentSensor', currentSensor)
    try {
      const response =  await urlSocket.post(
        "/updateSensorData",
        {currentSensor}, // Request payload
        {
          headers: { "Content-Type": "application/json" }, // Proper content type
        }
      );
      console.log("Response data:", response.data);
      setSensors(response.data.sensor)
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
    setIsModalVisible(false);
  };


  const handleDeleteSensor = async (id) => {
    const delsensor = sensors.filter((sensor) => sensor.id === id);
    console.log('delsensor', delsensor)
    try {
      const response =  await urlSocket.post(
        "/deleteSensorData",
        {currentSensor:delsensor[0]}, // Request payload
        {
          headers: { "Content-Type": "application/json" }, // Proper content type
        }
      );
      console.log("Response data:", response.data);
      setSensors(response.data.sensor)
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
    // setSensors(sensors.filter((sensor) => sensor.id !== id));
  };

  const handleBrandChange = (name) => {
    const types = sensorData[name] || [];
    updateSensorState("name", name);
    updateSensorState("type", types.length === 1 ? types[0] : "");
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

  return (
    <div className="page-content">
      <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
        <Button type="primary" onClick={() => handleModalVisibility("add")}> 
          <PlusOutlined /> Add Sensor
        </Button>
        <Title level={3}>Sensor Information</Title>
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
        </Button.Group>
      </Row>

      <SensorList
        sensors={sensors}
        viewMode={viewMode}
        onDelete={handleDeleteSensor}
        onEdit={(sensor) => handleModalVisibility("edit", sensor)}
      />

      <Modal
        title={modalType === "add" ? "Add New Sensor" : "Edit Sensor"}
        visible={isModalVisible}
        onOk={modalType === "add" ? handleAddSensor : handleUpdateSensor}
        onCancel={() => setIsModalVisible(false)}
      >
        <Select
          placeholder="Select or Add Sensor Brand"
          value={modalType === "add" ? newSensor.name : currentSensor.name}
          onChange={handleBrandChange}
          style={{ width: "100%", marginBottom: 10 }}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div style={{ padding: 8, borderTop: "1px solid #f0f0f0" }}>
                <Button type="text" onClick={() => setIsBrandModalVisible(true)}>
                  + Add New Brand
                </Button>
              </div>
            </>
          )}
        >
          {Object.keys(sensorData).map((brand) => (
            <Option key={brand} value={brand}>
              {brand}
            </Option>
          ))}
        </Select>

        <Input
          placeholder="Sensor Model"
          value={modalType === "add" ? newSensor.model_name : currentSensor.model_name}
          onChange={(e) => updateSensorState("model_name", e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <Input.TextArea
          placeholder="Sensor Description"
          value={modalType === "add" ? newSensor.description : currentSensor.description}
          onChange={(e) => updateSensorState("description", e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <Select
          placeholder="Select Sensor Type"
          value={modalType === "add" ? newSensor.type : currentSensor.type}
          onChange={(value) => updateSensorState("type", value)}
          style={{ width: "100%", marginBottom: 10 }}
          // disabled={!sensorData[newSensor.name]?.length}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Input
                  placeholder="Add a new type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  style={{ flex: "1", marginRight: "8px" }}
                />
                <Button
                  type="primary"
                  onClick={() => {
                    if (newType.trim()) {
                      // Update sensorData with the new type for the selected brand
                      setSensorData((prev) => ({
                        ...prev,
                        [newSensor.name]: [
                          ...(prev[newSensor.name] || []),
                          newType.trim(),
                        ],
                      }));
                      setNewType(""); // Reset newType field
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </>
          )}
        >{modalType === 'add' ? sensorData[newSensor.name]?.map((type) => (
          <Option key={type} value={type}>
            {type}
          </Option>
        )) :
          sensorData[currentSensor.name]?.map((type) => (
            <Option key={type} value={type}>
              {type}
            </Option>
          ))
          }
        </Select>
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
              onChange={(e) => setNewBrand(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Sensor Type">
            <Input
              placeholder="Enter Sensor Type"
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SensorInfo;

// Jose Anna UI Changed Code

// import React, { useState } from "react";
// import MetaTags from 'react-meta-tags';
// import { Modal, Input, Switch, Typography } from "antd";
// import { PlusOutlined, UnorderedListOutlined, AppstoreOutlined, EditOutlined } from "@ant-design/icons";
// import { Container, Row, Col, Card, CardBody, ButtonGroup, Button } from "reactstrap";
// import Breadcrumbs from "components/Common/Breadcrumb";
// import SensorList from "./SensorList";
// import Nodata_admin from "assets/images/nodata/nodata_admin.jpg";

// const { Title } = Typography;

// const SensorInfo = () => {
//     const [sensors, setSensors] = useState([
//         { id: 1, name: "Sensor 1", description: "Description for Sensor 1" },
//         { id: 2, name: "Sensor 2", description: "Description for Sensor 2" },
//     ]);

//     const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [modalType, setModalType] = useState(""); // "add" or "edit"
//     const [currentSensor, setCurrentSensor] = useState({ id: null, name: "", description: "" });
//     const [newSensor, setNewSensor] = useState({ name: "", description: "" });

//     const handleAddSensor = () => {
//         const newId = sensors.length ? sensors[sensors.length - 1].id + 1 : 1;
//         setSensors([...sensors, { ...newSensor, id: newId }]);
//         setNewSensor({ name: "", description: "" });
//         setIsModalVisible(false);
//     };

//     const handleDeleteSensor = (id) => {
//         setSensors(sensors.filter((sensor) => sensor.id !== id));
//     };

//     const handleEditSensor = (sensor) => {
//         setModalType("edit");
//         setCurrentSensor(sensor);
//         setIsModalVisible(true);
//     };

//     const handleUpdateSensor = () => {
//         setSensors(
//             sensors.map((sensor) =>
//                 sensor.id === currentSensor.id ? { ...sensor, ...currentSensor } : sensor
//             )
//         );
//         setIsModalVisible(false);
//     };

//     return (
//         <React.Fragment>
//             <div className="page-content">
//                 <MetaTags>
//                     <title>Sensor Information | RunOut Admin</title>
//                 </MetaTags>
//                 <Breadcrumbs title="SENSOR INFORMATION" />

//                 <Container fluid>
//                     <Card>
//                         <CardBody>
//                             <Row className="mb-2">
//                                 <Col sm={3}>
//                                     <div className="search-box ">
//                                         <div className="position-relative">
//                                             <Input
//                                                 // onChange={(e) => this.onSearch(e.target.value)}
//                                                 id="search-user"
//                                                 type="text"
//                                                 className="form-control"
//                                                 placeholder="Search..."
//                                             // value={this.state.SearchField}
//                                             />
//                                             <i className="bx bx-search-alt search-icon" />
//                                         </div>
//                                     </div>
//                                 </Col>
//                                 <Col>



//                                     <div className="d-flex align-items-center justify-content-end gap-3">
//                                         {/* Button Group for View Modes */}
//                                         <ButtonGroup>
//                                             <Button
//                                                 color={viewMode === "grid" ? "primary" : "light"}
//                                                 onClick={() => setViewMode("grid")}
//                                                 size="sm"
//                                                 className="d-flex align-items-center"
//                                             >
//                                                 <i className="bx bx-grid-alt" style={{ marginRight: "5px", fontSize: '16px' }}></i> Grid View
//                                             </Button>
//                                             <Button
//                                                 color={viewMode === "list" ? "primary" : "light"}
//                                                 onClick={() => setViewMode("list")}
//                                                 size="sm"
//                                                 className="d-flex align-items-center"
//                                             >
//                                                 <i className="bx bx-list-ul" style={{ marginRight: "5px", fontSize: '16px' }}></i> List View
//                                             </Button>
//                                         </ButtonGroup>

//                                         {/* Add Sensor Button */}
//                                         <Button
//                                             color="primary"
//                                             size="sm"
//                                             onClick={() => { setModalType("add"); setIsModalVisible(true); }}
//                                             className="d-flex align-items-center"
//                                         >
//                                             <i className="bx bx-list-plus me-1" style={{ fontSize: '18px' }} /> Add Sensor
//                                         </Button>
//                                     </div>


//                                 </Col>
//                             </Row>


//                             {sensors.length > 0 ?
//                                 <>
//                                     <SensorList
//                                         sensors={sensors}
//                                         viewMode={viewMode}
//                                         onDelete={handleDeleteSensor}
//                                         onEdit={handleEditSensor}
//                                     />
//                                 </>

//                                 :
//                                 <div className="container" style={{ position: 'relative', minHeight: window.innerHeight }}>
//                                     <div className="text-center" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} >
//                                         <img src={Nodata_admin} className="img-sm h-auto" style={{ width: '20%' }} />
//                                         <h5 className="text-secondary">No Data Available</h5>
//                                     </div>
//                                 </div>
//                             }
//                         </CardBody>
//                     </Card>
//                 </Container>


//                 <Modal
//                     title={modalType === "add" ? "Add New Sensor" : "Edit Sensor"}
//                     visible={isModalVisible}
//                     onOk={modalType === "add" ? handleAddSensor : handleUpdateSensor}
//                     onCancel={() => setIsModalVisible(false)}
//                 >
//                     <Input
//                         placeholder="Sensor Name"
//                         value={modalType === "add" ? newSensor.name : currentSensor.name}
//                         onChange={(e) => {
//                             const value = e.target.value;
//                             modalType === "add"
//                                 ? setNewSensor({ ...newSensor, name: value })
//                                 : setCurrentSensor({ ...currentSensor, name: value });
//                         }}
//                         style={{ marginBottom: "10px" }}
//                     />
//                     <Input.TextArea
//                         placeholder="Sensor Description"
//                         value={modalType === "add" ? newSensor.description : currentSensor.description}
//                         onChange={(e) => {
//                             const value = e.target.value;
//                             modalType === "add"
//                                 ? setNewSensor({ ...newSensor, description: value })
//                                 : setCurrentSensor({ ...currentSensor, description: value });
//                         }}
//                     />
//                 </Modal>
//             </div>
//         </React.Fragment>
//     );
// };

// export default SensorInfo;










///Before - 21-12-24
// import React, { useState } from "react";
// import { Button, Row, Col, Modal, Input, Switch, Typography } from "antd";
// import { PlusOutlined, UnorderedListOutlined, AppstoreOutlined, EditOutlined } from "@ant-design/icons";
// import SensorList from "./SensorList";

// const { Title } = Typography;

// const SensorInfo = () => {
//     const [sensors, setSensors] = useState([
//         { id: 1, name: "Sensor 1", description: "Description for Sensor 1" },
//         { id: 2, name: "Sensor 2", description: "Description for Sensor 2" },
//     ]);

//     const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [modalType, setModalType] = useState(""); // "add" or "edit"
//     const [currentSensor, setCurrentSensor] = useState({ id: null, name: "", description: "" });
//     const [newSensor, setNewSensor] = useState({ name: "", description: "" });

//     const handleAddSensor = () => {
//         const newId = sensors.length ? sensors[sensors.length - 1].id + 1 : 1;
//         setSensors([...sensors, { ...newSensor, id: newId }]);
//         setNewSensor({ name: "", description: "" });
//         setIsModalVisible(false);
//     };

//     const handleDeleteSensor = (id) => {
//         setSensors(sensors.filter((sensor) => sensor.id !== id));
//     };

//     const handleEditSensor = (sensor) => {
//         setModalType("edit");
//         setCurrentSensor(sensor);
//         setIsModalVisible(true);
//     };

//     const handleUpdateSensor = () => {
//         setSensors(
//             sensors.map((sensor) =>
//                 sensor.id === currentSensor.id ? { ...sensor, ...currentSensor } : sensor
//             )
//         );
//         setIsModalVisible(false);
//     };

//     return (
//         <div className="page-content">
//             <Row justify="space-between" align="middle" style={{ marginBottom: "20px" }}>
//                 <Button type="primary" onClick={() => { setModalType("add"); setIsModalVisible(true); }}>
//                     <PlusOutlined /> Add Sensor
//                 </Button>
//                 <Title level={3}>Sensor Information</Title>
//                 <Button.Group>
//                     <Button
//                         icon={<AppstoreOutlined />}
//                         onClick={() => setViewMode("grid")}
//                         type={viewMode === "grid" ? "primary" : "default"}
//                     >
//                         Grid View
//                     </Button>
//                     <Button
//                         icon={<UnorderedListOutlined />}
//                         onClick={() => setViewMode("list")}
//                         type={viewMode === "list" ? "primary" : "default"}
//                     >
//                         List View
//                     </Button>
//                 </Button.Group>
//             </Row>

//             <SensorList
//                 sensors={sensors}
//                 viewMode={viewMode}
//                 onDelete={handleDeleteSensor}
//                 onEdit={handleEditSensor}
//             />

//             <Modal
//                 title={modalType === "add" ? "Add New Sensor" : "Edit Sensor"}
//                 visible={isModalVisible}
//                 onOk={modalType === "add" ? handleAddSensor : handleUpdateSensor}
//                 onCancel={() => setIsModalVisible(false)}
//             >
//                 <Input
//                     placeholder="Sensor Name"
//                     value={modalType === "add" ? newSensor.name : currentSensor.name}
//                     onChange={(e) => {
//                         const value = e.target.value;
//                         modalType === "add"
//                             ? setNewSensor({ ...newSensor, name: value })
//                             : setCurrentSensor({ ...currentSensor, name: value });
//                     }}
//                     style={{ marginBottom: "10px" }}
//                 />
//                 <Input.TextArea
//                     placeholder="Sensor Description"
//                     value={modalType === "add" ? newSensor.description : currentSensor.description}
//                     onChange={(e) => {
//                         const value = e.target.value;
//                         modalType === "add"
//                             ? setNewSensor({ ...newSensor, description: value })
//                             : setCurrentSensor({ ...currentSensor, description: value });
//                     }}
//                 />
//             </Modal>
//         </div>
//     );
// };

// export default SensorInfo;
