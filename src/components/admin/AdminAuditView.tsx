import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpdeskStorageService } from '../../services/storage';
import { Role, SecurityAuditLog, User } from '../../types/helpdesk';
import { Shield, ShieldAlert, UserCheck, UserX, Plus, Lock } from 'lucide-react';

export const AdminAuditView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>(() => HelpdeskStorageService.getUsers());
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>(() => HelpdeskStorageService.getAuditLogs());

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'audit'>('users');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState<Role>('ROLE_EMPLOYEE');
  const [userError, setUserError] = useState('');

  // Toggle user activation
  const handleToggleUserStatus = (user: User) => {
    const updated = users.map((u) => {
      if (u.id === user.id) {
        const nextState = !u.active;
        HelpdeskStorageService.recordAudit({
          userEmail: currentUser.email,
          action: nextState ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
          resourceType: 'USER',
          resourceId: user.email,
          ipAddress: '127.0.0.1',
          status: 'SUCCESS',
          details: `${nextState ? 'Reactivated' : 'Deactivated and revoked all sessions for'} user ${user.email}`,
        });
        return { ...u, active: nextState };
      }
      return u;
    });

    setUsers(updated);
    HelpdeskStorageService.setUsers(updated);
    setAuditLogs(HelpdeskStorageService.getAuditLogs());
  };

  // Create user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newFullName.trim() || !newDepartment.trim()) {
      setUserError('All fields are required.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setUserError('Email address already registered.');
      return;
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      email: newEmail.trim().toLowerCase(),
      fullName: newFullName.trim(),
      department: newDepartment.trim(),
      role: newRole,
      active: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    setUsers(updated);
    HelpdeskStorageService.setUsers(updated);

    HelpdeskStorageService.recordAudit({
      userEmail: currentUser.email,
      action: 'USER_PROVISIONED',
      resourceType: 'USER',
      resourceId: newUser.email,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: `Provisioned account ${newUser.email} with role ${newUser.role}`,
    });

    setAuditLogs(HelpdeskStorageService.getAuditLogs());
    setShowCreateUserModal(false);
    setNewEmail('');
    setNewFullName('');
    setNewDepartment('');
    setUserError('');
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white border border-red-200 rounded-lg">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900">403 Forbidden — Administrator Privileges Required</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Security audit logs and account provisioning controls are restricted strictly to users with ROLE_ADMIN.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">System Administration & Security Audit</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-based user provisioning, session invalidation, and immutable security audit logs.
          </p>
        </div>

        {activeSubTab === 'users' && (
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        )}
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'users' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          User Directory & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeSubTab === 'audit' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* Users Tab */}
      {activeSubTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.fullName}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{u.email}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{u.role.replace('ROLE_', '')}</td>
                    <td className="px-4 py-3">{u.department}</td>
                    <td className="px-4 py-3">
                      {u.active ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <UserX className="w-3.5 h-3.5" /> Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`text-xs font-semibold cursor-pointer ${
                            u.active ? 'text-red-600 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          {u.active ? 'Deactivate & Invalidate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Audit Tab */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Immutable Security Audit Trail</h3>
            <p className="text-xs text-slate-500">Chronological security telemetry, auth attempts, and IDOR defenses</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / Email</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-900 font-medium">
                      {log.userEmail || 'anonymous'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{log.action}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{log.ipAddress}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          log.status === 'SUCCESS' ? 'text-emerald-600' : 'text-red-600'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Provision Enterprise User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@resolveit.internal"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Platform Engineering"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md bg-white text-slate-900"
                >
                  <option value="ROLE_EMPLOYEE">EMPLOYEE (Self-Service)</option>
                  <option value="ROLE_IT_AGENT">IT_AGENT (Triage & Work)</option>
                  <option value="ROLE_IT_MANAGER">IT_MANAGER (Department Reports)</option>
                  <option value="ROLE_ADMIN">ADMIN (Full Authority)</option>
                </select>
              </div>

              {userError && <div className="text-xs text-red-600 font-semibold">{userError}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
