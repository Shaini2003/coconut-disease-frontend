import { useState } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import AboutPage from './pages/AboutPage';
import DetectPage, { AnalysisResult } from './pages/DetectPage';
import DiseasesPage from './pages/DiseasesPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token');
  });

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setCurrentPage('results');
  };

  const handleNewDetection = () => {
    setAnalysisResult(null);
    setCurrentPage('detect');
  };

  const renderPage = () => {
    // Auth pages — no header/footer
    if (currentPage === 'login') {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
    }
    if (currentPage === 'signup') {
      return <SignUpPage onSignUpSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'detect':
        return <DetectPage onAnalysisComplete={handleAnalysisComplete} />;
      case 'results':
        return analysisResult ? (
          <ResultsPage
            result={analysisResult}
            onNavigate={handleNavigate}
            onNewDetection={handleNewDetection}
          />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
      case 'history':
        return <HistoryPage onNavigate={handleNavigate} />;
      case 'diseases':
        return <DiseasesPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  // Hide header/footer on auth pages
  const isAuthPage = currentPage === 'login' || currentPage === 'signup';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {!isAuthPage && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      <main className="flex-grow">{renderPage()}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;