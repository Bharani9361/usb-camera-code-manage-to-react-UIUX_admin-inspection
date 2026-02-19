// import React from "react";

// export default function CameraView({ port }) {
//     console.log('port', port)
//     const src = `http://localhost:8000/video/${port}`;

//     return (
//         <div style={{ textAlign: "center" }}>
//             <img
//                 src={src}
//                 alt={`Camera port ${port}`}
//                 style={{
//                     width: 640,
//                     height: 360,
//                     objectFit: "cover",
//                     borderRadius: 8,
//                     border: "1px solid #222"
//                 }}
//                 onError={(e) => {
//                     // show placeholder on error
//                     e.target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQBAMAAADt1kGZAAAAGFBMVEUAAAD///9fX1+fn5+cnJzV1dXq6urQ0NDq6urW5sK6AAAAKElEQVR4nO3BMQEAAADCoPdPbQ43oAAAAAAAAAAA4G0GgAAGqjv4wAAAAASUVORK5CYII=";
//                 }}
//             />
//         </div>
//     );
// }



import React from "react";
import PropTypes from "prop-types";

export default function CameraView({ port }) {
    console.log('port', port)
    const src = `http://localhost:8000/video/${port}`;
    console.log('src', src)

    return (
        <div style={{ textAlign: "center" }}>
            <img
                src={src}
                alt={`Camera port ${port}`}
                style={{
                    width: 640,
                    height: 360,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #222"
                }}
                onError={(e) => {
                    e.target.src =
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQBAMAAADt1kGZAAAAGFBMVEUAAAD///9fX1+fn5+cnJzV1dXq6urQ0NDq6urW5sK6AAAAKElEQVR4nO3BMQEAAADCoPdPbQ43oAAAAAAAAAAA4G0GgAAGqjv4wAAAAASUVORK5CYII=";
                }}
            />
        </div>
    );
}

CameraView.propTypes = {
    port: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};





