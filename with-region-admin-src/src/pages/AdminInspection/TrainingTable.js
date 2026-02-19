import React, { useState } from 'react';
import { Table, Button, UncontrolledTooltip, Progress, Row, Collapse, Card, CardBody } from 'reactstrap';
import PropTypes from 'prop-types';


const TrainingTable = ({
    refersh,
    compModelVerInfo,
    config,
    selectedRows,
    handleSelectRow,
    isCheckboxDisabled,
    togXlarge,
    activateModel,
    startAdminTest,
    train,
    clock
}) => {
    const [expandedRows, setExpandedRows] = useState({});
    const [showAll, setShowAll] = useState(false);

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (!refersh) return null;

    // Show only 2 rows initially, or all if showAll is true
    const displayData = showAll ? compModelVerInfo : compModelVerInfo.slice(0, 2);
    const hasMoreData = compModelVerInfo.length > 2;



    return (
        <div className='mt-2 mb-4'>
            <div className='table-responsive'>
                <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: '50px' }}></th>
                            <th>Select Training</th>
                            <th>Model Version</th>
                            <th>Model Status</th>
                            <th>Created on</th>
                            <th>Camera</th>
                            <th>Approved on</th>
                            <th>Live on</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.map((data, index) => {
                            let okCount = 0;
                            let notokCount = 0;

                            if (data.type === 'DL') {
                                okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
                                notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;
                            }

                            const isInactive = data.model_status === 'Inactive';
                            const isTrainingInProgress = data.training_status === 'training_in_progress';
                            const isApprovedTrainedModel = (data.training_status === 'admin approved trained model' && data.model_status !== 'Live');
                            const isTrainingCompleted = data.training_status === 'training completed';
                            const isRetrain = data.training_status === 'training_queued';
                            const isTrainingNotStarted = data.training_status === 'training_not_started';
                            const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
                            const hasTrainingDetails = isTrainingInProgress || isRetrain;

                            return (
                                <React.Fragment key={index}>
                                    <tr id='recent-list'>
                                        {/* Expand/Collapse Icon */}
                                        <td style={{ backgroundColor: "white", textAlign: 'center' }}>
                                            {hasTrainingDetails && (
                                                <Button
                                                    color="link"
                                                    size="sm"
                                                    onClick={() => toggleRow(data._id)}
                                                    className="p-0"
                                                    style={{ textDecoration: 'none', fontSize: '18px' }}
                                                >
                                                    {expandedRows[data._id] ? '▼' : '▶'}
                                                </Button>
                                            )}
                                        </td>

                                        {/* Select Training Checkbox */}
                                        <td style={{ backgroundColor: "white" }}>
                                            {(() => {
                                                const { result_mode } = compModelVerInfo[0];
                                                const minOk = Number(config[0]?.min_ok_for_training);
                                                const minNotOk = Number(config[0]?.min_notok_for_training);

                                                const canTrain =
                                                    (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                    (result_mode === "ng" && notokCount >= minNotOk) ||
                                                    (result_mode === "ok" && okCount >= minOk);

                                                if ((data.training_status === 'training_not_started' ||
                                                    data.training_status === 'training_queued' ||
                                                    data.training_status === 'admin accuracy testing in_progress' ||
                                                    data.training_status === 'training completed') && canTrain) {
                                                    return (
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.some((item) => item._id === data._id)}
                                                            onChange={() => handleSelectRow(data._id, data)}
                                                            disabled={isCheckboxDisabled(data)}
                                                        />
                                                    );
                                                }
                                                return <span>-</span>;
                                            })()}
                                        </td>

                                        {/* Model Version */}
                                        <td style={{ backgroundColor: "white" }}>V{data.model_ver}</td>

                                        {/* Model Status */}
                                        <td style={{ backgroundColor: "white" }}>
                                            <span className={
                                                data.model_status === 'Live' ? 'badge badge-soft-success' :
                                                    data.model_status === 'Approved' ? 'badge badge-soft-warning' :
                                                        data.model_status === 'Draft' ? 'badge badge-soft-info' :
                                                            'badge badge-soft-danger'
                                            }>
                                                {data.model_status}
                                            </span>
                                        </td>

                                        {/* Created On */}
                                        <td style={{ backgroundColor: "white" }}>{data.created_on}</td>

                                        {/* Camera */}
                                        <td style={{ backgroundColor: "white" }}>{data.camera.label}</td>

                                        {/* Approved On */}
                                        <td style={{ backgroundColor: "white" }}>{data.approved_on}</td>

                                        {/* Live On */}
                                        <td style={{ backgroundColor: "white" }}>{data.live_on}</td>

                                        {/* Actions */}
                                        <td style={{ backgroundColor: "white", fontSize: "18px" }}>
                                            <div className="d-flex align-items-start flex-wrap gap-2">
                                                {/* Log Info Button */}
                                                <>
                                                    <Button
                                                        color="primary"
                                                        className="btn btn-sm"
                                                        onClick={() => togXlarge(data)}
                                                        id={`log-${data._id}`}
                                                    >
                                                        Log Info
                                                    </Button>
                                                    <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
                                                        Log Info
                                                    </UncontrolledTooltip>
                                                </>

                                                {/* Activate Button */}
                                                {isInactive && (
                                                    <Button
                                                        color="success"
                                                        className="btn btn-sm"
                                                        onClick={() => activateModel(data, index)}
                                                    >
                                                        Activate
                                                    </Button>
                                                )}

                                                {/* Train / Admin Test Buttons */}
                                                {!(data.type === "ML") && !isInactive && !isTrainingInProgress && !isRetrain && (
                                                    isTrainingCompleted ? (
                                                        <Button
                                                            className="btn btn-sm"
                                                            color="success"
                                                            onClick={() => startAdminTest(data)}
                                                        >
                                                            Start Admin Accuracy Test
                                                        </Button>
                                                    ) : (() => {
                                                        if (isTrainingInProgress || !isTrainingNotStarted) return null;

                                                        const { result_mode } = compModelVerInfo[0];
                                                        const minOk = Number(config[0]?.min_ok_for_training);
                                                        const minNotOk = Number(config[0]?.min_notok_for_training);

                                                        const canTrain =
                                                            (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
                                                            (result_mode === "ng" && notokCount >= minNotOk) ||
                                                            (result_mode === "ok" && okCount >= minOk);

                                                        return canTrain ? (
                                                            <Button
                                                                className="btn btn-sm"
                                                                color="primary"
                                                                onClick={() => train(data)}
                                                            >
                                                                Train
                                                            </Button>
                                                        ) : null;
                                                    })()
                                                )}

                                                {/* Admin Accuracy Test In Progress */}
                                                {isAdminAccuracyInProgress && !isTrainingInProgress && (
                                                    <div>
                                                        <p className="mb-1 small">Admin Accuracy Testing In Progress</p>
                                                        <Button
                                                            className="btn btn-sm"
                                                            color="success"
                                                            onClick={() => startAdminTest(data)}
                                                        >
                                                            Continue
                                                        </Button>
                                                    </div>
                                                )}

                                                {/* Training Status Badge */}
                                                {isTrainingInProgress && (
                                                    <span className="badge badge-soft-info">
                                                        Training In Progress - Click arrow to view details
                                                    </span>
                                                )}

                                                {isRetrain && (
                                                    <span className="badge badge-soft-warning">
                                                        Training In Queue
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Collapsible Training Details Row */}
                                    {hasTrainingDetails && (
                                        <tr>
                                            <td colSpan="9" style={{ backgroundColor: "#f8f9fa", padding: 0 }}>
                                                <Collapse isOpen={expandedRows[data._id]}>
                                                    <div className="p-3">
                                                        {/* Training In Progress Details */}
                                                        {isTrainingInProgress && data?.training_status !== 'training_queued' && (
                                                            <div>
                                                                {/* Timer */}
                                                                <div className="mb-3 text-center">
                                                                    <strong>Training Duration: </strong>
                                                                    {data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}
                                                                </div>

                                                                {/* Region-wise Progress */}
                                                                {data?.rectangles && data?.region_selection && (
                                                                    <div className="mb-4">
                                                                        <h6 className="mb-3">Region Training Progress</h6>
                                                                        {Object.values(data.rectangles).map((position, posIndex) => (
                                                                            <div key={posIndex} className="mb-3">
                                                                                {Object.values(position).map((region, regionIndex) => (
                                                                                    <div key={region.id} className="mb-3">
                                                                                        <div className="mb-2">
                                                                                            <strong>{regionIndex + 1}. {region.name}</strong>
                                                                                        </div>
                                                                                        <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
                                                                                            {region.training_status_id === 0 && (
                                                                                                <Progress bar color="primary" value={100} animated>Loading...</Progress>
                                                                                            )}
                                                                                            {region.training_status_id === 1 && (
                                                                                                <>
                                                                                                    <Progress bar color="success" value={20}>20%</Progress>
                                                                                                    <Progress bar color="primary" value={80} animated></Progress>
                                                                                                </>
                                                                                            )}
                                                                                            {region.training_status_id === 2 && (
                                                                                                <>
                                                                                                    <Progress bar color="success" value={40}>40%</Progress>
                                                                                                    <Progress bar color="primary" value={60} animated></Progress>
                                                                                                </>
                                                                                            )}
                                                                                            {region.training_status_id === 3 && (
                                                                                                <>
                                                                                                    <Progress bar color="success" value={60}>60%</Progress>
                                                                                                    <Progress bar color="primary" value={40} animated></Progress>
                                                                                                </>
                                                                                            )}
                                                                                            {region.training_status_id === 4 && (
                                                                                                <>
                                                                                                    <Progress bar color="success" value={80}>80%</Progress>
                                                                                                    <Progress bar color="primary" value={20} animated></Progress>
                                                                                                </>
                                                                                            )}
                                                                                            {region.training_status_id === 5 && (
                                                                                                <Progress bar color="success" value={100}>100%</Progress>
                                                                                            )}
                                                                                        </Progress>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Component Training Progress */}
                                                                <div>
                                                                    <h6 className="mb-3">Component Training Progress</h6>
                                                                    <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
                                                                        {data.training_status_id === 0 && (
                                                                            <Progress bar color="primary" value={100} animated>Loading...</Progress>
                                                                        )}
                                                                        {data.training_status_id === 1 && (
                                                                            <>
                                                                                <Progress bar color="success" value={20}>20%</Progress>
                                                                                <Progress bar color="primary" value={80} animated></Progress>
                                                                            </>
                                                                        )}
                                                                        {data.training_status_id === 2 && (
                                                                            <>
                                                                                <Progress bar color="success" value={40}>40%</Progress>
                                                                                <Progress bar color="primary" value={60} animated></Progress>
                                                                            </>
                                                                        )}
                                                                        {data.training_status_id === 3 && (
                                                                            <>
                                                                                <Progress bar color="success" value={60}>60%</Progress>
                                                                                <Progress bar color="primary" value={40} animated></Progress>
                                                                            </>
                                                                        )}
                                                                        {data.training_status_id === 4 && (
                                                                            <>
                                                                                <Progress bar color="success" value={80}>80%</Progress>
                                                                                <Progress bar color="primary" value={20} animated></Progress>
                                                                            </>
                                                                        )}
                                                                        {data.training_status_id === 5 && (
                                                                            <Progress bar color="success" value={100}>100%</Progress>
                                                                        )}
                                                                    </Progress>

                                                                    <div className="loading-content mt-2 text-center">
                                                                        Training In Progress
                                                                        <div className="dot-loader d-inline-block ms-2">
                                                                            <div className="dot"></div>
                                                                            <div className="dot"></div>
                                                                            <div className="dot"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Training In Queue */}
                                                        {isRetrain && (
                                                            <div>
                                                                <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
                                                                    <Progress bar color="primary" value={100} animated>
                                                                        Training In Queue
                                                                    </Progress>
                                                                </Progress>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Collapse>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            {/* View More / View Less Button */}
            {hasMoreData && (
                <div className="text-center mt-3">
                    <Button
                        color="primary"
                        outline
                        onClick={() => setShowAll(!showAll)}
                        className="btn-rounded waves-effect waves-light"
                        style={{
                            minWidth: '200px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {showAll ? (
                            <>
                                <i className="mdi mdi-chevron-up me-1"></i>
                                View Less
                            </>
                        ) : (
                            <>
                                <i className="mdi mdi-chevron-down me-1"></i>
                                View More ({compModelVerInfo.length - 2} more)
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
};

TrainingTable.propTypes = {
    refersh: PropTypes.bool.isRequired,
    compModelVerInfo: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string,
        model_ver: PropTypes.number,
        model_status: PropTypes.string,
        created_on: PropTypes.string,
        camera: PropTypes.shape({
            label: PropTypes.string
        }),
        approved_on: PropTypes.string,
        live_on: PropTypes.string,
        training_status: PropTypes.string,
        training_status_id: PropTypes.number,
        type: PropTypes.string,
        datasets: PropTypes.array,
        rectangles: PropTypes.object,
        region_selection: PropTypes.bool,
        training_start_time: PropTypes.string,
        result_mode: PropTypes.string
    })).isRequired,
    config: PropTypes.arrayOf(PropTypes.shape({
        min_ok_for_training: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        min_notok_for_training: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })).isRequired,
    selectedRows: PropTypes.array.isRequired,
    handleSelectRow: PropTypes.func.isRequired,
    isCheckboxDisabled: PropTypes.func.isRequired,
    togXlarge: PropTypes.func.isRequired,
    activateModel: PropTypes.func.isRequired,
    startAdminTest: PropTypes.func.isRequired,
    train: PropTypes.func.isRequired,
    clock: PropTypes.func.isRequired
};

export default TrainingTable;

// import React, { useState } from 'react';
// import { Table, Button, UncontrolledTooltip, Progress, Row, Collapse } from 'reactstrap';
// import PropTypes from 'prop-types';

// /**
//  * TrainingTable Component
//  *
//  * @prop {boolean} refersh - Controls table visibility
//  * @prop {Array} compModelVerInfo - Array of model training data objects
//  * @prop {Array} config - Configuration array with min_ok_for_training and min_notok_for_training
//  * @prop {Array} selectedRows - Array of currently selected row objects
//  * @prop {Function} handleSelectRow - Callback function: (id, data) => void
//  * @prop {Function} isCheckboxDisabled - Function to determine if checkbox should be disabled: (data) => boolean
//  * @prop {Function} togXlarge - Callback to open modal with log info: (data) => void
//  * @prop {Function} activateModel - Callback to activate a model: (data, index) => void
//  * @prop {Function} startAdminTest - Callback to start admin accuracy test: (data) => void
//  * @prop {Function} train - Callback to start training: (data) => void
//  * @prop {Function} clock - Function to format training time: (timestamp) => string
//  */
// const TrainingTable = ({
//     refersh,
//     compModelVerInfo,
//     config,
//     selectedRows,
//     handleSelectRow,
//     isCheckboxDisabled,
//     togXlarge,
//     activateModel,
//     startAdminTest,
//     train,
//     clock
// }) => {
//     const [expandedRows, setExpandedRows] = useState({});

//     const toggleRow = (id) => {
//         setExpandedRows(prev => ({
//             ...prev,
//             [id]: !prev[id]
//         }));
//     };

//     if (!refersh) return null;

//     return (
//         <div className='table-responsive mt-2 mb-4'>
//             <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
//                 <thead className="table-light">
//                     <tr>
//                         <th style={{ width: '50px' }}></th>
//                         <th>Select Training</th>
//                         <th>Model Version</th>
//                         <th>Model Status</th>
//                         <th>Created on</th>
//                         <th>Camera</th>
//                         <th>Approved on</th>
//                         <th>Live on</th>
//                         <th>Action</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {compModelVerInfo.map((data, index) => {
//                         let okCount = 0;
//                         let notokCount = 0;

//                         if (data.type === 'DL') {
//                             okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
//                             notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;
//                         }

//                         const isInactive = data.model_status === 'Inactive';
//                         const isTrainingInProgress = data.training_status === 'training_in_progress';
//                         const isApprovedTrainedModel = (data.training_status === 'admin approved trained model' && data.model_status !== 'Live');
//                         const isTrainingCompleted = data.training_status === 'training completed';
//                         const isRetrain = data.training_status === 'training_queued';
//                         const isTrainingNotStarted = data.training_status === 'training_not_started';
//                         const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
//                         const hasTrainingDetails = isTrainingInProgress || isRetrain;

//                         return (
//                             <React.Fragment key={index}>
//                                 <tr id='recent-list'>
//                                     {/* Expand/Collapse Icon */}
//                                     <td style={{ backgroundColor: "white", textAlign: 'center' }}>
//                                         {hasTrainingDetails && (
//                                             <Button
//                                                 color="link"
//                                                 size="sm"
//                                                 onClick={() => toggleRow(data._id)}
//                                                 className="p-0"
//                                                 style={{ textDecoration: 'none', fontSize: '18px' }}
//                                             >
//                                                 {expandedRows[data._id] ? '▼' : '▶'}
//                                             </Button>
//                                         )}
//                                     </td>

//                                     {/* Select Training Checkbox */}
//                                     <td style={{ backgroundColor: "white" }}>
//                                         {(() => {
//                                             const { result_mode } = compModelVerInfo[0];
//                                             const minOk = Number(config[0]?.min_ok_for_training);
//                                             const minNotOk = Number(config[0]?.min_notok_for_training);

//                                             const canTrain =
//                                                 (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
//                                                 (result_mode === "ng" && notokCount >= minNotOk) ||
//                                                 (result_mode === "ok" && okCount >= minOk);

//                                             if ((data.training_status === 'training_not_started' ||
//                                                 data.training_status === 'training_queued' ||
//                                                 data.training_status === 'admin accuracy testing in_progress' ||
//                                                 data.training_status === 'training completed') && canTrain) {
//                                                 return (
//                                                     <input
//                                                         type="checkbox"
//                                                         checked={selectedRows.some((item) => item._id === data._id)}
//                                                         onChange={() => handleSelectRow(data._id, data)}
//                                                         disabled={isCheckboxDisabled(data)}
//                                                     />
//                                                 );
//                                             }
//                                             return <span>-</span>;
//                                         })()}
//                                     </td>

//                                     {/* Model Version */}
//                                     <td style={{ backgroundColor: "white" }}>V{data.model_ver}</td>

//                                     {/* Model Status */}
//                                     <td style={{ backgroundColor: "white" }}>
//                                         <span className={
//                                             data.model_status === 'Live' ? 'badge badge-soft-success' :
//                                                 data.model_status === 'Approved' ? 'badge badge-soft-warning' :
//                                                     data.model_status === 'Draft' ? 'badge badge-soft-info' :
//                                                         'badge badge-soft-danger'
//                                         }>
//                                             {data.model_status}
//                                         </span>
//                                     </td>

//                                     {/* Created On */}
//                                     <td style={{ backgroundColor: "white" }}>{data.created_on}</td>

//                                     {/* Camera */}
//                                     <td style={{ backgroundColor: "white" }}>{data.camera.label}</td>

//                                     {/* Approved On */}
//                                     <td style={{ backgroundColor: "white" }}>{data.approved_on}</td>

//                                     {/* Live On */}
//                                     <td style={{ backgroundColor: "white" }}>{data.live_on}</td>

//                                     {/* Actions */}
//                                     <td style={{ backgroundColor: "white", fontSize: "18px" }}>
//                                         <div className="d-flex align-items-start flex-wrap gap-2">
//                                             {/* Log Info Button */}
//                                             <>
//                                                 <Button
//                                                     color="primary"
//                                                     className="btn btn-sm"
//                                                     onClick={() => togXlarge(data)}
//                                                     id={`log-${data._id}`}
//                                                 >
//                                                     Log Info
//                                                 </Button>
//                                                 <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
//                                                     Log Info
//                                                 </UncontrolledTooltip>
//                                             </>

//                                             {/* Activate Button */}
//                                             {isInactive && (
//                                                 <Button
//                                                     color="success"
//                                                     className="btn btn-sm"
//                                                     onClick={() => activateModel(data, index)}
//                                                 >
//                                                     Activate
//                                                 </Button>
//                                             )}

//                                             {/* Train / Admin Test Buttons */}
//                                             {!(data.type === "ML") && !isInactive && !isTrainingInProgress && !isRetrain && (
//                                                 isTrainingCompleted ? (
//                                                     <Button
//                                                         className="btn btn-sm"
//                                                         color="success"
//                                                         onClick={() => startAdminTest(data)}
//                                                     >
//                                                         Start Admin Accuracy Test
//                                                     </Button>
//                                                 ) : (() => {
//                                                     if (isTrainingInProgress || !isTrainingNotStarted) return null;

//                                                     const { result_mode } = compModelVerInfo[0];
//                                                     const minOk = Number(config[0]?.min_ok_for_training);
//                                                     const minNotOk = Number(config[0]?.min_notok_for_training);

//                                                     const canTrain =
//                                                         (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
//                                                         (result_mode === "ng" && notokCount >= minNotOk) ||
//                                                         (result_mode === "ok" && okCount >= minOk);

//                                                     return canTrain ? (
//                                                         <Button
//                                                             className="btn btn-sm"
//                                                             color="primary"
//                                                             onClick={() => train(data)}
//                                                         >
//                                                             Train
//                                                         </Button>
//                                                     ) : null;
//                                                 })()
//                                             )}

//                                             {/* Admin Accuracy Test In Progress */}
//                                             {isAdminAccuracyInProgress && !isTrainingInProgress && (
//                                                 <div>
//                                                     <p className="mb-1 small">Admin Accuracy Testing In Progress</p>
//                                                     <Button
//                                                         className="btn btn-sm"
//                                                         color="success"
//                                                         onClick={() => startAdminTest(data)}
//                                                     >
//                                                         Continue
//                                                     </Button>
//                                                 </div>
//                                             )}

//                                             {/* Training Status Badge */}
//                                             {isTrainingInProgress && (
//                                                 <span className="badge badge-soft-info">
//                                                     Training In Progress - Click arrow to view details
//                                                 </span>
//                                             )}

//                                             {isRetrain && (
//                                                 <span className="badge badge-soft-warning">
//                                                     Training In Queue
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>

//                                 {/* Collapsible Training Details Row */}
//                                 {hasTrainingDetails && (
//                                     <tr>
//                                         <td colSpan="9" style={{ backgroundColor: "#f8f9fa", padding: 0 }}>
//                                             <Collapse isOpen={expandedRows[data._id]}>
//                                                 <div className="p-3">
//                                                     {/* Training In Progress Details */}
//                                                     {isTrainingInProgress && data?.training_status !== 'training_queued' && (
//                                                         <div>
//                                                             {/* Timer */}
//                                                             <div className="mb-3 text-center">
//                                                                 <strong>Training Duration: </strong>
//                                                                 {data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}
//                                                             </div>

//                                                             {/* Region-wise Progress */}
//                                                             {data?.rectangles && data?.region_selection && (
//                                                                 <div className="mb-4">
//                                                                     <h6 className="mb-3">Region Training Progress</h6>
//                                                                     {Object.values(data.rectangles).map((position, posIndex) => (
//                                                                         <div key={posIndex} className="mb-3">
//                                                                             {Object.values(position).map((region, regionIndex) => (
//                                                                                 <div key={region.id} className="mb-3">
//                                                                                     <div className="mb-2">
//                                                                                         <strong>{regionIndex + 1}. {region.name}</strong>
//                                                                                     </div>
//                                                                                     <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
//                                                                                         {region.training_status_id === 0 && (
//                                                                                             <Progress bar color="primary" value={100} animated>Loading...</Progress>
//                                                                                         )}
//                                                                                         {region.training_status_id === 1 && (
//                                                                                             <>
//                                                                                                 <Progress bar color="success" value={20}>20%</Progress>
//                                                                                                 <Progress bar color="primary" value={80} animated></Progress>
//                                                                                             </>
//                                                                                         )}
//                                                                                         {region.training_status_id === 2 && (
//                                                                                             <>
//                                                                                                 <Progress bar color="success" value={40}>40%</Progress>
//                                                                                                 <Progress bar color="primary" value={60} animated></Progress>
//                                                                                             </>
//                                                                                         )}
//                                                                                         {region.training_status_id === 3 && (
//                                                                                             <>
//                                                                                                 <Progress bar color="success" value={60}>60%</Progress>
//                                                                                                 <Progress bar color="primary" value={40} animated></Progress>
//                                                                                             </>
//                                                                                         )}
//                                                                                         {region.training_status_id === 4 && (
//                                                                                             <>
//                                                                                                 <Progress bar color="success" value={80}>80%</Progress>
//                                                                                                 <Progress bar color="primary" value={20} animated></Progress>
//                                                                                             </>
//                                                                                         )}
//                                                                                         {region.training_status_id === 5 && (
//                                                                                             <Progress bar color="success" value={100}>100%</Progress>
//                                                                                         )}
//                                                                                     </Progress>
//                                                                                 </div>
//                                                                             ))}
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             )}

//                                                             {/* Component Training Progress */}
//                                                             <div>
//                                                                 <h6 className="mb-3">Component Training Progress</h6>
//                                                                 <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
//                                                                     {data.training_status_id === 0 && (
//                                                                         <Progress bar color="primary" value={100} animated>Loading...</Progress>
//                                                                     )}
//                                                                     {data.training_status_id === 1 && (
//                                                                         <>
//                                                                             <Progress bar color="success" value={20}>20%</Progress>
//                                                                             <Progress bar color="primary" value={80} animated></Progress>
//                                                                         </>
//                                                                     )}
//                                                                     {data.training_status_id === 2 && (
//                                                                         <>
//                                                                             <Progress bar color="success" value={40}>40%</Progress>
//                                                                             <Progress bar color="primary" value={60} animated></Progress>
//                                                                         </>
//                                                                     )}
//                                                                     {data.training_status_id === 3 && (
//                                                                         <>
//                                                                             <Progress bar color="success" value={60}>60%</Progress>
//                                                                             <Progress bar color="primary" value={40} animated></Progress>
//                                                                         </>
//                                                                     )}
//                                                                     {data.training_status_id === 4 && (
//                                                                         <>
//                                                                             <Progress bar color="success" value={80}>80%</Progress>
//                                                                             <Progress bar color="primary" value={20} animated></Progress>
//                                                                         </>
//                                                                     )}
//                                                                     {data.training_status_id === 5 && (
//                                                                         <Progress bar color="success" value={100}>100%</Progress>
//                                                                     )}
//                                                                 </Progress>

//                                                                 <div className="loading-content mt-2 text-center">
//                                                                     Training In Progress
//                                                                     <div className="dot-loader d-inline-block ms-2">
//                                                                         <div className="dot"></div>
//                                                                         <div className="dot"></div>
//                                                                         <div className="dot"></div>
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     )}

//                                                     {/* Training In Queue */}
//                                                     {isRetrain && (
//                                                         <div>
//                                                             <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
//                                                                 <Progress bar color="primary" value={100} animated>
//                                                                     Training In Queue
//                                                                 </Progress>
//                                                             </Progress>
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </Collapse>
//                                         </td>
//                                     </tr>
//                                 )}
//                             </React.Fragment>
//                         );
//                     })}
//                 </tbody>
//             </Table>
//         </div>
//     );
// };

// TrainingTable.propTypes = {
//     refersh: PropTypes.bool.isRequired,
//     compModelVerInfo: PropTypes.arrayOf(PropTypes.shape({
//         _id: PropTypes.string,
//         model_ver: PropTypes.number,
//         model_status: PropTypes.string,
//         created_on: PropTypes.string,
//         camera: PropTypes.shape({
//             label: PropTypes.string
//         }),
//         approved_on: PropTypes.string,
//         live_on: PropTypes.string,
//         training_status: PropTypes.string,
//         training_status_id: PropTypes.number,
//         type: PropTypes.string,
//         datasets: PropTypes.array,
//         rectangles: PropTypes.object,
//         region_selection: PropTypes.bool,
//         training_start_time: PropTypes.string,
//         result_mode: PropTypes.string
//     })).isRequired,
//     config: PropTypes.arrayOf(PropTypes.shape({
//         min_ok_for_training: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//         min_notok_for_training: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     })).isRequired,
//     selectedRows: PropTypes.array.isRequired,
//     handleSelectRow: PropTypes.func.isRequired,
//     isCheckboxDisabled: PropTypes.func.isRequired,
//     togXlarge: PropTypes.func.isRequired,
//     activateModel: PropTypes.func.isRequired,
//     startAdminTest: PropTypes.func.isRequired,
//     train: PropTypes.func.isRequired,
//     clock: PropTypes.func.isRequired
// };

// export default TrainingTable;
// // import React, { useState } from 'react';
// // import { Table, Button, UncontrolledTooltip, Progress, Row, Collapse } from 'reactstrap';
// // import { ChevronDown, ChevronRight } from 'lucide-react';

// // /**
// //  * TrainingTable Component
// //  *
// //  * @prop {boolean} refersh - Controls table visibility
// //  * @prop {Array} compModelVerInfo - Array of model training data objects
// //  * @prop {Array} config - Configuration array with min_ok_for_training and min_notok_for_training
// //  * @prop {Array} selectedRows - Array of currently selected row objects
// //  * @prop {Function} handleSelectRow - Callback function: (id, data) => void
// //  * @prop {Function} isCheckboxDisabled - Function to determine if checkbox should be disabled: (data) => boolean
// //  * @prop {Function} togXlarge - Callback to open modal with log info: (data) => void
// //  * @prop {Function} activateModel - Callback to activate a model: (data, index) => void
// //  * @prop {Function} startAdminTest - Callback to start admin accuracy test: (data) => void
// //  * @prop {Function} train - Callback to start training: (data) => void
// //  * @prop {Function} clock - Function to format training time: (timestamp) => string
// //  */
// // const TrainingTable = ({
// //     refersh,
// //     compModelVerInfo,
// //     config,
// //     selectedRows,
// //     handleSelectRow,
// //     isCheckboxDisabled,
// //     togXlarge,
// //     activateModel,
// //     startAdminTest,
// //     train,
// //     clock
// // }) => {
// //     const [expandedRows, setExpandedRows] = useState({});

// //     const toggleRow = (id) => {
// //         setExpandedRows(prev => ({
// //             ...prev,
// //             [id]: !prev[id]
// //         }));
// //     };

// //     if (!refersh) return null;

// //     return (
// //         <div className='table-responsive mt-2 mb-4'>
// //             <Table className="table mb-0 align-middle table-nowrap table-check" bordered>
// //                 <thead className="table-light">
// //                     <tr>
// //                         <th style={{ width: '50px' }}></th>
// //                         <th>Select Training</th>
// //                         <th>Model Version</th>
// //                         <th>Model Status</th>
// //                         <th>Created on</th>
// //                         <th>Camera</th>
// //                         <th>Approved on</th>
// //                         <th>Live on</th>
// //                         <th>Action</th>
// //                     </tr>
// //                 </thead>
// //                 <tbody>
// //                     {compModelVerInfo.map((data, index) => {
// //                         let okCount = 0;
// //                         let notokCount = 0;

// //                         if (data.type === 'DL') {
// //                             okCount = data.datasets.filter((dataset) => dataset.type === 'OK').length;
// //                             notokCount = data.datasets.filter((dataset) => dataset.type === 'NG').length;
// //                         }

// //                         const isInactive = data.model_status === 'Inactive';
// //                         const isTrainingInProgress = data.training_status === 'training_in_progress';
// //                         const isApprovedTrainedModel = (data.training_status === 'admin approved trained model' && data.model_status !== 'Live');
// //                         const isTrainingCompleted = data.training_status === 'training completed';
// //                         const isRetrain = data.training_status === 'training_queued';
// //                         const isTrainingNotStarted = data.training_status === 'training_not_started';
// //                         const isAdminAccuracyInProgress = data.training_status === 'admin accuracy testing in_progress';
// //                         const hasTrainingDetails = isTrainingInProgress || isRetrain;

// //                         return (
// //                             <React.Fragment key={index}>
// //                                 <tr id='recent-list'>
// //                                     {/* Expand/Collapse Icon */}
// //                                     <td style={{ backgroundColor: "white", textAlign: 'center' }}>
// //                                         {hasTrainingDetails && (
// //                                             <Button
// //                                                 color="link"
// //                                                 size="sm"
// //                                                 onClick={() => toggleRow(data._id)}
// //                                                 className="p-0"
// //                                             >
// //                                                 {expandedRows[data._id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
// //                                             </Button>
// //                                         )}
// //                                     </td>

// //                                     {/* Select Training Checkbox */}
// //                                     <td style={{ backgroundColor: "white" }}>
// //                                         {(() => {
// //                                             const { result_mode } = compModelVerInfo[0];
// //                                             const minOk = Number(config[0]?.min_ok_for_training);
// //                                             const minNotOk = Number(config[0]?.min_notok_for_training);

// //                                             const canTrain =
// //                                                 (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
// //                                                 (result_mode === "ng" && notokCount >= minNotOk) ||
// //                                                 (result_mode === "ok" && okCount >= minOk);

// //                                             if ((data.training_status === 'training_not_started' ||
// //                                                 data.training_status === 'training_queued' ||
// //                                                 data.training_status === 'admin accuracy testing in_progress' ||
// //                                                 data.training_status === 'training completed') && canTrain) {
// //                                                 return (
// //                                                     <input
// //                                                         type="checkbox"
// //                                                         checked={selectedRows.some((item) => item._id === data._id)}
// //                                                         onChange={() => handleSelectRow(data._id, data)}
// //                                                         disabled={isCheckboxDisabled(data)}
// //                                                     />
// //                                                 );
// //                                             }
// //                                             return <span>-</span>;
// //                                         })()}
// //                                     </td>

// //                                     {/* Model Version */}
// //                                     <td style={{ backgroundColor: "white" }}>V{data.model_ver}</td>

// //                                     {/* Model Status */}
// //                                     <td style={{ backgroundColor: "white" }}>
// //                                         <span className={
// //                                             data.model_status === 'Live' ? 'badge badge-soft-success' :
// //                                                 data.model_status === 'Approved' ? 'badge badge-soft-warning' :
// //                                                     data.model_status === 'Draft' ? 'badge badge-soft-info' :
// //                                                         'badge badge-soft-danger'
// //                                         }>
// //                                             {data.model_status}
// //                                         </span>
// //                                     </td>

// //                                     {/* Created On */}
// //                                     <td style={{ backgroundColor: "white" }}>{data.created_on}</td>

// //                                     {/* Camera */}
// //                                     <td style={{ backgroundColor: "white" }}>{data.camera.label}</td>

// //                                     {/* Approved On */}
// //                                     <td style={{ backgroundColor: "white" }}>{data.approved_on}</td>

// //                                     {/* Live On */}
// //                                     <td style={{ backgroundColor: "white" }}>{data.live_on}</td>

// //                                     {/* Actions */}
// //                                     <td style={{ backgroundColor: "white", fontSize: "18px" }}>
// //                                         <div className="d-flex align-items-start flex-wrap gap-2">
// //                                             {/* Log Info Button */}
// //                                             <>
// //                                                 <Button
// //                                                     color="primary"
// //                                                     className="btn btn-sm"
// //                                                     onClick={() => togXlarge(data)}
// //                                                     id={`log-${data._id}`}
// //                                                 >
// //                                                     Log Info
// //                                                 </Button>
// //                                                 <UncontrolledTooltip placement="top" target={`log-${data._id}`}>
// //                                                     Log Info
// //                                                 </UncontrolledTooltip>
// //                                             </>

// //                                             {/* Activate Button */}
// //                                             {isInactive && (
// //                                                 <Button
// //                                                     color="success"
// //                                                     className="btn btn-sm"
// //                                                     onClick={() => activateModel(data, index)}
// //                                                 >
// //                                                     Activate
// //                                                 </Button>
// //                                             )}

// //                                             {/* Train / Admin Test Buttons */}
// //                                             {!(data.type === "ML") && !isInactive && !isTrainingInProgress && !isRetrain && (
// //                                                 isTrainingCompleted ? (
// //                                                     <Button
// //                                                         className="btn btn-sm"
// //                                                         color="success"
// //                                                         onClick={() => startAdminTest(data)}
// //                                                     >
// //                                                         Start Admin Accuracy Test
// //                                                     </Button>
// //                                                 ) : (() => {
// //                                                     if (isTrainingInProgress || !isTrainingNotStarted) return null;

// //                                                     const { result_mode } = compModelVerInfo[0];
// //                                                     const minOk = Number(config[0]?.min_ok_for_training);
// //                                                     const minNotOk = Number(config[0]?.min_notok_for_training);

// //                                                     const canTrain =
// //                                                         (result_mode === "both" && okCount >= minOk && notokCount >= minNotOk) ||
// //                                                         (result_mode === "ng" && notokCount >= minNotOk) ||
// //                                                         (result_mode === "ok" && okCount >= minOk);

// //                                                     return canTrain ? (
// //                                                         <Button
// //                                                             className="btn btn-sm"
// //                                                             color="primary"
// //                                                             onClick={() => train(data)}
// //                                                         >
// //                                                             Train
// //                                                         </Button>
// //                                                     ) : null;
// //                                                 })()
// //                                             )}

// //                                             {/* Admin Accuracy Test In Progress */}
// //                                             {isAdminAccuracyInProgress && !isTrainingInProgress && (
// //                                                 <div>
// //                                                     <p className="mb-1 small">Admin Accuracy Testing In Progress</p>
// //                                                     <Button
// //                                                         className="btn btn-sm"
// //                                                         color="success"
// //                                                         onClick={() => startAdminTest(data)}
// //                                                     >
// //                                                         Continue
// //                                                     </Button>
// //                                                 </div>
// //                                             )}

// //                                             {/* Training Status Badge */}
// //                                             {isTrainingInProgress && (
// //                                                 <span className="badge badge-soft-info">
// //                                                     Training In Progress - Click arrow to view details
// //                                                 </span>
// //                                             )}

// //                                             {isRetrain && (
// //                                                 <span className="badge badge-soft-warning">
// //                                                     Training In Queue
// //                                                 </span>
// //                                             )}
// //                                         </div>
// //                                     </td>
// //                                 </tr>

// //                                 {/* Collapsible Training Details Row */}
// //                                 {hasTrainingDetails && (
// //                                     <tr>
// //                                         <td colSpan="9" style={{ backgroundColor: "#f8f9fa", padding: 0 }}>
// //                                             <Collapse isOpen={expandedRows[data._id]}>
// //                                                 <div className="p-3">
// //                                                     {/* Training In Progress Details */}
// //                                                     {isTrainingInProgress && data?.training_status !== 'training_queued' && (
// //                                                         <div>
// //                                                             {/* Timer */}
// //                                                             <div className="mb-3 text-center">
// //                                                                 <strong>Training Duration: </strong>
// //                                                                 {data.training_start_time ? clock(data.training_start_time) : 'Training started ...'}
// //                                                             </div>

// //                                                             {/* Region-wise Progress */}
// //                                                             {data?.rectangles && data?.region_selection && (
// //                                                                 <div className="mb-4">
// //                                                                     <h6 className="mb-3">Region Training Progress</h6>
// //                                                                     {Object.values(data.rectangles).map((position, posIndex) => (
// //                                                                         <div key={posIndex} className="mb-3">
// //                                                                             {Object.values(position).map((region, regionIndex) => (
// //                                                                                 <div key={region.id} className="mb-3">
// //                                                                                     <div className="mb-2">
// //                                                                                         <strong>{regionIndex + 1}. {region.name}</strong>
// //                                                                                     </div>
// //                                                                                     <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
// //                                                                                         {region.training_status_id === 0 && (
// //                                                                                             <Progress bar color="primary" value={100} animated>Loading...</Progress>
// //                                                                                         )}
// //                                                                                         {region.training_status_id === 1 && (
// //                                                                                             <>
// //                                                                                                 <Progress bar color="success" value={20}>20%</Progress>
// //                                                                                                 <Progress bar color="primary" value={80} animated></Progress>
// //                                                                                             </>
// //                                                                                         )}
// //                                                                                         {region.training_status_id === 2 && (
// //                                                                                             <>
// //                                                                                                 <Progress bar color="success" value={40}>40%</Progress>
// //                                                                                                 <Progress bar color="primary" value={60} animated></Progress>
// //                                                                                             </>
// //                                                                                         )}
// //                                                                                         {region.training_status_id === 3 && (
// //                                                                                             <>
// //                                                                                                 <Progress bar color="success" value={60}>60%</Progress>
// //                                                                                                 <Progress bar color="primary" value={40} animated></Progress>
// //                                                                                             </>
// //                                                                                         )}
// //                                                                                         {region.training_status_id === 4 && (
// //                                                                                             <>
// //                                                                                                 <Progress bar color="success" value={80}>80%</Progress>
// //                                                                                                 <Progress bar color="primary" value={20} animated></Progress>
// //                                                                                             </>
// //                                                                                         )}
// //                                                                                         {region.training_status_id === 5 && (
// //                                                                                             <Progress bar color="success" value={100}>100%</Progress>
// //                                                                                         )}
// //                                                                                     </Progress>
// //                                                                                 </div>
// //                                                                             ))}
// //                                                                         </div>
// //                                                                     ))}
// //                                                                 </div>
// //                                                             )}

// //                                                             {/* Component Training Progress */}
// //                                                             <div>
// //                                                                 <h6 className="mb-3">Component Training Progress</h6>
// //                                                                 <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
// //                                                                     {data.training_status_id === 0 && (
// //                                                                         <Progress bar color="primary" value={100} animated>Loading...</Progress>
// //                                                                     )}
// //                                                                     {data.training_status_id === 1 && (
// //                                                                         <>
// //                                                                             <Progress bar color="success" value={20}>20%</Progress>
// //                                                                             <Progress bar color="primary" value={80} animated></Progress>
// //                                                                         </>
// //                                                                     )}
// //                                                                     {data.training_status_id === 2 && (
// //                                                                         <>
// //                                                                             <Progress bar color="success" value={40}>40%</Progress>
// //                                                                             <Progress bar color="primary" value={60} animated></Progress>
// //                                                                         </>
// //                                                                     )}
// //                                                                     {data.training_status_id === 3 && (
// //                                                                         <>
// //                                                                             <Progress bar color="success" value={60}>60%</Progress>
// //                                                                             <Progress bar color="primary" value={40} animated></Progress>
// //                                                                         </>
// //                                                                     )}
// //                                                                     {data.training_status_id === 4 && (
// //                                                                         <>
// //                                                                             <Progress bar color="success" value={80}>80%</Progress>
// //                                                                             <Progress bar color="primary" value={20} animated></Progress>
// //                                                                         </>
// //                                                                     )}
// //                                                                     {data.training_status_id === 5 && (
// //                                                                         <Progress bar color="success" value={100}>100%</Progress>
// //                                                                     )}
// //                                                                 </Progress>

// //                                                                 <div className="loading-content mt-2 text-center">
// //                                                                     Training In Progress
// //                                                                     <div className="dot-loader d-inline-block ms-2">
// //                                                                         <div className="dot"></div>
// //                                                                         <div className="dot"></div>
// //                                                                         <div className="dot"></div>
// //                                                                     </div>
// //                                                                 </div>
// //                                                             </div>
// //                                                         </div>
// //                                                     )}

// //                                                     {/* Training In Queue */}
// //                                                     {isRetrain && (
// //                                                         <div>
// //                                                             <Progress multi style={{ height: '20px', fontWeight: 'bold' }}>
// //                                                                 <Progress bar color="primary" value={100} animated>
// //                                                                     Training In Queue
// //                                                                 </Progress>
// //                                                             </Progress>
// //                                                         </div>
// //                                                     )}
// //                                                 </div>
// //                                             </Collapse>
// //                                         </td>
// //                                     </tr>
// //                                 )}
// //                             </React.Fragment>
// //                         );
// //                     })}
// //                 </tbody>
// //             </Table>
// //         </div>
// //     );
// // };

// // export default TrainingTable;