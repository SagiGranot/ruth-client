import React from "react";
import "./App.css";
import { Header } from "./components/Header";

import { MapSceneView } from "./components/MapSceneView";

function App() {
  return (
    <div className="App">
      <Header />
      <MapSceneView />
    </div>
  );
}

export default App;
