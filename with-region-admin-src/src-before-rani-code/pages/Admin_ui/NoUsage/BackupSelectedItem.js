// import React from "react";
// import { List, Button } from "antd";
// import { MinusCircleOutlined } from "@ant-design/icons";
// import PropTypes from 'prop-types';

// const BackupSelectedItem = ({ selectedItems, products, handleRemove }) => {
//   return (
//     <div style={{ marginTop: 20 }}>
//       <h4>{`Selected Sensor(s)`}</h4>
//       <List
//         dataSource={selectedItems.map((id) => products.find((p) => p.id === id))}
//         renderItem={(item) => (
//           <List.Item
//             key={item.id}
//             actions={[
//                 <Button 
//                     key="remove"
//                     icon={<MinusCircleOutlined />} onClick={() => handleRemove(item.id)} />]}
//           >
//             {item.name} - {item.description}
//           </List.Item>
//         )}
//       />
//     </div>
//   );
// };

// BackupSelectedItem.propTypes = {
//     selectedItems: PropTypes.any.isRequired,
//     products: PropTypes.any.isRequired,
//     handleRemove: PropTypes.any.isRequired,
// }

// export default BackupSelectedItem;
import React, { useState } from "react";
import { List, Button, Collapse, Input, Card } from "antd";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

const { Panel } = Collapse;

const BackupSelectedItem = ({ selectedItems, products, handleRemove }) => {
  const [measurements, setMeasurements] = useState({}); // { sensorId: [{ id, name, regions: [] }] }
  const [regionInput, setRegionInput] = useState({}); // For managing region input per measurement

  // Add a new measurement for a specific sensor
  const handleAddMeasurement = (sensorId) => {
    setMeasurements((prev) => ({
      ...prev,
      [sensorId]: [
        ...(prev[sensorId] || []),
        { id: Date.now(), name: `Measurement ${Date.now()}`, regions: [] },
      ],
    }));
  };

  // Add a new region to a specific measurement
  const handleAddRegion = (sensorId, measurementId) => {
    setMeasurements((prev) => ({
      ...prev,
      [sensorId]: prev[sensorId].map((m) =>
        m.id === measurementId
          ? {
              ...m,
              regions: [
                ...m.regions,
                { id: Date.now(), name: regionInput[measurementId] || `Region ${Date.now()}` },
              ],
            }
          : m
      ),
    }));
    setRegionInput((prev) => ({ ...prev, [measurementId]: "" })); // Reset input
  };

  // Update region input
  const handleRegionInputChange = (measurementId, value) => {
    setRegionInput((prev) => ({ ...prev, [measurementId]: value }));
  };

  // Render
  return (
    <div style={{ marginTop: 20 }}>
      <h4>{`Selected Sensor(s)`}</h4>
      <List
        dataSource={selectedItems.map((id) => products.find((p) => p.id === id))}
        renderItem={(sensor) => (
          <List.Item
            key={sensor.id}
            actions={[
              <Button
                key="remove"
                icon={<MinusCircleOutlined />}
                onClick={() => handleRemove(sensor.id)}
              />,
            ]}
          >
            <div style={{ width: "100%" }}>
              <h5>{sensor.name} - {sensor.description}</h5>
                {/* Add Measurement Button */}
                <Button
                    icon={<PlusCircleOutlined />}
                    type="primary"
                    style={{ marginTop: 10 }}
                    onClick={() => handleAddMeasurement(sensor.id)}
                >
                    Add Measurement
                </Button>
              {/* Measurements Section */}
              <Collapse>
                {measurements[sensor.id]?.map((measurement) => (
                  <Panel header={measurement.name} key={measurement.id}>
                    <div>
                      <h5>Regions:</h5>
                      <List
                        dataSource={measurement.regions}
                        renderItem={(region) => <List.Item>{region.name}</List.Item>}
                        bordered
                      />
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <Input
                          placeholder="Enter region name"
                          value={regionInput[measurement.id] || ""}
                          onChange={(e) =>
                            handleRegionInputChange(measurement.id, e.target.value)
                          }
                        />
                        <Button
                          icon={<PlusCircleOutlined />}
                          onClick={() => handleAddRegion(sensor.id, measurement.id)}
                        >
                          Add Region
                        </Button>
                      </div>
                    </div>
                  </Panel>
                ))}
              </Collapse>

              
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

BackupSelectedItem.propTypes = {
  selectedItems: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  handleRemove: PropTypes.func.isRequired,
};

export default BackupSelectedItem;
