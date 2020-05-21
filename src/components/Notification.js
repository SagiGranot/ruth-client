import { useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

export const Notification = ({ socketio }) => {
  const { addToast } = useToasts();

  useEffect(() => {
    // socketio.on('NOTIFICATION', showWarningToast);
    socketio.on('ENEMY_CLOSER_'+3, showEnemyCloser);
    socketio.on('ENEMY_SURROUNDING_'+3, showEnemySurrounding);
    socketio.on('ASSIST_FRIENDLY_1', showAssist);
  }, []);

  // const showWarningToast = async ({ content, type }) => {
  //   addToast('ENEMY CLOSER!', { appearance: 'info', autoDismiss: true });
  // };

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
