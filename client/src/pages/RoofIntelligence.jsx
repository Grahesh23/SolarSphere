import { useState } from 'react';
import {
  Satellite, Upload, Scan, ImageIcon, CheckCircle2, AlertTriangle, Sun, Ruler,
  Sparkles, Download, MousePointer2, Crosshair, Layers, FileText,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { FileUploader } from '@/components/ui/FileUploader';
import { fmtDate, genId } from '@/lib/format';

export function RoofIntelligence() {
  const { data } = useData();
  const [photos, setPhotos] = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [result, setResult] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const runAnalysis = () => {
    setResult(null);
    setReportGenerated(false);
    setAnalysisError('The roof analysis service is not configured; no analysis was performed.');
  };

  const scoreTone = result ? (result.suitabilityScore >= 80 ? 'emerald' : result.suitabilityScore >= 60 ? 'amber' : 'rose') : 'slate';

  return (
    <PageContainer>
      <PageHeader
        title="Roof Intelligence"
        description="AI-assisted rooftop analysis workspace. Upload photos, run computer-vision analysis, and visualize panel placement."
        actions={
          <>
            <button className="btn-outline" disabled={!result} onClick={() => setReportGenerated(true)}>
              <FileText className="w-4 h-4" />Generate Report
            </button>
            <button className="btn-grape" disabled={photos.length === 0} onClick={runAnalysis}>
              <Scan className="w-4 h-4" />Run AI Analysis
            </button>
          </>
        }
      />

      <div className="mb-4">
        <AlertBanner type="info" message="The computer-vision service is not connected. This screen will not display simulated analysis results." />
      </div>
      {analysisError && <div className="card p-3 mb-4 bg-amber-50 text-sm text-amber-800">{analysisError}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column — upload + photos */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="section-title text-sm mb-3 flex items-center gap-2"><Upload className="w-4 h-4 text-grape-500" />Rooftop Photos</h3>
            <FileUploader label="Upload rooftop photos" hint="JPG / PNG, multiple allowed" />
            <div className="mt-3 space-y-2">
              {photos.map((p, i) => (
                <div key={p} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition ${activePhoto === i ? 'border-grape-400 bg-grape-50' : 'border-slate-200 hover:bg-slate-50'}`} onClick={() => setActivePhoto(i)}>
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-800 truncate">{p}</div>
                    <div className="text-xs text-slate-400">Photo {i + 1}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setPhotos((prev) => prev.filter((_, idx) => idx !== i)); }} className="text-slate-300 hover:text-rose-500 text-xs">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <h3 className="section-title text-sm mb-3">Analysis Context</h3>
            <label className="label">Link to Project</label>
            <select className="input mb-3" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              <option value="">Select project (optional)...</option>
              {data.projects.map((p) => {
                const c = data.customers.find((c) => c.id === p.customerId);
                return <option key={p.id} value={p.id}>{p.code} — {c?.name}</option>;
              })}
            </select>
            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex justify-between"><span>Photos loaded</span><span className="font-medium text-navy-700">{photos.length}</span></div>
              <div className="flex justify-between"><span>Analysis status</span><span className="font-medium text-navy-700">{result ? 'Complete' : 'Not configured'}</span></div>
              <div className="flex justify-between"><span>Mode</span><span className="font-medium text-slate-600">Unavailable</span></div>
            </div>
          </div>
        </div>

        {/* Center column — visualization */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-grape-500" />
                <span className="text-sm font-semibold text-navy-800">Roof Visualization</span>
                {result && <StatusBadgeAuto status={`Score: ${result.suitabilityScore}%`} />}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOverlay((s) => !s)}
                  disabled={!result}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${showOverlay ? 'bg-grape-50 border-grape-200 text-grape-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'} disabled:opacity-40`}
                >
                  <Layers className="w-3 h-3 inline mr-1" />Overlay
                </button>
              </div>
            </div>

            <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden">
              {result && showOverlay && (
                <>
                  {/* Shaded regions */}
                  {result.shadedRegions.map((s) => (
                    <div key={s.id} className="absolute border-2 border-amber-400/80 bg-amber-400/25 rounded-md flex items-start justify-end p-1"
                      style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}>
                      <span className="text-[9px] text-amber-900 bg-amber-100/80 px-1 rounded">{s.label}</span>
                    </div>
                  ))}
                  {/* Obstacles */}
                  {result.obstacles.map((o) => (
                    <div key={o.id} className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-md flex items-start p-1"
                      style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%`, height: `${o.h}%` }}>
                      <span className="text-[9px] text-rose-900 bg-white/70 px-1 rounded whitespace-nowrap">{o.label}</span>
                    </div>
                  ))}
                  {/* Panel placements */}
                  {result.panelPlacements.map((p) => (
                    <div key={p.id} className="absolute border border-navy-700 bg-navy-600/60 rounded-sm flex items-center justify-center group hover:bg-emerald-600/70 hover:border-emerald-500 cursor-move transition"
                      style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, height: `${p.h}%` }}>
                      <span className="text-[8px] text-white font-medium">P{p.id}</span>
                    </div>
                  ))}
                </>
              )}

              {!result && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <Satellite className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">No roof analysis is available</p>
                  <p className="text-xs mt-1">Connect the computer-vision service to generate results.</p>
                </div>
              )}
            </div>

            {result && (
              <div className="px-4 py-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                <MousePointer2 className="w-3.5 h-3.5" />
                <span>Drag panels to manually adjust placement</span>
                <span className="ml-auto flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-navy-600/60 border border-navy-700" />Panel</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-500/20 border border-rose-500" />Obstacle</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-400/25 border border-amber-400" />Shade</span>
                </span>
              </div>
            )}
          </div>

          {/* Results cards */}
          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
              <div className={`card p-3 ${scoreTone === 'emerald' ? 'ring-1 ring-emerald-200' : scoreTone === 'amber' ? 'ring-1 ring-amber-200' : 'ring-1 ring-rose-200'}`}>
                <div className="text-xs text-slate-500">Suitability Score</div>
                <div className={`text-2xl font-display font-bold ${scoreTone === 'emerald' ? 'text-emerald-600' : scoreTone === 'amber' ? 'text-amber-600' : 'text-rose-600'}`}>{result.suitabilityScore}%</div>
              </div>
              <div className="card p-3">
                <div className="text-xs text-slate-500">Usable Area</div>
                <div className="text-xl font-display font-bold text-navy-800">{result.usableArea} m²</div>
                <div className="text-xs text-slate-400">of {result.totalArea} m²</div>
              </div>
              <div className="card p-3">
                <div className="text-xs text-slate-500">Panels Fit</div>
                <div className="text-xl font-display font-bold text-navy-800">{result.panelPlacements.length}</div>
                <div className="text-xs text-slate-400">× 540W each</div>
              </div>
              <div className="card p-3">
                <div className="text-xs text-slate-500">Est. Capacity</div>
                <div className="text-xl font-display font-bold text-grape-600">{result.estimatedCapacity} kW</div>
                <div className="text-xs text-slate-400">recommended</div>
              </div>
            </div>
          )}

          {/* Detected obstacles list */}
          {result && (
            <div className="card p-4 animate-fade-in">
              <h3 className="section-title text-sm mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" />Detected Obstacles ({result.obstacles.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {result.obstacles.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200">
                    <div><div className="text-sm font-medium text-navy-800">{o.label}</div><div className="text-xs text-slate-400">{o.type}</div></div>
                    <StatusBadgeAuto status={o.impact} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated report */}
          {reportGenerated && result && (
            <div className="card p-5 animate-fade-in border-grape-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-title flex items-center gap-2"><FileText className="w-4 h-4 text-grape-500" />Analysis Report</h3>
                <button className="btn-outline text-xs"><Download className="w-3.5 h-3.5" />Export PDF</button>
              </div>
              <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="mb-2"><span className="font-semibold text-navy-800">Roof Analysis Summary — {fmtDate(new Date().toISOString())}</span></p>
                <p>{result.reportSummary}</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div><span className="text-slate-400">Suitability:</span> <span className="font-medium">{result.suitabilityScore}%</span></div>
                  <div><span className="text-slate-400">Usable Area:</span> <span className="font-medium">{result.usableArea} m²</span></div>
                  <div><span className="text-slate-400">Panels:</span> <span className="font-medium">{result.panelPlacements.length}</span></div>
                  <div><span className="text-slate-400">Capacity:</span> <span className="font-medium">{result.estimatedCapacity} kW</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
