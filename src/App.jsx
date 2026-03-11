import { useState } from 'react';
import Dashboard from './components/Dashboard';
import APITestTool from './components/APITestTool';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'test'

  return (
    <div className="App">
      {/* Navigation */}
      <div className="fixed top-0 right-0 z-50 p-4 flex gap-2">
        <button
          onClick={() => setView('dashboard')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            view === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setView('test')}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            view === 'test'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          🧪 API Test
        </button>
      </div>

      {/* View Content */}
      {view === 'dashboard' && <Dashboard />}
      {view === 'test' && <APITestTool />}
    </div>
  );
}

export default App;
