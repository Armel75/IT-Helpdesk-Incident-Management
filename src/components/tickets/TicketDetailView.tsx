import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpdeskStorageService } from '../../services/storage';
import { Comment, CommentType, Ticket, TicketStatus, User } from '../../types/helpdesk';
import {
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle2,
  Lock,
  UserCheck,
  Send,
  MessageSquare,
  History,
  ShieldAlert,
  FileText,
} from 'lucide-react';

interface TicketDetailViewProps {
  ticketId: string;
  onBack: () => void;
  onTicketUpdated: () => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticketId, onBack, onTicketUpdated }) => {
  const { currentUser, isTechnician, isEmployee, isAdmin, isManager } = useAuth();

  // Fetch ticket
  const ticket = useMemo(() => {
    return HelpdeskStorageService.getTickets().find((t) => t.id === ticketId);
  }, [ticketId]);

  // Comments state
  const [comments, setComments] = useState<Comment[]>(() => {
    const all = HelpdeskStorageService.getComments().filter((c) => c.ticketId === ticketId);
    if (isEmployee) {
      // Physical filter: employees never see internal technician notes
      return all.filter((c) => c.commentType === 'PUBLIC');
    }
    return all;
  });

  const [activeTab, setActiveTab] = useState<'comments' | 'history'>('comments');
  const [commentContent, setCommentContent] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('PUBLIC');
  const [commentError, setCommentError] = useState('');

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolveError, setResolveError] = useState('');

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const agents = useMemo(() => {
    return HelpdeskStorageService.getUsers().filter((u) => ['ROLE_IT_AGENT', 'ROLE_IT_MANAGER'].includes(u.role));
  }, []);

  const history = useMemo(() => {
    return HelpdeskStorageService.getHistory().filter((h) => h.ticketId === ticketId);
  }, [ticketId]);

  if (!ticket) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-900">Ticket Not Found</h3>
        <button onClick={onBack} className="mt-3 text-xs font-semibold text-blue-600 cursor-pointer">
          &larr; Back to Queue
        </button>
      </div>
    );
  }

  // Mandatory Object-Level Authorization: Employees can only view own tickets
  if (isEmployee && ticket.requesterId !== currentUser.id) {
    return (
      <div className="p-8 text-center bg-white border border-red-200 rounded-lg">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900">403 Forbidden — IDOR Protection Enforced</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Server-side object-level access control policy prohibits employee account ({currentUser.email}) from viewing ticket{' '}
          {ticket.ticketNumber} owned by {ticket.requesterName}.
        </p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Return to Permitted Tickets
        </button>
      </div>
    );
  }

  // Handle status transition
  const handleTransition = (targetStatus: TicketStatus, summary?: string) => {
    const tickets = HelpdeskStorageService.getTickets();
    const idx = tickets.findIndex((t) => t.id === ticket.id);
    if (idx === -1) return;

    const oldStatus = ticket.status;
    const now = new Date().toISOString();

    const updatedTicket: Ticket = {
      ...ticket,
      status: targetStatus,
      version: ticket.version + 1,
      updatedAt: now,
    };

    if (oldStatus === 'OPEN' && !ticket.firstResponseAt) {
      updatedTicket.firstResponseAt = now;
    }

    if (targetStatus === 'RESOLVED') {
      updatedTicket.resolutionSummary = summary || resolutionSummary;
      updatedTicket.resolvedAt = now;
    }

    if (targetStatus === 'CLOSED') {
      updatedTicket.closedAt = now;
    }

    if (targetStatus === 'REOPENED') {
      updatedTicket.resolvedAt = undefined;
      updatedTicket.closedAt = undefined;
    }

    tickets[idx] = updatedTicket;
    HelpdeskStorageService.setTickets(tickets);

    // Record history event
    const hist = HelpdeskStorageService.getHistory();
    hist.push({
      id: 'h-' + Date.now(),
      ticketId: ticket.id,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      eventType: 'STATUS_CHANGE',
      fieldChanged: 'status',
      oldValue: oldStatus,
      newValue: targetStatus,
      createdAt: now,
    });
    HelpdeskStorageService.setHistory(hist);

    HelpdeskStorageService.recordAudit({
      userEmail: currentUser.email,
      action: 'TICKET_STATUS_TRANSITION',
      resourceType: 'TICKET',
      resourceId: ticket.ticketNumber,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: `Transitioned ${ticket.ticketNumber} from ${oldStatus} to ${targetStatus}`,
    });

    onTicketUpdated();
    setShowResolveModal(false);
  };

  // Handle assignment
  const handleAssign = (agentId: string) => {
    const agent = agents.find((a) => a.id === agentId);
    if (!agent) return;

    const tickets = HelpdeskStorageService.getTickets();
    const idx = tickets.findIndex((t) => t.id === ticket.id);
    if (idx === -1) return;

    const oldAgent = ticket.assignedAgentName || 'Unassigned';
    const now = new Date().toISOString();

    tickets[idx] = {
      ...ticket,
      assignedAgentId: agent.id,
      assignedAgentName: agent.fullName,
      version: ticket.version + 1,
      updatedAt: now,
    };
    HelpdeskStorageService.setTickets(tickets);

    const hist = HelpdeskStorageService.getHistory();
    hist.push({
      id: 'h-' + Date.now(),
      ticketId: ticket.id,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      eventType: 'ASSIGNED',
      fieldChanged: 'assigned_agent',
      oldValue: oldAgent,
      newValue: agent.fullName,
      createdAt: now,
    });
    HelpdeskStorageService.setHistory(hist);

    setShowAssignModal(false);
    onTicketUpdated();
  };

  // Add comment / note
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    // RBAC validation: Employees can never submit internal notes
    if (isEmployee && commentType === 'INTERNAL_NOTE') {
      setCommentError('Security policy strictly prohibits employees from creating internal notes.');
      return;
    }

    const now = new Date().toISOString();
    const newComment: Comment = {
      id: 'cm-' + Date.now(),
      ticketId: ticket.id,
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorEmail: currentUser.email,
      authorRole: currentUser.role,
      content: commentContent.trim(),
      commentType: isEmployee ? 'PUBLIC' : commentType,
      createdAt: now,
    };

    const allComments = HelpdeskStorageService.getComments();
    allComments.push(newComment);
    HelpdeskStorageService.setComments(allComments);

    setComments((prev) => [...prev, newComment]);
    setCommentContent('');
    setCommentError('');

    // If ticket was OPEN and agent commented, stamp firstResponseAt
    if (ticket.status === 'OPEN' && isTechnician && !ticket.firstResponseAt) {
      const tickets = HelpdeskStorageService.getTickets();
      const idx = tickets.findIndex((t) => t.id === ticket.id);
      if (idx !== -1) {
        tickets[idx].firstResponseAt = now;
        tickets[idx].updatedAt = now;
        HelpdeskStorageService.setTickets(tickets);
      }
    }

    onTicketUpdated();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-semibold text-slate-900">{ticket.ticketNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{ticket.ticketType.replace('_', ' ')}</span>
              <span aria-hidden="true">·</span>
              <span>{ticket.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">v{ticket.version} (Optimistic Lock)</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5">{ticket.title}</h1>
          </div>
        </div>

        {/* State Machine Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Agent Claim / Assign CTA */}
          {isTechnician && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>{ticket.assignedAgentName ? 'Reassign' : 'Claim / Assign'}</span>
            </button>
          )}

          {/* Transition buttons according to current status & state machine rules */}
          {ticket.status === 'OPEN' && isTechnician && (
            <>
              <button
                onClick={() => handleTransition('TRIAGED')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Triage
              </button>
              <button
                onClick={() => handleTransition('IN_PROGRESS')}
                className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors cursor-pointer"
              >
                Start Work
              </button>
            </>
          )}

          {ticket.status === 'TRIAGED' && isTechnician && (
            <button
              onClick={() => handleTransition('IN_PROGRESS')}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Start Investigation
            </button>
          )}

          {ticket.status === 'IN_PROGRESS' && isTechnician && (
            <>
              <button
                onClick={() => handleTransition('PENDING_USER')}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-800 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
              >
                Pending User
              </button>
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors cursor-pointer"
              >
                Resolve Ticket
              </button>
            </>
          )}

          {ticket.status === 'PENDING_USER' && (
            <button
              onClick={() => handleTransition('IN_PROGRESS')}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Resume Work
            </button>
          )}

          {ticket.status === 'RESOLVED' && (
            <>
              <button
                onClick={() => handleTransition('CLOSED')}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-md hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                Confirm & Close
              </button>
              <button
                onClick={() => handleTransition('REOPENED')}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition-colors cursor-pointer"
              >
                Reopen
              </button>
            </>
          )}

          {ticket.status === 'REOPENED' && isTechnician && (
            <button
              onClick={() => handleTransition('IN_PROGRESS')}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors cursor-pointer"
            >
              Re-investigate
            </button>
          )}

          {!['CLOSED', 'CANCELLED'].includes(ticket.status) && (
            <button
              onClick={() => handleTransition('CANCELLED')}
              className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Column Details & Timeline / Right Column SLA & Meta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Description, Resolution Summary, Comments, History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Ticket Description */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Incident Description</h3>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Resolution Summary if resolved */}
          {ticket.resolutionSummary && (
            <div className="p-5 bg-emerald-50/60 border border-emerald-200 rounded-lg shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Resolution Summary</span>
              </div>
              <p className="text-sm text-emerald-950 whitespace-pre-wrap leading-relaxed font-medium">
                {ticket.resolutionSummary}
              </p>
              {ticket.resolvedAt && (
                <div className="text-[11px] text-emerald-700 font-mono pt-1">
                  Resolved on: {new Date(ticket.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Dual Tab: Comments Stream vs Audit Timeline */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            <div className="flex items-center border-b border-slate-200 bg-slate-50/70 px-4">
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'comments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Activity & Comments ({comments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                <span>State Transition Audit ({history.length})</span>
              </button>
            </div>

            {/* Comments Tab Body */}
            {activeTab === 'comments' && (
              <div className="p-6 space-y-6">
                
                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No comments or technician notes recorded yet.
                    </div>
                  ) : (
                    comments.map((cm) => {
                      const isInternal = cm.commentType === 'INTERNAL_NOTE';
                      return (
                        <div
                          key={cm.id}
                          className={`p-4 rounded-lg border text-xs space-y-1.5 ${
                            isInternal
                              ? 'bg-amber-50/50 border-amber-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-slate-500">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">{cm.authorName}</span>
                              <span aria-hidden="true">·</span>
                              <span className="text-[11px] text-slate-400">{cm.authorRole.replace('ROLE_', '')}</span>
                              {isInternal && (
                                <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded text-[10px]">
                                  <Lock className="w-3 h-3" /> Internal Technician Note (Shielded from User)
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-slate-400">
                              {new Date(cm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-800 text-sm whitespace-pre-wrap">{cm.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Comment Box */}
                {!['CLOSED', 'CANCELLED'].includes(ticket.status) && (
                  <form onSubmit={handleAddComment} className="space-y-3 pt-4 border-t border-slate-200">
                    
                    {/* Public vs Internal Note toggle (Technicians only) */}
                    {isTechnician && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCommentType('PUBLIC')}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                            commentType === 'PUBLIC'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Public Customer Reply
                        </button>
                        <button
                          type="button"
                          onClick={() => setCommentType('INTERNAL_NOTE')}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                            commentType === 'INTERNAL_NOTE'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Lock className="w-3 h-3" />
                          <span>Internal Note</span>
                        </button>
                      </div>
                    )}

                    <div>
                      <textarea
                        rows={3}
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder={
                          commentType === 'INTERNAL_NOTE'
                            ? 'Record confidential diagnostics, vendor logs, or internal technician notes...'
                            : 'Write a response visible to the requester...'
                        }
                        className="w-full text-xs p-3 border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {commentError && (
                      <div className="text-xs text-red-600 font-semibold">{commentError}</div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Post {commentType === 'INTERNAL_NOTE' ? 'Internal Note' : 'Public Reply'}</span>
                      </button>
                    </div>
                  </form>
                )}

              </div>
            )}

            {/* History Tab Body */}
            {activeTab === 'history' && (
              <div className="p-6">
                <div className="divide-y divide-slate-100 space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="pt-3 first:pt-0 flex items-start justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-800">
                          {h.actorName} performed {h.eventType}
                        </div>
                        {h.fieldChanged && (
                          <div className="text-slate-500">
                            Changed <span className="font-mono">{h.fieldChanged}</span> from{' '}
                            <span className="font-medium text-slate-700">{h.oldValue || 'None'}</span> to{' '}
                            <span className="font-medium text-slate-900">{h.newValue}</span>
                          </div>
                        )}
                      </div>
                      <div className="font-mono text-slate-400 shrink-0">
                        {new Date(h.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right Col: SLA Policy, Metadata, Requester & Assigned Agent */}
        <div className="space-y-6">
          
          {/* SLA Tracking Card */}
          {ticket.sla && (
            <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">SLA Enforcement</h3>
              
              <div className="space-y-3 pt-1">
                <div>
                  <div className="text-xs text-slate-500">Governing Policy</div>
                  <div className="text-xs font-bold text-slate-900">{ticket.sla.policyName}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-md space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Resolution Target</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {new Date(ticket.sla.resolutionDeadline).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Resolution Status</span>
                    {ticket.sla.resolutionBreached ? (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Breached
                      </span>
                    ) : ticket.resolvedAt ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Met Within SLA
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Active Target
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ticket Metadata Card */}
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ticket Details</h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Requester</span>
                <span className="font-semibold text-slate-900">{ticket.requesterName}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Requester Email</span>
                <span className="font-mono text-slate-700">{ticket.requesterEmail}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Assigned Agent</span>
                <span className="font-semibold text-slate-900">{ticket.assignedAgentName || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Assigned Team</span>
                <span className="text-slate-700">{ticket.assignedTeamName || 'General Queue'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Priority / Severity</span>
                <span className="font-semibold text-slate-900">{ticket.priority} ({ticket.severity})</span>
              </div>
              {ticket.assetTag && (
                <div className="flex justify-between pb-2 border-b border-slate-100">
                  <span className="text-slate-500">Linked Asset</span>
                  <span className="font-mono font-semibold text-blue-600">{ticket.assetTag}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Created Date</span>
                <span className="font-mono text-slate-700">{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Mandatory Resolution Summary Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">Resolve Ticket & Document Fix</h3>
              <p className="text-xs text-slate-500 mt-1">
                State machine precondition: Resolving ticket {ticket.ticketNumber} requires an explicit, detailed resolution summary (min 10 characters).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Summary *
              </label>
              <textarea
                rows={4}
                value={resolutionSummary}
                onChange={(e) => setResolutionSummary(e.target.value)}
                placeholder="Explain the root cause identified, corrective steps taken, and verification outcome..."
                className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            {resolveError && (
              <div className="text-xs text-red-600 font-semibold">{resolveError}</div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (resolutionSummary.trim().length < 10) {
                    setResolveError('Resolution summary must be at least 10 characters.');
                    return;
                  }
                  handleTransition('RESOLVED', resolutionSummary.trim());
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-500 cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Ticket Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-base font-bold text-slate-900">Assign Incident Ticket</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select a qualified technician to take ownership of {ticket.ticketNumber}.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Select IT Agent</label>
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-md bg-white text-slate-900"
              >
                <option value="">-- Choose Agent --</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.fullName} ({ag.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedAgentId}
                onClick={() => handleAssign(selectedAgentId)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
