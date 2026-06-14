"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, apiPut } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import Section from "@/components/ui/Section";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  User, Phone, Mail, Instagram, Award, Calendar, Clock, MapPin,
  Save, Upload, AlertCircle, CheckCircle2
} from "lucide-react";

const DAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
const LOCATIONS = [
  { id: 1, name: "НашФит Центр" },
  { id: 2, name: "НашФит Север" },
];

function timeHHMM(value) {
  return String(value || "").slice(0, 5);
}

function normalizeSchedule(schedule) {
  return {
    ...schedule,
    day_of_week: Number(schedule.day_of_week),
    start_time: timeHHMM(schedule.start_time || "09:00"),
    end_time: timeHHMM(schedule.end_time || "18:00"),
    location_id: schedule.location_id ? Number(schedule.location_id) : null,
    slot_duration_minutes: Number(schedule.slot_duration_minutes || 60),
  };
}

export default function TrainerProfilePage() {
  const { user, loading: authLoading, isAuthed, isTrainer } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Форма профиля
  const [form, setForm] = useState({
    specialization: "",
    experience_years: "",
    age: "",
    bio: "",
    instagram: "",
    phone: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  // Расписание
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthed) { router.replace("/login?next=/trainer/profile"); return; }
    if (!isTrainer) { router.replace("/account"); return; }

    let alive = true;
    (async () => {
      try {
        const response = await apiGet("/trainer/profile");
        const data = response?.data ?? response;
        if (!alive) return;
        if (!data || !data.id) {
          setError("Не удалось загрузить профиль");
          setLoading(false);
          return;
        }
        setProfile(data);
        setForm({
          specialization: data.specialization || "",
          experience_years: data.experience_years || "",
          age: data.age || "",
          bio: data.bio || "",
          instagram: data.instagram || "",
          phone: data.phone || "",
        });
        setPhotoPreview(data.photo_url || "");
        setSchedules((data.schedules || []).map(normalizeSchedule));
      } catch {
        if (!alive) return;
        setError("Ошибка загрузки профиля. Убедитесь, что у вас есть профиль тренера.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [authLoading, isAuthed, isTrainer, router]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Обновление расписания
  const updateSchedule = (dayOfWeek, field, value) => {
    setSchedules(prev => {
      const existing = prev.find(s => s.day_of_week === dayOfWeek);
      if (existing) {
        return prev.map(s => s.day_of_week === dayOfWeek ? { ...s, [field]: value } : s);
      }
      return [...prev, normalizeSchedule({ day_of_week: dayOfWeek, start_time: "09:00", end_time: "18:00", location_id: null, slot_duration_minutes: 60, [field]: value })];
    });
  };

  const toggleDay = (dayOfWeek) => {
    setSchedules(prev => {
      const exists = prev.find(s => s.day_of_week === dayOfWeek);
      if (exists) return prev.filter(s => s.day_of_week !== dayOfWeek);
      return [...prev, normalizeSchedule({ day_of_week: dayOfWeek, start_time: "09:00", end_time: "18:00", location_id: null, slot_duration_minutes: 60 })];
    });
  };

  const saveProfile = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("specialization", form.specialization);
      formData.append("experience_years", form.experience_years);
      formData.append("age", form.age);
      formData.append("bio", form.bio);
      formData.append("instagram", form.instagram);
      formData.append("phone", form.phone);
      if (photoFile) formData.append("photo", photoFile);

      const response = await apiPost("/trainer/profile", formData);
      const data = response?.data ?? response;
      setProfile(data);
      setSuccess("Профиль обновлён");
    } catch (e) {
      setError(e?.data?.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const saveSchedule = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        schedules: schedules.map(s => ({
          day_of_week: Number(s.day_of_week),
          start_time: timeHHMM(s.start_time),
          end_time: timeHHMM(s.end_time),
          location_id: s.location_id ? Number(s.location_id) : null,
          slot_duration_minutes: Number(s.slot_duration_minutes || 60),
        })),
      };

      await apiPut("/trainer/schedule", payload);
      setSuccess("Расписание обновлено");

      // Перезагружаем профиль
      const response = await apiGet("/trainer/profile");
      const data = response?.data ?? response;
      setSchedules((data.schedules || []).map(normalizeSchedule));
    } catch (e) {
      setError(e?.data?.message || "Ошибка сохранения расписания");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <Section><div className="py-20 text-center text-[color:var(--muted)]">Загрузка...</div></Section>;

  return (
    <Section title="Мой профиль тренера" subtitle="Редактируйте информацию и расписание">
      {error && (
        <Card hover={false} className="mb-6 p-4 bg-red-500/10 border-red-500/30">
          <div className="flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </Card>
      )}
      {success && (
        <Card hover={false} className="mb-6 p-4 bg-emerald-500/10 border-emerald-500/30">
          <div className="flex items-center gap-3 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Профиль */}
        <Card hover={false}>
          <h2 className="text-xl font-bold text-[color:var(--text)] mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[color:var(--accent)]" />
            Информация о себе
          </h2>

          {/* Фото */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-24 w-24 rounded-xl overflow-hidden bg-[color:var(--panel)] border border-[color:var(--stroke)] flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Фото" className="h-full w-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[color:var(--muted)]" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--stroke)] px-3 py-2 text-sm cursor-pointer hover:border-[color:var(--accent)] transition">
                <Upload className="w-4 h-4" />
                <span>Загрузить фото</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
              <p className="text-xs text-[color:var(--muted)] mt-1">JPG, PNG до 2 МБ</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[color:var(--text)] mb-1 block">Специализация</label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]" />
                <Input placeholder="Функциональный тренинг" value={form.specialization} onChange={e => updateField("specialization", e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-[color:var(--text)] mb-1 block">Опыт (лет)</label>
                <Input type="number" min="0" max="50" value={form.experience_years} onChange={e => updateField("experience_years", e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-[color:var(--text)] mb-1 block">Возраст</label>
                <Input type="number" min="18" max="100" value={form.age} onChange={e => updateField("age", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[color:var(--text)] mb-1 block">О себе</label>
              <textarea
                value={form.bio}
                onChange={e => updateField("bio", e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-[color:var(--stroke)] bg-[color:var(--panel)] px-3 py-2.5 text-[color:var(--text)] placeholder:text-[color:var(--muted2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] resize-y"
                placeholder="Расскажите о своём опыте и подходе к тренировкам..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[color:var(--text)] mb-1 block">VK / Соцсеть</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]" />
                <Input placeholder="@username" value={form.instagram} onChange={e => updateField("instagram", e.target.value)} className="pl-10" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[color:var(--text)] mb-1 block">Телефон</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--muted)]" />
                <Input placeholder="+79990000000" value={form.phone} onChange={e => updateField("phone", e.target.value)} className="pl-10" />
              </div>
            </div>

            <Button onClick={saveProfile} disabled={saving} variant="primary" className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Сохранение..." : "Сохранить профиль"}
            </Button>
          </div>
        </Card>

        {/* Расписание */}
        <Card hover={false}>
          <h2 className="text-xl font-bold text-[color:var(--text)] mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[color:var(--accent)]" />
            Расписание
          </h2>

          <div className="space-y-3">
            {DAY_NAMES.map((dayName, dayOfWeek) => {
              const schedule = schedules.find(s => s.day_of_week === dayOfWeek);
              const isActive = !!schedule;

              return (
                <div key={dayOfWeek} className={`rounded-xl border transition-all ${isActive ? "border-[color:var(--accent)] bg-[color:var(--accent)]/5" : "border-[color:var(--stroke)] bg-[color:var(--panel)]"}`}>
                  <div className="flex items-center justify-between px-3 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={() => toggleDay(dayOfWeek)}
                        className="w-4 h-4 accent-[color:var(--accent)]"
                      />
                      <span className="text-sm font-medium text-[color:var(--text)]">{dayName}</span>
                    </label>
                  </div>

                  {isActive && (
                    <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-[color:var(--muted)] mb-1 block">Начало</label>
                        <input
                          type="time"
                          value={schedule.start_time}
                          onChange={e => updateSchedule(dayOfWeek, "start_time", e.target.value)}
                          className="w-full rounded-lg border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2 py-1.5 text-sm text-[color:var(--text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[color:var(--muted)] mb-1 block">Окончание</label>
                        <input
                          type="time"
                          value={schedule.end_time}
                          onChange={e => updateSchedule(dayOfWeek, "end_time", e.target.value)}
                          className="w-full rounded-lg border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2 py-1.5 text-sm text-[color:var(--text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[color:var(--muted)] mb-1 block">Зал</label>
                        <select
                          value={schedule.location_id || ""}
                          onChange={e => updateSchedule(dayOfWeek, "location_id", e.target.value ? Number(e.target.value) : null)}
                          className="w-full rounded-lg border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2 py-1.5 text-sm text-[color:var(--text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
                        >
                          <option value="">Не выбран</option>
                          {LOCATIONS.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-[color:var(--muted)] mb-1 block">Слот (мин)</label>
                        <select
                          value={schedule.slot_duration_minutes || 60}
                          onChange={e => updateSchedule(dayOfWeek, "slot_duration_minutes", Number(e.target.value))}
                          className="w-full rounded-lg border border-[color:var(--stroke)] bg-[color:var(--bg)] px-2 py-1.5 text-sm text-[color:var(--text)] focus:outline-none focus:ring-1 focus:ring-[color:var(--accent)]"
                        >
                          <option value={30}>30 мин</option>
                          <option value={45}>45 мин</option>
                          <option value={60}>60 мин</option>
                          <option value={90}>90 мин</option>
                          <option value={120}>120 мин</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button onClick={saveSchedule} disabled={saving} variant="primary" className="w-full mt-4">
            <Clock className="w-4 h-4 mr-2" />
            {saving ? "Сохранение..." : "Сохранить расписание"}
          </Button>
        </Card>
      </div>
    </Section>
  );
}
