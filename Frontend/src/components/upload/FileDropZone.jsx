import { useRef, useState } from 'react';

const allowedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export default function FileDropZone({ onFileSelect, selectedFile, disabled }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  function validateFile(file) {
    if (!file) {
      return null;
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF or DOCX files are allowed';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'File must be 5MB or smaller';
    }

    return null;
  }

  function handleFile(file) {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      onFileSelect(null);
      return;
    }

    setError(null);
    onFileSelect(file);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    handleFile(event.dataTransfer.files?.[0]);
  }

  function handleClick() {
    if (!disabled) {
      inputRef.current?.click();
    }
  }

  function removeFile(event) {
    event.stopPropagation();
    setError(null);
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={disabled}
        className={`w-full rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-[#e91e63] bg-[#e91e63]/5'
            : 'border-[#2a2a2a] hover:border-[#e91e63]/50'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          hidden
          disabled={disabled}
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/10 text-xl text-[#22c55e]">
              ✓
            </span>
            <div>
              <p className="break-all text-sm font-semibold text-white">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <span
              role="button"
              tabIndex={0}
              onClick={removeFile}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  removeFile(event);
                }
              }}
              className="rounded-lg border border-[#2a2a2a] px-3 py-1 text-xs text-[#9ca3af] hover:border-[#ef4444]/50 hover:text-[#ef4444]"
            >
              Remove
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e91e63]/10 text-2xl text-[#e91e63]">
              ↑
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Click to upload or drag & drop
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">
                PDF or DOCX (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </button>

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}
    </div>
  );
}
