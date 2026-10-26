import {
  Asset,
  Category,
  Comment,
  CommentType,
  DashboardStats,
  KnowledgeArticle,
  Role,
  SecurityAuditLog,
  SlaPolicy,
  Team,
  Ticket,
  TicketHistory,
  TicketPriority,
  TicketStatus,
  TicketType,
  User,
} from '../types/helpdesk';

const STORAGE_KEY_PREFIX = 'resolveit_enterprise_';

// Initial Mock/Seed Users
export const SEED_USERS: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@resolveit.internal',
    fullName: 'System Administrator',
    role: 'ROLE_ADMIN',
    department: 'IT Operations',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'manager.sarah@resolveit.internal',
    fullName: 'Sarah Connor (IT Manager)',
    role: 'ROLE_IT_MANAGER',
    department: 'Service Delivery',
    active: true,
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'agent.marcus@resolveit.internal',
    fullName: 'Marcus Vance (Senior Agent)',
    role: 'ROLE_IT_AGENT',
    department: 'Tier 2 Support',
    active: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'agent.elena@resolveit.internal',
    fullName: 'Elena Rostova (Support Agent)',
    role: 'ROLE_IT_AGENT',
    department: 'Tier 1 Service Desk',
    active: true,
    createdAt: '2026-02-15T11:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'employee.alex@resolveit.internal',
    fullName: 'Alex Rivera (Engineer)',
    role: 'ROLE_EMPLOYEE',
    department: 'Engineering',
    active: true,
    createdAt: '2026-03-01T08:30:00Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'employee.chloe@resolveit.internal',
    fullName: 'Chloe Bennett (Marketing)',
    role: 'ROLE_EMPLOYEE',
    department: 'Growth & Marketing',
    active: true,
    createdAt: '2026-03-15T09:15:00Z',
  },
];

export const SEED_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Hardware & Peripherals', code: 'HW', description: 'Physical laptops, docking stations, monitors', active: true },
  { id: 'c2', name: 'Network & Connectivity', code: 'NET', description: 'Wi-Fi, VPN gateways, DNS, firewall', active: true },
  { id: 'c3', name: 'Software & Applications', code: 'SW', description: 'Productivity suites, IDEs, SaaS access', active: true },
  { id: 'c4', name: 'Identity & Access Management', code: 'IAM', description: 'SSO, MFA, password resets, permissions', active: true },
];

export const SEED_TEAMS: Team[] = [
  { id: 't1', name: 'Service Desk Tier 1', description: 'Frontline incident intake and rapid resolution', leadUserId: '22222222-2222-2222-2222-222222222222', active: true },
  { id: 't2', name: 'Infrastructure & Networks', description: 'Core routing, VPN, firewalls, and cloud connectivity', leadUserId: '33333333-3333-3333-3333-333333333333', active: true },
  { id: 't3', name: 'Workplace & End-User Compute', description: 'Laptops, OS deployments, and physical desk hardware', leadUserId: '44444444-4444-4444-4444-444444444444', active: true },
];

export const SEED_ASSETS: Asset[] = [
  { id: 'a1', assetTag: 'AST-LP-0192', name: 'ThinkPad X1 Carbon Gen 11', assetType: 'LAPTOP', status: 'ACTIVE', ownerId: '55555555-5555-5555-5555-555555555555', serialNumber: 'SN-TP882910X' },
  { id: 'a2', assetTag: 'AST-LP-0205', name: 'MacBook Pro 16 M3 Max', assetType: 'LAPTOP', status: 'ACTIVE', ownerId: '66666666-6666-6666-6666-666666666666', serialNumber: 'SN-MBP992011M' },
  { id: 'a3', assetTag: 'AST-MON-0044', name: 'Dell UltraSharp 32 4K USB-C Hub', assetType: 'MONITOR', status: 'ACTIVE', ownerId: '55555555-5555-5555-5555-555555555555', serialNumber: 'SN-DL440019A' },
  { id: 'a4', assetTag: 'AST-LIC-0081', name: 'JetBrains All Products Pack License', assetType: 'SOFTWARE_LICENSE', status: 'ACTIVE', ownerId: '55555555-5555-5555-5555-555555555555', serialNumber: 'JB-CORP-9901' },
];

