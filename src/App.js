import React from 'react';
import {Header} from './components/Header';
import './resources/style/Style.css';

import {MapSceneView} from './components/MapSceneView';

function App() {
  return (
    <div className='App'>
      <Header/>
      <MapSceneView />
      <footer/>
    </div>
  );
}

export default App;
