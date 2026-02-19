import React, { useState } from "react";
import { Button } from "antd";
import SensorCreationModal from "./SensorCreationModal";
import SensorCreationDeveloper from "./SensorCreationDeveloper";

const SensorCreationApp = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [devSensorModal, setDevSensorModal] = useState(false);
    const [userSensors, setUserSensors] = useState([]);
    const [developerSensors, setDeveloperSensors] = useState([]);

    const handleCreateSensor = (sensor) => {
        setUserSensors([...userSensors, sensor]);
        console.log("User Sensors:", userSensors);
    };

    const handleCreateDeveloperSensor = (sensor) => {
        setDeveloperSensors([...developerSensors, sensor]);
        console.log("developerSensors: ", developerSensors)
    }

    const logSensorInfo = () => {
        console.log('userSensors, developerSensors ', userSensors, developerSensors)
    }

    return (
        <div>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
                Create Sensor
            </Button>
            <Button type="primary" onClick={() => setDevSensorModal(true)}>
                Create Developer Sensor
            </Button>
            <Button type="primary" onClick={() => logSensorInfo()}>
                Log Sensor Info
            </Button>

            {/* {
                developerSensors.length > 0 ?
                <SensorCreationModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onCreate={handleCreateSensor}
                    // sensorList={developerSensors}
                />
                : null
            } */}
            <SensorCreationModal
                    visible={isModalVisible}
                    onClose={() => setIsModalVisible(false)}
                    onCreate={handleCreateSensor}
                    // sensorList={developerSensors}
                />
            <SensorCreationDeveloper
                visible={devSensorModal}
                onClose={() => setDevSensorModal(false)}
                onCreate={handleCreateDeveloperSensor}
            />
        </div>
    );
};

export default SensorCreationApp;
