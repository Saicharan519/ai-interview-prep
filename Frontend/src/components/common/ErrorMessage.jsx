export default function ErrorMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-xl border border-red-800 bg-red-950 p-4">
      <div className="flex items-start gap-3 text-sm text-red-400">
        <span aria-hidden="true">!</span>
        <p>{message}</p>
      </div>
    </div>
  );
}
