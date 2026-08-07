import useCountUp from '../hooks/useCountUp';

/** Animated statistic counter — premium black style. */
export default function StatCounter({ value, label, icon: Icon }) {
  const { ref, value: count } = useCountUp(value);

  return (
    <div
      ref={ref}
      className="card group flex flex-col items-center gap-2 px-6 py-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/40 hover:shadow-lg hover:shadow-white/5"
    >
      <span className="icon-chip">
        {Icon && <Icon size={22} />}
      </span>
      <span className="font-display text-3xl font-bold sm:text-4xl">
        {count}
        <span className="text-muted">+</span>
      </span>
      <span className="text-xs font-medium uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}
