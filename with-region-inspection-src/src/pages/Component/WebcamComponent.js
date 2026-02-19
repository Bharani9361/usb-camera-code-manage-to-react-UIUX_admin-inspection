import React from 'react';
import Webcam from 'react-webcam';
import PropTypes from 'prop-types';

const WebcamComponent = ({ videoConstraints, showresult, response_message, config_positive, config_negative, config_posble_match }) => {
    const borderStyle = {
        border: showresult
            ? response_message === 'No Objects Detected'
                ? ''
                : response_message === config_positive
                    ? '10px solid lightgreen'
                    : response_message === config_negative
                        ? '10px solid red'
                        : response_message === config_posble_match
                            ? '10px solid orange'
                            : null
            : null,
        borderRadius: '2rem',
    };

    return (
        <Webcam
            videoConstraints={videoConstraints}
            audio={false}
            height={'100%'}
            screenshotFormat="image/png"
            width={'100%'}
            style={showresult ? borderStyle : { borderRadius: '2rem' }}
        />
    );
};


WebcamComponent.propTypes = {
    videoConstraints: PropTypes.object.isRequired,
    showresult: PropTypes.bool.isRequired,
    response_message: PropTypes.string.isRequired,
    config_positive: PropTypes.string.isRequired,
    config_negative: PropTypes.string.isRequired,
    config_posble_match: PropTypes.string.isRequired,
};

export default WebcamComponent;