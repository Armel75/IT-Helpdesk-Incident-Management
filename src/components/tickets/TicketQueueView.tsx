import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpdeskStorageService } from '../../services/storage';
import { Ticket, TicketPriority, TicketStatus } from '../../types/helpdesk';
import { Search, Filter, AlertCircle, Clock, CheckCircle2, ChevronRight, RefreshCw } from 'lucide-react';

interface TicketQueueViewProps {
  onSelectTicket: (ticket: Ticket) => void;
  initialStatusFilter?: string;
}

export const TicketQueueView: React.FC<TicketQueueViewProps> = ({ onSelectTicket, initialStatusFilter }) => {
  const { currentUser, isTechnician, isEmployee } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [assignedOnly, setAssignedOnly] = useState(false);

  const categories = useMemo(() => HelpdeskStorageService.getCategories(), []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    let tickets = HelpdeskStorageService.getTickets();

    // 1. Mandatory Object-Level Authorization: Employees can ONLY view own tickets
    if (isEmployee) {
      tickets = tickets.filter((t) => t.requesterId === currentUser.id);
    }

    // 2. Assigned-to-me toggle for technicians
    if (assignedOnly && isTechnician) {
      tickets = tickets.filter((t) => t.assignedAgentId === currentUser.id);
    }

    // 3. Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      tickets = tickets.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q)
      );
    }

    // 4. Status filter
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'ACTIVE') {
        tickets = tickets.filter((t) => !['RESOLVED', 'CLOSED', 'CANCELLED'].includes(t.status));
      } else if (statusFilter === 'BREACHED') {
        tickets = tickets.filter(
          (t) => t.sla && (t.sla.resolutionBreached || (t.sla.resolutionDeadline && new Date(t.sla.resolutionDeadline) < new Date()))
        );
      } else {
        tickets = tickets.filter((t) => t.status === statusFilter);
      }
    }

    // 5. Priority filter
    if (priorityFilter !== 'ALL') {
      tickets = tickets.filter((t) => t.priority === priorityFilter);
    }

    // 6. Category filter
    if (categoryFilter !== 'ALL') {
      tickets = tickets.filter((t) => t.categoryId === categoryFilter);
    }

    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [search, statusFilter, priorityFilter, categoryFilter, assignedOnly, currentUser, isEmployee, isTechnician]);

  return (
    <div className="space-y-6">
      
      {/* Title & Queue Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {isEmployee ? 'My Support Requests' : 'Incident & Request Queue'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployee
              ? 'Showing tickets submitted by your account. Object-level access control enforced.'
              : 'Enterprise support queue. Filter by assignment, priority, and SLA deadlines.'}
          </p>
        </div>

        {/* Quick Filter Tabs (Functional segmented controls) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Open
          </button>
          <button
            onClick={() => setStatusFilter('RESOLVED')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'RESOLVED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => setStatusFilter('BREACHED')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              statusFilter === 'BREACHED' ? 'bg-white text-red-600 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SLA Warning
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket number, title, requester..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Priority selector */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Assigned to me toggle */}
          {isTechnician && (
            <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer pl-1">
              <input
                type="checkbox"
                checked={assignedOnly}
                onChange={(e) => setAssignedOnly(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Assigned to me</span>
            </label>
          )}
        </div>
      </div>

      {/* Tickets Table / List */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No matching tickets</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No tickets matched your filter criteria or search query. Try resetting filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTickets.map((ticket) => {
              const isBreached =
                ticket.sla &&
                (ticket.sla.resolutionBreached ||
                  (!['RESOLVED', 'CLOSED', 'CANCELLED'].includes(ticket.status) &&
                    new Date(ticket.sla.resolutionDeadline) < new Date()));

              return (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket(ticket)}
                  className="p-4 hover:bg-slate-50/90 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Unboxed Metadata (Zero-Pill Discipline) */}
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-slate-900">{ticket.ticketNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600 font-medium">{ticket.ticketType.replace('_', ' ')}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{ticket.categoryName}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          ticket.priority === 'CRITICAL'
                            ? 'text-red-600'
                            : ticket.priority === 'HIGH'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>

                    {/* Ticket Title */}
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {ticket.title}
                    </h4>

                    {/* Secondary metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-0.5">
                      <span>Requester: {ticket.requesterName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Assignee: {ticket.assignedAgentName || 'Unassigned'}</span>
                      {ticket.assetTag && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-slate-500">{ticket.assetTag}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-400">
                        Created {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status & SLA Indicators */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 text-right gap-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      {ticket.status.replace(/_/g, ' ')}
                    </span>

                    {ticket.sla && (
                      <div className="flex items-center gap-1 text-[11px] font-mono">
                        {isBreached ? (
                          <span className="text-red-600 flex items-center gap-1 font-semibold">
                            <AlertCircle className="w-3 h-3" /> SLA Breached
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Due {new Date(ticket.sla.resolutionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400">v{ticket.version}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
