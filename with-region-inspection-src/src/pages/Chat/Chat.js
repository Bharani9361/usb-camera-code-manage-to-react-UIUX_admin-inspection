// Import dependencies
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

function App() {
  const webcam = useRef(null);
  const canvasRef = useRef(null);

  // Main function
  const runCoco = async () => {
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect();
    }, 10);
  };

  const detect = async () => {
    // Check data is available

    console.log(webcam)

    if (
      typeof webcam.current !== "undefined" &&
      webcam.current !== null &&
      webcam.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcam.current.video;
      const videoWidth = webcam.current.video.videoWidth;
      const videoHeight = webcam.current.video.videoHeight;

      // Set video width
      webcam.current.video.width = videoWidth;
      webcam.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      ctx.rect(21, 64, 640,  480);
      ctx.lineWidth = "6";
      ctx.strokeStyle = "red";
      ctx.stroke();
      //drawRect(obj, ctx); 
    }
  };

  useEffect(() => { runCoco() }, []);

  return (
    <div className="App">
      <header className="App-header mt-5">
        <Webcam
          ref={webcam}
          muted={true}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 8,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
