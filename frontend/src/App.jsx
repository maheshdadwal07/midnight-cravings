// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Shop from "./pages/Shop";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/shop" element={<Shop />} />
    </Routes>
  );
}
