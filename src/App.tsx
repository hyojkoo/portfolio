import { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { CareerManagerModal } from './components/CareerManagerModal';
import { DataExplorerSection } from './components/DataExplorerSection';
import { ProjectsSection } from './components/ProjectsSection';
import { TopBar } from './components/TopBar';
import { DEFAULT_PORTFOLIO_DATA } from './data/defaultPortfolio';
import { ExplorerPreset, PortfolioData, ViewTab } from './types/portfolio';
import { generateStandaloneHtml } from './utils/exportStandaloneHtml';

const STORAGE_KEY = 'hyoj_portfolio_data_v1';

function loadSavedPortfolio(): PortfolioData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PORTFOLIO_DATA;
    const parsed = JSON.parse(raw) as PortfolioData;
    if (!parsed.profile || !Array.isArray(parsed.careers) || !Array.isArray(parsed.projects)) {
      return DEFAULT_PORTFOLIO_DATA;
    }
    return parsed;
  } catch {
    return DEFAULT_PORTFOLIO_DATA;
  }
}

export default function App() {
  const [activeView, setActiveView] = useState<ViewTab>('about');
  const [explorerPreset, setExplorerPreset] = useState<ExplorerPreset>('all');
  const [explorerKey, setExplorerKey] = useState(0);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(loadSavedPortfolio);
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolioData));
    } catch {
      // Ignore storage quota issues
    }
  }, [portfolioData]);

  const handleSelectView = (view: ViewTab) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExplorePreset = (preset: ExplorerPreset) => {
    setExplorerPreset(preset);
    setExplorerKey((k) => k + 1);
    setActiveView('explorer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickDownloadHtml = async () => {
    const html = await generateStandaloneHtml(portfolioData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F5F4] text-[#191617]">
      <TopBar
        activeView={activeView}
        onSelectView={handleSelectView}
        onOpenCareerManager={() => setIsManagerOpen(true)}
        brandNameEn={portfolioData.profile.nameEn}
        brandNameKo={portfolioData.profile.nameKo}
      />

      <main className="flex-1">
        {activeView === 'about' && (
          <AboutSection
            profile={portfolioData.profile}
            careers={portfolioData.careers}
            onNavigate={handleSelectView}
            onOpenCareerManager={() => setIsManagerOpen(true)}
          />
        )}

        {activeView === 'projects' && (
          <ProjectsSection
            projects={portfolioData.projects}
            onExplorePreset={handleExplorePreset}
            onOpenCareerManager={() => setIsManagerOpen(true)}
          />
        )}

        {activeView === 'explorer' && (
          <DataExplorerSection key={explorerKey} initialPreset={explorerPreset} />
        )}
      </main>

      <footer className="border-t border-[#E4DFDF] bg-white">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-[#615B5D] sm:px-8">
          <p>
            © {new Date().getFullYear()} {portfolioData.profile.nameKo} ({portfolioData.profile.contact.email}) · 고려대학교 언어학과·경영학
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleSelectView('about')}
              className="hover:text-[#6B1D2B]"
            >
              자기소개
            </button>
            <button
              type="button"
              onClick={() => handleSelectView('projects')}
              className="hover:text-[#6B1D2B]"
            >
              프로젝트
            </button>
            <button
              type="button"
              onClick={() => handleSelectView('explorer')}
              className="hover:text-[#6B1D2B]"
            >
              데이터 탐색
            </button>
            <button
              type="button"
              onClick={handleQuickDownloadHtml}
              className="font-medium text-[#6B1D2B] hover:underline"
            >
              GitHub Pages용 단일 index.html 다운로드
            </button>
          </div>
        </div>
      </footer>

      <CareerManagerModal
        key={isManagerOpen ? 'open' : 'closed'}
        isOpen={isManagerOpen}
        data={portfolioData}
        onSave={setPortfolioData}
        onReset={() => {
          localStorage.removeItem(STORAGE_KEY);
          setPortfolioData(DEFAULT_PORTFOLIO_DATA);
        }}
        onClose={() => setIsManagerOpen(false)}
      />
    </div>
  );
}
