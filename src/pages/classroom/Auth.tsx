import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, ShieldQuestion, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { ClassroomPrivacyNotice } from '../../components/classroom/ClassroomPrivacyNotice';
import { RecoveryCodeReveal } from '../../components/classroom/RecoveryCodeReveal';

type Role = 'teacher' | 'student';
type Mode = 'login' | 'register';
type View = 'form' | 'forgot-password' | 'recovery-reveal';

export function ClassroomAuth() {
  const navigate = useNavigate();
  const { backendUrl, certTrusted, setAuth } = useClassroomStore();

  const [role, setRole] = useState<Role>('student');
  const [mode, setMode] = useState<Mode>('login');
  const [view, setView] = useState<View>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupCode, setSignupCode] = useState('');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [revealCode, setRevealCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  if (!backendUrl || !certTrusted) {
    return <Navigate to="/classes/connect" replace />;
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      if (role === 'teacher') {
        if (mode === 'login') {
          const res = await classroomApi.teacherLogin({ email, password });
          setAuth('teacher', res.token, res.teacher);
          navigate('/classes');
        } else {
          const res = await classroomApi.teacherRegister({ name, email, password, signupCode: signupCode || undefined });
          setAuth('teacher', res.token, res.teacher);
          setRevealCode(res.recoveryCode);
          setView('recovery-reveal');
        }
      } else {
        if (mode === 'login') {
          const res = await classroomApi.studentLogin({ email, password });
          setAuth('student', res.token, res.student);
          navigate('/classes');
        } else {
          const res = await classroomApi.studentRegister({ name, email, password });
          setAuth('student', res.token, res.student);
          setRevealCode(res.recoveryCode);
          setView('recovery-reveal');
        }
      }
    } catch (err) {
      setError(err instanceof ClassroomApiError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitRecovery() {
    setSubmitting(true);
    setError(null);
    try {
      const path = role === 'teacher' ? '/api/auth/teacher/reset-with-recovery-code' : '/api/auth/student/reset-with-recovery-code';
      const res = await classroomApi.post<{
        token: string;
        recoveryCode: string;
        teacher?: { id: string; name: string; email: string };
        student?: { id: string; name: string; email: string };
      }>(path, { email, recoveryCode: recoveryCodeInput.trim(), newPassword });
      const profile = role === 'teacher' ? res.teacher! : res.student!;
      setAuth(role, res.token, profile);
      setRevealCode(res.recoveryCode);
      setView('recovery-reveal');
    } catch (err) {
      setError(err instanceof ClassroomApiError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  if (view === 'recovery-reveal') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-1">Almost there</h1>
          <p className="text-secondary text-sm font-display italic">One thing before you go in.</p>
        </motion.div>
        <RecoveryCodeReveal
          code={revealCode}
          email={email}
          backendUrl={backendUrl}
          onDone={() => navigate('/classes')}
          doneLabel="I've saved it — Continue"
        />
      </div>
    );
  }

  if (view === 'forgot-password') {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-primary mb-1">Reset Password</h1>
          <p className="text-secondary text-sm font-display italic truncate">{backendUrl}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5 mt-6 space-y-3"
        >
          <p className="text-xs text-muted">
            Use the recovery code you saved when you created your account.
          </p>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="ios-input py-2.5 text-sm"
          />
          <input
            value={recoveryCodeInput}
            onChange={(e) => setRecoveryCodeInput(e.target.value)}
            placeholder="Recovery code"
            className="ios-input py-2.5 text-sm font-mono"
          />
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            type="password"
            className="ios-input py-2.5 text-sm"
          />
          {error && (
            <p className="text-xs" style={{ color: 'var(--danger)' }}>
              {error}
            </p>
          )}
          <Button
            onClick={submitRecovery}
            disabled={submitting || !email.trim() || !recoveryCodeInput.trim() || !newPassword.trim()}
            className="w-full"
          >
            <KeyRound size={16} /> Reset Password
          </Button>
          <button
            onClick={() => { setView('form'); setError(null); }}
            className="text-xs text-muted hover:underline cursor-pointer"
            style={{ background: 'transparent', border: 'none' }}
          >
            Back to log in
          </button>
          <p className="text-xs text-muted">
            {role === 'student'
              ? "Lost your recovery code too? Ask your teacher to reset your password from the class roster."
              : "Lost your recovery code too? See the server's README for the recovery script (needs access to the machine it runs on)."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-primary mb-1">Sign In</h1>
        <p className="text-secondary text-sm font-display italic truncate">{backendUrl}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-5 mt-6 space-y-5"
      >
        <div className="seg-control">
          {(['student', 'teacher'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              aria-pressed={role === r}
              className="seg-item"
              style={{ position: 'relative' }}
            >
              {role === r && (
                <motion.span
                  layoutId="classroom-role-seg"
                  className="absolute inset-0 rounded-[10px]"
                  style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-1)', zIndex: 0 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 380 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>
                {r === 'student' ? "I'm a Student" : "I'm the Teacher"}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-4 text-sm">
          <button
            onClick={() => setMode('login')}
            className="cursor-pointer font-semibold"
            style={{
              background: 'transparent',
              border: 'none',
              color: mode === 'login' ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            Log In
          </button>
          <button
            onClick={() => setMode('register')}
            className="cursor-pointer font-semibold"
            style={{
              background: 'transparent',
              border: 'none',
              color: mode === 'register' ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            Create Account
          </button>
        </div>

        {role === 'student' && (
          <div style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--hairline)', overflow: 'hidden' }}>
            <button
              onClick={() => setPrivacyOpen((v) => !v)}
              className="w-full p-3 flex items-center justify-between text-left cursor-pointer"
              style={{ background: 'var(--bg-inset)', border: 'none' }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                <ShieldQuestion size={15} style={{ color: 'var(--accent)' }} />
                What data do I share?
              </span>
              {privacyOpen ? (
                <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
              ) : (
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              )}
            </button>
            <AnimatePresence>
              {privacyOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <ClassroomPrivacyNotice />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="space-y-3">
          {mode === 'register' && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="ios-input py-2.5 text-sm"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="ios-input py-2.5 text-sm"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="ios-input py-2.5 text-sm"
          />
          {mode === 'register' && role === 'teacher' && (
            <input
              value={signupCode}
              onChange={(e) => setSignupCode(e.target.value)}
              placeholder="Invite code (only needed after the first teacher)"
              className="ios-input py-2.5 text-sm"
            />
          )}
        </div>

        {mode === 'login' && (
          <button
            onClick={() => { setView('forgot-password'); setError(null); }}
            className="text-xs text-muted hover:underline cursor-pointer -mt-2"
            style={{ background: 'transparent', border: 'none' }}
          >
            Forgot password?
          </button>
        )}

        {error && (
          <p className="text-xs" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}

        <Button
          onClick={submit}
          disabled={submitting || !email.trim() || !password.trim() || (mode === 'register' && !name.trim())}
          className="w-full"
        >
          <LogIn size={16} /> {mode === 'login' ? 'Log In' : 'Create Account'}
        </Button>
      </motion.div>
    </div>
  );
}
