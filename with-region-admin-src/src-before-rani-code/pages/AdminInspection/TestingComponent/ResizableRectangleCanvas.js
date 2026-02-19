// // canvas and rectangle not adjustable.
// import React, { useRef, useState, useEffect } from 'react';

// const ResizableRectangleCanvas = () => {
//     const canvasRef = useRef(null);
//     const containerRef = useRef(null);
//     const [isDrawing, setIsDrawing] = useState(false);
//     const [rect, setRect] = useState({});
//     const [startPos, setStartPos] = useState({});
//     const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
//     const [canvasData, setCanvasData] = useState({
//         canvasWidth: 0,
//         canvasHeight: 0,
//         rectangle: {}
//     });

//     useEffect(() => {
//         const handleResize = () => {
//             const container = containerRef.current;
//             setCanvasSize({
//                 width: container.clientWidth,
//                 height: container.clientHeight
//             });
//         };

//         handleResize();
//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, []);

//     useEffect(() => {
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d');
//         context.clearRect(0, 0, canvas.width, canvas.height);

//         if (rect.width && rect.height) {
//             context.strokeStyle = 'black';
//             context.lineWidth = 2;
//             context.strokeRect(rect.x, rect.y, rect.width, rect.height);
//         }
//     }, [rect, canvasSize]);

//     const handleMouseDown = (e) => {
//         const rect = canvasRef.current.getBoundingClientRect();
//         setStartPos({
//             x: (e.clientX - rect.left) * (canvasRef.current.width / rect.width),
//             y: (e.clientY - rect.top) * (canvasRef.current.height / rect.height)
//         });
//         setIsDrawing(true);
//     };

//     const handleMouseUp = () => {
//         setIsDrawing(false);
//     };

//     const handleMouseMove = (e) => {
//         if (!isDrawing) return;

//         const rect = canvasRef.current.getBoundingClientRect();
//         const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
//         const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

//         setRect({
//             x: Math.min(x, startPos.x),
//             y: Math.min(y, startPos.y),
//             width: Math.abs(x - startPos.x),
//             height: Math.abs(y - startPos.y)
//         });
//     };

//     const handleExportCanvasData = () => {
//         const canvas = canvasRef.current;
//         const canvasData = {
//             canvasWidth: canvas.width,
//             canvasHeight: canvas.height,
//             rectangle: rect
//         };
//         setCanvasData(canvasData);
//         console.log(canvasData); // You can use this data as needed (e.g., send to server, display to user)
//     };

//     return (
//         <div className='page-content' ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
//             <canvas
//                 ref={canvasRef}
//                 width={canvasSize.width}
//                 height={canvasSize.height}
//                 style={{ border: '1px solid black' }}
//                 onMouseDown={handleMouseDown}
//                 onMouseUp={handleMouseUp}
//                 onMouseMove={handleMouseMove}
//             />
//             <button onClick={handleExportCanvasData}>Export Canvas Data</button>
//         </div>
//     );
// };

// export default ResizableRectangleCanvas;


// // canvas only responsive not rectangle inside in it.
// import React, { useRef, useState, useEffect } from 'react';

// const ResizableRectangleCanvas = () => {
//   const canvasRef = useRef(null);
//   const [canvasSize, setCanvasSize] = useState(300); // Initial canvas size, in pixels
//   const [rect, setRect] = useState({});
//   const [startPos, setStartPos] = useState({});
//   const [isDrawing, setIsDrawing] = useState(false);

//   useEffect(() => {
//     const handleResize = () => {
//       const newSize = Math.min(window.innerWidth, window.innerHeight) * 0.8; // Adjust size dynamically
//       setCanvasSize(newSize);
//     };

//     handleResize();
//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');
//     context.clearRect(0, 0, canvas.width, canvas.height);

//     if (rect.width && rect.height) {
//       context.strokeStyle = 'black';
//       context.lineWidth = 2;
//       context.strokeRect(rect.x, rect.y, rect.width, rect.height);
//     }
//   }, [rect, canvasSize]);

//   const handleMouseDown = (e) => {
//     const rect = canvasRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     setStartPos({ x, y });
//     setIsDrawing(true);
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//   };

//   const handleMouseMove = (e) => {
//     if (!isDrawing) return;

//     const rect = canvasRef.current.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const y = e.clientY - rect.top;

//     setRect({
//       x: Math.min(x, startPos.x),
//       y: Math.min(y, startPos.y),
//       width: Math.abs(x - startPos.x),
//       height: Math.abs(y - startPos.y)
//     });
//   };

//   return (
//     <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//       <canvas
//         ref={canvasRef}
//         width={canvasSize}
//         height={canvasSize}
//         style={{ border: '1px solid black' }}
//         onMouseDown={handleMouseDown}
//         onMouseUp={handleMouseUp}
//         onMouseMove={handleMouseMove}
//       />
//     </div>
//   );
// };

// export default ResizableRectangleCanvas;


import React, { useRef, useState, useEffect } from 'react';

const ResizableRectangleCanvas = () => {
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 });
  const [rect, setRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

  const handleResize = () => {
    const newSize = Math.min(window.innerWidth, window.innerHeight) * 0.8;
    console.log('********* sizes ', newSize, canvasSize, [window.innerWidth, window.innerHeight])
    const scaleX = newSize / canvasSize.width;
    const scaleY = newSize / canvasSize.height;

    setCanvasSize({ width: newSize, height: newSize });
    setRect(prevRect => ({
      x: prevRect.x * scaleX,
      y: prevRect.y * scaleY,
      width: prevRect.width * scaleX,
      height: prevRect.height * scaleY,
    }));
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    console.log('******** rect, canvasSize')
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    if (rect.width && rect.height) {
      context.strokeStyle = 'black';
      context.lineWidth = 2;
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
  }, [rect, canvasSize]);

  const handleMouseDown = (e) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    setRect({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ border: '1px solid black' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default ResizableRectangleCanvas;
