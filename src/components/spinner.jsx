const Spinner = ({ size = "md", label = "Loading movies..." }) => {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-[3px]",
    lg: "w-16 h-16 border-4",
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-xl animate-pulse" />

        {/* Spinner ring */}
        <div
          className={`${sizeClasses[size]} relative rounded-full
                      border-white/10
                      border-t-blue-400
                      border-r-fuchsia-400
                      animate-spin`}
          style={{ animationDuration: "0.8s" }}
        />
      </div>

      {label && (
        <p className="text-sm text-slate-400 tracking-wide animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};

export default Spinner;