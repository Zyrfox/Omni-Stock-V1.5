"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Loader2, Trash2, UserPlus } from "lucide-react";

interface AppUser {
  id: string;
  email: string;
  nama: string;
  role: "admin" | "manager";
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "manager">("manager");
  const [error, setError] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.data) setUsers(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleAdd() {
    if (!formEmail || !formNama) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formEmail, nama: formNama, role: formRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setFormEmail("");
        setFormNama("");
        setFormRole("manager");
        await fetchUsers();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Gagal menambahkan user");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus user ini?")) return;
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) await fetchUsers();
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Users className="h-8 w-8" />
          Manajemen User
        </h1>
        <p className="text-muted-foreground">
          Kelola email yang diizinkan mengakses sistem (Admin only)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tambah User Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="user@company.com"
                className="flex h-9 w-64 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Nama</label>
              <input
                type="text"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Nama Lengkap"
                className="flex h-9 w-48 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Role</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as "admin" | "manager")}
                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button onClick={handleAdd} disabled={adding || !formEmail || !formNama} size="sm">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tambah"}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar User ({users.length})</CardTitle>
          <CardDescription>Hanya email terdaftar yang dapat login via Google SSO</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Belum ada user terdaftar.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Terdaftar</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs">{u.id}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell className="font-medium">{u.nama}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
