import React, { useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import { Header } from './components/Header';
import './resources/style/Style.css';
import { Notification } from './components/Notification';
import { MapSceneView } from './components/MapSceneView';
import { ToastProvider } from 'react-toast-notifications';
import { CustomToast } from './components/Toast';

const App = () => {
  const socketio = socketIOClient('https://fierce-everglades-47378.herokuapp.com');
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('userId');

  return (
    <div className="App">
      <Header />
      <ToastProvider components={{ Toast: CustomToast }} placement="bottom-right">
        <Notification socketio={socketio} userId={userId} />
        <MapSceneView socketio={socketio} userId={userId} />
        <footer />
      </ToastProvider>
    </div>
  );
};

export default App;
