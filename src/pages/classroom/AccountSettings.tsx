import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, KeyRound, Check, ShieldAlert } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
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
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/classes"
          className="inline-flex items-center gap-0.5 text-sm font-medium mb-3 no-underline"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronLeft size={18} strokeWidth={2.4} className="-ml-1.5" /> Classes
        </Link>
        <h1 className="text-3xl font-bold text-primary mb-1">Account</h1>
        <p className="text-secondary text-sm">{profile?.name} · {profile?.email}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="inset-group">
        <div className="p-4 space-y-3">
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <KeyRound size={14} style={{ color: 'var(--accent)' }} /> Change Password
          </p>
          <input
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            type="password"
            className="ios-input py-2 text-sm"
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            type="password"
            className="ios-input py-2 text-sm"
          />
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            type="password"
            className="ios-input py-2 text-sm"
          />
          {error && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--success)' }}>
              <Check size={12} /> Password updated.
            </p>
          )}
          <Button
            onClick={submit}
            disabled={submitting || !currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
          >
            Update Password
          </Button>
          <p className="text-xs text-muted">
            Forgot your password instead of just wanting to change it? Use the recovery code you saved at
            sign-up from the login screen's "Forgot password?" link.
            {role === 'student'
              ? ' Lost that too? Ask your teacher to reset it from the class roster.'
              : " Lost that too? The server's README explains the recovery script you can run on the machine it's hosted on."}
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="inset-group">
        <div className="p-4 space-y-3">
          <p className="text-sm font-semibold text-primary flex items-center gap-2">
            <ShieldAlert size={14} style={{ color: '#f59e0b' }} /> Recovery Code
          </p>
          <p className="text-xs text-muted">
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
              <Button variant="tinted" size="sm" onClick={regenerateRecoveryCode} disabled={regenerating}>
                Yes, generate a new one
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
