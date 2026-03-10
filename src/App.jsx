import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Upgraded Loading Spinner for the "Fintech Dark" theme
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-50">
        <div className="relative w-12 h-12">
          {/* Faint background track */}
          <div className="absolute inset-0 rounded-full border-4 border-white/[0.05]"></div>
          {/* Glowing spinning rim */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        </div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router future={{ v7_relativeSplatPath: true }}>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        {/* The Toaster will now inherit the dark theme from index.css */}
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App