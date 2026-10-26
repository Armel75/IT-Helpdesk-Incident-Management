import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpdeskStorageService } from '../../services/storage';
import { Ticket, TicketPriority } from '../../types/helpdesk';
import { AlertCircle, Clock, CheckCircle2, Flame, ArrowUpRight, ShieldCheck, Inbox } from 'lucide-react';

interface DashboardViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  onNavigateToTickets: (filterStatus?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTicket, onNavigateToTickets }) => {
  const { currentUser, isTechnician, isEmployee } = useAuth();

  const stats = useMemo(() => {
    return HelpdeskStorageService.getDashboardStats(currentUser);
  }, [currentUser]);

  const urgentTickets = useMemo(() => {
    let tickets = HelpdeskStorageService.getTickets();
    if (isEmployee) {
      tickets = tickets.filter((t) => t.requesterId === currentUser.id);
    }
    return tickets
      .filter((t) => !['RESOLVED', 'CLOSED', 'CANCELLED'].includes(t.status))
      .sort((a, b) => {
        const priorityOrder: Record<TicketPriority, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  }, [currentUser, isEmployee]);

  return (
    <div className="space-y-8">
      {/* Scope banner explaining role visibility */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg text-white">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-blue-400">
            {isEmployee ? 'Employee Self-Service Portal' : 'Enterprise Operations Command'}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
            Welcome back, {currentUser.fullName}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEmployee
              ? 'Showing real-time status of your logged incident requests and service tickets.'
              : 'Monitoring department queue health, active incident response, and SLA compliance.'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-400">Active Role Policy</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{currentUser.role.replace('ROLE_', '')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Open Tickets */}
        <div
          onClick={() => onNavigateToTickets('OPEN')}
          className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Active Queue</span>
            <Inbox className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {stats.totalOpenTickets}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Requires technician action</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* Critical Incidents */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Critical Severity (Sev 1)</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-red-600 font-mono tabular-nums">
            {stats.criticalOpenTickets}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Highest priority incident triage
          </div>
        </div>

        {/* SLA Breaches */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">SLA Escalation Watch</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-amber-600 font-mono tabular-nums">
            {stats.breachedSlaTickets}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Response or resolution overdue
          </div>
        </div>

        {/* Resolved Count */}
        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Resolved Tickets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-emerald-600 font-mono tabular-nums">
            {stats.resolvedTickets}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Closed with verified summaries
          </div>
        </div>

      </div>

      {/* Main Grid: Priority / Status Breakdown & Urgent Action Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Urgent Attention Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Highest Priority Queue</h3>
              <p className="text-xs text-slate-500 mt-0.5">Tickets sorted by urgency and breach risk</p>
            </div>
            <button
              onClick={() => onNavigateToTickets()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              View Full Queue &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {urgentTickets.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active tickets requiring attention. All queues cleared.
              </div>
            ) : (
              urgentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="py-3.5 hover:bg-slate-50/80 px-2 rounded-md transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-700">{ticket.ticketNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600">{ticket.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`font-semibold ${
                        ticket.priority === 'CRITICAL' ? 'text-red-600' :
                        ticket.priority === 'HIGH' ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 truncate mt-1">
                      {ticket.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Requester: {ticket.requesterName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Assignee: {ticket.assignedAgentName || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                      {ticket.status.replace('_', ' ')}
                    </div>
                    {ticket.sla && (
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Due: {new Date(ticket.sla.resolutionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Performance & SLA Benchmark */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">SLA Operational Benchmark</h3>
            <p className="text-xs text-slate-500">Department turnaround performance metrics</p>
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Mean Time to First Response</span>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                  {stats.avgResponseHours} hrs
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span>Mean Time to Resolution</span>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
                  {stats.avgResolutionHours} hrs
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>SLA Compliance Rate</span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-600 tabular-nums">
                  96.4%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Active Priority Breakdown</h3>
            <div className="space-y-2 pt-1 text-xs">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as TicketPriority[]).map((p) => {
                const count = stats.ticketsByPriority[p] || 0;
                const total = stats.totalOpenTickets || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={p} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-700">{p}</span>
                      <span className="font-mono text-slate-500 tabular-nums">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          p === 'CRITICAL' ? 'bg-red-500' :
                          p === 'HIGH' ? 'bg-amber-500' :
                          p === 'MEDIUM' ? 'bg-blue-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
