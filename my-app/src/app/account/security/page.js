"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiPost, apiGet } from "@/services/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import Badge from "@/components/ui/Badge";
import { 
  Shield, 
  Smartphone, 
  Key, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Copy,
  Check
} from "lucide-react";

export default function TwoFactorSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(0); // 0 = disabled, 1 = setup, 2 = verify, 3 = enabled

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    try {
      const data = await apiGet("/auth/2fa/status");
      setTwoFactorEnabled(data.enabled);
      setStep(data.enabled ? 3 : 0);
    } catch (e) {
      console.error("Failed to load 2FA status", e);
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    setError("");
    setSuccess("");
    try {
      const data = await apiPost("/2fa/generate");
      setQrCodeUrl(data.qr_code_base64 || data.qr_code_url);
      setSecret(data.secret);
      setRecoveryCodes(data.recovery_codes);
      setStep(1);
    } catch (e) {
      setError(e?.data?.message || "Ошибка при настройке 2FA");
    }
  };

  const confirmSetup = async () => {
    setError("");
    setSuccess("");

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Введите 6-значный код из приложения");
      return;
    }

    try {
      await apiPost("/2fa/confirm", { code: verificationCode });
      setTwoFactorEnabled(true);
      setStep(3);
      setSuccess("2FA успешно включен!");
      refreshUser();
    } catch (e) {
      setError(e?.data?.message || "Неверный код");
    }
  };

  const disableTwoFactor = async () => {
    setError("");
    setSuccess("");

    if (!password) {
      setError("Введите пароль для подтверждения");
      return;
    }

    try {
      await apiPost("/2fa/disable", { password });
      setTwoFactorEnabled(false);
      setStep(0);
      setPassword("");
      setSuccess("2FA успешно отключен");
      refreshUser();
    } catch (e) {
      setError(e?.data?.message || "Ошибка при отключении 2FA");
    }
  };

  const regenerateRecoveryCodes = async () => {
    setError("");
    setSuccess("");

    if (!password) {
      setError("Введите пароль для подтверждения");
      return;
    }

    try {
      const data = await apiPost("/2fa/recovery-codes", { password });
      setRecoveryCodes(data.recovery_codes);
      setShowRecoveryCodes(true);
      setPassword("");
      setSuccess("Коды восстановления перевыпущены");
    } catch (e) {
      setError(e?.data?.message || "Ошибка при генерации кодов");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setSuccess("Код скопирован в буфер обмена");
    setTimeout(() => setSuccess(""), 2000);
  };

  if (loading) {
    return (
      <Card hover={false} className="p-8 text-center">
        <p className="text-[color:var(--muted)]">Загрузка...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">Двухфакторная аутентификация</h1>
        <p className="text-[color:var(--muted)] mt-1">
          Повысьте безопасность вашего аккаунта с помощью 2FA
        </p>
      </div>

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
            <AlertTriangle className="w-5 h-5 text-[color:var(--danger)] flex-shrink-0" />
            <p className="text-[color:var(--danger)]">{error}</p>
          </div>
        </Card>
      )}

      {/* Статус 2FA */}
      <Card hover={false} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              twoFactorEnabled 
                ? "bg-[color:var(--accent-soft)]" 
                : "bg-[color:var(--stroke)]"
            }`}>
              <Shield className={`w-6 h-6 ${
                twoFactorEnabled ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--text)]">
                {twoFactorEnabled ? "2FA включен" : "2FA отключен"}
              </h3>
              <p className="text-sm text-[color:var(--muted)]">
                {twoFactorEnabled 
                  ? "Ваш аккаунт защищён двухфакторной аутентификацией" 
                  : "Рекомендуется включить для большей безопасности"}
              </p>
            </div>
          </div>
          <Badge className={twoFactorEnabled 
            ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)] border-[color:var(--accent-border)]" 
            : "bg-[color:var(--stroke)] text-[color:var(--muted)] border-[color:var(--stroke)]"
          }>
            {twoFactorEnabled ? "Активно" : "Неактивно"}
          </Badge>
        </div>
      </Card>

      {/* Настройка 2FA */}
      {!twoFactorEnabled && step === 0 && (
        <Card hover={false} className="p-6">
          <div className="text-center py-8">
            <Smartphone className="w-16 h-16 mx-auto text-[color:var(--muted)] mb-4" />
            <h3 className="text-xl font-semibold text-[color:var(--text)] mb-2">
              Защитите свой аккаунт
            </h3>
            <p className="text-[color:var(--muted)] mb-6 max-w-md mx-auto">
              Двухфакторная аутентификация добавляет дополнительный уровень защиты.
              Для входа потребуется код из приложения Authenticator.
            </p>
            <Button onClick={startSetup} className="px-8">
              Настроить 2FA
            </Button>
          </div>
        </Card>
      )}

      {/* Шаг 1: QR-код */}
      {!twoFactorEnabled && step === 1 && (
        <Card hover={false} className="p-6">
          <h3 className="text-xl font-semibold text-[color:var(--text)] mb-4">
            Шаг 1: Отсканируйте QR-код
          </h3>

          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-4 rounded-xl mb-4">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl.startsWith('data:') ? qrCodeUrl : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeUrl)}`}
                  alt="2FA QR Code"
                  className="w-48 h-48"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-[color:var(--muted)]">
                  Загрузка QR...
                </div>
              )}
            </div>
            <p className="text-center text-[color:var(--muted)] mb-4">
              Отсканируйте этот код в приложении Google Authenticator, Authy или аналогичном
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)]">
              <Key className="w-4 h-4 text-[color:var(--muted)]" />
              <span className="text-[color:var(--text)] font-mono">{secret}</span>
              <button
                onClick={() => copyCode(secret)}
                className="ml-2 p-1 rounded hover:bg-[color:var(--stroke)]"
              >
                <Copy className="w-4 h-4 text-[color:var(--muted)]" />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)}>
              Назад
            </Button>
            <Button onClick={() => setStep(2)}>
              Далее
            </Button>
          </div>
        </Card>
      )}

      {/* Шаг 2: Проверка кода */}
      {!twoFactorEnabled && step === 2 && (
        <Card hover={false} className="p-6">
          <h3 className="text-xl font-semibold text-[color:var(--text)] mb-4">
            Шаг 2: Подтвердите код
          </h3>
          
          <div className="max-w-sm mx-auto">
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">
              Введите 6-значный код из приложения
            </label>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
            />
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Назад
              </Button>
              <Button onClick={confirmSetup}>
                Подтвердить
              </Button>
            </div>
          </div>

          {/* Коды восстановления */}
          {recoveryCodes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[color:var(--stroke)]">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-[color:var(--warning)]" />
                <h4 className="font-semibold text-[color:var(--text)]">Коды восстановления</h4>
              </div>
              <p className="text-sm text-[color:var(--muted)] mb-4">
                Сохраните эти коды в безопасном месте. Они понадобятся для доступа к аккаунту, 
                если вы потеряете телефон.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {recoveryCodes.map((code, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-[color:var(--panel)] border border-[color:var(--stroke)]"
                  >
                    <code className="text-sm text-[color:var(--text)]">{code}</code>
                    <button 
                      onClick={() => copyCode(code)}
                      className="p-1 rounded hover:bg-[color:var(--stroke)]"
                    >
                      <Copy className="w-3.5 h-3.5 text-[color:var(--muted)]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 2FA включен */}
      {twoFactorEnabled && (
        <>
          <Card hover={false} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[color:var(--accent)]" />
              <h3 className="font-semibold text-[color:var(--text)]">2FA активирован</h3>
            </div>
            <p className="text-[color:var(--muted)]">
              Теперь при входе в аккаунт потребуется вводить код из приложения Authenticator.
            </p>
          </Card>

          <Card hover={false} className="p-6">
            <h3 className="font-semibold text-[color:var(--text)] mb-4">Отключить 2FA</h3>
            <p className="text-sm text-[color:var(--muted)] mb-4">
              Для отключения двухфакторной аутентификации введите ваш пароль
            </p>
            <div className="space-y-4">
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
              />
              <Button 
                variant="outline" 
                onClick={disableTwoFactor}
                className="text-[color:var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] hover:bg-[color:var(--danger-soft)] hover:text-[color:var(--danger)]"
              >
                <Lock className="w-4 h-4 mr-2" />
                Отключить 2FA
              </Button>
            </div>
          </Card>

          <Card hover={false} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-5 h-5 text-[color:var(--secondary)]" />
              <h3 className="font-semibold text-[color:var(--text)]">Коды восстановления</h3>
            </div>
            <p className="text-sm text-[color:var(--muted)] mb-4">
              Сгенерируйте новые коды восстановления для доступа к аккаунту
            </p>
            
            {!showRecoveryCodes ? (
              <div className="space-y-4">
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                />
                <Button onClick={regenerateRecoveryCodes}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Сгенерировать коды
                </Button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {recoveryCodes.map((code, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[color:var(--panel)] border border-[color:var(--stroke)]"
                    >
                      <code className="text-sm text-[color:var(--text)]">{code}</code>
                      <button 
                        onClick={() => copyCode(code)}
                        className="p-1 rounded hover:bg-[color:var(--stroke)]"
                      >
                        {success === "Код скопирован в буфер обмена" ? (
                          <Check className="w-3.5 h-3.5 text-[color:var(--accent)]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-[color:var(--muted)]" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[color:var(--muted)]">
                  Сохраните эти коды в безопасном месте
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
