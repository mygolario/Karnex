"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useLocale } from "@/hooks/use-translations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Crown, 
  Shield, 
  Edit3, 
  Eye,
  MoreHorizontal,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  TeamMember, 
  TeamInvitation, 
  TeamRole, 
  ROLE_LABELS,
  hasPermission,
  getProjectTeam,
  inviteTeamMember,
  removeTeamMember,
  updateMemberRole
} from "@/lib/team";

export default function TeamPage() {
  const { user } = useAuth();
  const { activeProject } = useProject();
  const { locale, isRTL } = useLocale();
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("editor");
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Current user's role in this project
  const [currentUserRole, setCurrentUserRole] = useState<TeamRole>("owner");

  const labels = locale === 'fa' ? {
    title: 'تیم پروژه',
    subtitle: 'اعضای تیم و دسترسی‌ها را مدیریت کنید',
    members: 'اعضای تیم',
    pendingInvites: 'دعوت‌نامه‌های در انتظار',
    invite: 'دعوت عضو جدید',
    inviteButton: 'ارسال دعوت‌نامه',
    email: 'آدرس ایمیل',
    role: 'نقش',
    noMembers: 'هنوز عضوی اضافه نشده',
    noPending: 'دعوت‌نامه‌ای در انتظار نیست',
    you: '(شما)',
    cancel: 'انصراف',
    remove: 'حذف',
    copyLink: 'کپی لینک دعوت',
    resend: 'ارسال مجدد',
    expires: 'منقضی می‌شود',
    invitedBy: 'دعوت توسط',
    addFirstMember: 'اولین عضو تیم را دعوت کنید',
    comeBackSoon: 'قابلیت تیم به زودی فعال می‌شود',
    comingSoon: 'این بخش در حال توسعه است و به زودی در دسترس خواهد بود.',
  } : {
    title: 'Project Team',
    subtitle: 'Manage team members and access levels',
    members: 'Team Members',
    pendingInvites: 'Pending Invitations',
    invite: 'Invite New Member',
    inviteButton: 'Send Invitation',
    email: 'Email Address',
    role: 'Role',
    noMembers: 'No members added yet',
    noPending: 'No pending invitations',
    you: '(You)',
    cancel: 'Cancel',
    remove: 'Remove',
    copyLink: 'Copy invite link',
    resend: 'Resend',
    expires: 'Expires',
    invitedBy: 'Invited by',
    addFirstMember: 'Invite your first team member',
    comeBackSoon: 'Team feature coming soon',
    comingSoon: 'This feature is under development and will be available soon.',
  };

  const roleLabels = ROLE_LABELS;

  const getRoleIcon = (role: TeamRole) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-amber-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-primary" />;
      case 'editor': return <Edit3 className="w-4 h-4 text-emerald-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: TeamRole) => {
    switch (role) {
      case 'owner': return 'gradient';
      case 'admin': return 'secondary';
      case 'editor': return 'default';
      case 'viewer': return 'outline';
    }
  };

  useEffect(() => {
    loadTeam();
  }, [user, activeProject]);

  const loadTeam = async () => {
    if (!user || !activeProject?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const team = await getProjectTeam(user.uid, activeProject.id);
      if (team) {
        setMembers(team.members);
        setInvitations(team.invitations.filter(i => i.status === 'pending'));
        
        // Find current user's role
        const currentMember = team.members.find(m => m.userId === user.uid);
        if (currentMember) {
          setCurrentUserRole(currentMember.role);
        }
      } else {
        // No team yet, current user is owner by default
        setMembers([{
          id: 'owner-placeholder',
          userId: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
          role: 'owner',
          invitedAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
          invitedBy: user.uid,
          status: 'active',
        }]);
      }
    } catch (error) {
      console.error('Error loading team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeProject?.id || !inviteEmail) return;

    setInviting(true);
    try {
      const invitation = await inviteTeamMember(
        user.uid,
        activeProject.id,
        activeProject.projectName,
        user.displayName || user.email || 'Unknown',
        inviteEmail,
        inviteRole
      );
      
      if (invitation) {
        setInvitations(prev => [invitation, ...prev]);
        setInviteEmail("");
        setShowInviteForm(false);
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setInviting(false);
    }
  };

  const canManageMembers = hasPermission(currentUserRole, 'canRemoveMembers');
  const canInvite = hasPermission(currentUserRole, 'canInvite');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-7 h-7 text-primary" />
            {labels.title}
          </h1>
          <p className="text-muted-foreground mt-1">{labels.subtitle}</p>
        </div>
        
        {canInvite && (
          <Button 
            onClick={() => setShowInviteForm(!showInviteForm)}
            variant="gradient"
          >
            <UserPlus className="w-4 h-4" />
            {labels.invite}
          </Button>
        )}
      </div>

      {/* Coming Soon Notice - Remove this section when team feature is fully implemented */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{labels.comeBackSoon}</h3>
            <p className="text-sm text-muted-foreground mt-1">{labels.comingSoon}</p>
          </div>
        </div>
      </Card>

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="p-6">
          <form onSubmit={handleInvite} className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {labels.invite}
            </h3>
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm text-muted-foreground mb-2 block">{labels.email}</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  dir="ltr"
                />
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">{labels.role}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  className="w-full px-4 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {(['admin', 'editor', 'viewer'] as TeamRole[]).map(role => (
                    <option key={role} value={role}>
                      {roleLabels[role][locale].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowInviteForm(false)}
              >
                {labels.cancel}
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {labels.inviteButton}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Members List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{labels.members}</h3>
        </div>
        
        <div className="divide-y divide-border">
          {members.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{labels.noMembers}</p>
            </div>
          ) : (
            members.map((member) => (
              <div 
                key={member.id} 
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {member.displayName?.charAt(0)?.toUpperCase() || member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {member.displayName || member.email.split('@')[0]}
                      {member.userId === user?.uid && (
                        <span className="text-xs text-muted-foreground">{labels.you}</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={getRoleBadgeVariant(member.role) as any}>
                    {getRoleIcon(member.role)}
                    <span className={cn(isRTL ? "mr-1" : "ml-1")}>
                      {roleLabels[member.role][locale].label}
                    </span>
                  </Badge>
                  
                  {canManageMembers && member.userId !== user?.uid && (
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {labels.pendingInvites}
              <Badge variant="secondary" size="sm">{invitations.length}</Badge>
            </h3>
          </div>
          
          <div className="divide-y divide-border">
            {invitations.map((invitation) => (
              <div 
                key={invitation.id} 
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{labels.expires}: {new Date(invitation.expiresAt).toLocaleDateString(locale)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {getRoleIcon(invitation.role)}
                    <span className={cn(isRTL ? "mr-1" : "ml-1")}>
                      {roleLabels[invitation.role][locale].label}
                    </span>
                  </Badge>
                  
                  {canManageMembers && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm" title={labels.copyLink}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive" title={labels.remove}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
