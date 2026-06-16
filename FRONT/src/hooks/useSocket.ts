import { useEffect, useRef } from 'react';
import socketService from '../services/socket';

export const useSocket = () => {
  const socketRef = useRef(socketService);

  useEffect(() => {
    socketRef.current.connect();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  return socketRef.current;
};

export const useSocketEvent = (event: string, callback: (data: any) => void) => {
  const socketRef = useRef(socketService);

  useEffect(() => {
    socketRef.current.on(event, callback);

    return () => {
      socketRef.current.off(event, callback);
    };
  }, [event, callback]);
};
