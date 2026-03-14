"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { User, Mail, Phone, Lock, UserPlus, Check, ChevronRight, ChevronLeft } from "lucide-react";

const STEPS = [
  { id: 1, title: "Аккаунт", description: "Логин и пароль" },
  { id: 2, title: "Данные", description: "Персональная информация" },
  { id: 3, title: "Контакты", description: "Способы связи" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    login: "",
    password: "",
    password_confirmation: "",
    name: "",
    phone: "",
    email: "",
  });

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!form.login || form.login.length < 6) {
        newErrors.login = "Логин должен быть не менее 6 символов";
        isValid = false;
      } else if (!/^[a-zA-Z0-9_]+$/.test(form.login)) {
        newErrors.login = "Логин может содержать только латинские буквы, цифры и _";
        isValid = false;
      }

      if (!form.password || form.password.length < 8) {
        newErrors.password = "Пароль должен быть не менее 8 символов";
        isValid = false;
      }

      if (form.password !== form.password_confirmation) {
        newErrors.password_confirmation = "Пароли не совпадают";
        isValid = false;
      }
    }

    if (step === 2) {
      if (!form.name || form.name.trim().length < 2) {
        newErrors.name = "Введите корректное имя";
        isValid = false;
      } else if (!/^[А-Яа-яЁё\s-]+$/.test(form.name)) {
        newErrors.name = "Имя должно быть на русском языке";
        isValid = false;
      }
    }

    if (step === 3) {
      const phoneDigits = form.phone.replace(/\D/g, "");
      if (!form.phone || phoneDigits.length !== 11) {
        newErrors.phone = "Введите корректный номер телефона";
        isValid = false;
      }

      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        newErrors.email = "Введите корректный email";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
      setError("");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setError("");
    setBusy(true);

    try {
      // Формируем данные для отправки
      const payload = {
        login: form.login.trim(),
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, "").length === 11 
          ? `+${form.phone.replace(/\D/g, "")}` 
          : form.phone,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      };

      await register(payload);
      router.replace("/account?welcome=true");
    } catch (e2) {
      if (e2?.data?.errors) {
        const serverErrors = {};
        Object.entries(e2.data.errors).forEach(([key, messages]) => {
          serverErrors[key] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(serverErrors);
        setError("Проверьте правильность заполнения полей");
      } else {
        setError(e2?.data?.message || "Ошибка регистрации");
      }
    } finally {
      setBusy(false);
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Container size="narrow" className="py-8 min-h-[90vh]">
      <div className="w-full max-w-lg mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
            <UserPlus className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Создание аккаунта</h1>
          <p className="text-[color:var(--muted)] mt-2">Присоединяйтесь к FitLab</p>
        </div>

        {/* Индикатор прогресса */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold transition-all ${
                    currentStep >= step.id
                      ? "bg-emerald-500 text-white"
                      : "bg-[color:var(--stroke)] text-[color:var(--muted)]"
                  }`}
                >
                  {currentStep > step.id ? <Check size={16} /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 md:w-24 h-0.5 mx-2 ${
                      currentStep > step.id ? "bg-emerald-500" : "bg-[color:var(--stroke)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[color:var(--muted)]">
            {STEPS.map((step) => (
              <span
                key={step.id}
                className={`text-center w-20 ${
                  currentStep === step.id ? "text-emerald-400 font-medium" : ""
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        <Card className="w-full p-6 md:p-8" hover={false}>
          <form onSubmit={submit}>
            {/* Шаг 1: Аккаунт */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[color:var(--text)]">Логин</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                    <Input
                      placeholder="Придумайте логин"
                      value={form.login}
                      onChange={(e) => updateField("login", e.target.value)}
                      disabled={busy}
                      className="pl-10"
                      autoComplete="username"
                    />
                  </div>
                  {errors.login && <p className="text-xs text-red-400">{errors.login}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[color:var(--text)]">Пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                    <PasswordInput
                      placeholder="Минимум 8 символов"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      disabled={busy}
                      className="pl-10"
                      showStrength
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[color:var(--text)]">Подтверждение пароля</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                    <PasswordInput
                      placeholder="Повторите пароль"
                      value={form.password_confirmation}
                      onChange={(e) => updateField("password_confirmation", e.target.value)}
                      disabled={busy}
                      className="pl-10"
                      autoComplete="new-password"
                    />
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-xs text-red-400">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>
            )}

            {/* Шаг 2: Данные */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[color:var(--text)]">Имя</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                    <Input
                      placeholder="Иван Иванов"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      disabled={busy}
                      className="pl-10"
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-300">
                    💡 Используйте своё реальное имя — это поможет при общении с тренерами и при получении заказов
                  </p>
                </div>
              </div>
            )}

            {/* Шаг 3: Контакты */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[color:var(--text)]">Телефон</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                    <PhoneInput
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      disabled={busy}
                      className="pl-10"
                      autoComplete="tel"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[color:var(--text)]">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
                    <Input
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      disabled={busy}
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>

                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-xs text-cyan-300">
                    📧 На email придёт подтверждение регистрации и уведомления о заказах
                  </p>
                </div>
              </div>
            )}

            {/* Общая ошибка */}
            {error && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Кнопки навигации */}
            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={busy}
                  className="flex-1"
                >
                  <ChevronLeft size={18} />
                  Назад
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={nextStep}
                  disabled={busy}
                  className="flex-1"
                >
                  Далее
                  <ChevronRight size={18} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={busy}
                  className="flex-1"
                >
                  {busy ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Создание...
                    </span>
                  ) : (
                    "Создать аккаунт"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Ссылка на вход */}
        <p className="mt-6 text-center text-sm text-[color:var(--muted)]">
          Уже есть аккаунт?{" "}
          <a href="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
            Войти
          </a>
        </p>
      </div>
    </Container>
  );
}
