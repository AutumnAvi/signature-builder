"use client";

const ENV_INSTRUCTIONS: Record<
  string,
  { label: string; instructions: string }
> = {
  ANTHROPIC_API_KEY: {
    label: "Anthropic API Key",
    instructions:
      "Go to console.anthropic.com → API Keys → Create Key → copy it",
  },
  GITHUB_TOKEN: {
    label: "GitHub Personal Access Token",
    instructions:
      "Go to github.com → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token (classic) → check the 'repo' scope → copy it",
  },
  GITHUB_REPO_OWNER: {
    label: "GitHub Repository Owner",
    instructions: 'Already set to "AutumnAvi" — add this to your .env.local',
  },
  GITHUB_REPO_NAME: {
    label: "GitHub Repository Name",
    instructions: 'Already set to "Assets" — add this to your .env.local',
  },
};

export default function EnvSetupScreen({ missing }: { missing: string[] }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg max-w-xl w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-[#8B1A1A] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Setup Required</h1>
            <p className="text-sm text-gray-500">A few things need to be configured before you can use this app.</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          The following environment variables are missing. Add them to a file
          called <code className="bg-gray-100 px-1 rounded text-sm">.env.local</code> in the root of this project, then restart the app.
        </p>

        <div className="space-y-4 mb-8">
          {missing.map((key) => {
            const info = ENV_INSTRUCTIONS[key];
            return (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#8B1A1A]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {key}
                    </p>
                    {info && (
                      <>
                        <p className="text-xs text-gray-500 mt-0.5">{info.label}</p>
                        <p className="text-sm text-gray-700 mt-1">{info.instructions}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">Your .env.local file should look like this:</p>
          <pre className="text-xs bg-gray-100 rounded p-3 overflow-x-auto whitespace-pre-wrap">{`ANTHROPIC_API_KEY=sk-ant-...your key here...
GITHUB_TOKEN=ghp_...your token here...
GITHUB_REPO_OWNER=AutumnAvi
GITHUB_REPO_NAME=Assets`}</pre>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          After updating .env.local, restart the server with <code className="bg-gray-100 px-1 rounded">npm run dev</code>
        </p>
      </div>
    </div>
  );
}
