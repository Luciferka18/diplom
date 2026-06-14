"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, apiDelete } from "@/services/api";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserX, 
  Trash2, 
  Search, 
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const roleColors = {
  admin: "bg-purple-500/20 text-[color:var(--warm)] border-purple-500/30",
  trainer: "bg-cyan-500/20 text-[color:var(--secondary)] border-cyan-500/30",
  user: "bg-[color:var(--accent-soft)] text-[color:var(--accent)] border-[color:var(--accent-border)]",
};

const roleNames = {
  admin: "Администратор",
  trainer: "Тренер",
  user: "Пользователь",
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Фильтры
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [bannedFilter, setBannedFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Модальное окно блокировки
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, search, roleFilter, bannedFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "10",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(bannedFilter && { banned: bannedFilter }),
      });

      const data = await apiGet(`/admin/users?${params}`);
      setUsers(data.data);
      setTotalPages(data.last_page);
    } catch (e) {
      setError(e?.data?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiGet("/admin/users/stats");
      setStats(data);
    } catch {}
  };

  const handleBan = async () => {
    if (!selectedUser || !banReason) return;

    try {
      await apiPost(`/admin/users/${selectedUser.id}/ban`, {
        reason: banReason,
        duration_days: banDuration ? parseInt(banDuration) : null,
      });
      setSuccess("Пользователь заблокирован");
      setShowBanModal(false);
      setBanReason("");
      setBanDuration("");
      setSelectedUser(null);
      loadUsers();
      loadStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e?.data?.message || "Ошибка блокировки");
    }
  };

  const handleUnban = async (userId) => {
    try {
      await apiPost(`/admin/users/${userId}/unban`);
      setSuccess("Пользователь разблокирован");
      loadUsers();
      loadStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e?.data?.message || "Ошибка разблокировки");
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.")) {
      return;
    }

    try {
      await apiDelete(`/admin/users/${userId}`);
      setSuccess("Пользователь удалён");
      loadUsers();
      loadStats();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e?.data?.message || "Ошибка удаления");
    }
  };

  const openBanModal = (user) => {
    setSelectedUser(user);
    setShowBanModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatBanUntil = (dateString) => {
    if (!dateString) return "Навсегда";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Container className="py-8">
      <div className="space-y-6">
        {/* Заголовок и статистика */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">Управление пользователями</h1>
          <p className="text-[color:var(--muted)] mt-1">
            Просмотр, блокировка и удаление пользователей
          </p>
        </div>

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[color:var(--stroke)] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[color:var(--text)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[color:var(--text)]">{stats.total}</p>
                  <p className="text-xs text-[color:var(--muted)]">Всего</p>
                </div>
              </div>
            </Card>
            <Card hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[color:var(--warm-soft)] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[color:var(--warm)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[color:var(--text)]">{stats.admins}</p>
                  <p className="text-xs text-[color:var(--muted)]">Админы</p>
                </div>
              </div>
            </Card>
            <Card hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[color:var(--secondary-soft)] flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-[color:var(--secondary)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[color:var(--text)]">{stats.trainers}</p>
                  <p className="text-xs text-[color:var(--muted)]">Тренеры</p>
                </div>
              </div>
            </Card>
            <Card hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[color:var(--accent-soft)] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[color:var(--text)]">{stats.users}</p>
                  <p className="text-xs text-[color:var(--muted)]">Клиенты</p>
                </div>
              </div>
            </Card>
            <Card hover={false} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[color:var(--danger-soft)] flex items-center justify-center">
                  <UserX className="w-5 h-5 text-[color:var(--danger)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[color:var(--text)]">{stats.banned}</p>
                  <p className="text-xs text-[color:var(--muted)]">Заблокированы</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Уведомления */}
        {success && (
          <Card hover={false} className="p-4 bg-[color:var(--accent-soft)] border-[color:var(--accent-border)]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[color:var(--accent)] flex-shrink-0" />
              <p className="text-[color:var(--accent)]">{success}</p>
            </div>
          </Card>
        )}

        {error && (
          <Card hover={false} className="p-4 bg-[color:var(--danger-soft)] border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))]">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[color:var(--danger)] flex-shrink-0" />
              <p className="text-[color:var(--danger)]">{error}</p>
            </div>
          </Card>
        )}

        {/* Фильтры */}
        <Card hover={false} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                <Input
                  placeholder="Поиск по имени, email, логину..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              <option value="">Все роли</option>
              <option value="admin">Администраторы</option>
              <option value="trainer">Тренеры</option>
              <option value="user">Пользователи</option>
            </select>
            <select
              value={bannedFilter}
              onChange={(e) => setBannedFilter(e.target.value)}
              className="rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]"
            >
              <option value="">Все статусы</option>
              <option value="0">Активные</option>
              <option value="1">Заблокированные</option>
            </select>
          </div>
        </Card>

        {/* Список пользователей */}
        {loading ? (
          <Card hover={false} className="p-8 text-center">
            <p className="text-[color:var(--muted)]">Загрузка...</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <Card key={user.id} hover={false} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[color:var(--text)] font-semibold ${
                      user.is_banned 
                        ? "bg-[color:var(--danger-soft)]" 
                        : "bg-gradient-to-br from-emerald-500 to-cyan-500"
                    }`}>
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[color:var(--text)]">{user.name}</span>
                        {user.is_banned && (
                          <Badge className="bg-[color:var(--danger-soft)] text-[color:var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))]">
                            Заблокирован
                          </Badge>
                        )}
                        <Badge className={roleColors[user.role] || roleColors.user}>
                          {roleNames[user.role] || user.role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[color:var(--muted)]">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>{user.login}</span>
                        {user.is_banned && user.banned_until && (
                          <>
                            <span>•</span>
                            <span className="text-[color:var(--danger)]">
                              до {formatBanUntil(user.banned_until)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.is_banned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnban(user.id)}
                        className="text-[color:var(--accent)] border-[color:var(--accent-border)] hover:bg-[color:var(--accent-soft)]"
                      >
                        <Unlock className="w-4 h-4" />
                      </Button>
                    ) : user.role !== "admin" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openBanModal(user)}
                        className="text-[color:var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] hover:bg-[color:var(--danger-soft)]"
                      >
                        <Lock className="w-4 h-4" />
                      </Button>
                    ) : null}

                    {user.role !== "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-[color:var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] hover:bg-[color:var(--danger-soft)]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <Card hover={false} className="p-4">
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Назад
              </Button>
              <span className="flex items-center px-4 text-[color:var(--muted)]">
                Страница {currentPage} из {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Вперёд
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Модальное окно блокировки */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <Card hover={false} className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-[color:var(--text)] mb-4">
              Заблокировать пользователя
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[color:var(--muted)] mb-1">
                  Пользователь:
                </p>
                <p className="text-[color:var(--text)] font-medium">{selectedUser.name}</p>
                <p className="text-sm text-[color:var(--muted)]">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--text)] mb-2">
                  Причина блокировки *
                </label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] min-h-[100px]"
                  placeholder="Укажите причину блокировки..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[color:var(--text)] mb-2">
                  Срок блокировки (дней)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={banDuration}
                  onChange={(e) => setBanDuration(e.target.value)}
                  placeholder="Оставьте пустым для вечной блокировки"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason("");
                    setBanDuration("");
                    setSelectedUser(null);
                  }}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={handleBan}
                  disabled={!banReason}
                  className="flex-1 bg-red-500 hover:bg-red-600"
                >
                  Заблокировать
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
}
