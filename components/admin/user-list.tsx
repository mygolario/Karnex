"use client";

import { Card } from "@/components/ui/card";
import { UserProfile, getAllUsersAdmin } from "@/lib/db";
import { Loader2, Search, UserCheck, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function UserList() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
        try {
            const data = await getAllUsersAdmin();
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center p-8"><Loader2 className="animate-spin mx-auto text-emerald-500" /></div>;

  return (
    <Card className="bg-slate-900 border-slate-800 flex flex-col h-[500px]">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-blue-500" />
                USER DATABASE <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{users.length}</span>
            </h3>
            <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 text-slate-500 w-4 h-4" />
                <Input 
                    placeholder="Search users..." 
                    className="h-9 bg-slate-950 border-slate-800 pl-8 focus:ring-emerald-500/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 font-mono bg-slate-950/50 sticky top-0">
                    <tr>
                        <th className="p-4 w-16">AVATAR</th>
                        <th className="p-4">IDENTITY</th>
                        <th className="p-4">ROLE</th>
                        <th className="p-4">PLAN</th>
                        <th className="p-4 text-right">JOINED</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                    {filteredUsers.map((user) => (
                        <tr key={user.uid} className="hover:bg-slate-800/30 transition-colors group">
                            <td className="p-4">
                                <Avatar className="w-8 h-8 ring-2 ring-slate-800 group-hover:ring-emerald-500/50 transition-all">
                                    <AvatarImage src={user.photoURL} />
                                    <AvatarFallback className="bg-slate-800 text-xs">{user.email?.substring(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </td>
                            <td className="p-4">
                                <div className="font-medium text-slate-200">{user.displayName || 'Anonymous'}</div>
                                <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                            </td>
                            <td className="p-4">
                                {user.role === 'admin' ? 
                                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20 gap-1"><Shield className="w-3 h-3"/> ADMIN</Badge> : 
                                    <Badge variant="outline" className="border-slate-700 text-slate-400">USER</Badge>
                                }
                            </td>
                            <td className="p-4">
                                <Badge variant="secondary" className={`capitalize ${
                                    user.subscription?.planId === 'pro' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                    user.subscription?.planId === 'plus' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                    'bg-slate-800 text-slate-400'
                                }`}>
                                    {user.subscription?.planId || 'free'}
                                </Badge>
                            </td>
                            <td className="p-4 text-right font-mono text-xs text-slate-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                    No users found matching "{search}"
                </div>
            )}
        </div>
    </Card>
  );
}

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    )
}
