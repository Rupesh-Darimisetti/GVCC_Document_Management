import React, { useState, useEffect } from 'react';

interface KnowledgeDocument {
    _id: string;
    name: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
}

export default function DocumentManager({ token }: { token: string }) {
    const [collection, setCollection] = useState<KnowledgeDocument[]>([]);
    const [filterQuery, setFilterQuery] = useState('');
    const [ioStatus, setIoStatus] = useState({ processing: false, feedback: '' });

    const pullDocumentIndex = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/documents?search=${filterQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) setCollection(data);
        } catch {
            setIoStatus(prev => ({ ...prev, feedback: 'Error establishing indexing tracking sync link.' }));
        }
    };

    useEffect(() => {
        const contextDebounceTimer = setTimeout(() => { pullDocumentIndex(); }, 250);
        return () => clearTimeout(contextDebounceTimer);
    }, [filterQuery]);

    const dispatchFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.[0]) return;
        setIoStatus({ processing: true, feedback: '' });

        const standardPayloadWrapper = new FormData();
        standardPayloadWrapper.append('file', event.target.files[0]);

        try {
            const response = await fetch('http://localhost:5000/api/documents', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: standardPayloadWrapper
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Upload runtime fault.');

            setFilterQuery('');
            pullDocumentIndex();
        } catch (err: any) {
            setIoStatus(prev => ({ ...prev, feedback: err.message || 'Stream processing layer error.' }));
        } finally {
            setIoStatus(prev => ({ ...prev, processing: false }));
        }
    };

    const dispatchPurgeCommand = async (documentIdentifier: string) => {
        try {
            const response = await fetch(`http://localhost:5000/api/documents/${documentIdentifier}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) pullDocumentIndex();
        } catch {
            setIoStatus(prev => ({ ...prev, feedback: 'Destruction stack execution error.' }));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-4 rounded border border-slate-800/80">
                <input
                    type="text"
                    placeholder="FILTER_DOCUMENT_REGISTRY..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-4 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 w-full sm:w-72 placeholder:text-slate-600"
                />

                <label className="bg-indigo-600 hover:bg-indigo-500 cursor-pointer text-white px-5 py-2 rounded text-xs font-mono font-bold tracking-wider uppercase transition-all whitespace-nowrap disabled:opacity-40">
                    {ioStatus.processing ? 'PROCESSING_STREAM...' : 'INGEST_NEW_ASSET'}
                    <input type="file" accept=".pdf,.txt,.md" onChange={dispatchFileUpload} className="hidden" disabled={ioStatus.processing} />
                </label>
            </div>

            {ioStatus.feedback && (
                <div className="bg-rose-950/30 border border-rose-900/50 p-3 rounded text-xs font-mono text-rose-400 uppercase text-center tracking-wide">
                    {ioStatus.feedback}
                </div>
            )}

            <div className="bg-slate-900 rounded border border-slate-800/80 overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-900/50 border-b border-slate-800 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                    INDEXED_REGISTRY_NODES
                </div>
                {collection.length === 0 ? (
                    <div className="p-12 text-center text-xs font-mono text-slate-500 italic uppercase">No structural data profiles match selection parameters.</div>
                ) : (
                    <div className="divide-y divide-slate-800/60 font-mono text-xs">
                        {collection.map(doc => (
                            <div key={doc._id} className="p-4 flex justify-between items-center hover:bg-slate-950/20 transition-colors">
                                <div className="space-y-1 min-w-0 pr-4">
                                    <p className="font-bold text-slate-200 truncate">{doc.name}</p>
                                    <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
                                        Extension: {doc.fileType} | Structural Size: {(doc.fileSize / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={() => dispatchPurgeCommand(doc._id)}
                                    className="text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1 rounded border border-transparent hover:border-rose-900/50 transition-all"
                                >
                                    PURGE
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}