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
} from "lucide-react";

export default function TwoFactorSettingsPage() {
  const { refreshUser } = useAuth();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    loadTwoFactorStatus();
  }, []);

  const loadTwoFactorStatus = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/auth/2fa/status");
      setTwoFactorEnabled(Boolean(data.enabled));
      setRecoveryCount(Number(data.recovery_codes_count || 0));
      setStep(data.enabled ? 3 : 0);
    } catch (e) {
      setError(e?.data?.message || "Не удалось загрузить статус 2FA.");
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const startSetup = async () => {
    clearMessages();
    setBusy(true);
    try {
      const data = await apiPost("/2fa/generate");
      setQrCodeUrl(data.qr_code_base64 || data.qr_code_url || "");
      setSecret(data.secret || "");
      setRecoveryCodes(data.recovery_codes || []);
      setShowRecoveryCodes(true);
      setVerificationCode("");
      setStep(1);
    } catch (e) {
      setError(e?.data?.message || "Ошибка при настройке 2FA.");
    } finally {
      setBusy(false);
    }
  };

  const confirmSetup = async () => {
    clearMessages();
    const code = verificationCode.replace(/\D/g, "");

    if (code.length !== 6) {
      setError("Введите 6-значный код из приложения.");
      return;
    }

    setBusy(true);
    try {
      await apiPost("/2fa/confirm", { code });
      setTwoFactorEnabled(true);
      setStep(3);
      setVerificationCode("");
      setRecoveryCount(recoveryCodes.length || 8);
      setSuccess("2FA успешно включена.");
      await refreshUser?.();
    } catch (e) {
      setError(e?.data?.message || "Неверный код.");
    } finally {
      setBusy(false);
    }
  };

  const disableTwoFactor = async () => {
    clearMessages();

    if (!password) {
      setError("Введите пароль для подтверждения.");
      return;
    }

    setBusy(true);
    try {
      await apiPost("/2fa/disable", { password });
      setTwoFactorEnabled(false);
      setStep(0);
      setPassword("");
      setSecret("");
      setQrCodeUrl("");
      setRecoveryCodes([]);
      setRecoveryCount(0);
      setSuccess("2FA успешно отключена.");
      await refreshUser?.();
    } catch (e) {
      setError(e?.data?.message || "Ошибка при отключении 2FA.");
    } finally {
      setBusy(false);
    }
  };

  const regenerateRecoveryCodes = async () => {
    clearMessages();

    if (!password) {
      setError("Введите пароль для подтверждения.");
      return;
    }

    setBusy(true);
    try {
      const data = await apiPost("/2fa/recovery-codes", { password });
      const codes = data.recovery_codes || [];
      setRecoveryCodes(codes);
      setRecoveryCount(codes.length);
      setShowRecoveryCodes(true);
      setPassword("");
      setSuccess("Коды восстановления перевыпущены. Сохраните их сейчас.");
    } catch (e) {
      setError(e?.data?.message || "Ошибка при генерации кодов.");
    } finally {
      setBusy(false);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess("Код скопирован.");
      setTimeout(() => setSuccess(""), 1600);
    } catch {
      setError("Не удалось скопировать код.");
    }
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
        <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--text)]">Безопасность и 2FA</h1>
        <p className="text-[color:var(--muted)] mt-1">Настройка входа, двухфакторной аутентификации и кодов восстановления.</p>
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

      <Card hover={false} className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${twoFactorEnabled ? "bg-[color:var(--accent-soft)]" : "bg-[color:var(--stroke)]"}`}>
              <Shield className={`w-6 h-6 ${twoFactorEnabled ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"}`} />
            </div>
            <div>
              <h3 className="font-semibold text-[color:var(--text)]">{twoFactorEnabled ? "2FA включена" : "2FA отключена"}</h3>
              <p className="text-sm text-[color:var(--muted)]">
                {twoFactorEnabled ? `Аккаунт защищён. Активных кодов восстановления: ${recoveryCount}.` : "Рекомендуется включить для большей безопасности."}
              </p>
            </div>
          </div>
          <Badge className={twoFactorEnabled ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)] border-[color:var(--accent-border)]" : "bg-[color:var(--stroke)] text-[color:var(--muted)] border-[color:var(--stroke)]"}>
            {twoFactorEnabled ? "Активно" : "Неактивно"}
          </Badge>
        </div>
      </Card>

      {!twoFactorEnabled && step === 0 && (
        <Card hover={false} className="p-6">
          <div className="text-center py-8">
            <Smartphone className="w-16 h-16 mx-auto text-[color:var(--muted)] mb-4" />
            <h3 className="text-xl font-semibold text-[color:var(--text)] mb-2">Защитите свой аккаунт</h3>
            <p className="text-[color:var(--muted)] mb-6 max-w-md mx-auto">Для входа потребуется код из Google Authenticator, Authy или другого совместимого приложения.</p>
            <Button onClick={startSetup} disabled={busy} className="px-8">{busy ? "Подготовка..." : "Настроить 2FA"}</Button>
          </div>
        </Card>
      )}

      {!twoFactorEnabled && step === 1 && (
        <Card hover={false} className="p-6">
          <h3 className="text-xl font-semibold text-[color:var(--text)] mb-4">Шаг 1: отсканируйте QR-код</h3>
          <div className="flex flex-col items-center mb-6">
            <div className="bg-white p-4 rounded-xl mb-4 border border-[color:var(--stroke)]">
              {qrCodeUrl ? <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" /> : <div className="w-48 h-48 flex items-center justify-center text-[color:var(--muted)]">QR недоступен</div>}
            </div>
            <p className="text-center text-[color:var(--muted)] mb-4">Отсканируйте QR-код приложением-аутентификатором.</p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[color:var(--panel)] border border-[color:var(--stroke)] max-w-full overflow-x-auto">
              <Key className="w-4 h-4 text-[color:var(--muted)] flex-shrink-0" />
              <span className="text-[color:var(--text)] font-mono text-sm whitespace-nowrap">{secret}</span>
              <button type="button" onClick={() => copyCode(secret)} className="ml-2 p-1 rounded hover:bg-[color:var(--stroke)]" aria-label="Скопировать секрет">
                <Copy className="w-4 h-4 text-[color:var(--muted)]" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(0)} disabled={busy}>Назад</Button>
            <Button onClick={() => setStep(2)} disabled={busy}>Далее</Button>
          </div>
        </Card>
      )}

      {!twoFactorEnabled && step === 2 && (
        <Card hover={false} className="p-6">
          <h3 className="text-xl font-semibold text-[color:var(--text)] mb-4">Шаг 2: подтвердите код</h3>
          <div className="max-w-sm mx-auto">
            <label className="block text-sm font-medium text-[color:var(--text)] mb-2">Введите 6-значный код из приложения</label>
            <Input type="text" inputMode="numeric" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="text-center text-2xl tracking-widest" />
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)} disabled={busy}>Назад</Button>
              <Button onClick={confirmSetup} disabled={busy}>{busy ? "Проверка..." : "Подтвердить"}</Button>
            </div>
          </div>

          {recoveryCodes.length > 0 && (
            <RecoveryCodes codes={recoveryCodes} copyCode={copyCode} />
          )}
        </Card>
      )}

      {twoFactorEnabled && (
        <>
          <Card hover={false} className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[color:var(--accent)]" />
              <h3 className="font-semibold text-[color:var(--text)]">2FA активирована</h3>
            </div>
            <p className="text-[color:var(--muted)]">Теперь при входе потребуется код из приложения-аутентификатора.</p>
          </Card>

          <Card hover={false} className="p-6">
            <h3 className="font-semibold text-[color:var(--text)] mb-4">Коды восстановления</h3>
            <p className="text-sm text-[color:var(--muted)] mb-4">Новые коды можно посмотреть только один раз — сразу после перевыпуска.</p>
            <div className="space-y-4">
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" leftIcon={<Lock className="w-5 h-5" />} />
              <Button onClick={regenerateRecoveryCodes} disabled={busy}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {busy ? "Генерация..." : "Перевыпустить коды"}
              </Button>
            </div>
            {showRecoveryCodes && recoveryCodes.length > 0 && <RecoveryCodes codes={recoveryCodes} copyCode={copyCode} />}
          </Card>

          <Card hover={false} className="p-6">
            <h3 className="font-semibold text-[color:var(--text)] mb-4">Отключить 2FA</h3>
            <p className="text-sm text-[color:var(--muted)] mb-4">Введите пароль и подтвердите отключение двухфакторной защиты.</p>
            <div className="space-y-4">
              <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" leftIcon={<Lock className="w-5 h-5" />} />
              <Button variant="outline" onClick={disableTwoFactor} disabled={busy} className="text-[color:var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_40%,var(--stroke))] hover:bg-[color:var(--danger-soft)] hover:text-[color:var(--danger)]">
                <Lock className="w-4 h-4 mr-2" />
                Отключить 2FA
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function RecoveryCodes({ codes, copyCode }) {
  return (
    <div className="mt-8 pt-6 border-t border-[color:var(--stroke)]">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-[color:var(--warning)]" />
        <h4 className="font-semibold text-[color:var(--text)]">Коды восстановления</h4>
      </div>
      <p className="text-sm text-[color:var(--muted)] mb-4">Сохраните эти коды. Каждый код можно использовать только один раз.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {codes.map((code, idx) => (
          <div key={`${code}-${idx}`} className="flex items-center justify-between p-2 rounded-lg bg-[color:var(--panel)] border border-[color:var(--stroke)]">
            <code className="text-sm text-[color:var(--text)] tracking-wider">{code}</code>
            <button type="button" onClick={() => copyCode(code)} className="p-1 rounded hover:bg-[color:var(--stroke)]" aria-label="Скопировать код">
              <Copy className="w-3.5 h-3.5 text-[color:var(--muted)]" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
