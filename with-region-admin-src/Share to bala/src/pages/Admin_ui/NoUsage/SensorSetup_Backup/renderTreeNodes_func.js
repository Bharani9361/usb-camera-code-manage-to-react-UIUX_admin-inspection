

const renderTreeNodes = (data) =>
    data.map((sensor) => ({
        title: (
            <span
                style={getNodeStyle(sensor)} // Apply styles dynamically
                onClick={() => {
                    if (!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`) handleSelectSensor(sensor);
                }}
            >
                {`${sensor.name}-${sensor.model_name} `}
                <Button
                    size="small"
                    onClick={() => {
                        if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`) addMeasurement(sensor.id)
                    }}
                >
                    Add Measurement
                </Button>
            </span>
            // <span 
            //     style={getNodeStyle(sensor.id)} // Apply styles for selected sensor
            //     onClick={() => handleSelectSensor(sensor)}
            // >
            //     {`${sensor.name}-${sensor.model_name}  `}
            //     {}{" "}{}
            //     <Button size="small" onClick={() => addMeasurement(sensor.id)}>
            //         Add Measurement
            //     </Button>
            // </span>
        ),
        key: sensor.id,
        children: sensor.measurements.map((measurement) => ({
            title: (
                <span 
                    style={getNodeStyle(sensor)} // Apply styles for selected measurement
                    onClick={() => {
                        if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`) 
                            handleSelectMeasurement(sensor.id, measurement.id, measurement)
                    }}
                >
                    {measurement.name}{" "}
                    <EditOutlined
                        onClick={() => {
                            if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
                                editItem("measurement", sensor.id, measurement.id)
                        }}
                    />{" "}
                    <DeleteOutlined
                        onClick={() => {
                            if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
                                deleteItem("measurement", sensor.id, measurement.id)
                        }}
                    />{" "}
                    {/* <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => addRegion(sensor.id, measurement.id)}
                    >
                        Add Region
                    </Button> */}
                </span>
            ),
            key: measurement.id,
            children: measurement.regions.map((region, rid) => ({
                title: (
                    <span>
                        {region.name}{" "}
                        <EditOutlined
                            onClick={() => {
                                if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
                                    editRegionValues(sensor.id, measurement.id, rid)
                            }
                                // editItem("region", sensor.id, measurement.id, region.id)
                            }
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
                                onClick={() => {
                                    if(!sensorConnected.sensorName && sensorConnected.sensorName != `${sensor.name}-${sensor.model_name}`)
                                        togglePopConfirm(region.id, 0)
                                }}
                            />
                        </Popconfirm>
                        {/* <DeleteOutlined
                            onClick={() =>
                                deleteItem("region", sensor.id, measurement.id, region.id)
                            }
                        /> */}
                    </span>
                ),
                key: region.id
            }))
        }))
    }));