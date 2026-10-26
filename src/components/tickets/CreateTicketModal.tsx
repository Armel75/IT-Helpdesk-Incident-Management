import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpdeskStorageService } from '../../services/storage';
import { Ticket, TicketPriority, TicketSeverity, TicketType } from '../../types/helpdesk';
import { X, Clock, ShieldCheck } from 'lucide-react';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (newTicket: Ticket) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ isOpen, onClose, onTicketCreated }) => {
  const { currentUser } = useAuth();

  const categories = useMemo(() => HelpdeskStorageService.getCategories(), []);
  const assets = useMemo(() => HelpdeskStorageService.getAssets(), []);
  const slaPolicies = useMemo(() => HelpdeskStorageService.getSlaPolicies(), []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ticketType, setTicketType] = useState<TicketType>('INCIDENT');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [severity, setSeverity] = useState<TicketSeverity>('SEV3');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [assetId, setAssetId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic SLA policy resolution
  const activeSlaPolicy = useMemo(() => {
    return (
      slaPolicies.find((p) => p.priority === priority && p.ticketType === ticketType && p.active) ||
      slaPolicies[0]
    );
  }, [priority, ticketType, slaPolicies]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }
    if (!description.trim() || description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters.';
    }
    if (!categoryId) {
      errs.categoryId = 'Please select an affected category.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const category = categories.find((c) => c.id === categoryId);
    const asset = assets.find((a) => a.id === assetId);

    const now = new Date();
    const prefix = ticketType === 'INCIDENT' ? 'INC' : 'SRQ';
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const ticketNumber = `${prefix}-${now.getFullYear()}-${randomNum}`;

    const responseHours = activeSlaPolicy ? activeSlaPolicy.responseTimeHours : 4;
    const resolutionHours = activeSlaPolicy ? activeSlaPolicy.resolutionTimeHours : 24;

    const responseDeadline = new Date(now.getTime() + responseHours * 3600 * 1000).toISOString();
    const resolutionDeadline = new Date(now.getTime() + resolutionHours * 3600 * 1000).toISOString();

    const newTicket: Ticket = {
      id: 'tk-' + Date.now(),
      ticketNumber,
      title: title.trim(),
      description: description.trim(),
      ticketType,
      priority,
      severity,
      status: 'OPEN',
      requesterId: currentUser.id,
      requesterName: currentUser.fullName,
      requesterEmail: currentUser.email,
      categoryId,
      categoryName: category?.name || 'General',
      assetId: asset?.id,
      assetTag: asset?.assetTag,
      version: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      sla: {
        id: 'sla-' + Date.now(),
        ticketId: 'tk-' + Date.now(),
        policyName: activeSlaPolicy?.name || 'Standard SLA',
        responseDeadline,
        resolutionDeadline,
        responseBreached: false,
        resolutionBreached: false,
      },
    };

    const tickets = HelpdeskStorageService.getTickets();
    tickets.unshift(newTicket);
    HelpdeskStorageService.setTickets(tickets);

    const history = HelpdeskStorageService.getHistory();
    history.push({
      id: 'h-' + Date.now(),
      ticketId: newTicket.id,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      eventType: 'TICKET_CREATED',
      fieldChanged: 'status',
      newValue: 'OPEN',
      createdAt: now.toISOString(),
    });
    HelpdeskStorageService.setHistory(history);

    HelpdeskStorageService.recordAudit({
      userEmail: currentUser.email,
      action: 'TICKET_CREATED',
      resourceType: 'TICKET',
      resourceId: newTicket.ticketNumber,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: `Created new ${ticketType} (${ticketNumber}) with priority ${priority}`,
    });

    onTicketCreated(newTicket);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create New Support Request</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit an operational incident or IT service request with automated SLA tracking.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Ticket Type & Priority Split */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Request Type *</label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as TicketType)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="INCIDENT">Incident (Break / Outage / Bug)</option>
                <option value="SERVICE_REQUEST">Service Request (Access / Hardware)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level *</label>
              <select
                value={priority}
                onChange={(e) => {
                  const p = e.target.value as TicketPriority;
                  setPriority(p);
                  if (p === 'CRITICAL') setSeverity('SEV1');
                  else if (p === 'HIGH') setSeverity('SEV2');
                  else if (p === 'MEDIUM') setSeverity('SEV3');
                  else setSeverity('SEV4');
                }}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="CRITICAL">Critical (Immediate Outage / Sev 1)</option>
                <option value="HIGH">High (Major Feature Impaired / Sev 2)</option>
                <option value="MEDIUM">Medium (Normal Issue / Sev 3)</option>
                <option value="LOW">Low (Minor Inconvenience / Sev 4)</option>
              </select>
            </div>
          </div>

          {/* Dynamic SLA Target Preview Strip */}
          {activeSlaPolicy && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-md flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-semibold">{activeSlaPolicy.name}:</span>
              </div>
              <div className="flex items-center gap-3 font-mono font-medium">
                <span>First Response: &le; {activeSlaPolicy.responseTimeHours}h</span>
                <span aria-hidden="true">·</span>
                <span>Target Resolution: &le; {activeSlaPolicy.resolutionTimeHours}h</span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Concise summary of the problem or request..."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {errors.title && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.title}</p>}
          </div>

          {/* Category & Asset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.categoryId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Affected Asset (Optional)</label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="">-- None / General --</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} — {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact error messages, affected systems, steps to reproduce, and business impact..."
              className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {errors.description && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.description}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="text-[11px] text-slate-400">
              Logged as: <span className="font-semibold text-slate-700">{currentUser.fullName}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
              >
                Submit Ticket
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
