import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:room" element={<Home />} />
      <Route path="/lobby" element={<Lobby />} />
    </Routes>
  );
}

export default App;
