import { useState } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import AboutPage from './pages/AboutPage';
import DetectPage from './pages/DetectPage';
import DiseasesPage from './pages/DiseasesPage';
import HistoryPage from './pages/HistoryPage';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setCurrentPage('results');
  };

  const handleNewDetection = () => {
    setAnalysisResult(null);
    setCurrentPage('detect');
  };

  const renderPage = () => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow">{renderPage()}</main>
      <Footer />
    </div>
  );
}

export default App;
