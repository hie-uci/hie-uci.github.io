'use client';

import { useState, type ReactNode } from 'react';
import { RFModelBadge } from '@/components/RFModelBadge';
import { rfCategories, toolHref, type RFTool } from '@/data/rfTools';

interface ToolModuleProps {
  tool: RFTool;
  /** Position within its category, 1-based. */
  position: number;
  count: number;
  children: ReactNode;
}

function CopyLink({ tool }: { tool: RFTool }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => {
    const url = new URL(toolHref(tool), window.location.origin).toString();
    try {
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      // Clipboard access can be refused (permissions, insecure context); say so instead of pretending.
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 1800);
  };
  const label = state === 'copied' ? 'Link copied' : state === 'failed' ? 'Copy failed' : 'Copy link';
  return (
    <button type="button" onClick={copy} className="btn-icon h-10 px-3 font-mono text-[11px] [font-stretch:87.5%]" aria-live="polite">
      {label}
    </button>
  );
}

/**
 * The instrument frame every calculator sits in: category and index, the tool's
 * name, its model badge and assumptions, a deep link, then the calculator body.
 * The module a URL points at (#tool-id) lights its corner ticks.
 */
export default function ToolModule({ tool, position, count, children }: ToolModuleProps) {
  const category = rfCategories.find((c) => c.id === tool.category);
  return (
    <section
      id={tool.id}
      aria-labelledby={`${tool.id}-title`}
      className="tool-module ticks scroll-mt-36 rounded-[4px] border border-line bg-surface"
    >
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-7">
        <div className="min-w-0 max-w-3xl">
          <p className="kicker text-[10.5px]">
            {category?.name} · {String(position).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <h2 id={`${tool.id}-title`} className="text-[1.6rem] font-bold leading-tight tracking-[-0.02em] [font-stretch:108%]">
              {tool.name}
            </h2>
            <RFModelBadge level={tool.model} detail={tool.modelDetail} />
            {tool.stage && (
              <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-marker-ink/50 px-2 py-1 font-mono text-[10px] uppercase leading-none tracking-[0.12em] text-marker-ink [font-stretch:87.5%]">
                {tool.stage === '3d' ? '3D stage' : 'Live plot'}
              </span>
            )}
          </div>
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-3">{tool.modelDetail}</p>
        </div>
        <CopyLink tool={tool} />
      </header>
      <div className="px-5 py-6 sm:px-7 sm:py-7">{children}</div>
    </section>
  );
}