export const SEED_SLA_POLICIES: SlaPolicy[] = [
  { id: 'sp1', name: 'Critical Incident Policy', priority: 'CRITICAL', ticketType: 'INCIDENT', responseTimeHours: 1, resolutionTimeHours: 4, active: true },
  { id: 'sp2', name: 'High Incident Policy', priority: 'HIGH', ticketType: 'INCIDENT', responseTimeHours: 2, resolutionTimeHours: 8, active: true },
  { id: 'sp3', name: 'Medium Incident Policy', priority: 'MEDIUM', ticketType: 'INCIDENT', responseTimeHours: 4, resolutionTimeHours: 24, active: true },
  { id: 'sp4', name: 'Low Incident Policy', priority: 'LOW', ticketType: 'INCIDENT', responseTimeHours: 8, resolutionTimeHours: 48, active: true },
  { id: 'sp5', name: 'Critical Service Request', priority: 'CRITICAL', ticketType: 'SERVICE_REQUEST', responseTimeHours: 2, resolutionTimeHours: 8, active: true },
  { id: 'sp6', name: 'High Service Request', priority: 'HIGH', ticketType: 'SERVICE_REQUEST', responseTimeHours: 4, resolutionTimeHours: 16, active: true },
  { id: 'sp7', name: 'Medium Service Request', priority: 'MEDIUM', ticketType: 'SERVICE_REQUEST', responseTimeHours: 8, resolutionTimeHours: 48, active: true },
  { id: 'sp8', name: 'Low Service Request', priority: 'LOW', ticketType: 'SERVICE_REQUEST', responseTimeHours: 16, resolutionTimeHours: 72, active: true },
];

