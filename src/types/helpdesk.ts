export type Role = 'ROLE_ADMIN' | 'ROLE_IT_MANAGER' | 'ROLE_IT_AGENT' | 'ROLE_EMPLOYEE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  department: string;
  active: boolean;
  createdAt: string;
}

export type TicketType = 'INCIDENT' | 'SERVICE_REQUEST';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketSeverity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';
export type TicketStatus =
  | 'OPEN'
  | 'TRIAGED'
  | 'IN_PROGRESS'
  | 'PENDING_USER'
  | 'PENDING_THIRD_PARTY'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'CANCELLED';

export interface Category {
  id: string;
  parentId?: string;
  name: string;
  code: string;
  description: string;
  active: boolean;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  leadUserId?: string;
  active: boolean;
}

export interface Asset {
  id: string;
  assetTag: string;
  name: string;
  assetType: 'LAPTOP' | 'DESKTOP' | 'SERVER' | 'MONITOR' | 'MOBILE' | 'SOFTWARE_LICENSE' | 'PERIPHERAL';
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'LOST';
  ownerId?: string;
  serialNumber?: string;
}

export interface SlaPolicy {
  id: string;
  name: string;
  priority: TicketPriority;
  ticketType: TicketType;
  responseTimeHours: number;
  resolutionTimeHours: number;
  active: boolean;
}

export interface TicketSla {
  id: string;
  ticketId: string;
  policyName: string;
  responseDeadline: string;
  resolutionDeadline: string;
  responseBreached: boolean;
  resolutionBreached: boolean;
  responseBreachedAt?: string;
  resolutionBreachedAt?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  ticketType: TicketType;
  priority: TicketPriority;
  severity: TicketSeverity;
  status: TicketStatus;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  categoryId: string;
  categoryName: string;
  assetId?: string;
  assetTag?: string;
  resolutionSummary?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  sla?: TicketSla;
}

export type CommentType = 'PUBLIC' | 'INTERNAL_NOTE';

export interface Comment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorRole: Role;
  content: string;
  commentType: CommentType;
  createdAt: string;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  actorId: string;
  actorName: string;
  eventType: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
  categoryName?: string;
  authorId: string;
  authorName: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
}

export interface SecurityAuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  details: string;
  createdAt: string;
}

export interface DashboardStats {
  totalOpenTickets: number;
  criticalOpenTickets: number;
  breachedSlaTickets: number;
  resolvedTickets: number;
  avgResponseHours: number;
  avgResolutionHours: number;
  ticketsByStatus: Record<string, number>;
  ticketsByPriority: Record<string, number>;
}
