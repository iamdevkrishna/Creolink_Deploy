import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ClientPortal from './pages/ClientPortal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portal/:magicLinkId" element={<ClientPortal />} />
      </Routes>
    </Router>
  );
}

export default App;