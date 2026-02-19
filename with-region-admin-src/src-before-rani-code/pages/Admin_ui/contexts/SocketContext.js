import PropTypes from 'prop-types';
import React, { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { socketUrl } from '../urls';

// Create a Context for the socket
export const SocketContext = createContext();

const SocketProvider = ({ children }) => {
  const socket = useRef(null); // Ensure a single socket instance
  const [data, setData] = useState({}); // Shared state for received data

  useEffect(() => {
    // Connect to the backend (Replace `http://localhost:5000` with your Flask backend URL)
    socket.current = io(socketUrl);

    // Handle connection events
    socket.current.on('connect', () => {
      console.log('Socket connected:', socket.current.id);
    });

    // Example of receiving and storing data
    socket.current.on('example_event', (payload) => {
      setData((prev) => ({ ...prev, example_event: payload }));
    });
    socket.current.on('child_event', (payload) => {
      setData((prev) => ({ ...prev, child_event: payload }));
    });
    socket.current.on('extra_event', (payload) => {
      setData((prev) => ({ ...prev, extra_event: payload }));
    });

    // Handle socket disconnection event
    socket.current.on('disconnect', (reason) => {
      console.log('Socket disconnected. Reason:', reason); // 'transport close', 'client namespace disconnect', etc.
    });

    // Handle socket connection error event
    socket.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message || error);
    });

    // Handle socket connection timeout event
    socket.current.on('connect_timeout', (timeout) => {
      console.error('Socket connection timeout:', timeout);
    });

    // Cleanup on unmount
    return () => {
      socket.current.disconnect();
        socket.current.off('connect');
        socket.current.off('disconnect');
        socket.current.off('connect_error');
        socket.current.off('connect_timeout');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket.current, data }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
    children: PropTypes.any.isRequired,
}

export default SocketProvider;
