import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { useClassroomStore } from '../../stores/classroomStore';
import { classroomApi, ClassroomApiError } from '../../services/classroom';
import { Button } from '../../components/ui/Button';

type Role = 'teacher' | 'student';
type Mode = 'login' | 'register';

export function ClassroomAuth() {
  const navigate = useNavigate();
  const { backendUrl, certTrusted, setAuth } = useClassroomStore();

  const [role, setRole] = useState<Role>('student');
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupCode, setSignupCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!backendUrl || !certTrusted) {
    return <Navigate to="/classes/connect" replace />;
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      if (role === 'teacher') {
        const res =
          mode === 'login'
            ? await classroomApi.teacherLogin({ email, password })
            : await classroomApi.teacherRegister({ name, email, password, signupCode: signupCode || undefined });
        setAuth('teacher', res.token, res.teacher);
      } else {
        const res =
          mode === 'login'
            ? await classroomApi.studentLogin({ email, password })
            : await classroomApi.studentRegister({ name, email, password });
        setAuth('student', res.token, res.student);
      }
      navigate('/classes');
    } catch (err) {
      setError(err instanceof ClassroomApiError ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
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
