import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, ShieldQuestion, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';
import { Tabs } from '../../components/ui/Controls';
import { Wordmark } from '../../components/ui/Signage';
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
      <div className="page page--form">
        <div className="mb-6 flex justify-center">
          <Wordmark size="lg" />
        </div>
        <h1 className="h-page text-center">Almost there</h1>
        <div className="sheet p-6">
          <RecoveryCodeReveal
            code={revealCode}
            email={email}
            backendUrl={backendUrl}
            onDone={() => navigate('/classes')}
            doneLabel="I've saved it — Continue"
          />
        </div>
      </div>
    );
  }

  if (view === 'forgot-password') {
    return (
      <div className="page page--form">
        <div className="mb-6 flex justify-center">
          <Wordmark size="lg" />
        </div>
        <h1 className="h-page text-center">Reset Password</h1>
        <div className="sheet p-6 space-y-5">
          <p className="t-small">
            Use the recovery code you saved when you created your account.
          </p>
          <div className="field">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
          </div>
          <div className="field">
            <input
              value={recoveryCodeInput}
              onChange={(e) => setRecoveryCodeInput(e.target.value)}
              placeholder="Recovery code"
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
          {error && (
            <p className="t-small text-signal-text" role="alert">
              {error}
            </p>
          )}
          <Button
            onClick={submitRecovery}
            disabled={submitting || !email.trim() || !recoveryCodeInput.trim() || !newPassword.trim()}
            variant="primary"
            block
          >
            <KeyRound size={16} /> Reset Password
          </Button>
          <button
            onClick={() => { setView('form'); setError(null); }}
            className="btn btn--quiet btn--sm self-start"
          >
            Back to log in
          </button>
          <p className="t-small text-ink-3">
            {role === 'student'
              ? "Lost your recovery code too? Ask your teacher to reset your password from the class roster."
              : "Lost your recovery code too? See the server's README for the recovery script (needs access to the machine it runs on)."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page page--form">
      <div className="mb-6 flex justify-center">
        <Wordmark size="lg" />
      </div>
      <h1 className="h-page text-center">Sign In</h1>

      <div className="sheet p-6 space-y-5">
        <div className="flex gap-3">
          <Button
            onClick={() => setRole('student')}
            aria-pressed={role === 'student'}
            variant="secondary"
            className={role === 'student' ? 'shadow-[inset_0_0_0_2px_var(--enamel-text)]' : ''}
          >
            I'm a Student
          </Button>
          <Button
            onClick={() => setRole('teacher')}
            aria-pressed={role === 'teacher'}
            variant="secondary"
            className={role === 'teacher' ? 'shadow-[inset_0_0_0_2px_var(--enamel-text)]' : ''}
          >
            I'm the Teacher
          </Button>
        </div>

        <Tabs
          items={[
            { value: 'login' as const, label: 'Log In' },
            { value: 'register' as const, label: 'Create Account' }
          ]}
          value={mode}
          onChange={setMode}
          label="Account"
        />

        {role === 'student' && (
          <div className="rounded-control border border-rule-strong overflow-hidden">
            <button
              onClick={() => setPrivacyOpen((v) => !v)}
              className="w-full p-3 flex items-center justify-between text-left cursor-pointer bg-inset"
            >
              <span className="flex items-center gap-2 t-small font-semibold text-ink">
                <ShieldQuestion size={16} className="text-enamel-text" />
                What data do I share?
              </span>
              {privacyOpen ? (
                <ChevronUp size={16} className="text-ink-3" />
              ) : (
                <ChevronDown size={16} className="text-ink-3" />
              )}
            </button>
            {privacyOpen && (
              <div className="border-t border-rule-strong p-4 bg-sheet">
                <ClassroomPrivacyNotice />
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {mode === 'register' && (
            <div className="field">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
            </div>
          )}
          <div className="field">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
          </div>
          <div className="field">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              type="password"
            />
          </div>
          {mode === 'register' && role === 'teacher' && (
            <div className="field">
              <input
                value={signupCode}
                onChange={(e) => setSignupCode(e.target.value)}
                placeholder="Invite code (only needed after the first teacher)"
              />
            </div>
          )}
        </div>

        {mode === 'login' && (
          <button
            onClick={() => { setView('forgot-password'); setError(null); }}
            className="btn btn--quiet btn--sm self-start"
          >
            Forgot password?
          </button>
        )}

        {error && (
          <p className="t-small text-signal-text" role="alert">
            {error}
          </p>
        )}

        <Button
          onClick={submit}
          disabled={submitting || !email.trim() || !password.trim() || (mode === 'register' && !name.trim())}
          variant="primary"
          block
        >
          <LogIn size={16} /> {mode === 'login' ? 'Log In' : 'Create Account'}
        </Button>
      </div>
    </div>
  );
}
