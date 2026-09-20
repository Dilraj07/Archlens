import React, { useState } from 'react';

export type CompanyName =
  | 'amazon'
  | 'netflix'
  | 'irctc'
  | 'hotstar'
  | 'discord'
  | 'cloudflare'
  | 'redis'
  | 'kafka'
  | 'uber'
  | 'airbnb'
  | 'linkedin'
  | 'github'
  | 'stripe'
  | 'youtube'
  | 'twitter'
  | 'x';

const LOGO_MAP: Record<CompanyName, string> = {
  amazon: '/logos/amazon.svg',
  netflix: '/logos/netflix.svg',
  irctc: '/logos/irctc.svg',
  hotstar: '/logos/hotstar.svg',
  discord: '/logos/discord.svg',
  cloudflare: '/logos/cloudflare.svg',
  redis: '/logos/redis.svg',
  kafka: '/logos/kafka.svg',
  uber: '/logos/uber.svg',
  airbnb: '/logos/airbnb.svg',
  linkedin: '/logos/linkedin.svg',
  github: '/logos/github.svg',
  stripe: '/logos/stripe.svg',
  youtube: '/logos/youtube.svg',
  twitter: '/logos/x.svg',
  x: '/logos/x.svg',
};

export function detectCompany(text: string): CompanyName | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes('amazon') || lower.includes('aws') || lower.includes('dynamodb') || lower.includes('s3')) return 'amazon';
  if (lower.includes('netflix') || lower.includes('zuul') || lower.includes('open connect')) return 'netflix';
  if (lower.includes('irctc') || lower.includes('tatkal') || lower.includes('railway')) return 'irctc';
  if (lower.includes('hotstar') || lower.includes('cricket')) return 'hotstar';
  if (lower.includes('discord')) return 'discord';
  if (lower.includes('cloudflare')) return 'cloudflare';
  if (lower.includes('redis')) return 'redis';
  if (lower.includes('kafka')) return 'kafka';
  if (lower.includes('uber')) return 'uber';
  if (lower.includes('airbnb')) return 'airbnb';
  if (lower.includes('linkedin')) return 'linkedin';
  if (lower.includes('github')) return 'github';
  if (lower.includes('stripe')) return 'stripe';
  if (lower.includes('youtube')) return 'youtube';
  if (lower.includes('twitter') || lower.includes(' x ')) return 'twitter';
  return null;
}

interface CompanyLogoProps {
  name: CompanyName | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name,
  size = 'md',
  className = '',
  title,
}) => {
  const [hasError, setHasError] = useState(false);
  const detected = detectCompany(name);
  const key = (detected || name.toLowerCase().trim()) as CompanyName;
  const logoSrc = LOGO_MAP[key];

  if (!logoSrc || hasError) {
    return null;
  }

  let sizeClasses = 'w-6 h-6';
  if (size === 'xs') sizeClasses = 'w-4 h-4';
  if (size === 'sm') sizeClasses = 'w-5 h-5';
  if (size === 'md') sizeClasses = 'w-6 h-6';
  if (size === 'lg') sizeClasses = 'w-8 h-8';
  if (size === 'xl') sizeClasses = 'w-10 h-10';

  const defaultTitle = title || (typeof name === 'string' ? name : key);

  return (
    <img
      src={logoSrc}
      alt={defaultTitle}
      title={defaultTitle}
      onError={() => setHasError(true)}
      className={`inline-block object-contain shrink-0 select-none ${sizeClasses} ${className}`}
      loading="lazy"
    />
  );
};