export const SEED_TICKETS: Ticket[] = [
  {
    id: 'tk1',
    ticketNumber: 'INC-2026-00101',
    title: 'Core VPN Gateway Connection Dropping Intermittently',
    description: 'When connecting from remote networks, WireGuard sessions terminate abruptly every 15-20 minutes with handshake timeout errors.',
    ticketType: 'INCIDENT',
    priority: 'CRITICAL',
    severity: 'SEV1',
    status: 'IN_PROGRESS',
    requesterId: '55555555-5555-5555-5555-555555555555',
    requesterName: 'Alex Rivera (Engineer)',
    requesterEmail: 'employee.alex@resolveit.internal',
    assignedAgentId: '33333333-3333-3333-3333-333333333333',
    assignedAgentName: 'Marcus Vance (Senior Agent)',
    assignedTeamId: 't2',
    assignedTeamName: 'Infrastructure & Networks',
    categoryId: 'c2',
    categoryName: 'Network & Connectivity',
    assetId: 'a1',
    assetTag: 'AST-LP-0192',
    firstResponseAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    version: 3,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    sla: {
      id: 'sla1',
      ticketId: 'tk1',
      policyName: 'Critical Incident Policy',
      responseDeadline: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      resolutionDeadline: new Date(Date.now() + 1 * 3600 * 1000).toISOString(),
      responseBreached: false,
      resolutionBreached: false,
    },
  },
  {
    id: 'tk2',
    ticketNumber: 'INC-2026-00102',
    title: 'Dual 4K Monitor Display Flickering via Thunderbolt Dock',
    description: 'The secondary external display flickers black intermittently when compiling code or running GPU-intensive graphics workloads.',
    ticketType: 'INCIDENT',
    priority: 'MEDIUM',
    severity: 'SEV3',
    status: 'OPEN',
    requesterId: '66666666-6666-6666-6666-666666666666',
    requesterName: 'Chloe Bennett (Marketing)',
    requesterEmail: 'employee.chloe@resolveit.internal',
    assignedTeamId: 't3',
    assignedTeamName: 'Workplace & End-User Compute',
    categoryId: 'c1',
    categoryName: 'Hardware & Peripherals',
    assetId: 'a2',
    assetTag: 'AST-LP-0205',
    version: 1,
    createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    sla: {
      id: 'sla2',
      ticketId: 'tk2',
      policyName: 'Medium Incident Policy',
      responseDeadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      resolutionDeadline: new Date(Date.now() + 23 * 3600 * 1000).toISOString(),
      responseBreached: false,
      resolutionBreached: false,
    },
  },
  {
    id: 'tk3',
    ticketNumber: 'SRQ-2026-00103',
    title: 'Request Provisioning for JetBrains All Products Pack License',
    description: 'Need license assignment for IntelliJ IDEA Ultimate and DataGrip for incoming backend migration sprint.',
    ticketType: 'SERVICE_REQUEST',
    priority: 'LOW',
    severity: 'SEV4',
    status: 'RESOLVED',
    requesterId: '55555555-5555-5555-5555-555555555555',
    requesterName: 'Alex Rivera (Engineer)',
    requesterEmail: 'employee.alex@resolveit.internal',
    assignedAgentId: '44444444-4444-4444-4444-444444444444',
    assignedAgentName: 'Elena Rostova (Support Agent)',
    assignedTeamId: 't1',
    assignedTeamName: 'Service Desk Tier 1',
    categoryId: 'c3',
    categoryName: 'Software & Applications',
    assetId: 'a4',
    assetTag: 'AST-LIC-0081',
    resolutionSummary: 'License allocated from corporate enterprise pool and invitation sent to employee corporate email.',
    firstResponseAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    version: 2,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    sla: {
      id: 'sla3',
      ticketId: 'tk3',
      policyName: 'Low Service Request',
      responseDeadline: new Date(Date.now() + 10 * 3600 * 1000).toISOString(),
      resolutionDeadline: new Date(Date.now() + 66 * 3600 * 1000).toISOString(),
      responseBreached: false,
      resolutionBreached: false,
    },
  },
  {
    id: 'tk4',
    ticketNumber: 'INC-2026-00098',
    title: 'Production Staging Kubernetes Ingress SSL Certificate Expired',
    description: 'Ingress controller returned certificate date invalid error on api-staging.internal. Submissions blocked.',
    ticketType: 'INCIDENT',
    priority: 'CRITICAL',
    severity: 'SEV1',
    status: 'RESOLVED',
    requesterId: '55555555-5555-5555-5555-555555555555',
    requesterName: 'Alex Rivera (Engineer)',
    requesterEmail: 'employee.alex@resolveit.internal',
    assignedAgentId: '33333333-3333-3333-3333-333333333333',
    assignedAgentName: 'Marcus Vance (Senior Agent)',
    assignedTeamId: 't2',
    assignedTeamName: 'Infrastructure & Networks',
    categoryId: 'c2',
    categoryName: 'Network & Connectivity',
    resolutionSummary: 'Renewed LetEncrypt wildcard certificate and triggered cert-manager automated rotation.',
    firstResponseAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    version: 4,
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
    sla: {
      id: 'sla4',
      ticketId: 'tk4',
      policyName: 'Critical Incident Policy',
      responseDeadline: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
      resolutionDeadline: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      responseBreached: false,
      resolutionBreached: false,
    },
  },
];

export const SEED_COMMENTS: Comment[] = [
  {
    id: 'cm1',
    ticketId: 'tk1',
    authorId: '33333333-3333-3333-3333-333333333333',
    authorName: 'Marcus Vance (Senior Agent)',
    authorEmail: 'agent.marcus@resolveit.internal',
    authorRole: 'ROLE_IT_AGENT',
    content: 'Investigating server-side packet drops on Frankfurt gateway node gw-eu-02. Increased keepalive interval to 25s.',
    commentType: 'INTERNAL_NOTE',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'cm2',
    ticketId: 'tk1',
    authorId: '33333333-3333-3333-3333-333333333333',
    authorName: 'Marcus Vance (Senior Agent)',
    authorEmail: 'agent.marcus@resolveit.internal',
    authorRole: 'ROLE_IT_AGENT',
    content: 'Hello Alex, we are diagnosing the VPN gateway termination issue. Can you confirm if you are on corporate Wi-Fi or home optical fiber?',
    commentType: 'PUBLIC',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'cm3',
    ticketId: 'tk1',
    authorId: '55555555-5555-5555-5555-555555555555',
    authorName: 'Alex Rivera (Engineer)',
    authorEmail: 'employee.alex@resolveit.internal',
    authorRole: 'ROLE_EMPLOYEE',
    content: 'I am currently on home optical fiber connection (Vodafone Germany 1Gbps).',
    commentType: 'PUBLIC',
    createdAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
  },
];

