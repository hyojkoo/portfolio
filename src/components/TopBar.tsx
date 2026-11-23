import { Home, SlidersHorizontal } from 'lucide-react';
import { ViewTab } from '../types/portfolio';

interface TopBarProps {
  activeView: ViewTab;
  onSelectView: (view: ViewTab) => void;
  onOpenCareerManager: () => void;
  brandNameEn: string;
  brandNameKo: string;
}

export function TopBar({
  activeView,
  onSelectView,
  onOpenCareerManager,
  brandNameEn,
  brandNameKo,
}: TopBarProps) {
  const navItems: { id: ViewTab; label: string }[] = [
    { id: 'about', label: '자기소개' },
    { id: 'projects', label: '프로젝트' },
    { id: 'explorer', label: '데이터 탐색' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E4DFDF] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3.5 sm:gap-8 sm:px-8">
        {/* Left-top: Home button */}
        <button
          type="button"
          onClick={() => onSelectView('about')}
          className="group flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B1D2B]"
          aria-label="홈으로 돌아가기"
        >
          <span className="flex h-8 w-8 items-center justify-center bg-[#6B1D2B] text-white transition-colors duration-150 group-hover:bg-[#52131F]">
            <Home className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-editorial text-lg font-semibold tracking-tight text-[#191617]">
            {brandNameKo} <span className="hidden text-sm font-normal text-[#615B5D] sm:inline">· {brandNameEn}</span>
          </span>
        </button>

        {/* Right-top navigation + Career Manager action */}
        <div className="flex items-center gap-4 sm:gap-8">
          <nav aria-label="주요 메뉴" className="flex items-center gap-4 sm:gap-7">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6B1D2B] ${
                    isActive
                      ? 'text-[#6B1D2B] font-semibold'
                      : 'text-[#615B5D] hover:text-[#191617]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-[15px] h-[2px] bg-[#6B1D2B]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={onOpenCareerManager}
            className="inline-flex items-center gap-2 border border-[#6B1D2B] bg-[#6B1D2B] px-3.5 py-2 text-xs font-medium text-white whitespace-nowrap shrink-0 transition-colors duration-150 hover:bg-[#52131F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6B1D2B]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>이력 관리</span>
          </button>
        </div>
      </div>
    </header>
  );
}
