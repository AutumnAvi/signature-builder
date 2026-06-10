"use client";

import { useEffect, useState } from "react";
import type { SignatureData } from "./Step2ConfirmInfo";

interface Props {
  data: SignatureData;
  imageUrls: string[];
  screenshotPreview: string;
  onBack: () => void;
}

function buildFallbackHtml(data: SignatureData, imageUrls: string[]): string {
  const emailHref = data.email ? `href="mailto:${data.email}"` : "";

  const phone = [data.cell && `Cell: ${data.cell}`, data.office && `Office: ${data.office}`]
    .filter(Boolean)
    .join(" &nbsp;|&nbsp; ");

  const badgeRow =
    imageUrls.length > 0
      ? `<tr>
          <td style="padding-top:8px;">
            <table cellpadding="0" cellspacing="0" border="0"><tr>
              ${imageUrls
                .map(
                  (url) =>
                    `<td style="padding-right:8px;"><img src="${url}" height="55" alt="" style="display:block;border:0;height:55px;" /></td>`
                )
                .join("")}
            </tr></table>
          </td>
        </tr>`
      : "";

  const signatureHtml = `<table cellpadding="0" cellspacing="0" border="0" style="max-width:500px;font-family:Arial,Helvetica,sans-serif;">
  <tbody>
    ${data.name ? `<tr><td style="padding-bottom:2px;"><span style="font-weight:bold;font-size:14px;color:#1a1714;">${data.name}</span></td></tr>` : ""}
    ${data.title ? `<tr><td style="padding-bottom:4px;"><span style="font-size:12px;color:#666666;">${data.title}</span></td></tr>` : ""}
    ${phone ? `<tr><td style="padding-bottom:2px;"><span style="font-size:12px;color:#333333;">${phone}</span></td></tr>` : ""}
    ${data.email ? `<tr><td style="padding-bottom:2px;"><a ${emailHref} style="font-size:12px;color:#8B1A1A;text-decoration:none;">${data.email}</a></td></tr>` : ""}
    ${data.website ? `<tr><td style="padding-bottom:4px;"><span style="font-size:12px;color:#333333;">${data.website}</span></td></tr>` : ""}
    ${badgeRow}
    ${data.disclaimer ? `<tr><td style="padding-top:8px;max-width:500px;"><span style="font-size:10px;color:#888888;line-height:1.5;">${data.disclaimer}</span></td></tr>` : ""}
  </tbody>
</table>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
${signatureHtml}
</body>
</html>`;
}

export default function Step4Generate({ data, imageUrls, screenshotPreview, onBack }: Props) {
  const [html, setHtml] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        const res = await fetch("/api/generate-signature-html", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ screenshotDataUrl: screenshotPreview, data }),
        });
        if (!res.ok) throw new Error("API error");
        const { html: generatedHtml } = await res.json();

        let finalHtml = generatedHtml as string;
        imageUrls.forEach((url, i) => {
          finalHtml = finalHtml.split(`IMAGE_${i + 1}`).join(url);
        });

        if (!cancelled) setHtml(finalHtml);
      } catch {
        if (!cancelled) setHtml(buildFallbackHtml(data, imageUrls));
      } finally {
        if (!cancelled) setGenerating(false);
      }
    }

    generate();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGetSignature = () => {
    if (!html) return;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-signature.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const tab = window.open();
    if (tab) {
      tab.document.write(html);
      tab.document.close();
    }

    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Signature is Ready!
        </h2>
        <p className="text-gray-500">
          We&apos;ve built your signature with all the images hosted on GitHub so
          they won&apos;t appear as attachments in Asana.
        </p>
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-500">Preview</span>
        </div>
        <div className="p-6 overflow-x-auto">
          {generating ? (
            <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-500">
              <svg className="animate-spin w-5 h-5 text-[#8B1A1A] shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Generating your signature layout — this takes about 15 seconds...</span>
            </div>
          ) : html ? (
            <iframe
              srcDoc={html}
              className="w-full min-h-40 border-0"
              title="Signature Preview"
              sandbox="allow-same-origin"
            />
          ) : null}
        </div>
      </div>

      <button
        onClick={handleGetSignature}
        disabled={generating || !html}
        className="w-full py-4 px-6 bg-[#8B1A1A] hover:bg-[#6d1414] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-lg mb-6"
      >
        {generating ? "Building your signature..." : "Get My Signature"}
      </button>

      {downloaded && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span>
              How to install your signature in Outlook
            </h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span className="font-bold shrink-0">1.</span>
                Your signature just opened in a new browser tab (and was also downloaded as a file).
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">2.</span>
                In that new tab, press <kbd className="bg-blue-100 border border-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl+A</kbd> to select everything.
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">3.</span>
                Press <kbd className="bg-blue-100 border border-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl+C</kbd> to copy.
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">4.</span>
                Open <strong>Outlook</strong> → <strong>Settings</strong> → <strong>Mail</strong> → <strong>Signatures</strong>.
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">5.</span>
                Click inside the signature text box and press <kbd className="bg-blue-100 border border-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl+V</kbd> to paste.
              </li>
              <li className="flex gap-2">
                <span className="font-bold shrink-0">6.</span>
                Click <strong>Save</strong>.
              </li>
            </ol>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">One more thing</p>
            <p>
              Forward a test email into Asana after installing. If images still
              appear as attachments, contact{" "}
              <strong>Avi Weinreb</strong>.
            </p>
          </div>

          <button
            onClick={onBack}
            className="w-full py-2 px-4 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            ← Start over with a different signature
          </button>
        </div>
      )}
    </div>
  );
}
