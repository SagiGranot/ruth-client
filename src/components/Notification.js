import { useEffect } from "react";
import { useToasts } from "react-toast-notifications";

export const Notification = ({ socketio, userId }) => {
  const { addToast } = useToasts();

  useEffect(() => {
    // socketio.on('NOTIFICATION', showWarningToast);
    socketio.on("NOTIFICATION", showWarningToast);
    socketio.on("ENEMY_CLOSER_" + userId, showEnemyCloser);
    socketio.on("ENEMY_SURROUNDING_" + userId, showEnemySurrounding);
    socketio.on("SUSPECT-BUILDING", showSuspectBuilding);
    socketio.on("ASSIST_FRIENDLY_" + userId, showAssist);
  }, []);

  const showWarningToast = async ({ content, type }) => {
    console.log(content);
    addToast(`${content}`, { appearance: type, autoDismiss: true });
  };

  const showEnemyCloser = async ({ content, type }) => {
    console.log(content);
    addToast(
      `ENEMY ${content.data.deployId} CLOSER FROM ${content.data.bearing} ! `,
      {
        appearance: "warning",
        autoDismiss: true,
      }
    );
  };

  const showEnemySurrounding = async ({ content, type }) => {
    console.log(content);
    addToast(`ENEMY SURROUNDING in ${content.data.deployId}!`, {
      appearance: "error",
      autoDismiss: true,
    });
  };

  const showSuspectBuilding = async ({ content, type }) => {
    console.log(content);
    content.data.forEach((building) => {
      addToast(`SUSPECT BUILDING ${building.deployId}`, {
        appearance: "info",
        autoDismiss: true,
      });
    });
  };

  const showAssist = async ({ content, type }) => {
    console.log(content);
    addToast(`ASSIST FRIENDLY ALPHA ${content.data.deployId}`, {
      appearance: "success",
      autoDismiss: true,
    });
  };
  return null;
};
