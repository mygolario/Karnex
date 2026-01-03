// Team Data Operations
// Firebase-based team management functions

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db, appId } from "@/lib/firebase";
import type { 
  TeamMember, 
  TeamInvitation, 
  ProjectTeam, 
  Activity,
  Comment,
  TeamRole,
  TeamSettings 
} from "./types";

// Generate secure invitation token
function generateInviteToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Get team for a project
export async function getProjectTeam(userId: string, projectId: string): Promise<ProjectTeam | null> {
  try {
    const teamRef = doc(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'team', 'settings');
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      return null;
    }

    // Get members
    const membersRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'team', 'members');
    const membersSnap = await getDocs(membersRef);
    const members = membersSnap.docs.map(d => ({ id: d.id, ...d.data() })) as TeamMember[];

    // Get invitations
    const invitesRef = collection(db, 'artifacts', appId, 'users', userId, 'plans', projectId, 'team', 'invitations');
    const invitesSnap = await getDocs(invitesRef);
    const invitations = invitesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as TeamInvitation[];

    return {
      projectId,
      members,
      invitations,
      settings: teamDoc.data() as TeamSettings,
    };
  } catch (error) {
    console.error('Error getting project team:', error);
    return null;
  }
}

// Initialize team for a project (makes current user the owner)
export async function initializeProjectTeam(
  ownerId: string, 
  ownerEmail: string, 
  ownerName: string,
  projectId: string
): Promise<boolean> {
  try {
    const teamSettingsRef = doc(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'team', 'settings');
    
    const defaultSettings: TeamSettings = {
      allowViewerComments: false,
      notifyOnChanges: true,
      requireApprovalForEdits: false,
    };

    // Create settings document using setDoc with merge (updateDoc requires doc to exist)
    const { setDoc } = await import('firebase/firestore');
    await setDoc(teamSettingsRef, defaultSettings, { merge: true }).catch(() => {
      // If fails, just continue - doc may already exist
    });

    // Add owner as first member
    const membersRef = collection(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'team', 'members');
    await addDoc(membersRef, {
      userId: ownerId,
      email: ownerEmail,
      displayName: ownerName,
      role: 'owner' as TeamRole,
      invitedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      invitedBy: ownerId,
      status: 'active',
    } as Omit<TeamMember, 'id'>);

    return true;
  } catch (error) {
    console.error('Error initializing project team:', error);
    return false;
  }
}

// Invite a team member
export async function inviteTeamMember(
  ownerId: string,
  projectId: string,
  projectName: string,
  inviterName: string,
  email: string,
  role: TeamRole
): Promise<TeamInvitation | null> {
  try {
    const invitesRef = collection(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'team', 'invitations');
    
    const invitation: Omit<TeamInvitation, 'id'> = {
      projectId,
      projectName,
      email: email.toLowerCase(),
      role,
      invitedBy: ownerId,
      inviterName,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      token: generateInviteToken(),
      status: 'pending',
    };

    const docRef = await addDoc(invitesRef, invitation);
    
    // TODO: Send invitation email via email service
    console.log(`[Team] Invitation created for ${email} with token: ${invitation.token}`);
    
    return { id: docRef.id, ...invitation };
  } catch (error) {
    console.error('Error inviting team member:', error);
    return null;
  }
}

// Accept invitation
export async function acceptInvitation(
  token: string,
  userId: string,
  userName: string
): Promise<boolean> {
  // This would typically involve:
  // 1. Looking up the invitation by token across all projects
  // 2. Verifying the user's email matches the invitation email
  // 3. Creating a member entry
  // 4. Updating the invitation status
  
  // For now, this is a placeholder that would be implemented with proper cross-user queries
  // In production, this would likely be a Cloud Function or server-side API
  console.log(`[Team] Accept invitation - token: ${token}, userId: ${userId}`);
  return true;
}

// Remove team member
export async function removeTeamMember(
  ownerId: string,
  projectId: string,
  memberId: string
): Promise<boolean> {
  try {
    const memberRef = doc(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'team', 'members', memberId);
    await deleteDoc(memberRef);
    return true;
  } catch (error) {
    console.error('Error removing team member:', error);
    return false;
  }
}

// Update member role
export async function updateMemberRole(
  ownerId: string,
  projectId: string,
  memberId: string,
  newRole: TeamRole
): Promise<boolean> {
  try {
    const memberRef = doc(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'team', 'members', memberId);
    await updateDoc(memberRef, { role: newRole });
    return true;
  } catch (error) {
    console.error('Error updating member role:', error);
    return false;
  }
}

// Add activity to the feed
export async function addActivity(
  ownerId: string,
  projectId: string,
  activity: Omit<Activity, 'id' | 'createdAt'>
): Promise<string | null> {
  try {
    const activitiesRef = collection(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'activities');
    const docRef = await addDoc(activitiesRef, {
      ...activity,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding activity:', error);
    return null;
  }
}

// Get recent activities
export async function getRecentActivities(
  ownerId: string,
  projectId: string,
  count: number = 20
): Promise<Activity[]> {
  try {
    const activitiesRef = collection(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'activities');
    const q = query(activitiesRef, orderBy('createdAt', 'desc'), limit(count));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Activity[];
  } catch (error) {
    console.error('Error getting activities:', error);
    return [];
  }
}

// Add comment
export async function addComment(
  ownerId: string,
  projectId: string,
  comment: Omit<Comment, 'id' | 'createdAt'>
): Promise<Comment | null> {
  try {
    const commentsRef = collection(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'comments');
    const docRef = await addDoc(commentsRef, {
      ...comment,
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, ...comment, createdAt: new Date().toISOString() };
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}

// Get comments for a section
export async function getComments(
  ownerId: string,
  projectId: string,
  sectionId?: string
): Promise<Comment[]> {
  try {
    const commentsRef = collection(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'comments');
    
    let q = sectionId 
      ? query(commentsRef, where('sectionId', '==', sectionId), orderBy('createdAt', 'asc'))
      : query(commentsRef, orderBy('createdAt', 'asc'));
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Comment[];
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
}

// Resolve comment
export async function resolveComment(
  ownerId: string,
  projectId: string,
  commentId: string
): Promise<boolean> {
  try {
    const commentRef = doc(db, 'artifacts', appId, 'users', ownerId, 'plans', projectId, 'comments', commentId);
    await updateDoc(commentRef, { isResolved: true });
    return true;
  } catch (error) {
    console.error('Error resolving comment:', error);
    return false;
  }
}
