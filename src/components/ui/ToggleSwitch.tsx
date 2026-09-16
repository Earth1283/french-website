import { motion } from 'framer-motion';

export function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative w-[51px] h-[31px] rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer"
      style={{
        backgroundColor: checked ? 'var(--success)' : 'var(--bg-inset)',
        border: 'none',
        boxShadow: checked ? 'none' : 'inset 0 0 0 1px var(--hairline)',
      }}
    >
      <motion.span
        className="absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full"
        style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2), 0 0.5px 1px rgba(0,0,0,0.1)' }}
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 420 }}
      />
    </button>
  );
}
