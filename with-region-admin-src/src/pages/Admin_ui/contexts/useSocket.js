import { useContext } from 'react';
import { SocketContext } from './SocketContext';

const useSocket = () => {
  const { socket, data } = useContext(SocketContext);
  return { socket, data };
};

export default useSocket;
