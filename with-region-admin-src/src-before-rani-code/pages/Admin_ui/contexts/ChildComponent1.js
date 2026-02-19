import React, { useEffect, useState } from 'react';
import useSocket from './useSocket';

const ChildComponent1 = () => {
  const { socket, data } = useSocket();
  const [childData, setChildData] = useState(null);

  useEffect(() => {
    if(socket) {
        // Listen to specific events for this child
        socket.on('child_event', (payload) => {
            console.log('parload not found')
            setChildData(payload);
        });

        return () => {
            // Cleanup the event listener
            socket.off('child_event');
        };
    }
    
  }, [socket]);

  return (
    <div>
      <h2>Child Component 1</h2>
      <p>Shared Data: {JSON.stringify(data)}</p>
      <p>Child-Specific Data: {JSON.stringify(childData)}</p>
    </div>
  );
};

export default ChildComponent1;
