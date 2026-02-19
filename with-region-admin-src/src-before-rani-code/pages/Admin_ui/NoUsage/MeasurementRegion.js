import React from 'react'

const MeasurementRegion = () => {
    const [measurements, setMeasurements] = useState([
        {
            id: 1,
            name: "Measurement 1",
            regions: [],
        },
    ]);

    const addMeasurement = () => {
        const newMeasurement = {
            id: measurements.length + 1,
            name: `Measurement ${measurements.length + 1}`,
            regions: [],
        };
        setMeasurements([...measurements, newMeasurement]);
    };

    const addRegion = (measurementId) => {
        const updatedMeasurements = measurements.map((measurement) => {
            if (measurement.id === measurementId) {
                const newRegion = {
                    id: measurement.regions.length + 1,
                    name: `Region ${measurement.regions.length + 1}`,
                };
                return { ...measurement, regions: [...measurement.regions, newRegion] };
            }
            return measurement;
        });
        setMeasurements(updatedMeasurements);
    };
    return (
        <>
            <h4>Measurements</h4>
            <ListGroup>
                {measurements.map((measurement) => (
                    <ListGroupItem key={measurement.id}>
                        <div>
                            <strong>{measurement.name}</strong>
                            <ul>
                                {measurement.regions.map((region) => (
                                    <li key={region.id}>{region.name}</li>
                                ))}
                            </ul>
                            <Button
                                color="link"
                                onClick={() => addRegion(measurement.id)}
                            >
                                + Add Region
                            </Button>
                            {measurement.regions.length > 0 && (
                                <Button color="success">Start Master</Button>
                            )}
                        </div>
                    </ListGroupItem>
                ))}
                <Button color="primary" onClick={addMeasurement}>
                    + Add Measurement
                </Button>
            </ListGroup>
        </>
    )
}

export default MeasurementRegion;