import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CropDetail from './pages/CropDetail';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crop/:id" element={<CropDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
        <Toaster position="bottom-right" />
      </Router>
    </ErrorBoundary>
  );
}

export default App;