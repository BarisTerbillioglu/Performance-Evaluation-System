import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/design-system';

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  icon,
  to,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
}) => {
  const buttonContent = (
    <>
      <span className="mr-2">{icon}</span>
      {label}
    </>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block">
        <Button
          variant={variant}
          size={size}
          disabled={disabled}
          loading={loading}
          className={className}
        >
          {buttonContent}
        </Button>
      </Link>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      className={className}
    >
      {buttonContent}
    </Button>
  );
};
