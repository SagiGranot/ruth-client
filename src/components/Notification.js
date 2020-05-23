import { useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

export const Notification = ({ socketio,userId }) => {
  const { addToast } = useToasts();

  useEffect(() => {
    // socketio.on('NOTIFICATION', showWarningToast);
    socketio.on('NOTIFICATION', showWarningToast);
    socketio.on('ENEMY_CLOSER_' + userId, showEnemyCloser);
    socketio.on('ENEMY_SURROUNDING_' + userId, showEnemySurrounding);
    socketio.on('ASSIST_FRIENDLY_'+ userId, showAssist);
  }, []);

  const showWarningToast = async ({ content, type }) => {
    addToast(`${content}`, { appearance: type, autoDismiss: true });
  };

  const showEnemyCloser = async ({ content, type }) => {
    addToast('ENEMY CLOSER!', { appearance: 'warning', autoDismiss: true });
  };

  const showEnemySurrounding = async ({ content, type }) => {
    //
    addToast('ENEMY SURROUNDING!', { appearance: 'error', autoDismiss: true });
  };

  const showAssist = async ({ content, type }) => {
    //
    addToast('ASSIST FRIENDLY ALPHA', { appearance: 'info', autoDismiss: true });
  };
  return null;
};
