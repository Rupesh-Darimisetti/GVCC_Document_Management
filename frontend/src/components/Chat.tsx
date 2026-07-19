import React, { useState, useEffect } from 'react';

interface DocumentNodeRef {
    _id: string;
    name: string;
}

interface ChatHistoryEntry {
    _id: string;
    question: string;
    aiResponse: string;
    document?: { name: string };
}

export default function Chat({ token }: { token: string }) {
    const [availableDocs, setAvailableDocs] = useState<DocumentNodeRef[]>([]);
    const [selectedDocId, setSelectedDocId] = useState('');
    const [conversationLogs, setConversationLogs] = useState<ChatHistoryEntry[]>([]);
    const [queryInput, setQueryInput] = useState('');
    const [historyFilter, setHistoryFilter] = useState('');
    const [executingInference, setExecutingInference] = useState(false);

    useEffect(() => {
        fetch('http://localhost:5000/api/documents', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAvailableDocs(data);
                    if (data.length > 0) setSelectedDocId(data[0]._id);
                }
            });
    }, [token]);

    const syncConversationLogHistory = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/history?search=${historyFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) setConversationLogs(data);
        } catch {
            console.error('History mapping engine synchronization dropped.');
        }
    };

    useEffect(() => {
        const processingDebounce = setTimeout(() => { syncConversationLogHistory(); }, 200);
        return () => clearTimeout(processingDebounce);
    }, [historyFilter, token]);

    const fireInferenceRequest = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!selectedDocId || !queryInput.trim()) return;
        setExecutingInference(true);

        try {
            const response = await fetch('http://localhost:5000/api/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ documentId: selectedDocId, question: queryInput })
            });
            if (response.ok) {
                setQueryInput('');
                syncConversationLogHistory();
            }
        } catch {
            console.error('Inference transport system collapsed.');
        } finally {
            setExecutingInference(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-140px)] min-h-[500px]">
            <div className="lg:col-span-1 bg-slate-900 p-4 rounded border border-slate-800/80 flex flex-col gap-4">
                <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-2">TARGET_RESOURCE_CONTEXT</label>
                    <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                        {availableDocs.map(doc => <option key={doc._id} value={doc._id}>{doc.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-2">FILTER_LOG_SUBTREES</label>
                    <input
                        type="text"
                        placeholder="Search query logs..."
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 placeholder:text-slate-700"
                    />
                </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900 rounded border border-slate-800/80 flex flex-col overflow-hidden shadow-2xl">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs selection:bg-indigo-500/40">
                    {conversationLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-600 italic uppercase tracking-wider text-[11px]">
                            No active historical matrix records found.
                        </div>
                    ) : (
                        conversationLogs.map((logItem) => (
                            <div key={logItem._id} className="space-y-2 border-b border-slate-800/40 pb-4 last:border-0">
                                <div className="flex items-start space-x-2">
                                    <span className="text-indigo-400 font-bold shrink-0">[INPUT]:</span>
                                    <p className="text-slate-200">{logItem.question}</p>
                                </div>
                                <div className="flex items-start space-x-2 bg-slate-950/40 p-3 rounded border border-slate-800/30">
                                    <span className="text-emerald-400 font-bold shrink-0">[EVAL]:</span>
                                    <p className="text-slate-400 leading-relaxed">{logItem.aiResponse}</p>
                                </div>
                                <div className="text-[9px] text-slate-600 uppercase text-right tracking-wider">
                                    Scope Anchor: {logItem.document?.name || 'Isolated Context'}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <form onSubmit={fireInferenceRequest} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
                    <input
                        type="text"
                        placeholder="EXECUTE_CONTEXTUAL_QUERY_STATEMENT..."
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        disabled={executingInference || !selectedDocId}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-40 placeholder:text-slate-600"
                    />
                    <button
                        type="submit"
                        disabled={executingInference || !selectedDocId}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-mono font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded transition-all border border-indigo-500"
                    >
                        {executingInference ? 'COMPUTING...' : 'RUN'}
                    </button>
                </form>
            </div>
        </div>
    );
}