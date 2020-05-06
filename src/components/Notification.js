import { useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

export const Notification = ({ socketio }) => {
  const { addToast } = useToasts();

  useEffect(() => {
    socketio.on('NOTIFICATION', showWarningToast);
  }, []);

  const showWarningToast = async ({ content, type }) => {
    addToast(content, { appearance: type, autoDismiss: true });
  };
  return null;
};
