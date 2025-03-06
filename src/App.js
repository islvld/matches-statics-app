import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Disciplines from './components/disciplines';
import Matches from './components/matches';
import Login from './components/login';
import Register from './components/register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Disciplines />} />
        <Route path="/matches/:disciplineId" element={<Matches />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;