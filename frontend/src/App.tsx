import  { useState } from 'react';
import Auth from './components/Auth.tsx';
import Dashboard from './components/Dashboard.tsx';
import DocumentManager from './components/DocumentManager.tsx';
import Chat from './components/Chat.tsx';

type ViewStates = 'dashboard' | 'documents' | 'chat';

export default function App() {
    const [sessionKey, setSessionKey] = useState<string | null>(localStorage.getItem('token'));
    const [activeView, setActiveView] = useState<ViewStates>('dashboard');

    const processDisconnect = () => {
        localStorage.removeItem('token');
        setSessionKey(null);
    };

    if (!sessionKey) {
        return <Auth onIdentityAcquired={(extractedToken) => setSessionKey(extractedToken)} />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
            <nav className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] animate-pulse" />
                    <span className="font-mono text-xs tracking-[0.2em] uppercase text-slate-400 font-bold">KB-MATRIX // OPERATIONAL ENVIRONMENT</span>
                </div>
                <div className="flex items-center gap-2">
                    {(['dashboard', 'documents', 'chat'] as ViewStates[]).map((viewTarget) => (
                        <button
                            key={viewTarget}
                            onClick={() => setActiveView(viewTarget)}
                            className={`px-4 py-1.5 rounded text-[11px] font-bold tracking-wider font-mono uppercase transition-all duration-200 ${activeView === viewTarget
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                                }`}
                        >
                            {viewTarget}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-slate-800 mx-2" />
                    <button
                        onClick={processDisconnect}
                        className="px-3 py-1.5 rounded text-[11px] font-bold tracking-wider font-mono uppercase text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all"
                    >
                        TERMINATE
                    </button>
                </div>
            </nav>

            <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
                {activeView === 'dashboard' && <Dashboard token={sessionKey} />}
                {activeView === 'documents' && <DocumentManager token={sessionKey} />}
                {activeView === 'chat' && <Chat token={sessionKey} />}
            </main>
        </div>
    );
}