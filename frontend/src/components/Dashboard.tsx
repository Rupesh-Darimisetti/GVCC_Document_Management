import  { useState, useEffect } from 'react';

interface MetricState {
    totalDocs: number;
    totalQuestions: number;
    recentUploads: Array<{ _id: string; name: string; fileType: string; createdAt: string }>;
}

export default function Dashboard({ token }: { token: string }) {
    const [metrics, setMetrics] = useState<MetricState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => { setMetrics(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [token]);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse font-mono text-xs">
                <div className="h-28 bg-slate-900 border border-slate-800 rounded" />
                <div className="h-28 bg-slate-900 border border-slate-800 rounded" />
                <div className="h-48 md:col-span-2 bg-slate-900 border border-slate-800 rounded" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900 p-6 rounded border border-slate-800/80 shadow-md flex flex-col justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">INGESTED_METADATA_UNITS</span>
                    <p className="text-4xl font-black font-mono tracking-tight text-indigo-400 mt-2">{metrics?.totalDocs || 0}</p>
                    <span className="text-[9px] font-mono text-slate-600 mt-2 uppercase">Validated contextual data structures</span>
                </div>
                <div className="bg-slate-900 p-6 rounded border border-slate-800/80 shadow-md flex flex-col justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">CONTEXT_AUDIT_TRANSACTIONS</span>
                    <p className="text-4xl font-black font-mono tracking-tight text-emerald-400 mt-2">{metrics?.totalQuestions || 0}</p>
                    <span className="text-[9px] font-mono text-slate-600 mt-2 uppercase">Processed knowledge extractions</span>
                </div>
            </div>

            <div className="bg-slate-900 rounded border border-slate-800/80 shadow-lg overflow-hidden">
                <div className="p-4 bg-slate-900/50 border-b border-slate-800 text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                    CHRONOLOGICAL_INGESTION_STREAM_LOGGER (MAX_5)
                </div>
                {metrics?.recentUploads && metrics.recentUploads.length > 0 ? (
                    <div className="divide-y divide-slate-800/60 font-mono text-xs">
                        {metrics.recentUploads.map((uploadItem) => (
                            <div key={uploadItem._id} className="p-4 flex justify-between items-center hover:bg-slate-950/20 transition-colors">
                                <span className="text-slate-300 font-medium truncate max-w-xs sm:max-w-md">{uploadItem.name}</span>
                                <div className="flex items-center space-x-4 text-[10px] text-slate-500 uppercase">
                                    <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{uploadItem.fileType}</span>
                                    <span>{new Date(uploadItem.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-xs font-mono text-slate-500 italic uppercase">
                        No telemetry objects currently loaded into working frame.
                    </div>
                )}
            </div>
        </div>
    );
}