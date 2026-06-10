"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onNext: (file: File, preview: string) => void;
}

export default function Step1Upload({ onNext }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onDragLeave = () => setDragging(false);

  const handleNext = () => {
    if (!file || !preview) return;
    setLoading(true);
    onNext(file, preview);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Your Current Signature
        </h2>
        <p className="text-gray-500">
          Take a screenshot of your current Outlook email signature and upload
          it here. We&apos;ll read all the information automatically.
        </p>
      </div>

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
            ${dragging ? "border-[#8B1A1A] bg-red-50" : "border-gray-300 hover:border-[#8B1A1A] hover:bg-red-50"}`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Click to upload or drag &amp; drop
              </p>
              <p className="text-sm text-gray-400 mt-1">PNG or JPG accepted</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Preview</span>
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Remove
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Signature preview" className="w-full object-contain max-h-64 p-4" />
          </div>

          <button
            onClick={handleNext}
            disabled={loading}
            className="w-full py-3 px-6 bg-[#8B1A1A] hover:bg-[#6d1414] disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Reading your signature...
              </span>
            ) : "Read My Signature →"}
          </button>
        </div>
      )}
    </div>
  );
}
