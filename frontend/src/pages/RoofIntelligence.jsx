import { useState } from 'react';
import {
  Satellite, Upload, Scan, ImageIcon, CheckCircle2, AlertTriangle, Sun, Ruler,
  Sparkles, Download, MousePointer2, Crosshair, Layers, FileText, Loader2,
} from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer } from '@/components/layout/MobileSidebar';
import { PageHeader } from '@/components/layout/Header';
import { StatusBadgeAuto, AlertBanner } from '@/components/ui/Status';
import { FileUploader } from '@/components/ui/FileUploader';
import { fmtDate, genId } from '@/lib/format';



// Simulated analysis — never presented as actual measured data
const DEMO_RESULT = {
  suitabilityScore: 87,
  usableArea: 78,
  totalArea: 96,
  obstacles: [
    { id: 'o1', label: 'Water Tank', type: 'Rounded', impact: 'Medium', x: 70, y: 8, w: 18, h: 16 },
    { id: 'o2', label: 'Vent Pipe', type: 'Cylindrical', impact: 'Low', x: 30, y: 60, w: 6, h: 6 },
    { id: 'o3', label: 'Parapet Shadow', type: 'Linear', impact: 'High', x: 4, y: 84, w: 92, h: 8 },
  ],
  shadedRegions: [
    { id: 's1', label: 'Morning shade (east edge)', area: 9, x: 4, y: 4, w: 22, h: 18 },
    { id: 's2', label: 'Parapet shade', area: 7, x: 4, y: 84, w: 92, h: 8 },
  ],
  panelPlacements: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    x: 28 + (i % 5) * 14,
    y: 14 + Math.floor(i / 5) * 32,
    w: 12,
    h: 26,
    tilt: 22,
  })),
  estimatedCapacity: 5,
  reportSummary:
    'The roof shows a strong south-facing orientation with 87% suitability. A water tank near the north-east corner and parapet shadow along the south edge reduce usable area to 78 m². 10 panels of 540W can be accommodated in a 2×5 landscape layout, yielding approximately 5 kW of capacity. Morning shading on the east edge is minor and affects only the first row for ~1 hour after sunrise.',
};

export function RoofIntelligence() {
  const { data } = useData();
  const [photos, setPhotos] = useState(['roof-sample-1.jpg', 'roof-sample-2.jpg', 'roof-sample-3.jpg']);
  const [activePhoto, setActivePhoto] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [reportGenerated, setReportGenerated] = useState(false);

  const runAnalysis = () => {
    setAnalyzing(true);
    setResult(null);
    setReportGenerated(false);
    setTimeout(() => {
      setResult(DEMO_RESULT);
      setAnalyzing(false);
    }, 2200);
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
            <button className="btn-grape" disabled={analyzing || photos.length === 0} onClick={runAnalysis}>
              {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
              {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
            </button>
          </>
        }
      />

      <div className="mb-4">
        <AlertBanner type="info" message="AI analysis uses a computer-vision service. Results shown here are DEMO/simulated for demonstration — clearly distinct from any actual API response." />
      </div>

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
              <div className="flex justify-between"><span>Analysis status</span><span className="font-medium text-navy-700">{analyzing ? 'Running' : result ? 'Complete' : 'Not started'}</span></div>
              <div className="flex justify-between"><span>Mode</span><span className="font-medium text-grape-600">Demo / Simulated</span></div>
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
              {/* Simulated roof surface */}
              <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, #94a3b8 0, #94a3b8 1px, transparent 1px, transparent 12px)',
              }} />

              {analyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-950/30 backdrop-blur-sm">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-grape-200 border-t-grape-600 animate-spin" />
                    <Scan className="w-6 h-6 text-white absolute inset-0 m-auto" />
                  </div>
                  <div className="mt-4 text-white text-sm font-medium">Running computer-vision analysis...</div>
                  <div className="mt-1 text-white/70 text-xs">Detecting obstacles, shading & usable area</div>
                </div>
              )}

              {result && showOverlay && !analyzing && (
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

              {!result && !analyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <Satellite className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Upload photos and run AI analysis to visualize the roof</p>
                  <p className="text-xs mt-1">Click "Run AI Analysis" to see demo results</p>
                </div>
              )}
            </div>

            {result && (
              <div className="px-4 py-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
                <MousePointer2 className="w-3.5 h-3.5" />
                <span>Drag panels to manually adjust placement (demo)</span>
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
                <p className="mt-3 text-xs text-slate-400 italic">Disclaimer: Results are simulated for demonstration and do not represent actual measured or guaranteed performance.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
