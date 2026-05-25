import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeDatabase } from './services/database.js';
import { syncService } from './services/syncService.js';
import { companyService } from './services/companyService.js';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import Invoices from './components/Invoices.jsx';
import Customers from './components/Customers.jsx';
import Products from './components/Products.jsx';
import Companies from './components/Companies.jsx';
import Settings from './components/Settings.jsx';
import SyncStatus from './components/SyncStatus.jsx';
import './styles/App.css';

// App Context for global state
export const AppContext = createContext(null);

function App() {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [syncState, setSyncState] = useState({
    status: 'idle',
    progress: 0,
    message: '',
    lastSync: null,
    pendingCount: 0
  });
  const [isOnline, setIsOnline] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Initialize app on startup
  useEffect(() => {
    const init = async () => {
      try {
        // Step 1: Initialize local database
        console.log('Initializing database...');
        await initializeDatabase();
        
        // Step 2: Load companies (local data first)
        console.log('Loading local data...');
        const loadedCompanies = await companyService.getAll();
        setCompanies(loadedCompanies);
        
        // Set active company
        const savedCompanyId = companyService.getActiveCompany();
        if (savedCompanyId) {
          const company = loadedCompanies.find(c => c.id === savedCompanyId);
          if (company) {
            setActiveCompany(company);
          } else if (loadedCompanies.length > 0) {
            setActiveCompany(loadedCompanies[0]);
            companyService.setActiveCompany(loadedCompanies[0].id);
          }
        } else if (loadedCompanies.length > 0) {
          setActiveCompany(loadedCompanies[0]);
          companyService.setActiveCompany(loadedCompanies[0].id);
        }
        
        // Step 3: Check network status
        const online = await syncService.isOnline();
        setIsOnline(online);
        
        // Step 4: Subscribe to sync status
        const unsubscribe = syncService.onSyncStatus((status) => {
          setSyncState(prev => ({ ...prev, ...status }));
        });
        
        // Step 5: Load sync stats
        const stats = await syncService.getSyncStats();
        setSyncState(prev => ({
          ...prev,
          pendingCount: stats.pending,
          lastSync: stats.lastSync
        }));
        
        // Step 6: Try to sync if online
        if (online && authToken) {
          syncService.sync(authToken);
        }
        
        // Set up periodic sync check
        const syncInterval = setInterval(async () => {
          const stats = await syncService.getSyncStats();
          setSyncState(prev => ({ ...prev, pendingCount: stats.pending }));
          
          const stillOnline = await syncService.isOnline();
          setIsOnline(stillOnline);
          
          if (stillOnline && authToken && stats.pending > 0) {
            syncService.sync(authToken);
          }
        }, 30000); // Check every 30 seconds
        
        setInitialized(true);
        setLoading(false);
        
        return () => {
          unsubscribe();
          clearInterval(syncInterval);
        };
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
      }
    };
    
    init();
  }, [authToken]);

  // Handle company change
  const handleCompanyChange = (company) => {
    setActiveCompany(company);
    companyService.setActiveCompany(company.id);
  };

  // Refresh companies list
  const refreshCompanies = async () => {
    const loadedCompanies = await companyService.getAll();
    setCompanies(loadedCompanies);
    if (activeCompany) {
      const updated = loadedCompanies.find(c => c.id === activeCompany.id);
      if (updated) {
        setActiveCompany(updated);
      }
    }
  };

  // Manual sync trigger
  const triggerSync = async () => {
    if (!authToken) {
      setSyncState(prev => ({ ...prev, message: 'Please login to sync' }));
      return;
    }
    
    const result = await syncService.sync(authToken);
    const stats = await syncService.getSyncStats();
    setSyncState(prev => ({ ...prev, pendingCount: stats.pending }));
    return result;
  };

  // Render current page
  const renderPage = () => {
    const pageProps = {
      activeCompany,
      refreshCompanies,
      isOnline,
      authToken
    };
    
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard {...pageProps} />;
      case 'invoices':
        return <Invoices {...pageProps} />;
      case 'customers':
        return <Customers {...pageProps} />;
      case 'products':
        return <Products {...pageProps} />;
      case 'companies':
        return <Companies {...pageProps} onCompanySelect={handleCompanyChange} />;
      case 'settings':
        return <Settings {...pageProps} authToken={authToken} setAuthToken={setAuthToken} />;
      default:
        return <Dashboard {...pageProps} />;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="logo">
            <div className="logo-icon">B</div>
            <span className="logo-text">Bill Easy</span>
          </div>
          <div className="loading-spinner"></div>
          <p>Initializing offline database...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      activeCompany,
      companies,
      isOnline,
      syncState,
      authToken,
      setAuthToken,
      refreshCompanies,
      triggerSync,
      setCurrentPage
    }}>
      <div className="app-container">
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          companies={companies}
          activeCompany={activeCompany}
          onCompanyChange={handleCompanyChange}
        />
        <div className="main-content">
          <Header 
            isOnline={isOnline} 
            syncState={syncState}
            onSync={triggerSync}
          />
          <main className="page-content">
            {renderPage()}
          </main>
        </div>
        <SyncStatus 
          status={syncState.status} 
          message={syncState.message}
          pendingCount={syncState.pendingCount}
        />
      </div>
    </AppContext.Provider>
  );
}

export default App;
