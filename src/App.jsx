import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

function Home() {
  return <h1>Hello World</h1>;
}

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
