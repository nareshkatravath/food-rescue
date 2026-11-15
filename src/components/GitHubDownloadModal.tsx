import React, { useEffect, useState } from 'react';
import {
  Github,
  Download,
  Copy,
  Check,
  ExternalLink,
  X,
  Package,
  Terminal,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

interface GitHubReleaseData {
  tag_name: string;
  html_url: string;
  published_at: string;
  assets: GitHubReleaseAsset[];
}

const STORAGE_KEY = 'foodrescue_github_repo';

function detectInitialRepo(): string {
  const envRepo = import.meta.env.VITE_GITHUB_REPO as string | undefined;
  if (envRepo && envRepo.includes('/')) {
    return envRepo.trim();
  }
  const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (saved && saved.includes('/')) {
    return saved.trim();
  }
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.github.io')) {
    const owner = window.location.hostname.replace('.github.io', '');
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (owner && pathParts.length > 0) {
      return `${owner}/${pathParts[0]}`;
    }
  }
  return '';
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

interface GitHubDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubDownloadModal: React.FC<GitHubDownloadModalProps> = ({ isOpen, onClose }) => {
  const [repoInput, setRepoInput] = useState<string>(detectInitialRepo);
  const [activeRepo, setActiveRepo] = useState<string>(detectInitialRepo);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [releaseData, setReleaseData] = useState<GitHubReleaseData | null>(null);
  const [loadingRelease, setLoadingRelease] = useState(false);
  const [releaseError, setReleaseError] = useState<string | null>(null);

  const cleanRepoSlug = (value: string): string => {
    return value
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/^\/+|\/+$/g, '');
  };

  const fetchLatestRelease = async (slug: string) => {
    if (!slug || !slug.includes('/')) {
      setReleaseData(null);
      setReleaseError(null);
      return;
    }
    setLoadingRelease(true);
    setReleaseError(null);
    try {
      const res = await fetch(`https://api.github.com/repos/${slug}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setReleaseData(null);
          setReleaseError('No published GitHub release found yet for this repository.');
        } else {
          setReleaseError('Could not load release info from GitHub API.');
        }
        return;
      }
      const data = (await res.json()) as GitHubReleaseData;
      setReleaseData(data);
    } catch {
      setReleaseError('Unable to reach GitHub right now.');
    } finally {
      setLoadingRelease(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeRepo) {
      fetchLatestRelease(activeRepo);
    }
  }, [isOpen, activeRepo]);

  if (!isOpen) return null;

  const handleSaveRepo = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = cleanRepoSlug(repoInput);
    if (!slug || !slug.includes('/')) {
      setReleaseError('Enter a valid GitHub repository in owner/repo format.');
      return;
    }
    setRepoInput(slug);
    setActiveRepo(slug);
    window.localStorage.setItem(STORAGE_KEY, slug);
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const repoDisplay = activeRepo || '<username>/<repo>';
  const zipDownloadUrl = activeRepo
    ? `https://github.com/${activeRepo}/archive/refs/heads/main.zip`
    : null;
  const releasesPageUrl = activeRepo ? `https://github.com/${activeRepo}/releases` : null;
  const actionsPageUrl = activeRepo ? `https://github.com/${activeRepo}/actions` : null;

  const cloneCommand = `git clone https://github.com/${repoDisplay}.git && cd ${
    repoDisplay.split('/')[1] || 'foodrescue-app'
  } && npm install && npm run dev`;

  const publishCommands = `git init\ngit add .\ngit commit -m "Initial commit"\ngit branch -M main\ngit remote add origin https://github.com/${repoDisplay}.git\ngit push -u origin main\ngit tag v1.0.0 && git push origin v1.0.0`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto rounded-3xl bg-[#FFFDF2] p-5 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 font-heading">
                Download via GitHub
              </h3>
              <p className="text-[11px] text-slate-500">
                Install app, download ZIP, or fetch APK releases
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Direct PWA Install if available */}
        <div className="mb-3">
          <PWAInstallButton />
        </div>

        {/* GitHub Repo Configuration */}
        <form
          onSubmit={handleSaveRepo}
          className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs mb-3"
        >
          <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
            GitHub Repository (owner/repo or URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={repoInput}
              onChange={(e) => setRepoInput(e.target.value)}
              placeholder="e.g. yourname/foodrescue-app"
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087A28] min-w-0"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-[#087A28] hover:bg-[#066521] text-white text-xs font-bold rounded-xl shrink-0 transition"
            >
              Connect
            </button>
          </div>
        </form>

        {/* Download Actions for Connected Repo */}
        {activeRepo ? (
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs mb-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-slate-800 truncate">
                {activeRepo}
              </span>
              <button
                type="button"
                onClick={() => fetchLatestRelease(activeRepo)}
                className="text-[11px] font-bold text-[#087A28] flex items-center gap-1 hover:underline shrink-0"
              >
                <RefreshCw className={`w-3 h-3 ${loadingRelease ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <a
              href={
                releaseData?.assets.find((a) => a.name.endsWith('.apk'))
                  ?.browser_download_url ||
                `https://github.com/${activeRepo}/releases/latest/download/FoodRescue.apk`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#087A28] hover:bg-[#066521] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>Download Android APK (FoodRescue.apk)</span>
              <Download className="w-3.5 h-3.5 shrink-0" />
            </a>

            {actionsPageUrl && (
              <a
                href={`${actionsPageUrl}/workflows/build-android-apk.yml`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span>Or Download APK from GitHub Actions Artifacts</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}

            <div className="grid grid-cols-2 gap-2">
              {zipDownloadUrl && (
                <a
                  href={zipDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#087A28] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 shrink-0" />
                  <span>Source ZIP</span>
                </a>
              )}
              {releasesPageUrl && (
                <a
                  href={releasesPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span>All Releases</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              )}
            </div>

            {/* Latest Release Assets (APK / Web Zip) */}
            {releaseData && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">
                    Latest Release: {releaseData.tag_name}
                  </span>
                  <a
                    href={releaseData.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#087A28] font-semibold hover:underline"
                  >
                    View notes
                  </a>
                </div>
                {releaseData.assets.length > 0 ? (
                  releaseData.assets.map((asset) => (
                    <a
                      key={asset.name}
                      href={asset.browser_download_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800 transition"
                    >
                      <span className="flex items-center gap-2 truncate">
                        {asset.name.endsWith('.apk') ? (
                          <Smartphone className="w-4 h-4 text-[#087A28] shrink-0" />
                        ) : (
                          <Package className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                        <span className="truncate">{asset.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {formatBytes(asset.size)} ↓
                      </span>
                    </a>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Release created without binary assets. Check{' '}
                    {actionsPageUrl && (
                      <a
                        href={actionsPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#087A28] font-semibold underline"
                      >
                        GitHub Actions
                      </a>
                    )}{' '}
                    to download build artifacts.
                  </p>
                )}
              </div>
            )}

            {releaseError && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2">
                {releaseError}
              </p>
            )}
          </div>
        ) : (
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 mb-3 text-[11px] text-amber-900 leading-relaxed">
            Push this project to your GitHub repository and enter <code className="font-mono font-bold">owner/repo</code> above to enable 1-click Source ZIP, Web Bundle, and Android APK downloads.
          </div>
        )}

        {/* Copyable Git Clone Command */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#087A28]" />
              <span>Clone &amp; Run from GitHub</span>
            </span>
            <button
              type="button"
              onClick={() => handleCopy('clone', cloneCommand)}
              className="text-[10px] font-bold text-[#087A28] flex items-center gap-1 hover:underline"
            >
              {copiedKey === 'clone' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[10px] bg-slate-900 text-emerald-300 p-2.5 rounded-xl overflow-x-auto font-mono leading-relaxed">
            {cloneCommand}
          </pre>
        </div>

        {/* Copyable Push & Release Commands */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700">
              Publish &amp; Build APK Release on GitHub
            </span>
            <button
              type="button"
              onClick={() => handleCopy('publish', publishCommands)}
              className="text-[10px] font-bold text-[#087A28] flex items-center gap-1 hover:underline"
            >
              {copiedKey === 'publish' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="text-[10px] bg-slate-900 text-slate-200 p-2.5 rounded-xl overflow-x-auto font-mono leading-relaxed">
            {publishCommands}
          </pre>
        </div>
      </div>
    </div>
  );
};
