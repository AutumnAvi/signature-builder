"use client";

import { useEffect, useState } from "react";
import ProgressBar from "@/components/ProgressBar";
import EnvSetupScreen from "@/components/EnvSetupScreen";
import Step1Upload from "@/components/Step1Upload";
import Step2ConfirmInfo, { SignatureData } from "@/components/Step2ConfirmInfo";
import Step3UploadImages from "@/components/Step3UploadImages";
import Step4Generate from "@/components/Step4Generate";

type AppStep = 1 | 2 | 3 | 4;

export default function Home() {
  const [missingEnv, setMissingEnv] = useState<string[] | null>(null);
  const [step, setStep] = useState<AppStep>(1);
  const [screenshotPreview, setScreenshotPreview] = useState<string>("");
  const [sigData, setSigData] = useState<SignatureData | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    fetch("/api/check-env")
      .then((r) => r.json())
      .then((d) => setMissingEnv(d.missing));
  }, []);

  const handleStep1Next = async (file: File, preview: string) => {
    setScreenshotPreview(preview);
    setExtractError(null);
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/extract-signature", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to read signature");

      const normalized: SignatureData = {
        name: data.name || "",
        title: data.title || "",
        cell: data.cell || "",
        office: data.office || "",
        email: data.email || "",
        website: data.website || "",
        additionalInfo: data.additionalInfo || "",
        disclaimer: data.disclaimer || "",
        images: Array.isArray(data.images) ? data.images : [],
      };

      setSigData(normalized);
      setStep(2);
    } catch (err) {
      setExtractError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setExtracting(false);
    }
  };

  const handleStep2Next = (data: SignatureData) => {
    setSigData(data);
    setStep(3);
  };

  const handleStep3Next = (urls: string[]) => {
    setImageUrls(urls);
    setStep(4);
  };

  if (missingEnv === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B1A1A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (missingEnv.length > 0) {
    return <EnvSetupScreen missing={missingEnv} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#8B1A1A] shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Autumn Lake Email Signature Builder
            </h1>
            <p className="text-red-200 text-xs">
              Rebuild your signature so it works correctly with Asana
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <ProgressBar current={step} />

        {extractError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
            <div>
              <p className="font-semibold">Couldn&apos;t read your signature</p>
              <p>{extractError}</p>
            </div>
          </div>
        )}

        {extracting && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700 flex items-center gap-3">
            <svg className="animate-spin w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Reading your signature with AI — this takes about 10–15 seconds...</span>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {step === 1 && <Step1Upload onNext={handleStep1Next} />}
          {step === 2 && sigData && (
            <Step2ConfirmInfo
              data={sigData}
              onNext={handleStep2Next}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && sigData && (
            <Step3UploadImages
              data={sigData}
              screenshotPreview={screenshotPreview}
              onNext={handleStep3Next}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && sigData && (
            <Step4Generate
              data={sigData}
              imageUrls={imageUrls}
              screenshotPreview={screenshotPreview}
              onBack={() => setStep(1)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
