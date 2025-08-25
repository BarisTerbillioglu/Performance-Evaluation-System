import React from 'react';

interface PerformanceData {
  period: string;
  score: number;
  date: string;
}

interface PerformanceTrendChartProps {
  data: PerformanceData[];
  width?: number;
  height?: number;
}

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  data,
  width = 200,
  height = 48
}) => {
  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded text-gray-400 text-xs"
        style={{ width, height }}
      >
        No data
      </div>
    );
  }

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Get min and max scores for scaling
  const scores = sortedData.map(d => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const scoreRange = maxScore - minScore || 1; // Avoid division by zero

  // Calculate points for the line
  const points = sortedData.map((point, index) => {
    const x = (index / (sortedData.length - 1)) * (width - 20) + 10;
    const y = height - 10 - ((point.score - minScore) / scoreRange) * (height - 20);
    return `${x},${y}`;
  }).join(' ');

  // Create gradient for the line
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="relative">
      <svg
        width={width}
        height={height}
        className="overflow-visible"
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Background grid lines */}
        <g className="text-gray-200">
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = height - 10 - ((tick - minScore) / scoreRange) * (height - 20);
            return (
              <line
                key={tick}
                x1="10"
                y1={y}
                x2={width - 10}
                y2={y}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.3"
              />
            );
          })}
        </g>

        {/* Area fill */}
        <polygon
          points={`10,${height - 10} ${points} ${width - 10},${height - 10}`}
          fill={`url(#${gradientId})`}
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {sortedData.map((point, index) => {
          const x = (index / (sortedData.length - 1)) * (width - 20) + 10;
          const y = height - 10 - ((point.score - minScore) / scoreRange) * (height - 20);
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="#fbbf24"
              className="transition-all duration-200 hover:r-3"
            />
          );
        })}

        {/* Current score indicator */}
        {sortedData.length > 0 && (
          <g>
            <circle
              cx={(sortedData.length - 1) / (sortedData.length - 1) * (width - 20) + 10}
              cy={height - 10 - ((sortedData[sortedData.length - 1].score - minScore) / scoreRange) * (height - 20)}
              r="4"
              fill="#fbbf24"
              stroke="white"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Score labels */}
      <div className="absolute top-0 left-0 text-xs text-gray-500">
        {maxScore.toFixed(0)}
      </div>
      <div className="absolute bottom-0 left-0 text-xs text-gray-500">
        {minScore.toFixed(0)}
      </div>
    </div>
  );
};
