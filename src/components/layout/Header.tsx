import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types/helpdesk';
import { Plus, User, Shield, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange, onOpenCreateModal }) => {
  const { currentUser, switchRole, isTechnician, isAdmin } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles: { label: string; role: Role; desc: string }[] = [
    { label: 'Administrator', role: 'ROLE_ADMIN', desc: 'Full system & audit logs' },
    { label: 'IT Manager', role: 'ROLE_IT_MANAGER', desc: 'SLA oversight & queues' },
    { label: 'IT Agent', role: 'ROLE_IT_AGENT', desc: 'Triage, work & internal notes' },
    { label: 'Employee', role: 'ROLE_EMPLOYEE', desc: 'Self-service own tickets' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single Text Element Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white tracking-wider text-sm shadow-sm">
            RI
          </div>
          <button
            onClick={() => onTabChange('dashboard')}
            className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            ResolveIT
          </button>
        </div>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'dashboard' ? 'text-white border-b-2 border-blue-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('tickets')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'tickets' ? 'text-white border-b-2 border-blue-500 font-semibold' : 'hover:text-white'
            }`}
          >
            {isTechnician ? 'Ticket Queue' : 'My Tickets'}
          </button>

          <button
            onClick={() => onTabChange('kb')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'kb' ? 'text-white border-b-2 border-blue-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Knowledge Base
          </button>

          <button
            onClick={() => onTabChange('assets')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              currentTab === 'assets' ? 'text-white border-b-2 border-blue-500 font-semibold' : 'hover:text-white'
            }`}
          >
            Assets
          </button>

          {isTechnician && (
            <button
              onClick={() => onTabChange('sla')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                currentTab === 'sla' ? 'text-white border-b-2 border-blue-500 font-semibold' : 'hover:text-white'
              }`}
            >
              SLA & Escalation
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => onTabChange('admin')}
              className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                currentTab === 'admin' ? 'text-white border-b-2 border-blue-500 font-semibold' : 'hover:text-white'
              }`}
            >
              Admin & Audit
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Action (Create Ticket CTA + Role Switcher Dropdown) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Ticket</span>
          </button>

          {/* Quick Role Switcher for Evaluators / Administrators */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Switch user role to test permissions & IDOR protection"
            >
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">{currentUser.fullName.split(' ')[0]}</span>
              <span className="text-slate-400">({currentUser.role.replace('ROLE_', '')})</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1 z-50">
                <div className="px-3 py-2 border-b border-slate-800 text-xs text-slate-400">
                  Switch Active Role (RBAC Simulation):
                </div>
                <div className="py-1">
                  {roles.map((r) => {
                    const isSelected = currentUser.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-md transition-colors text-left cursor-pointer ${
                          isSelected ? 'bg-blue-600/20 text-blue-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div>{r.label}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{r.desc}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
