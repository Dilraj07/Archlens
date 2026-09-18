import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-mint' | 'outline-uv' | 'hazard-red';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const VergeButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  let baseStyles =
    'inline-flex items-center justify-center font-mono uppercase transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none tracking-verge-mono select-none';

  let sizeStyles = 'px-6 py-2.5 text-xs';
  if (size === 'sm') sizeStyles = 'px-4 py-1.5 text-[11px]';
  if (size === 'lg') sizeStyles = 'px-8 py-3.5 text-sm font-bold';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-[#3cffd0] text-black rounded-24px font-bold hover:bg-white hover:ring-2 hover:ring-[#3cffd0]/50';
      break;
    case 'secondary':
      variantStyles =
        'bg-[#2d2d2d] text-[#e9e9e9] rounded-24px hover:bg-white hover:text-black border border-[#313131]';
      break;
    case 'outline-mint':
      variantStyles =
        'bg-transparent text-[#3cffd0] border border-[#3cffd0] rounded-40px hover:bg-[#3cffd0] hover:text-black';
      break;
    case 'outline-uv':
      variantStyles =
        'bg-transparent text-white border border-[#5200ff] rounded-30px hover:bg-[#5200ff] hover:text-white';
      break;
    case 'hazard-red':
      variantStyles =
        'bg-[#ff3366] text-white rounded-24px font-bold hover:bg-white hover:text-[#ff3366]';
      break;
  }

  return (
    <button className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface CardProps {
  variant?: 'dark' | 'mint-tile' | 'uv-tile' | 'slate';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const VergeCard: React.FC<CardProps> = ({
  variant = 'dark',
  className = '',
  children,
  onClick,
}) => {
  let cardStyles = 'rounded-20px p-5 transition-colors duration-150 relative';

  switch (variant) {
    case 'dark':
      cardStyles += ' bg-[#131313] border border-[#313131] hover:border-white text-white';
      break;
    case 'slate':
      cardStyles += ' bg-[#2d2d2d] border border-[#313131] text-white';
      break;
    case 'mint-tile':
      cardStyles += ' bg-[#3cffd0] text-black font-medium';
      break;
    case 'uv-tile':
      cardStyles += ' bg-[#5200ff]/90 border border-[#5200ff] text-white';
      break;
  }

  return (
    <div className={`${cardStyles} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};

interface BadgeProps {
  variant?: 'mint' | 'uv' | 'slate' | 'verified' | 'fallback' | 'red' | 'amber';
  children: React.ReactNode;
  className?: string;
}

export const VergeBadge: React.FC<BadgeProps> = ({
  variant = 'slate',
  children,
  className = '',
}) => {
  let badgeStyles =
    'inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-verge-nano px-2.5 py-0.5 rounded-20px font-medium';

  switch (variant) {
    case 'mint':
      badgeStyles += ' bg-[#3cffd0] text-black font-bold';
      break;
    case 'uv':
      badgeStyles += ' bg-[#5200ff] text-white';
      break;
    case 'slate':
      badgeStyles += ' bg-[#2d2d2d] text-[#949494] border border-[#313131]';
      break;
    case 'verified':
      badgeStyles += ' bg-black/60 text-[#3cffd0] border border-[#3cffd0]';
      break;
    case 'fallback':
      badgeStyles += ' bg-black/60 text-[#949494] border border-[#313131]';
      break;
    case 'red':
      badgeStyles += ' bg-[#ff3366] text-white font-bold';
      break;
    case 'amber':
      badgeStyles += ' bg-[#ffb703] text-black font-bold';
      break;
  }

  return <span className={`${badgeStyles} ${className}`}>{children}</span>;
};
