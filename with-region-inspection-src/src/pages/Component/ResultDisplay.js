import React from 'react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const ResultDisplay = ({ showresult, response_message, config_positive, config_negative, response_value }) => {
    console.log('first6', showresult, response_message, config_positive, config_negative, response_value)
    if (!showresult) return null;

    let icon = null;
    let color = 'black';

    switch (response_message) {
        case 'No Objects Detected':
            break;
        case config_positive:
            icon = <CheckCircleOutlined style={{ fontSize: '80px' }} />;
            color = 'lightgreen';
            break;
        case config_negative:
            icon = <CloseCircleOutlined style={{ color: 'red', fontSize: '80px' }} />;
            color = 'red';
            break;
        default:
            break;
    }

    return (
        <div className="containerImg">
            <div style={{ color }}>{response_message}</div>
            <div className="align-self-bottom">{icon}</div>
            <div>{`Result: ${response_message} ${response_value}`}</div>
        </div>
    );
};

ResultDisplay.propTypes = {
    showresult: PropTypes.bool.isRequired,
    response_message: PropTypes.string.isRequired,
    config_positive: PropTypes.string.isRequired,
    config_negative: PropTypes.string.isRequired,
    response_value: PropTypes.string.isRequired,
};

export default ResultDisplay;