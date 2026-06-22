export default function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl text-slate-950 dark:text-white md:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  );
}
