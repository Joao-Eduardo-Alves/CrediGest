import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ClienteList from "./components/ClienteList";
import ClienteForm from "./components/ClienteForm";
import FiadoList from "./components/FiadoList";
import FiadoForm from "./components/FiadoForm";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              CrediGest
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/clientes" className="nav-link">
                  Clientes
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/fiados" className="nav-link">
                  Fiados
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/clientes" element={<ClienteList />} />
            <Route path="/clientes/novo" element={<ClienteForm />} />
            <Route path="/clientes/:id" element={<ClienteForm />} />
            <Route path="/fiados" element={<FiadoList />} />
            <Route path="/fiados/novo" element={<FiadoForm />} />
            <Route path="/fiados/:id" element={<FiadoForm />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

function Home() {
  return (
    <div className="home">
      <h1>Bem-vindo ao CrediGest</h1>
      <p>Sistema de gerenciamento de fiados</p>
      <div className="home-cards">
        <Link to="/clientes" className="card">
          <h3>Clientes</h3>
          <p>Gerenciar clientes</p>
        </Link>
        <Link to="/fiados" className="card">
          <h3>Fiados</h3>
          <p>Gerenciar fiados</p>
        </Link>
      </div>
    </div>
  );
}

export default App;
