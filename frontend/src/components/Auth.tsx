import React, { useState } from 'react';

interface AuthProperties {
    onIdentityAcquired: (token: string) => void;
}

export default function Auth({ onIdentityAcquired }: AuthProperties) {
    const [isLoginFlow, setIsLoginFlow] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const executeFormSubmission = async (event: React.FormEvent) => {
        event.preventDefault();
        setStatusMessage('');
        setSubmitting(true);

        const activeNode = isLoginFlow ? 'login' : 'signup';
        try {
            const response = await fetch(`http://localhost:5000/api/${activeNode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Server rejected authentication criteria verification request.');

            localStorage.setItem('token', data.token);
            onIdentityAcquired(data.token);
        } catch (err: any) {
            setStatusMessage(err.message || 'Fatal transport loop fault.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800/80 p-8 rounded-xl max-w-sm w-full space-y-6 shadow-2xl">
                <div className="space-y-1 text-center">
                    <h2 className="text-xs uppercase font-mono font-black tracking-widest text-indigo-400">IDENTITY REGISTRATION MATRIX</h2>
                    <p className="text-[11px] font-mono text-slate-500 uppercase">Input encrypted operational criteria</p>
                </div>

                {statusMessage && (
                    <div className="bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-400 font-mono p-3 rounded text-center uppercase tracking-wide">
                        {statusMessage}
                    </div>
                )}

                <form onSubmit={executeFormSubmission} className="space-y-4">
                    <input
                        type="email"
                        placeholder="SYSTEM_IDENTITY_EMAIL"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                        required
                        disabled={submitting}
                    />
                    <input
                        type="password"
                        placeholder="AUTHENTICATION_PASSPHRASE"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                        required
                        disabled={submitting}
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider py-3 rounded transition-all shadow-md shadow-indigo-600/10"
                    >
                        {submitting ? 'PROCESSING_IDENTITY...' : isLoginFlow ? 'INITIALIZE_SESSION' : 'GENERATE_CREDENTIAL_STRUCT'}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLoginFlow(!isLoginFlow); setStatusMessage(''); }}
                        className="text-[10px] uppercase font-mono tracking-wider text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                        {isLoginFlow ? 'Switch context to: Create Account' : 'Switch context to: Existing Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}