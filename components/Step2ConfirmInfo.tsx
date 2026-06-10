"use client";

import { useState } from "react";

export interface SignatureData {
  name: string;
  title: string;
  cell: string;
  office: string;
  email: string;
  website: string;
  disclaimer: string;
  images: { id: string | number; description: string; position: string; bbox?: { x: number; y: number; w: number; h: number } }[];
}

interface Props {
  data: SignatureData;
  onNext: (data: SignatureData) => void;
  onBack: () => void;
}

const FIELDS: { key: keyof Omit<SignatureData, "images">; label: string; multiline?: boolean }[] = [
  { key: "name", label: "Full Name" },
  { key: "title", label: "Job Title" },
  { key: "cell", label: "Cell Phone" },
  { key: "office", label: "Office Phone" },
  { key: "email", label: "Email Address" },
  { key: "website", label: "Website" },
  { key: "disclaimer", label: "Legal Disclaimer", multiline: true },
];

export default function Step2ConfirmInfo({ data, onNext, onBack }: Props) {
  const [form, setForm] = useState<SignatureData>(data);

  const handleChange = (key: keyof Omit<SignatureData, "images">, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirm Your Information
        </h2>
        <p className="text-gray-500">
          We read your signature automatically. Please review and correct
          anything that looks off.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mb-6">
        {FIELDS.map(({ key, label, multiline }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            {multiline ? (
              <textarea
                value={form[key] as string}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent resize-y"
              />
            ) : (
              <input
                type="text"
                value={form[key] as string}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A1A] focus:border-transparent"
              />
            )}
          </div>
        ))}
      </div>

      {form.images.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-blue-800 mb-2">
            Images found in your signature ({form.images.length}):
          </p>
          <ul className="space-y-1">
            {form.images.map((img) => (
              <li key={img.id} className="text-sm text-blue-700 flex items-start gap-2">
                <span className="shrink-0 font-medium">{img.id}.</span>
                <span>{img.description} <span className="text-blue-400">({img.position})</span></span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-blue-600 mt-2">
            You&apos;ll upload each of these images in the next step.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => onNext(form)}
          className="flex-2 flex-grow-[2] py-3 px-6 bg-[#8B1A1A] hover:bg-[#6d1414] text-white font-semibold rounded-xl transition-colors"
        >
          Looks Good — Next →
        </button>
      </div>
    </div>
  );
}
