import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  X,
  Loader2,
  RefreshCw,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { createUser, deleteUser } from "@/lib/admin.functions";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Configurações — NexaBoot" },
      { name: "description", content: "Painel administrativo" },
    ],
  }),
});

interface UserRow {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  status: "ativo" | "inativo";
  role: string;
  created_at: string;
}

function SettingsPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: true }),
      supabase.from("user_roles").select("*"),
    ]);

    if (profilesRes.error) {
      toast.error(profilesRes.error.message);
      setLoading(false);
      return;
    }

    const roleMap: Record<string, string> = {};
    for (const r of rolesRes.data ?? []) {
      roleMap[r.user_id] = r.role;
    }

    setUsers(
      (profilesRes.data ?? []).map((p) => ({
        ...p,
        role: roleMap[p.user_id] ?? "atendente",
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deletingUser) return;
    setActionLoading(true);
    const result = await deleteUser({ data: { userId: deletingUser.user_id } });
    setActionLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Usuário "${deletingUser.nome}" excluído`);
      setDeletingUser(null);
      fetchUsers();
    }
  };

  const handleToggleStatus = async (u: UserRow) => {
    const newStatus = u.status === "ativo" ? "inativo" : "ativo";
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("user_id", u.user_id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${u.nome} agora está ${newStatus}`);
      fetchUsers();
    }
  };

  const handleRoleToggle = async (u: UserRow) => {
    const newRole = u.role === "admin" ? "atendente" : "admin";
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", u.user_id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${u.nome} agora é ${newRole === "admin" ? "Administrador" : "Atendente"}`);
      fetchUsers();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">Gerencie usuários e permissões</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">Nenhum usuário encontrado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuário</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Perfil</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.user_id === currentUser?.id;
                  return (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {u.nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <span className="font-medium text-foreground">{u.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => !isSelf && handleRoleToggle(u)}
                          disabled={isSelf}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            u.role === "admin"
                              ? "bg-primary/10 text-primary border border-primary/20"
                              : "bg-muted text-muted-foreground border border-border"
                          } ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.role === "admin" ? "Admin" : "Atendente"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => !isSelf && handleToggleStatus(u)}
                          disabled={isSelf}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            u.status === "ativo"
                              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                          } ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
                        >
                          {u.status === "ativo" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                          {u.status === "ativo" ? "Ativo" : "Inativo"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingUser(u)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={fetchUsers} />}
      {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onUpdated={fetchUsers} />}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeletingUser(null)}>
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground">Excluir usuário</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tem certeza que deseja excluir <strong className="text-foreground">{deletingUser.nome}</strong>? Esta ação é irreversível.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeletingUser(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "atendente">("atendente");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    const result = await createUser({ data: { email, password, nome, role } });
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Usuário criado com sucesso!");
      onCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Novo Usuário</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" required />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label>Perfil</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setRole("atendente")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${role === "atendente" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                Atendente
              </button>
              <button type="button" onClick={() => setRole("admin")}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${role === "admin" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                Administrador
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Usuário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onUpdated }: { user: UserRow; onClose: () => void; onUpdated: () => void }) {
  const [nome, setNome] = useState(user.nome);
  const [email, setEmail] = useState(user.email);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nome, email })
      .eq("user_id", user.user_id);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Usuário atualizado!");
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Editar Usuário</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
