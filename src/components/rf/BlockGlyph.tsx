export type BlockKind = 'LNA' | 'Filter' | 'Mixer' | 'PA' | 'Attenuator';

/** Schematic symbol for one cascade block, drawn on a 32 × 20 grid in currentColor. */
export function BlockGlyph({ kind, className = '' }: { kind: BlockKind; className?: string }) {
  return (
    <svg viewBox="0 0 32 20" className={`h-5 w-8 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'LNA' || kind === 'PA' ? (
        <>
          <path d="M0 10h7M25 10h7" />
          <path d="M7 2.5 25 10 7 17.5Z" fill={kind === 'PA' ? 'currentColor' : 'none'} fillOpacity={0.22} />
        </>
      ) : kind === 'Mixer' ? (
        <>
          <path d="M0 10h9M23 10h9" />
          <circle cx="16" cy="10" r="7" />
          <path d="m11.05 5.05 9.9 9.9m0-9.9-9.9 9.9" />
        </>
      ) : (
        <>
          <path d="M0 10h7M25 10h7" />
          <rect x="7" y="2.5" width="18" height="15" rx="1.5" />
          {kind === 'Filter' ? (
            <path d="M10 10q1.5-3.2 3 0t3 0 3 0 3 0" />
          ) : (
            <path d="m9 10 1.25-3 2.5 6 2.5-6 2.5 6 2.5-6 2.5 6 1.25-3" />
          )}
        </>
      )}
    </svg>
  );
}
