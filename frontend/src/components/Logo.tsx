interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0284c7', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="50" cy="50" r="45" fill="white"/>
      <circle cx="50" cy="50" r="44" fill="none" stroke="url(#logoGrad)" strokeWidth="2"/>
      
      {/* Network nodes */}
      <g fill="url(#logoGrad)">
        {/* Central node */}
        <circle cx="50" cy="50" r="7"/>
        
        {/* Outer nodes */}
        <circle cx="50" cy="27" r="4.5"/>
        <circle cx="73" cy="50" r="4.5"/>
        <circle cx="50" cy="73" r="4.5"/>
        <circle cx="27" cy="50" r="4.5"/>
        
        {/* Corner nodes */}
        <circle cx="33" cy="33" r="3.5"/>
        <circle cx="67" cy="33" r="3.5"/>
        <circle cx="67" cy="67" r="3.5"/>
        <circle cx="33" cy="67" r="3.5"/>
      </g>
      
      {/* Connection lines */}
      <g fill="none" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
        <line x1="50" y1="43" x2="50" y2="32"/>
        <line x1="57" y1="50" x2="68" y2="50"/>
        <line x1="50" y1="57" x2="50" y2="68"/>
        <line x1="43" y1="50" x2="32" y2="50"/>
        <line x1="45" y1="45" x2="37" y2="37"/>
        <line x1="55" y1="45" x2="63" y2="37"/>
        <line x1="55" y1="55" x2="63" y2="63"/>
        <line x1="45" y1="55" x2="37" y2="63"/>
      </g>
    </svg>
  );
}

export function LogoWithText({ size = 32, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Logo size={size} />
      <span className="text-lg font-bold text-slate-900 tracking-tight">
        RareNet
      </span>
    </div>
  );
}

