import React, { useState } from 'react';
import { Modal, Table, Label, Button } from 'reactstrap';
import PropTypes from 'prop-types';

const AccuracyModal = ({
    config,
    sample_count,
    manual_abort,
    time_elapsed,
    res_mode,
    train_accuracy,
    get_a, get_b, get_c,
    get_d, get_e, get_f,
    get_g, get_h, get_i,
    navigate, navigateto
}) => {
    console.log('sample_count15', sample_count)
    const [show, setShow] = useState(true);

    const handleOk = () => {
        const train_acc_global = _.mean(Object.values(train_accuracy));
        const isFullAccuracy = train_acc_global === 100;
        setShow(false);
        isFullAccuracy ? navigateto() : navigate();
    };

    return (
        <>
            {config.map((data, index) => {
                if (Number(sample_count) !== Number(data.test_samples) || manual_abort || time_elapsed) return null;

                const accuracyLabel = res_mode === "ok"
                    ? config[0].positive
                    : res_mode === "ng"
                        ? config[0].negative
                        : 'Training Accuracy';
                console.log("train_accuracy:", train_accuracy)

                // const isFullAccuracy = train_accuracy === 100;
                const isFullAccuracy = Object.values(train_accuracy).every(acc => acc === 100);
                console.log('isFullAccuracy', isFullAccuracy)

                const allKeys = Array.from(
                    new Set([
                        ...Object.keys(get_a || {}),
                        ...Object.keys(get_b || {}),
                        ...Object.keys(get_c || {}),
                        ...Object.keys(get_d || {}),
                        ...Object.keys(get_e || {}),
                        ...Object.keys(get_f || {}),
                        ...Object.keys(get_g || {}),
                        ...Object.keys(get_h || {}),
                        ...Object.keys(get_i || {}),
                    ])
                );
                console.log('allKeys', allKeys)

                return (
                    <Modal key={index} isOpen={show} size="lg">
                        <div className="p-3">
                            <div>Total tested samples: {data.test_samples}</div>
                            <Label className="d-block mt-2">{accuracyLabel} Result</Label>
                            <Table bordered style={{ tableLayout: 'auto', width: '100%', fontSize: '14px' }}>
                                <thead>
                                    <tr>
                                        <th>Camera</th>
                                        <th>Version</th>
                                        <th>Result </th>
                                        <th>System Result</th>
                                        <th>Agreed by QC</th>
                                        <th>Disagreed by QC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allKeys.map((key) => {
                                        const [camera, version] = key.split('-V');
                                        return (
                                            <React.Fragment key={key}>
                                                {/* OK Row */}
                                                <tr>
                                                    <td rowSpan="2" style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>{camera}</td>
                                                    <td rowSpan="2" style={{ verticalAlign: 'middle' }}>{version}</td>
                                                    <td style={{ fontWeight: 'bold' }}>OK</td>
                                                    <td>{get_a?.[key] ?? '0'}</td> {/* System Result OK */}
                                                    <td>{get_d?.[key] ?? '0'}</td> {/* Agreed by QC OK */}
                                                    <td>{get_g?.[key] ?? '0'}</td> {/* Disagreed by QC OK */}
                                                </tr>

                                                {/* NG Row */}
                                                <tr>
                                                    <td style={{ fontWeight: 'bold' }}>NG</td>
                                                    <td>{get_b?.[key] ?? '0'}</td> {/* System Result NG */}
                                                    <td>{get_e?.[key] ?? '0'}</td> {/* Agreed by QC NG */}
                                                    <td>{get_h?.[key] ?? '0'}</td> {/* Disagreed by QC NG */}
                                                </tr>
                                            </React.Fragment>

                                        );
                                    })}
                                </tbody>
                            </Table>
                            {/* <Label style={{ color: isFullAccuracy ? 'green' : 'red', fontSize: '18px' }} className="d-block mt-2">
                                {accuracyLabel}: {parseFloat(train_accuracy).toFixed(2)}%
                            </Label>
                            <Label className="d-block mt-2">
                                {isFullAccuracy
                                    ? 'Model is ready for deployment.'
                                    : "Since accuracy is not equal to 100% based on QC's response, system will retrain the model using 'disagreed' samples."}
                            </Label> */}
                            <div>
                                {Object.entries(train_accuracy).map(([position, accuracy]) => (
                                    <Label
                                        key={position}
                                        style={{ color: accuracy === 100 ? 'green' : 'red', fontSize: '12px' }}
                                        className="d-block mt-2"
                                    >
                                        {position}: {accuracy.toFixed(2)}%
                                    </Label>
                                ))}

                                <Label className="d-block mt-2">
                                    {isFullAccuracy
                                        ? 'Model is ready for deployment.'
                                        : "Since accuracy is not equal to 100% based on QC's response, system will retrain the model using 'disagreed' samples."}
                                </Label>
                            </div>

                            {/* OK Button */}
                            <div className="text-center mt-3">
                                <Button color="primary" onClick={handleOk}>OK</Button>
                            </div>
                        </div>
                    </Modal>
                );
            })}
        </>
    );
};

AccuracyModal.propTypes = {
    config: PropTypes.array.isRequired,
    sample_count: PropTypes.number.isRequired,
    manual_abort: PropTypes.bool.isRequired,
    time_elapsed: PropTypes.bool.isRequired,
    res_mode: PropTypes.string.isRequired,
    train_accuracy: PropTypes.number.isRequired,
    get_a: PropTypes.object,
    get_b: PropTypes.object,
    get_c: PropTypes.object,
    get_d: PropTypes.object,
    get_e: PropTypes.object,
    get_f: PropTypes.object,
    get_g: PropTypes.object,
    get_h: PropTypes.object,
    get_i: PropTypes.object,
    navigate: PropTypes.func.isRequired,
    navigateto: PropTypes.func.isRequired,
};

export default AccuracyModal;
