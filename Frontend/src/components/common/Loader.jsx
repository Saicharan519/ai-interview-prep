const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-16 w-16 border-4',
};

export default function Loader({ size = 'md', fullScreen = false }) {
  const spinner = (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} animate-spin rounded-full border-[#e91e63] border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111111]">
        {spinner}
      </div>
    );
  }

  return spinner;
}
