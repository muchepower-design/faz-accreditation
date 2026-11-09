import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Apply from './pages/Apply';
import MyAccreditations from './pages/MyAccreditations';
import CardView from './pages/CardView';
import Verify from './pages/Verify';

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apply" element={<Apply />} />
        <Route path="/my" element={<MyAccreditations />} />
        <Route path="/my/:id" element={<CardView />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </MainLayout>
  );
}