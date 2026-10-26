import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { TicketQueueView } from './components/tickets/TicketQueueView';
import { TicketDetailView } from './components/tickets/TicketDetailView';
import { CreateTicketModal } from './components/tickets/CreateTicketModal';
import { KnowledgeBaseView } from './components/kb/KnowledgeBaseView';
import { AssetsView } from './components/assets/AssetsView';
import { SlaMonitorView } from './components/sla/SlaMonitorView';
import { AdminAuditView } from './components/admin/AdminAuditView';
import { Ticket } from './types/helpdesk';

const MainAppContent: React.FC = () => {
  const { isTechnician, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [initialStatusFilter, setInitialStatusFilter] = useState<string | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicketId(ticket.id);
  };

  const handleNavigateToTickets = (filterStatus?: string) => {
    setSelectedTicketId(null);
    setInitialStatusFilter(filterStatus);
    setCurrentTab('tickets');
  };

  const handleTicketCreated = (newTicket: Ticket) => {
    setRefreshTrigger((prev) => prev + 1);
    setSelectedTicketId(newTicket.id);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        currentTab={selectedTicketId ? 'tickets' : currentTab}
        onTabChange={(tab) => {
          setSelectedTicketId(null);
          setCurrentTab(tab);
        }}
        onOpenCreateModal={() => setCreateModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTicketId ? (
          <TicketDetailView
            key={`${selectedTicketId}-${refreshTrigger}`}
            ticketId={selectedTicketId}
            onBack={() => setSelectedTicketId(null)}
            onTicketUpdated={() => setRefreshTrigger((prev) => prev + 1)}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                onSelectTicket={handleSelectTicket}
                onNavigateToTickets={handleNavigateToTickets}
              />
            )}

            {currentTab === 'tickets' && (
              <TicketQueueView
                key={refreshTrigger}
                onSelectTicket={handleSelectTicket}
                initialStatusFilter={initialStatusFilter}
              />
            )}

            {currentTab === 'kb' && <KnowledgeBaseView />}

            {currentTab === 'assets' && <AssetsView />}

            {currentTab === 'sla' && isTechnician && <SlaMonitorView />}

            {currentTab === 'admin' && isAdmin && <AdminAuditView />}
          </>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ResolveIT Enterprise Helpdesk &middot; Java 21 LTS &amp; React 19 Monorepo</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Flyway Migrations</span>
            <span>&middot;</span>
            <span>Testcontainers PostgreSQL</span>
            <span>&middot;</span>
            <span>RBAC &amp; SLA Engine</span>
          </div>
        </div>
      </footer>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
