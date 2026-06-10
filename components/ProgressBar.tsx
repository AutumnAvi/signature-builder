"use client";

const STEPS = [
  "Upload Screenshot",
  "Confirm Your Info",
  "Upload Images",
  "Get Signature",
];

export default function ProgressBar({ current }: { current: number }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className={`flex-1 h-1 ${done ? "bg-[#8B1A1A]" : "bg-gray-200"}`}
                  />
                )}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 shrink-0
                    ${done ? "bg-[#8B1A1A] border-[#8B1A1A] text-white" : ""}
                    ${active ? "bg-white border-[#8B1A1A] text-[#8B1A1A]" : ""}
                    ${!done && !active ? "bg-white border-gray-300 text-gray-400" : ""}
                  `}
                >
                  {done ? "✓" : step}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${step < current ? "bg-[#8B1A1A]" : "bg-gray-200"}`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-xs text-center px-1 ${active ? "text-[#8B1A1A] font-semibold" : done ? "text-[#8B1A1A]" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
