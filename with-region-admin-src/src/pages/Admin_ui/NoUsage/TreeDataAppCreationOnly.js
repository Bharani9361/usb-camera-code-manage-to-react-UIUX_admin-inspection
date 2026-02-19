import React, { useState } from "react";
import { Tree, Button, Input } from "antd";

const initialData = [
    {
        id: 1,
        name: "MLSL123",
        description: "Description of Product 1",
        measurements: []
    },
    {
        id: 2,
        name: "Scan Control",
        description: "Description of Product 2",
        measurements: []
    }
];

const TreeDataApp = () => {
    const [treeData, setTreeData] = useState(initialData);

    const addMeasurement = (sensorId) => {
        setTreeData((prevData) =>
            prevData.map((sensor) =>
                sensor.id === sensorId
                    ? {
                          ...sensor,
                          measurements: [
                              ...sensor.measurements,
                              {
                                  id: Date.now(),
                                  name: `Measurement ${sensor.measurements.length + 1}`,
                                  regions: []
                              }
                          ]
                      }
                    : sensor
            )
        );
    };

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
    };

    const renderTreeNodes = (data) =>
        data.map((sensor) => ({
            title: (
                <span>
                    {sensor.name}{" "}
                    <Button size="small" onClick={() => addMeasurement(sensor.id)}>
                        Add Measurement
                    </Button>
                </span>
            ),
            key: sensor.id,
            children: sensor.measurements.map((measurement) => ({
                title: (
                    <span>
                        {measurement.name}{" "}
                        <Button size="small" onClick={() => addRegion(sensor.id, measurement.id)}>
                            Add Region
                        </Button>
                    </span>
                ),
                key: measurement.id,
                children: measurement.regions.map((region) => ({
                    title: region.name,
                    key: region.id
                }))
            }))
        }));

    return <Tree treeData={renderTreeNodes(treeData)} />;
};

export default TreeDataApp;
