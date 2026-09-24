'use client';

import { useId, type CSSProperties, type ReactNode } from 'react';

/** Integer stepper with explicit bounds. */
export function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const set = (v: number) => onChange(Math.min(max, Math.max(min, Math.round(v))));
  return (
    <div className="inline-flex items-center rounded-md border border-line-strong" role="group" aria-labelledby={id}>
      <span id={id} className="sr-only">
        {label}
      </span>
      <button type="button" className="h-10 w-8 font-mono text-ink-2 transition-colors hover:text-ink disabled:opacity-35" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => set(value - 1)}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) set(v);
        }}
        className="h-10 w-9 border-x border-line bg-transparent text-center font-mono text-sm text-ink [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className="h-10 w-8 font-mono text-ink-2 transition-colors hover:text-ink disabled:opacity-35" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => set(value + 1)}>
        +
      </button>
    </div>
  );
}

/** Range slider with a label row and a live value. `accent` paints the filled track and thumb gold. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  accent = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
  accent?: boolean;
}) {
  const id = useId();
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={id} className="field-label mb-0 flex items-baseline justify-between">
        <span>{label}</span>
        <span className={`normal-case tracking-normal text-[12px] ${accent ? 'text-marker-ink' : 'text-ink'}`}>{format(value)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`range ${accent ? 'range-accent' : ''}`}
        style={{ '--fill': `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

/** Segmented single-choice control built on radio semantics. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="field-label mb-2.5">{label}</legend>
      <div className="flex gap-[3px] rounded-lg border border-line bg-bg-raised p-[3px]">
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <label
              key={option.value}
              className={`relative flex min-h-9 flex-1 cursor-pointer items-center justify-center rounded-md px-2.5 font-mono text-[11px] transition-colors [font-stretch:87.5%] ${
                checked ? 'bg-surface-2 text-ink shadow-[inset_0_0_0_1px_var(--line)]' : 'text-ink-3 hover:text-ink'
              }`}
            >
              <input type="radio" name={name} value={option.value} checked={checked} onChange={() => onChange(option.value)} className="sr-only" />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** One instrument readout cell. */
export function Readout({
  label,
  value,
  unit,
  note,
  tone = 'ink',
  large = false,
}: {
  label: string;
  value: string;
  unit?: string;
  note?: string;
  tone?: 'ink' | 'good' | 'warn' | 'accent' | 'alert';
  large?: boolean;
}) {
  const toneClass = { ink: 'text-ink', good: 'text-trace-2', warn: 'text-marker-ink', accent: 'text-accent-ink', alert: 'text-alert' }[tone];
  return (
    <div className="flex flex-col gap-1.5">
      <span className="kicker text-[10.5px]">{label}</span>
      {/* In a narrow cell the unit wraps under the number instead of being clipped. */}
      <span className={`readout flex flex-wrap items-baseline gap-x-1.5 gap-y-1 ${large ? 'text-[2.1rem]' : 'text-[1.45rem]'} leading-none ${toneClass}`} aria-live="polite">
        <span>{value}</span>
        {unit && <span className="whitespace-nowrap text-[0.55em] text-ink-2">{unit}</span>}
      </span>
      {note && <span className="text-[12px] leading-snug text-ink-3">{note}</span>}
    </div>
  );
}
