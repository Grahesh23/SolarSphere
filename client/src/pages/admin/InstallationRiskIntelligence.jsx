import { useMemo } from 'react';
import { AlertTriangle, ShieldCheck, Clock, TrendingDown, Sun, Wind, CloudRain, Wrench } from 'lucide-react';
import { useData } from '@/data/DataContext';
import { PageContainer, PageHeader } from '@/components/layout/PortalLayout';
import { KpiCard } from '@/components/ui/KpiCard';
import { AlertBanner } from '@/components/ui/Status';
import { fmtNum, fmtPct, fmtDate, daysBetween, fmtINR } from '@/lib/format';

export function InstallationRiskIntelligence() {
  const { data } = useData();

  const risks = useMemo(() => {
    return data.projects.map((p) => {
      const survey = data.surveys.find((s) => s.id === p.surveyId);
      const config = data.configs.find((c) => c.id === p.configId);
      const installation = data.installations.find((i) => i.projectId === p.id);
      const customer = data.customers.find((c) => c.id === p.customerId);

      const factors = [];
      let score = 0;

      // Shading risk
      if (survey) {
        if (survey.shading === 'High') { factors.push({ label: 'Roof Shading', level: 'high', detail: 'High shading detected' }); score += 3; }
        else if (survey.shading === 'Moderate') { factors.push({ label: 'Roof Shading', level: 'medium', detail: 'Moderate shading — morning/evening' }); score += 2; }
        else if (survey.shading === 'Low') { factors.push({ label: 'Roof Shading', level: 'low', detail: 'Low shading' }); score += 0; }
      }

      // Orientation risk
      if (survey?.orientation) {
        if (survey.orientation === 'South') { factors.push({ label: 'Orientation', level: 'low', detail: 'South-facing — optimal' }); score += 0; }
        else if (survey.orientation === 'East' || survey.orientation === 'West') { factors.push({ label: 'Orientation', level: 'medium', detail: `${survey.orientation}-facing — reduced yield` }); score += 1; }
        else if (survey.orientation === 'North') { factors.push({ label: 'Orientation', level: 'high', detail: 'North-facing — suboptimal' }); score += 2; }
      }

      // Obstacles
      if (survey && survey.obstacles.length > 0) {
        factors.push({ label: 'Obstacles', level: survey.obstacles.length > 1 ? 'high' : 'medium', detail: `${survey.obstacles.length} obstacle(s): ${survey.obstacles.join(', ')}` });
        score += survey.obstacles.length;
      }

      // Cable distance
      if (survey && survey.cableDistance > 15) {
        factors.push({ label: 'Cable Distance', level: 'medium', detail: `${survey.cableDistance}m — voltage drop risk` });
        score += 1;
      }

      // Schedule delay
      if (p.targetEndDate) {
        const daysToTarget = daysBetween(p.targetEndDate, '2026-10-31');
        if (daysToTarget < 0 && p.status !== 'Completed') {
          factors.push({ label: 'Schedule Overrun', level: 'high', detail: `${Math.abs(daysToTarget)} days overdue` });
          score += 3;
        } else if (daysToTarget < 7 && p.status !== 'Completed') {
          factors.push({ label: 'Tight Schedule', level: 'medium', detail: `${daysToTarget} days to target` });
          score += 1;
        }
      }

      // Off-grid complexity
      if (p.gridType === 'Off-Grid' || p.gridType === 'Hybrid') {
        factors.push({ label: 'System Complexity', level: 'medium', detail: `${p.gridType} — battery integration` });
        score += 1;
      }

      // Payment risk
      if (p.advancePaid < p.totalCost * 0.3 && p.status !== 'Enquiry') {
        factors.push({ label: 'Payment Risk', level: 'medium', detail: 'Advance below 30% of total' });
        score += 1;
      }

      const riskLevel = score >= 6 ? 'High' : score >= 3 ? 'Medium' : 'Low';
      return { project: p, customer, survey, config, installation, factors, score, riskLevel };
    });
  }, [data]);

  const stats = useMemo(() => {
    const high = risks.filter((r) => r.riskLevel === 'High').length;
    const medium = risks.filter((r) => r.riskLevel === 'Medium').length;
    const low = risks.filter((r) => r.riskLevel === 'Low').length;
    const avgScore = risks.length ? risks.reduce((s, r) => s + r.score, 0) / risks.length : 0;
    return { high, medium, low, avgScore: Math.round(avgScore * 10) / 10 };
  }, [risks]);

  const levelColor = {
    low: 'badge-emerald', medium: 'badge-amber', high: 'badge-rose',
  };

  return (
    <PageContainer>
      <PageHeader
        title="Installation Risk Intelligence"
        description="Risk assessment for active and upcoming solar projects — evaluates shading, orientation, scheduling, and financial factors."
      />
      <div className="mb-4">
        <AlertBanner type="info" message="Risk scores are derived from survey data, project schedule, and payment status. Use this to prioritize resources and mitigate delays." />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="High Risk Projects" value={stats.high} icon={AlertTriangle} tone="rose" />
        <KpiCard label="Medium Risk" value={stats.medium} icon={ShieldCheck} tone="amber" />
        <KpiCard label="Low Risk" value={stats.low} icon={ShieldCheck} tone="emerald" />
        <KpiCard label="Avg Risk Score" value={stats.avgScore} icon={TrendingDown} tone="navy" />
      </div>

      <div className="space-y-3">
        {risks.map((r) => (
          <div key={r.project.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-semibold text-navy-900">{r.project.code}</h3>
                  <span className={r.riskLevel === 'High' ? 'badge-rose' : r.riskLevel === 'Medium' ? 'badge-amber' : 'badge-emerald'}>{r.riskLevel} Risk</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{r.customer?.name} · {r.project.location} · {r.project.capacity} kW {r.project.gridType}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-bold text-navy-900">{r.score}</div>
                <div className="text-xs text-slate-400">risk score</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {r.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-slate-50 p-2.5">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${f.level === 'high' ? 'bg-rose-100 text-rose-600' : f.level === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-navy-800">{f.label}</div>
                    <div className="text-xs text-slate-500">{f.detail}</div>
                  </div>
                </div>
              ))}
              {r.factors.length === 0 && (
                <div className="text-xs text-slate-400 italic col-span-3">No risk factors identified — project is on track.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
