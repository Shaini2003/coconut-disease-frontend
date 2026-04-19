// Frontend/src/App.tsx
// ✅ FIXED: After signup → goes to LOGIN page
// ✅ FIXED: Error boundary prevents blank page on component crash
// ✅ JWT expiry check on load

import { useEffect, useState, Component, ReactNode } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import HomePage from './pages/HomePage';
import DetectPage from './pages/DetectPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import DiseasesPage from './pages/DiseasesPage';
import ChatbotPage from './pages/ChatbotPage';
import AboutPage from './pages/AboutPage';
import type { AnalysisResult } from './pages/DetectPage';

type Page = 'login' | 'signup' | 'home' | 'detect' | 'results' | 'history' | 'diseases' | 'chatbot' | 'about';

// ── Error Boundary — prevents blank white screen on any component crash ───────
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('CocoAI Error Boundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-2">{this.state.errorMsg}</p>
            <p className="text-xs text-gray-400 mb-6">Check the browser console for details.</p>
            <button
              onClick={() => { this.setState({ hasError: false, errorMsg: '' }); window.location.href = '/'; }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl transition"
            >
              🔄 Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const [currentPage,    setCurrentPage]    = useState<Page>('login');
  const [isLoggedIn,     setIsLoggedIn]     = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [signupSuccess,  setSignupSuccess]  = useState(false);

  // Check token on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload  = JSON.parse(atob(token.split('.')[1]));
        const expired  = payload.exp * 1000 < Date.now();
        if (!expired) {
          setIsLoggedIn(true);
          setCurrentPage('home');
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleNavigate = (page: string) => {
    const protected_ = ['detect', 'results', 'history', 'chatbot'];
    if (protected_.includes(page) && !isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setSignupSuccess(false);
    setCurrentPage('home');
  };

  // ✅ After signup → go to LOGIN (not home)
  const handleSignUpSuccess = () => {
    setSignupSuccess(true);
    setCurrentPage('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setAnalysisResult(null);
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

  // ── Auth pages ────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (currentPage === 'signup') {
      return (
        <ErrorBoundary>
          <SignUpPage onSignUpSuccess={handleSignUpSuccess} onNavigate={handleNavigate} />
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigate={handleNavigate}
          signupSuccess={signupSuccess}
          onClearSignupSuccess={() => setSignupSuccess(false)}
        />
      </ErrorBoundary>
    );
  }

  // ── Authenticated pages ───────────────────────────────────────────────────
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'detect':
        return <DetectPage onAnalysisComplete={handleAnalysisComplete} />;
      case 'results':
        if (!analysisResult) { handleNewDetection(); return null; }
        return (
          <ResultsPage
            result={analysisResult}
            onNavigate={handleNavigate}
            onNewDetection={handleNewDetection}
          />
        );
      case 'history':
        return <HistoryPage onNavigate={handleNavigate} />;
      case 'diseases':
        return <DiseasesPage />;
      case 'chatbot':
        return <ChatbotPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <Header currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
        <main className="flex-1">
          <ErrorBoundary>
            {renderPage()}
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;