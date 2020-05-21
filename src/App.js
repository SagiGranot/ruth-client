import React from 'react';
import socketIOClient from 'socket.io-client';
import { Header } from './components/Header';
import './resources/style/Style.css';
import { Notification } from './components/Notification';
import { MapSceneView } from './components/MapSceneView';
import { ToastProvider } from 'react-toast-notifications';
import { CustomToast } from './components/Toast';

const App = () => {
  const socketio = socketIOClient('http://localhost:8080');

  return (
    <div className="App">
      <Header />
      <ToastProvider components={{ Toast: CustomToast }} placement="bottom-right">
        <Notification socketio={socketio} />
        <MapSceneView socketio={socketio} />
        <footer />
      </ToastProvider>
    </div>
  );
};

export default App;
