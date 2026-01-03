// Team Collaboration Types and Interfaces
// Foundation for multi-user project collaboration

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: TeamRole;
  invitedAt: string;
  acceptedAt?: string;
  invitedBy: string;
  status: 'pending' | 'active' | 'revoked';
}

export interface TeamInvitation {
  id: string;
  projectId: string;
  projectName: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  inviterName: string;
  createdAt: string;
  expiresAt: string;
  token: string; // Secure invitation token
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
}

export interface ProjectTeam {
  projectId: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
  settings: TeamSettings;
}

export interface TeamSettings {
  allowViewerComments: boolean;
  notifyOnChanges: boolean;
  requireApprovalForEdits: boolean;
}

// Activity types for the activity feed
export type ActivityType = 
  | 'member_joined'
  | 'member_invited'
  | 'member_removed'
  | 'role_changed'
  | 'project_updated'
  | 'step_completed'
  | 'comment_added'
  | 'file_uploaded';

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Comment types for collaborative discussions
export interface Comment {
  id: string;
  projectId: string;
  sectionId: string; // Which part of the project (roadmap, canvas, etc.)
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  mentions?: string[]; // User IDs mentioned with @
  parentId?: string; // For nested replies
  createdAt: string;
  updatedAt?: string;
  isResolved?: boolean;
}

// Permission matrix for role-based access control
export const ROLE_PERMISSIONS: Record<TeamRole, {
  canView: boolean;
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canRemoveMembers: boolean;
  canChangeRoles: boolean;
  canDeleteProject: boolean;
  canExport: boolean;
}> = {
  owner: {
    canView: true,
    canEdit: true,
    canComment: true,
    canInvite: true,
    canRemoveMembers: true,
    canChangeRoles: true,
    canDeleteProject: true,
    canExport: true,
  },
  admin: {
    canView: true,
    canEdit: true,
    canComment: true,
    canInvite: true,
    canRemoveMembers: true,
    canChangeRoles: false,
    canDeleteProject: false,
    canExport: true,
  },
  editor: {
    canView: true,
    canEdit: true,
    canComment: true,
    canInvite: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canDeleteProject: false,
    canExport: true,
  },
  viewer: {
    canView: true,
    canEdit: false,
    canComment: false, // Configurable in TeamSettings
    canInvite: false,
    canRemoveMembers: false,
    canChangeRoles: false,
    canDeleteProject: false,
    canExport: false,
  },
};

// Helper to check permissions
export function hasPermission(
  role: TeamRole,
  permission: keyof typeof ROLE_PERMISSIONS.owner,
  settings?: TeamSettings
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[role];
  
  // Special case: viewer comments configurable
  if (permission === 'canComment' && role === 'viewer' && settings) {
    return settings.allowViewerComments;
  }
  
  return rolePermissions[permission];
}

// Localized role labels
export const ROLE_LABELS: Record<TeamRole, Record<'en' | 'fa', { label: string; description: string }>> = {
  owner: {
    en: { label: 'Owner', description: 'Full control over the project' },
    fa: { label: 'مالک', description: 'کنترل کامل پروژه' },
  },
  admin: {
    en: { label: 'Admin', description: 'Can manage members and edit everything' },
    fa: { label: 'مدیر', description: 'می‌تواند اعضا را مدیریت کند و همه چیز را ویرایش کند' },
  },
  editor: {
    en: { label: 'Editor', description: 'Can edit project content' },
    fa: { label: 'ویرایشگر', description: 'می‌تواند محتوای پروژه را ویرایش کند' },
  },
  viewer: {
    en: { label: 'Viewer', description: 'Can only view the project' },
    fa: { label: 'بازدیدکننده', description: 'فقط می‌تواند پروژه را مشاهده کند' },
  },
};
