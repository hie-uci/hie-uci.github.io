// Server-safe half of the motion preference: constants and the boot script.
// The React hook lives in useMotionMode.ts because it needs a client module.

export type MotionMode = 'full' | 'reduced';

export const MOTION_STORAGE_KEY = 'hie-motion';

// Inlined into <head>. It sets <html data-motion> before first paint, from the
// visitor's saved choice or, failing that, from the OS reduced-motion setting.
// Storage can throw (private windows, blocked site data); the media query is the fallback.
export const MOTION_BOOT_SCRIPT = `(function(){var d=document.documentElement,m=null;try{m=localStorage.getItem('${MOTION_STORAGE_KEY}')}catch(e){}if(m!=='full'&&m!=='reduced'){m=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'}d.setAttribute('data-motion',m)})();`;
