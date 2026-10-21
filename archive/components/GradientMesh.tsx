'use client';

export default function GradientMesh({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* UCI Blue orb */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, #0064a4 0%, transparent 70%)',
          top: '10%',
          left: '15%',
          animation: 'drift-1 20s ease-in-out infinite',
        }}
      />
      {/* UCI Gold orb */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, #ffd200 0%, transparent 70%)',
          top: '40%',
          right: '10%',
          animation: 'drift-2 25s ease-in-out infinite',
        }}
      />
      {/* EECS Teal orb */}
      <div
        className="absolute w-[550px] h-[550px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, #528188 0%, transparent 70%)',
          bottom: '5%',
          left: '40%',
          animation: 'drift-3 22s ease-in-out infinite',
        }}
      />
    </div>
  );
}