export const SEED_HISTORY: TicketHistory[] = [
  {
    id: 'h1',
    ticketId: 'tk1',
    actorId: '55555555-5555-5555-5555-555555555555',
    actorName: 'Alex Rivera',
    eventType: 'TICKET_CREATED',
    fieldChanged: 'status',
    newValue: 'OPEN',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'h2',
    ticketId: 'tk1',
    actorId: '33333333-3333-3333-3333-333333333333',
    actorName: 'Marcus Vance',
    eventType: 'ASSIGNED',
    fieldChanged: 'assigned_agent',
    newValue: 'Marcus Vance',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'h3',
    ticketId: 'tk1',
    actorId: '33333333-3333-3333-3333-333333333333',
    actorName: 'Marcus Vance',
    eventType: 'STATUS_CHANGE',
    fieldChanged: 'status',
    oldValue: 'OPEN',
    newValue: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

export const SEED_KB_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb1',
    title: 'Troubleshooting Corporate WireGuard VPN Connectivity',
    content:
      'If your VPN fails to handshake after sleep mode:\n1. Disconnect the tunnel client.\n2. Verify local Wi-Fi router allows outbound UDP port 51820.\n3. Restart WireGuard background daemon via terminal:\n   sudo systemctl restart wg-quick@wg0\n4. Re-authenticate via corporate Okta SSO portal.',
    categoryId: 'c2',
    categoryName: 'Network & Connectivity',
    authorId: '33333333-3333-3333-3333-333333333333',
    authorName: 'Marcus Vance',
    status: 'PUBLISHED',
    viewCount: 142,
    publishedAt: '2026-03-01T08:00:00Z',
    createdAt: '2026-02-28T14:00:00Z',
  },
  {
    id: 'kb2',
    title: 'Standard macOS & Windows Developer Toolchain Setup',
    content:
      'Official guidelines for provisioning developer machines:\n- OpenJDK 21 LTS via Temurin\n- Docker Desktop 4.30+ with WSL2 backend on Windows\n- Git 2.45+ configured with corporate GPG commit signing\n- Node.js 22 LTS via nvm\nAll corporate machines must maintain full disk encryption (FileVault / BitLocker).',
    categoryId: 'c3',
    categoryName: 'Software & Applications',
    authorId: '44444444-4444-4444-4444-444444444444',
    authorName: 'Elena Rostova',
    status: 'PUBLISHED',
    viewCount: 89,
    publishedAt: '2026-03-10T09:00:00Z',
    createdAt: '2026-03-09T16:00:00Z',
  },
  {
    id: 'kb3',
    title: 'Multi-Factor Authentication (MFA) Recovery Process',
    content:
      'If you lose your hardware security key (YubiKey) or switch smartphones:\n1. Contact Tier 1 Service Desk directly at extension 4400 or log a ticket from a known workplace terminal.\n2. Manager verification will be performed via live video call.\n3. A temporary 8-hour bypass code will be generated once identity is confirmed.',
    categoryId: 'c4',
    categoryName: 'Identity & Access Management',
    authorId: '22222222-2222-2222-2222-222222222222',
    authorName: 'Sarah Connor',
    status: 'PUBLISHED',
    viewCount: 215,
    publishedAt: '2026-01-20T10:00:00Z',
    createdAt: '2026-01-19T11:00:00Z',
  },
];

