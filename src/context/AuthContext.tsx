import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '../types/helpdesk';
import { HelpdeskStorageService, SEED_USERS } from '../services/storage';

interface AuthContextType {
  currentUser: User;
  switchRole: (role: Role) => void;
  loginAsUser: (userId: string) => void;
  logout: () => void;
  isTechnician: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isAgent: boolean;
  isEmployee: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to IT Agent so user lands directly on a rich operational queue
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const users = HelpdeskStorageService.getUsers();
    return users.find((u) => u.role === 'ROLE_IT_AGENT') || users[0];
  });

  const switchRole = (role: Role) => {
    const users = HelpdeskStorageService.getUsers();
    const targetUser = users.find((u) => u.role === role && u.active);
    if (targetUser) {
      setCurrentUser(targetUser);
      HelpdeskStorageService.recordAudit({
        userEmail: targetUser.email,
        action: 'ROLE_SWITCH_SIMULATION',
        resourceType: 'AUTH',
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
        details: `Switched active preview role to ${role}`,
      });
    }
  };

  const loginAsUser = (userId: string) => {
    const users = HelpdeskStorageService.getUsers();
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      HelpdeskStorageService.recordAudit({
        userEmail: targetUser.email,
        action: 'USER_LOGIN',
        resourceType: 'AUTH',
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
        details: `Authenticated as ${targetUser.fullName}`,
      });
    }
  };

  const logout = () => {
    // Switch to first employee account upon logout
    const users = HelpdeskStorageService.getUsers();
    const employee = users.find((u) => u.role === 'ROLE_EMPLOYEE') || users[0];
    setCurrentUser(employee);
  };

  const isTechnician = ['ROLE_ADMIN', 'ROLE_IT_MANAGER', 'ROLE_IT_AGENT'].includes(currentUser.role);
  const isAdmin = currentUser.role === 'ROLE_ADMIN';
  const isManager = currentUser.role === 'ROLE_IT_MANAGER';
  const isAgent = currentUser.role === 'ROLE_IT_AGENT';
  const isEmployee = currentUser.role === 'ROLE_EMPLOYEE';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchRole,
        loginAsUser,
        logout,
        isTechnician,
        isAdmin,
        isManager,
        isAgent,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
