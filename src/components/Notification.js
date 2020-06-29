import { useEffect } from 'react';
import { useToasts } from 'react-toast-notifications';

var img = document.createElement('img');
img.src = '../resources/images/enemy_direction.png';
img.style.width = '50px';

export const Notification = ({ socketio, userId }) => {
  const { addToast } = useToasts();

  useEffect(() => {
    // socketio.on('NOTIFICATION', showWarningToast);
    socketio.on('NOTIFICATION', showWarningToast);
    socketio.on('ENEMY_CLOSER_' + userId, showEnemyCloser);
    socketio.on('ENEMY_SURROUNDING_' + userId, showEnemySurrounding);
    socketio.on('SUSPECT-BUILDING', showSuspectBuilding);
    socketio.on('ASSIST_FRIENDLY_' + userId, showAssist);
    socketio.on('ENEMY_SPOTTED_' + userId, showSpottedEnemy);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showWarningToast = async ({ content, type }) => {
    addToast(`${content}`, { appearance: type, autoDismiss: true });
  };

  const showEnemyCloser = async ({ enemy, bearing, distance }) => {
    let degree = parseInt(bearing, 10);
    addToast(`ENEMY ${enemy} APPROACH ${distance.toFixed()}km FROM `, {
      appearance: 'warning',
      autoDismiss: true,
      autoDismissTimeout: 10000,
      bearing: degree,
    });
  };

  const showEnemySurrounding = async ({ surrounded, area }) => {
    addToast(`ENEMY SURROUNDING in ${area.toFixed() / 1000}m !`, {
      appearance: 'error',
      autoDismissTimeout: 10000,
      autoDismiss: true,
    });
  };

  const showSuspectBuilding = async ({ content, type }) => {
    content.data.forEach((building) => {
      addToast(`SUSPECT BUILDING -- `, {
        appearance: 'info',
        autoDismissTimeout: 10000,
        autoDismiss: true,
      });
    });
  };

  const showAssist = async ({ content, type }) => {
    addToast(`ASSIST FRIENDLY ALPHA ${content.data.deployId}`, {
      appearance: 'success',
      autoDismissTimeout: 10000,
      autoDismiss: true,
    });
  };

  const showSpottedEnemy = async (data) => {
    addToast(`ENEMY SPOTTED `, {
      appearance: 'error',
      autoDismissTimeout: 10000,
      autoDismiss: true,
    });
  };
  return null;
};
