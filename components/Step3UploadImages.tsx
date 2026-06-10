"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { SignatureData } from "./Step2ConfirmInfo";

interface ImageResult {
  rawUrl: string;
  filename: string;
}

interface Props {
  data: SignatureData;
  screenshotPreview: string;
  onNext: (imageUrls: string[]) => void;
  onBack: () => void;
}

function ImageCard({
  img,
  index,
  screenshotPreview,
  onUploaded,
}: {
  img: SignatureData["images"][0];
  index: number;
  screenshotPreview: string;
  onUploaded: (url: string) => void;
}) {
  const [cropDataUrl, setCropDataUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!img.bbox || !screenshotPreview) return;
    const { x, y, w, h } = img.bbox;
    const htmlImg = new window.Image();
    htmlImg.onload = () => {
      const sx = Math.round(Math.max(0, x) * htmlImg.naturalWidth);
      const sy = Math.round(Math.max(0, y) * htmlImg.naturalHeight);
      const sw = Math.round(Math.min(w, 1 - x) * htmlImg.naturalWidth);
      const sh = Math.round(Math.min(h, 1 - y) * htmlImg.naturalHeight);
      if (sw <= 0 || sh <= 0) return;
      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(htmlImg, sx, sy, sw, sh, 0, 0, sw, sh);
        setCropDataUrl(canvas.toDataURL());
      }
    };
    htmlImg.src = screenshotPreview;
  }, [img.bbox, screenshotPreview]);
  const [result, setResult] = useState<ImageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setLocalPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload failed");
        setResult(data);
        onUploaded(data.rawUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setLocalPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-[#8B1A1A] text-white text-xs font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <span className="text-sm font-medium text-gray-700">{img.description}</span>
        <span className="ml-auto text-xs text-gray-400">{img.position}</span>
      </div>

      <div className="p-4 flex gap-4">
        {/* Screenshot region */}
        <div className="shrink-0 w-24 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 relative">
          {cropDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cropDataUrl} alt="image region" className="w-full h-full object-contain" />
          ) : img.bbox ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-gray-200 border-t-[#8B1A1A] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={screenshotPreview} alt="signature region" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-white/40" />
              <p className="absolute inset-0 flex items-center justify-center text-center text-xs text-gray-500 p-1 leading-tight">
                Reference from screenshot
              </p>
            </>
          )}
        </div>

        {/* Upload zone */}
        <div className="flex-1">
          {result ? (
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-800">Uploaded!</p>
                {localPreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={localPreview} alt="uploaded" className="mt-1 h-10 object-contain rounded" />
                )}
              </div>
              <button
                onClick={() => { setResult(null); setLocalPreview(null); }}
                className="ml-auto text-xs text-green-600 underline shrink-0"
              >
                Replace
              </button>
            </div>
          ) : (
            <div
              onClick={() => !uploading && inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                ${uploading ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "border-gray-300 hover:border-[#8B1A1A] hover:bg-red-50"}`}
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4 text-[#8B1A1A]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="text-sm text-gray-500">Uploading to GitHub...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Click or drag image here<br />
                  <span className="text-xs text-gray-400">PNG, JPG, SVG</span>
                </p>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Step3UploadImages({ data, screenshotPreview, onNext, onBack }: Props) {
  const [uploadedUrls, setUploadedUrls] = useState<(string | null)[]>(
    () => data.images.map(() => null)
  );

  const handleUploaded = (index: number, url: string) => {
    setUploadedUrls((prev) => {
      const next = [...prev];
      next[index] = url;
      return next;
    });
  };

  const allUploaded = uploadedUrls.every((u) => u !== null);

  const handleNext = () => {
    const urls = uploadedUrls.filter(Boolean) as string[];
    onNext(urls);
  };

  if (data.images.length === 0) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Images Detected</h2>
          <p className="text-gray-500">
            Claude didn&apos;t find any images in your signature. You can proceed to build your text-only signature.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            ← Back
          </button>
          <button onClick={() => onNext([])} className="flex-grow-[2] py-3 px-6 bg-[#8B1A1A] hover:bg-[#6d1414] text-white font-semibold rounded-xl transition-colors">
            Build My Signature →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Images</h2>
        <p className="text-gray-500">
          Upload each image or logo from your signature. We found{" "}
          <strong>{data.images.length}</strong> image{data.images.length !== 1 ? "s" : ""}. They&apos;ll be hosted on GitHub so Asana won&apos;t treat them as attachments.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        {data.images.map((img, i) => (
          <ImageCard
            key={img.id}
            img={img}
            index={i}
            screenshotPreview={screenshotPreview}
            onUploaded={(url) => handleUploaded(i, url)}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleNext}
          disabled={!allUploaded}
          className="flex-grow-[2] py-3 px-6 bg-[#8B1A1A] hover:bg-[#6d1414] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
        >
          {allUploaded
            ? "Build My Signature →"
            : `Waiting for ${uploadedUrls.filter((u) => !u).length} more image${uploadedUrls.filter((u) => !u).length !== 1 ? "s" : ""}...`}
        </button>
      </div>
    </div>
  );
}
