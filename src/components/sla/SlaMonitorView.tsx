import React, { useState, useMemo } from 'react';
import { HelpdeskStorageService } from '../../services/storage';
import { SlaPolicy, Ticket } from '../../types/helpdesk';
import { ShieldCheck, Clock, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SlaMonitorView: React.FC = () => {
  const policies = useMemo(() => HelpdeskStorageService.getSlaPolicies(), []);
  const [tickets, setTickets] = useState<Ticket[]>(() => HelpdeskStorageService.getTickets());
  const [scanMessage, setScanMessage] = useState('');

  // Active tickets with SLA targets
  const activeSlas = useMemo(() => {
    return tickets
      .filter((t) => t.sla && !['RESOLVED', 'CLOSED', 'CANCELLED'].includes(t.status))
      .sort((a, b) => {
        const da = new Date(a.sla!.resolutionDeadline).getTime();
        const db = new Date(b.sla!.resolutionDeadline).getTime();
        return da - db;
      });
  }, [tickets]);

  // Trigger simulated prober scan
  const handleTriggerProber = () => {
    const all = HelpdeskStorageService.getTickets();
    const now = new Date();
    let breachesDetected = 0;

    const updated = all.map((t) => {
      if (t.sla && !['RESOLVED', 'CLOSED', 'CANCELLED'].includes(t.status)) {
        const deadline = new Date(t.sla.resolutionDeadline);
        if (deadline < now && !t.sla.resolutionBreached) {
          breachesDetected++;
          return {
            ...t,
            sla: {
              ...t.sla,
              resolutionBreached: true,
              resolutionBreachedAt: now.toISOString(),
            },
          };
        }
      }
      return t;
    });

    if (breachesDetected > 0) {
      HelpdeskStorageService.setTickets(updated);
      setTickets(updated);
      setScanMessage(`Automated prober scan complete: ${breachesDetected} new SLA breach(es) flagged.`);
    } else {
      setScanMessage('Automated prober scan complete: All active tickets are currently compliant.');
    }

    setTimeout(() => setScanMessage(''), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Service Level Agreement (SLA) & Escalation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable response and resolution targets with 60-second scheduled breach detection.
          </p>
        </div>

        <button
          onClick={handleTriggerProber}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Execute Prober Scan</span>
        </button>
      </div>

      {scanMessage && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs font-semibold text-blue-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Active Escalation Watch Grid */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active SLA Targets in Flight</h3>
            <p className="text-xs text-slate-500">Unresolved incidents prioritized by closest deadline</p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {activeSlas.length} active
          </span>
        </div>

        <div className="divide-y divide-slate-200">
          {activeSlas.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No active tickets pending SLA deadlines.
            </div>
          ) : (
            activeSlas.map((t) => {
              const diffMs = new Date(t.sla!.resolutionDeadline).getTime() - Date.now();
              const isOverdue = diffMs < 0 || t.sla!.resolutionBreached;
              const hoursLeft = (diffMs / (3600 * 1000)).toFixed(1);

              return (
                <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-bold text-slate-900">{t.ticketNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-700">{t.priority}</span>
                      <span aria-hidden="true">·</span>
                      <span>Assignee: {t.assignedAgentName || 'Unassigned'}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{t.title}</div>
                  </div>

                  <div className="text-right shrink-0">
                    {isOverdue ? (
                      <div className="text-xs font-bold text-red-600 flex items-center gap-1 justify-end">
                        <AlertCircle className="w-4 h-4" />
                        <span>SLA BREACHED</span>
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-end font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{hoursLeft} hrs remaining</span>
                      </div>
                    )}
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      Target: {new Date(t.sla!.resolutionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SLA Policy Threshold Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Authoritative SLA Policy Thresholds</h3>
          <p className="text-xs text-slate-500">Configured first-response and resolution commitments</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Policy Name</th>
                <th className="px-4 py-3">Request Type</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3 text-right">Max Response Time</th>
                <th className="px-4 py-3 text-right">Max Resolution Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {policies.map((pol) => (
                <tr key={pol.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900">{pol.name}</td>
                  <td className="px-4 py-3">{pol.ticketType.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-semibold">{pol.priority}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{pol.responseTimeHours} hours</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">{pol.resolutionTimeHours} hours</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
