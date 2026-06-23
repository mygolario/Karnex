"use client";

import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { deleteProject } from "@/lib/db";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  User, Shield, Moon, Bell, Trash2, LogOut, Settings, Crown, 
  Mail, Key, Globe, Smartphone, Download, RefreshCw, AlertTriangle, 
  Check, X, ChevronLeft, Sliders, Monitor, Cloud, Database
} from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { activeProject, refreshProjects } = useProject();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'project' | 'preferences' | 'system'>('project');
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Collaborator States
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);

  const fetchMembers = async () => {
    if (!activeProject?.id) return;
    setLoadingMembers(true);
    try {
      const { getProjectMembersAction } = await import("@/lib/project-actions");
      const res = await getProjectMembersAction(activeProject.id);
      if (res.success && res.members) {
        setMembers(res.members);
      }
    } catch (e) {
      console.error("Failed to load members:", e);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (activeProject?.id && activeTab === 'project') {
      fetchMembers();
    }
  }, [activeProject?.id, activeTab]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !activeProject?.id) return;
    setInviting(true);
    try {
      const { inviteMemberAction } = await import("@/lib/project-actions");
      const res = await inviteMemberAction(activeProject.id, inviteEmail, inviteRole);
      if (res.success) {
        toast.success("دعوت‌نامه با موفقیت ارسال شد");
        setInviteEmail("");
        fetchMembers(); // Refresh list
      } else {
        toast.error(res.error || "خطا در ارسال دعوت‌نامه");
      }
    } catch (e) {
      console.error(e);
      toast.error("خطا در برقراری ارتباط با سرور");
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteCurrentProject = async () => {
    if (!user || !activeProject?.id) return;
    
    setIsDeleting(true);
    try {
      await deleteProject(user!.id!, activeProject.id!);
      if (refreshProjects) await refreshProjects();
      router.push('/projects');
    } catch (error) {
      console.error(error);
      toast.error("خطا در حذف پروژه");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const sidebarItems = [
    { id: 'project', label: 'تنظیمات پروژه', icon: Cloud },
    { id: 'preferences', label: 'شخصی‌سازی برنامه', icon: Sliders },
    { id: 'system', label: 'سیستم و خروج', icon: Shield },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-fade-in-up space-y-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl shadow-slate-900/20 p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center" />
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
         
         <div className="relative z-10 w-24 h-24 bg-white/5 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group">
           <Settings size={40} className="text-white/80 group-hover:rotate-45 transition-transform duration-700" />
         </div>
         <div className="relative z-10 flex-1 text-center md:text-right">
           <h1 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">تنظیمات برنامه</h1>
           <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
             مدیریت تنظیمات کلی، پیکربندی پروژه فعال و شخصی‌سازی تجربه کاربری
           </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 space-y-4">
          <Card variant="glass" className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-white/20 dark:border-white/5 sticky top-24">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    activeTab === item.id 
                    ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/25' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <item.icon size={18} className={`relative z-10 ${activeTab === item.id ? 'text-blue-400' : ''}`} />
                  <span className="font-bold relative z-10 text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </Card>


        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* PROJECT SETTINGS */}
          {activeTab === 'project' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeProject ? (
                <>
                  <Card variant="glass" className="p-8 border-l-4 border-l-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-transparent opacity-50" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-20 h-20 bg-gradient-to-tr from-primary to-blue-600 text-white rounded-[1.5rem] flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-500/20">
                        {activeProject.projectName?.charAt(0) || "P"}
                      </div>
                      <div className="flex-1 text-center md:text-right">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                           <h2 className="text-2xl font-black text-foreground">{activeProject.projectName}</h2>
                           <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">فعال</Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1">{activeProject.tagline}</p>
                      </div>
                      <Button variant="ghost" onClick={() => router.push('/projects')} className="group text-muted-foreground hover:text-foreground">
                        تغییر پروژه
                        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>

                  {/* COLLABORATORS SECTION */}
                  <Card variant="glass" className="p-8 border-l-4 border-l-blue-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent opacity-50" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border/50 pb-6">
                      <div className="text-right">
                        <h3 className="text-xl font-bold text-foreground mb-1">همکاران پروژه</h3>
                        <p className="text-muted-foreground text-sm">
                          مدیریت دسترسی‌ها و افراد همکار در این پروژه
                        </p>
                      </div>
                      
                      <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end sm:items-center">
                        <div className="relative w-full sm:w-64">
                          <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input 
                            type="email"
                            placeholder="ایمیل همکار جدید..."
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            required
                            className="w-full h-10 pr-10 pl-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-right text-foreground"
                          />
                        </div>
                        
                        <div className="w-full sm:w-36">
                          <select
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            className="w-full h-10 px-3 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-right appearance-none text-foreground"
                          >
                            <option value="editor">ویرایش‌گر</option>
                            <option value="viewer">بیننده</option>
                            <option value="admin">مدیر</option>
                          </select>
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={inviting || !inviteEmail} 
                          className="h-10 px-5 rounded-xl text-sm font-bold shadow-lg shadow-primary/10 whitespace-nowrap"
                        >
                          {inviting ? "⏳ ..." : "دعوت همکار"}
                        </Button>
                      </form>
                    </div>

                    {loadingMembers ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <RefreshCw size={24} className="animate-spin mb-2" />
                        <span className="text-sm">در حال بارگذاری لیست همکاران...</span>
                      </div>
                    ) : members.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        هیچ همکاری برای این پروژه تعریف نشده است.
                      </div>
                    ) : (
                      <div className="overflow-hidden border border-border/50 rounded-2xl bg-background/20 backdrop-blur-sm divide-y divide-border/50">
                        {members.map((m) => {
                          const getRoleBadge = (role: string) => {
                            switch (role) {
                              case 'owner':
                                return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">مالک پروژه</Badge>;
                              case 'admin':
                                return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">مدیر</Badge>;
                              case 'editor':
                                return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">ویرایش‌گر</Badge>;
                              case 'viewer':
                                return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">بیننده</Badge>;
                              default:
                                return <Badge className="bg-muted text-muted-foreground text-xs px-2.5 py-1 rounded-lg">{role}</Badge>;
                            }
                          };

                          return (
                            <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background/40 transition-colors">
                              <div className="flex items-center gap-4 text-right">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black shadow-inner">
                                  {m.name ? m.name.charAt(0) : (m.email ? m.email.charAt(0).toUpperCase() : 'U')}
                                </div>
                                <div>
                                  <span className="font-bold text-foreground block text-sm">{m.name || 'کاربر کارنکس'}</span>
                                  <span className="text-xs text-muted-foreground block font-mono">{m.email}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 justify-end">
                                {getRoleBadge(m.role)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  <div className="rounded-[2rem] border border-destructive/30 bg-destructive/5 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-destructive/50 to-transparent opacity-50" />
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center shadow-lg shadow-destructive/10 shrink-0">
                        <Trash2 size={24} />
                      </div>
                      <div className="text-center md:text-right flex-1">
                        <h3 className="text-lg font-bold text-destructive mb-1">حذف پروژه فعال</h3>
                        <p className="text-destructive/80 text-sm">
                          تمامی اطلاعات این پروژه برای همیشه حذف خواهد شد.
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={!activeProject}
                        className="whitespace-nowrap shadow-lg shadow-destructive/20"
                      >
                        حذف پروژه
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
                   <Cloud size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                   <h3 className="text-lg font-bold text-muted-foreground">هیچ پروژه‌ای فعال نیست</h3>
                   <Button variant="link" onClick={() => router.push('/projects')}>انتخاب یک پروژه</Button>
                </div>
              )}
            </div>
          )}

          {/* APP PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <Card variant="glass" padding="none" className="overflow-hidden divide-y divide-border/50">
                  {/* Theme */}
                  <div className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                        <Moon size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-foreground text-lg block mb-1">حالت تاریک</span>
                        <span className="text-sm text-muted-foreground">تغییر تم ظاهری برنامه</span>
                      </div>
                    </div>
                    <ThemeToggle />
                  </div>
                  
                  {/* Notifications */}
                  <div className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                        <Bell size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-foreground text-lg block mb-1">اعلان‌های ایمیلی</span>
                        <span className="text-sm text-muted-foreground">دریافت اخبار و نکات</span>
                      </div>
                    </div>
                    <button 
                      className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${emailNotifications ? 'bg-primary' : 'bg-muted'}`}
                      onClick={() => setEmailNotifications(!emailNotifications)}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${emailNotifications ? 'left-1' : 'right-1'}`} />
                    </button>
                  </div>

                  {/* Language */}
                  <div className="p-6 flex justify-between items-center hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-teal-500/10 text-teal-500 rounded-2xl flex items-center justify-center">
                        <Globe size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-foreground text-lg block mb-1">زبان برنامه</span>
                        <span className="text-sm text-muted-foreground">فارسی (پیش‌فرض)</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-base px-4 py-1.5">فارسی (IR)</Badge>
                  </div>
               </Card>
            </div>
          )}

          {/* SYSTEM & LOGOUT */}
          {activeTab === 'system' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card variant="default" hover="lift" className="cursor-pointer group border-border/60" onClick={handleLogout}>
                  <div className="flex items-center gap-5 p-2">
                    <div className="w-14 h-14 bg-muted text-muted-foreground group-hover:bg-red-500/10 group-hover:text-red-500 rounded-2xl flex items-center justify-center transition-colors duration-300">
                      <LogOut size={24} />
                    </div>
                    <div>
                      <span className="font-bold text-foreground text-lg block mb-1 group-hover:text-red-600 transition-colors">خروج از حساب</span>
                      <span className="text-sm text-muted-foreground">پایان نشست کاربری فعلی</span>
                    </div>
                  </div>
                </Card>

                <Card variant="default" hover="lift" className="cursor-pointer group border-border/60" onClick={() => router.push('/projects')}>
                  <div className="flex items-center gap-5 p-2">
                    <div className="w-14 h-14 bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary rounded-2xl flex items-center justify-center transition-colors duration-300">
                      <RefreshCw size={24} />
                    </div>
                    <div>
                      <span className="font-bold text-foreground text-lg block mb-1 group-hover:text-primary transition-colors">مدیریت پروژه‌ها</span>
                      <span className="text-sm text-muted-foreground">بازگشت به لیست پروژه‌ها</span>
                    </div>
                  </div>
                </Card>
             </div>
          )}

        </div>
      </div>

       {/* Delete Confirmation Modal */}
       {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="bg-card w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6 animate-bounce-gentle">
                <AlertTriangle size={40} className="text-destructive" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-2">مطمئن هستید؟</h3>
              <p className="text-muted-foreground text-lg">
                آیا می‌خواهید پروژه <strong className="text-foreground border-b-2 border-destructive/30 border-dashed">{activeProject?.projectName}</strong> را حذف کنید؟
              </p>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4 mb-8 flex gap-3 text-destructive text-sm text-right">
              <AlertTriangle size={20} className="shrink-0 mt-0.5" />
              <span>این عملیات غیرقابل بازگشت است و تمام داده‌های مربوط به این پروژه فوراً حذف خواهند شد.</span>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 h-14 text-lg rounded-2xl"
                disabled={isDeleting}
              >
                انصراف
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleDeleteCurrentProject}
                className="flex-1 h-14 text-lg rounded-2xl shadow-xl shadow-destructive/20"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    در حال حذف...
                  </>
                ) : (
                  <>
                    حذف پروژه
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
