import React from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import CropDetail from './pages/CropDetail';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';

const ENTRY_FLAG_KEY = 'agrovision_entered_app';

function EntryGate() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  // Checking for a session-level flag so it only shows once per tab session
  const hasEnteredApp =
    typeof window !== 'undefined' &&
    window.sessionStorage.getItem(ENTRY_FLAG_KEY) === 'true';

  if (query || hasEnteredApp) {
    return <Dashboard />;
  }

  const handleEnterApp = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(ENTRY_FLAG_KEY, 'true');
    }
  };

  return <LandingPage onEnterApp={handleEnterApp} />;
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<EntryGate />} />
            <Route path="/dashboard" element={<Dashboard />} />
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