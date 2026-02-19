import React, { useState } from "react";
import { Tree, Button, Input, Modal } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

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
    const [isEditing, setIsEditing] = useState(false);
    const [currentEdit, setCurrentEdit] = useState(null);

    console.log(treeData)

    // Add Measurement
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
    };

    // Edit Item
    const editItem = (type, sensorId, measurementId, regionId) => {
        const target = treeData.find((sensor) => sensor.id === sensorId);
        if (type === "measurement") {
            const measurement = target.measurements.find((m) => m.id === measurementId);
            setCurrentEdit({ type, item: measurement, sensorId });
        } else if (type === "region") {
            const measurement = target.measurements.find((m) => m.id === measurementId);
            const region = measurement.regions.find((r) => r.id === regionId);
            setCurrentEdit({ type, item: region, sensorId, measurementId });
        }
        setIsEditing(true);
    };

    // Save Edits
    const saveEdit = (name) => {
        const { type, sensorId, measurementId, item } = currentEdit;
        setTreeData((prevData) =>
            prevData.map((sensor) =>
                sensor.id === sensorId
                    ? {
                          ...sensor,
                          measurements: sensor.measurements.map((measurement) => {
                              if (type === "measurement" && measurement.id === item.id) {
                                  return { ...measurement, name };
                              }
                              if (type === "region" && measurement.id === measurementId) {
                                  return {
                                      ...measurement,
                                      regions: measurement.regions.map((region) =>
                                          region.id === item.id ? { ...region, name } : region
                                      )
                                  };
                              }
                              return measurement;
                          })
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
                          measurements: sensor.measurements.filter((measurement) =>
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
                        <EditOutlined onClick={() => editItem("measurement", sensor.id, measurement.id)} />{" "}
                        <DeleteOutlined
                            onClick={() => deleteItem("measurement", sensor.id, measurement.id)}
                        />{" "}
                        <Button
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addRegion(sensor.id, measurement.id)}
                        >
                            Add Region
                        </Button>
                    </span>
                ),
                key: measurement.id,
                children: measurement.regions.map((region) => ({
                    title: (
                        <span>
                            {region.name}{" "}
                            <EditOutlined
                                onClick={() =>
                                    editItem("region", sensor.id, measurement.id, region.id)
                                }
                            />{" "}
                            <DeleteOutlined
                                onClick={() =>
                                    deleteItem("region", sensor.id, measurement.id, region.id)
                                }
                            />
                        </span>
                    ),
                    key: region.id
                }))
            }))
        }));

    return (
        <>
            <Tree treeData={renderTreeNodes(treeData)} showLine/>
            <Modal
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
            </Modal>
        </>
    );
};

export default TreeDataApp;