export const SEED_AUDIT_LOGS: SecurityAuditLog[] = [
  {
    id: 'aud1',
    userEmail: 'admin@resolveit.internal',
    action: 'USER_LOGIN',
    resourceType: 'AUTH',
    ipAddress: '192.168.1.50',
    status: 'SUCCESS',
    details: 'User authenticated via password + MFA token',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'aud2',
    userEmail: 'agent.marcus@resolveit.internal',
    action: 'TICKET_STATUS_UPDATE',
    resourceType: 'TICKET',
    resourceId: 'tk1',
    ipAddress: '10.0.4.12',
    status: 'SUCCESS',
    details: 'Status transitioned OPEN -> IN_PROGRESS',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'aud3',
    userEmail: 'employee.chloe@resolveit.internal',
    action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    resourceType: 'TICKET',
    resourceId: 'tk1',
    ipAddress: '172.16.0.88',
    status: 'BLOCKED',
    details: 'IDOR protection blocked Employee access to ticket tk1 owned by another user',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

// Helper to get or set storage
function getStored<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch {
    // Ignore storage quota errors
  }
}

export class HelpdeskStorageService {
  static getUsers(): User[] {
    return getStored('users', SEED_USERS);
  }

  static setUsers(users: User[]): void {
    setStored('users', users);
  }

  static getTickets(): Ticket[] {
    return getStored('tickets', SEED_TICKETS);
  }

  static setTickets(tickets: Ticket[]): void {
    setStored('tickets', tickets);
  }

  static getComments(): Comment[] {
    return getStored('comments', SEED_COMMENTS);
  }

  static setComments(comments: Comment[]): void {
    setStored('comments', comments);
  }

  static getHistory(): TicketHistory[] {
    return getStored('history', SEED_HISTORY);
  }

  static setHistory(history: TicketHistory[]): void {
    setStored('history', history);
  }

  static getKbArticles(): KnowledgeArticle[] {
    return getStored('kb_articles', SEED_KB_ARTICLES);
  }

  static setKbArticles(articles: KnowledgeArticle[]): void {
    setStored('kb_articles', articles);
  }

  static getAuditLogs(): SecurityAuditLog[] {
    return getStored('audit_logs', SEED_AUDIT_LOGS);
  }

  static recordAudit(log: Omit<SecurityAuditLog, 'id' | 'createdAt'>): void {
    const logs = this.getAuditLogs();
    const newEntry: SecurityAuditLog = {
      ...log,
      id: 'aud-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    setStored('audit_logs', logs.slice(0, 100)); // retain last 100
  }

  static getCategories(): Category[] {
    return SEED_CATEGORIES;
  }

  static getTeams(): Team[] {
    return SEED_TEAMS;
  }

  static getAssets(): Asset[] {
    return SEED_ASSETS;
  }

  static getSlaPolicies(): SlaPolicy[] {
    return SEED_SLA_POLICIES;
  }

  static getDashboardStats(currentUser: User): DashboardStats {
    let tickets = this.getTickets();
    if (currentUser.role === 'ROLE_EMPLOYEE') {
      tickets = tickets.filter((t) => t.requesterId === currentUser.id);
    }

    const openTickets = tickets.filter((t) => !['RESOLVED', 'CLOSED', 'CANCELLED'].includes(t.status));
    const criticalTickets = openTickets.filter((t) => t.priority === 'CRITICAL');
    const breachedSla = openTickets.filter(
      (t) => t.sla && (t.sla.resolutionBreached || (t.sla.resolutionDeadline && new Date(t.sla.resolutionDeadline) < new Date()))
    );
    const resolvedTickets = tickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status));

    const statusCounts: Record<string, number> = {};
    const priorityCounts: Record<string, number> = {};

    tickets.forEach((t) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
      if (!['RESOLVED', 'CLOSED', 'CANCELLED'].includes(t.status)) {
        priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
      }
    });

    return {
      totalOpenTickets: openTickets.length,
      criticalOpenTickets: criticalTickets.length,
      breachedSlaTickets: breachedSla.length,
      resolvedTickets: resolvedTickets.length,
      avgResponseHours: 1.8,
      avgResolutionHours: 14.5,
      ticketsByStatus: statusCounts,
      ticketsByPriority: priorityCounts,
    };
  }
}
