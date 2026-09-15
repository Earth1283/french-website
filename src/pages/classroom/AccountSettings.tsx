import { useState } from 'react';
import { ChevronLeft, KeyRound, Check, ShieldAlert } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Wordmark } from '../../components/ui/Signage';
import { RecoveryCodeReveal } from '../../components/classroom/RecoveryCodeReveal';

export function AccountSettings() {
  const { role, profile, backendUrl, setToken } = useClassroomStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newRecoveryCode, setNewRecoveryCode] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  async function regenerateRecoveryCode() {
    setRegenerating(true);
    try {
      const path =
        role === 'teacher' ? '/api/auth/teacher/regenerate-recovery-code' : '/api/auth/student/regenerate-recovery-code';
      const res = await classroomApi.post<{ recoveryCode: string }>(path);
      setNewRecoveryCode(res.recoveryCode);
      setConfirmRegenerate(false);
    } finally {
      setRegenerating(false);
    }
  }

  async function submit() {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      const path = role === 'teacher' ? '/api/auth/teacher/change-password' : '/api/auth/student/change-password';
      const res = await classroomApi.post<{ token: string }>(path, { currentPassword, newPassword });
      setToken(res.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof ClassroomApiError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page page--form">
      <div className="mb-6 flex justify-center">
        <Wordmark size="lg" />
      </div>
      <ButtonLink
        to="/classes"
        variant="quiet"
        className="-ml-1.5 mb-2"
      >
        <ChevronLeft size={20} aria-hidden="true" /> Classes
      </ButtonLink>
      <h1 className="h-page text-center">Account</h1>
      <p className="text-center t-body mb-6">{profile?.name} · {profile?.email}</p>

      <div className="sheet p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="h-section">Change Password</h2>
          <div className="field">
            <input
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              type="password"
            />
          </div>
          <div className="field">
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              type="password"
            />
          </div>
          <div className="field">
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              type="password"
            />
          </div>
          {error && (
            <p className="t-small text-signal-text" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="t-small flex items-center gap-1 text-go">
              <Check size={14} /> Password updated.
            </p>
          )}
          <Button
            onClick={submit}
            disabled={submitting || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
            variant="primary"
            block
          >
            Update Password
          </Button>
          <p className="t-small text-ink-3">
            Forgot your password instead of just wanting to change it? Use the recovery code you saved at
            sign-up from the login screen's "Forgot password?" link.
            {role === 'student'
              ? ' Lost that too? Ask your teacher to reset it from the class roster.'
              : " Lost that too? The server's README explains the recovery script you can run on the machine it's hosted on."}
          </p>
        </div>

        <div className="border-t border-rule pt-6 space-y-4">
          <h2 className="h-section">Recovery Code</h2>
          <p className="t-small text-ink-3">
            Get a new recovery code if you lost the one from sign-up. This invalidates your old code.
          </p>
          {newRecoveryCode ? (
            <RecoveryCodeReveal code={newRecoveryCode} email={profile?.email ?? ''} backendUrl={backendUrl} />
          ) : !confirmRegenerate ? (
            <Button variant="secondary" size="sm" onClick={() => setConfirmRegenerate(true)}>
              Generate new recovery code
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirmRegenerate(false)}>
                Cancel
              </Button>
              <Button variant="secondary" size="sm" onClick={regenerateRecoveryCode} disabled={regenerating}>
                Yes, generate a new one
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
