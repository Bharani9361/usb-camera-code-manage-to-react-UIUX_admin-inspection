import React from "react";
import { Input } from "antd";

const SensorForm = ({ sensor, onChange }) => {
  return (
    <>
      <Input
        placeholder="Sensor Name"
        value={sensor.name}
        onChange={(e) => onChange({ ...sensor, name: e.target.value })}
        style={{ marginBottom: "10px" }}
      />
      <Input.TextArea
        placeholder="Sensor Description"
        value={sensor.description}
        onChange={(e) => onChange({ ...sensor, description: e.target.value })}
      />
    </>
  );
};

export default SensorForm;
