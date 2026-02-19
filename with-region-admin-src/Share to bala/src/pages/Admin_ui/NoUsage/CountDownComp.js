import React, { useState } from 'react';
import Countdown from 'react-countdown';
import { Button } from 'reactstrap';

const CountDownComp = () => {
    // State to track the end of the countdown
    const [hasEnded, setHasEnded] = useState(false);
    const [showTime, setShowTime] = useState(false);

    // Function to call when the countdown ends
    const handleCountdownEnd = () => {
        setHasEnded(true);
        console.log("Countdown has ended!");
        // Call your custom function here
    };

    // Clock-like countdown renderer (days, hours, minutes, seconds)
    const clockLikeRenderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return <span>Countdown Complete!</span>;
        } else {
            return (
                <div>
                    <p>{days} Days</p>
                    <p>{hours} Hours</p>
                    <p>{minutes} Minutes</p>
                    <p>{seconds} Seconds</p>
                </div>
            );
        }
    };

    // Digital countdown renderer (HH:MM:SS format)
    const digitalClockRenderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return <span>Countdown Complete!</span>;
        } else {
            return (
                <div>
                    <p>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
                </div>
            );
        }
    };

    return (
        <div>
            <h5>Countdown Timer</h5>
            <Button onClick={() => setShowTime(!showTime)}>Show / Hide Time</Button>

            {showTime &&
            <>
            {/* Clock-like Countdown */}
            <h5>Clock-like Countdown</h5>
            <Countdown
                date={Date.now() + 50000} // Countdown set for 50 seconds
                onComplete={handleCountdownEnd} // Trigger function when countdown ends
                renderer={clockLikeRenderer} // Clock-like renderer
            />

            {/* Digital Clock Countdown */}
            <h5>Digital Clock Countdown</h5>
            <Countdown
                date={Date.now() + 50000} // Countdown set for 50 seconds
                onComplete={handleCountdownEnd} // Trigger function when countdown ends
                renderer={digitalClockRenderer} // Digital clock renderer
            />
            
            </>
            }

            {hasEnded && <p>The countdown has ended! Now you can trigger other actions.</p>}
        </div>
    );
};

export default CountDownComp;
