import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { TrendingUp, TrendingDown } from "lucide-react";

const sizeClasses = {
  small: {
    container: "p-3",
    metric: "text-xl",
    label: "text-xs",
    iconBox: "w-8 h-8",
    iconSize: "w-4 h-4",
  },
  medium: {
    container: "p-5",
    metric: "text-3xl",
    label: "text-sm",
    iconBox: "w-12 h-12",
    iconSize: "w-6 h-6",
  },
  large: {
    container: "p-6",
    metric: "text-4xl",
    label: "text-base",
    iconBox: "w-16 h-16",
    iconSize: "w-8 h-8",
  },
};

export default function KPICard({
  icon,
  metric,
  label,
  trend,
  iconBgColor = "bg-emerald-100",
  loading = false,
  variant = "medium",
  animate = false,
}) {
  const [displayValue, setDisplayValue] = useState(metric);


  useEffect(() => {
    if (!animate || loading) return;

    let start = 0;
    const end = Number(metric);
    const duration = 900;
    const startTime = performance.now();

    function animateNumber(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.floor(progress * end);
      setDisplayValue(value);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    }

    requestAnimationFrame(animateNumber);
  }, [metric, animate, loading]);

  const size = sizeClasses[variant];
  const shownValue = !animate || loading ? metric : displayValue;


  if (loading) {
    return (
      <div
        className={`bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse ${size.container}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`${size.iconBox} bg-slate-200 rounded-lg`}></div>
          <div className="w-16 h-4 bg-slate-200 rounded"></div>
        </div>
        <div className={`h-6 bg-slate-200 rounded mb-2`}></div>
        <div className={`h-4 bg-slate-200 rounded`}></div>
      </div>
    );
  }


  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow ${size.container}`}
    >
      <div className="flex items-start justify-between mb-4">
        {/* Icon box */}
        <div
          className={`${size.iconBox} ${iconBgColor} rounded-lg flex items-center justify-center`}
        >
          {icon}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              trend.direction === "up"
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>

      {/* Metric */}
      <div className={`${size.metric} font-bold text-slate-900 mb-1`}>
        {shownValue}
      </div>

      {/* Label */}
      <div className={`${size.label} text-slate-600`}>{label}</div>
    </div>
  );
}

KPICard.propTypes = {
  icon: PropTypes.node.isRequired,
  metric: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  label: PropTypes.string.isRequired,
  trend: PropTypes.shape({
    direction: PropTypes.oneOf(["up", "down"]),
    value: PropTypes.string,
  }),
  iconBgColor: PropTypes.string,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(["small", "medium", "large"]),
  animate: PropTypes.bool,
};
