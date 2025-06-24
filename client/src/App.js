import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";

import Navbar from './components/Navbar';

function App() {
  return (
    <div>
      <Navbar />
      <h1>Welcome to Campus Marketplace 👋</h1>
    </div>
  );
}

export default App;

