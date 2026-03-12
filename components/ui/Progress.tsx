interface ProgressProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  color?: 'warm' | 'blue' | 'gold' | 'green';
}

export default function Progress({
  value,
  label = '进度',
  size = 'md',
  showPercentage = true,
  color = 'warm',
}: ProgressProps) {
  const getColorClasses = () => {
    const colors = {
      warm: 'bg-gradient-warm',
      blue: 'bg-lumen-blue',
      gold: 'bg-lumen-accent-gold',
      green: 'bg-green-500',
    };
    return colors[color];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: {
        bar: 'h-2',
        percentage: 'text-base',
        label: 'text-xs',
      },
      md: {
        bar: 'h-3',
        percentage: 'text-2xl',
        label: 'text-xs',
      },
      lg: {
        bar: 'h-4',
        percentage: 'text-3xl',
        label: 'text-sm',
      },
    };
    return sizes[size];
  };

  const sizeClasses = getSizeClasses();

  // Determine color based on progress level if warm gradient
  const getColorByProgress = () => {
    if (color !== 'warm') return getColorClasses();
    if (value >= 75) return 'bg-green-500';
    if (value >= 50) return 'bg-lumen-accent-gold';
    if (value >= 25) return 'bg-lumen-blue';
    return 'bg-lumen-gray-inactive';
  };

  const barColor = getColorByProgress();

  return (
    <div className="w-full">
      {/* Header with label and percentage */}
      <div className="flex justify-between items-baseline mb-3">
        <span className={`${sizeClasses.label} uppercase tracking-widest text-lumen-text-tertiary font-semibold`}>
          {label}
        </span>
        {showPercentage && (
          <span className={`${sizeClasses.percentage} font-bold text-lumen-text-primary tracking-tight`}>
            {value}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className={`w-full ${sizeClasses.bar} bg-lumen-bg-system rounded-full overflow-hidden shadow-inner`}>
        <div
          className={`h-full ${barColor} transition-all duration-700 ease-out rounded-full relative overflow-hidden`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
        </div>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs text-lumen-text-tertiary">0%</span>
        <span className="text-xs text-lumen-text-tertiary">50%</span>
        <span className="text-xs text-lumen-text-tertiary">100%</span>
      </div>
    </div>
  );
}
