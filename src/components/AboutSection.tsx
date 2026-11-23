import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Mail,
  PenSquare,
  User,
} from 'lucide-react';
import { GRAPH_METRICS } from '../data/neo4jGraph';
import { CareerEntry, ProfileInfo, ViewTab } from '../types/portfolio';

interface AboutSectionProps {
  profile: ProfileInfo;
  careers: CareerEntry[];
  onNavigate: (view: ViewTab) => void;
  onOpenCareerManager: () => void;
}

export function AboutSection({
  profile,
  careers,
  onNavigate,
  onOpenCareerManager,
}: AboutSectionProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  const tocItems: { num: string; title: string; subtitle: string; action: () => void }[] = [
    {
      num: '01',
      title: '소개 및 전공 배경',
      subtitle: `${profile.university} · ${profile.major} · ${profile.doubleMajor}`,
      action: () => {
        const el = document.getElementById('career-chronicle');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      num: '02',
      title: '학력 및 활동 이력',
      subtitle: `${careers.length}건의 기록 · 브라우저 내 이력 추가·수정 지원`,
      action: () => {
        const el = document.getElementById('career-chronicle');
        el?.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      num: '03',
      title: '대표 연구 프로젝트',
      subtitle: '2025–2026 고려대 석탑대동제 지식그래프 분석',
      action: () => onNavigate('projects'),
    },
    {
      num: '04',
      title: '데이터 탐색 워크스페이스',
      subtitle: 'Neo4j 150 노드 · 242 관계 인터랙티브 그래프 탐색',
      action: () => onNavigate('explorer'),
    },
  ];

  const catalogTraits = [
    {
      code: 'CAREER 01',
      label: '희망 직무',
      value: profile.targetRole,
      detail: `희망 근무지역 · ${profile.targetLocation}`,
      dark: true,
    },
    {
      code: 'WORKSTYLE 02',
      label: '성향 및 AI 활용',
      value: `${profile.mbti} · ${profile.primaryAiTool}`,
      detail: '체계적 구조화와 프롬프트 기반 데이터 정제',
      dark: false,
    },
    {
      code: 'CHANNEL 03',
      label: '주요 활동 SNS',
      value: profile.contact.instagram,
      detail: '트렌드 및 캠퍼스·브랜드 콘텐츠 탐색',
      dark: true,
    },
    {
      code: 'COMMUNITY 04',
      label: '관심 동아리 분과',
      value: profile.clubInterest,
      detail: '대학 축제 및 공연 문화에 대한 높은 관심',
      dark: false,
    },
    {
      code: 'LIFE 05',
      label: '최애 소울푸드',
      value: profile.soulFood,
      detail: '일상의 에너지를 채우는 취향 키워드',
      dark: true,
    },
    {
      code: 'TRAVEL 06',
      label: '여행 가고 싶은 나라',
      value: profile.dreamDestination,
      detail: '자연과 질서 있는 도시 풍경의 조화',
      dark: false,
    },
  ];

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10">
      {/* Spread 1: Asymmetric Editorial Brochure Hero (matches reference.jpg spread) */}
      <section className="grid grid-cols-1 border border-[#E4DFDF] bg-white shadow-sm lg:grid-cols-12 lg:items-stretch">
        {/* Left White Editorial Sheet */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:col-span-7">
          <div className="flex gap-5 sm:gap-7">
            {/* Vertical Rotated Editorial Label (like ABOUT US / WELCOME in reference.jpg) */}
            <div className="hidden shrink-0 items-start sm:flex">
              <div className="border border-[#E4DFDF] px-2.5 py-4">
                <span className="writing-vertical block font-editorial text-xs font-semibold tracking-[0.22em] text-[#6B1D2B]">
                  ABOUT ME
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#615B5D]">
                <span className="font-medium text-[#6B1D2B]">{profile.university}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.major}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.doubleMajor}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{profile.admissionYear} 입학</span>
              </div>

              <h1
                className="mt-4 font-editorial text-3xl font-semibold leading-[1.2] tracking-tight text-[#191617] sm:text-4xl lg:text-[2.65rem]"
                style={{ textWrap: 'balance' }}
              >
                {profile.headline}
              </h1>

              <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-[#615B5D]">
                {profile.subheadline}
              </p>

              <p className="mt-3 max-w-[62ch] text-sm leading-[1.7] text-[#615B5D]">
                {profile.bio}
              </p>
            </div>
          </div>

          {/* Bottom-Left Deep Burgundy "GET IN TOUCH" Block (from top-left spread in reference.jpg) */}
          <div className="mt-8 bg-[#6B1D2B] p-6 text-white sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/20 pb-4">
              <div>
                <p className="font-editorial text-xl font-semibold tracking-tight">
                  연락 방법 · GET IN TOUCH
                </p>
                <p className="mt-0.5 text-xs text-white/80">
                  LinkedIn 포트폴리오 및 협업·채용 관련 문의를 환영합니다.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('projects')}
                  className="inline-flex items-center gap-1.5 bg-white px-4 py-2 text-xs font-semibold text-[#6B1D2B] whitespace-nowrap transition-colors duration-150 hover:bg-[#F6F5F4]"
                >
                  <span>프로젝트 보기</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('explorer')}
                  className="inline-flex items-center gap-1.5 border border-white/50 px-4 py-2 text-xs font-medium text-white whitespace-nowrap transition-colors duration-150 hover:bg-white/10"
                >
                  <span>데이터 탐색</span>
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2 border border-white/15 bg-black/15 px-3.5 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden="true" />
                  <a
                    href={`mailto:${profile.contact.email}`}
                    className="truncate font-mono-tabular text-white hover:underline"
                  >
                    {profile.contact.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex shrink-0 items-center gap-1 text-[11px] text-white/85 hover:text-white"
                  aria-label="이메일 주소 복사"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span>복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={profile.contact.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 border border-white/15 bg-black/15 px-3.5 py-2.5 text-white transition-colors hover:bg-black/25"
              >
                <span className="truncate">디지털인문학 위키 (사용자:구효정)</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden="true" />
              </a>

              <a
                href={profile.contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 border border-white/15 bg-black/15 px-3.5 py-2.5 text-white transition-colors hover:bg-black/25"
              >
                <span className="truncate">LinkedIn 프로필</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden="true" />
              </a>

              <a
                href={profile.contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 border border-white/15 bg-black/15 px-3.5 py-2.5 text-white transition-colors hover:bg-black/25"
              >
                <span className="truncate">GitHub · {profile.contact.instagram}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-white/80" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Deep Burgundy Catalog Panel (Portrait + Table of Contents 01-04) */}
        <div className="flex flex-col justify-between bg-[#52131F] p-6 text-white sm:p-10 lg:col-span-5">
          {/* Portrait & Identity Grid */}
          <div className="grid grid-cols-12 items-end gap-5 border-b border-white/20 pb-6">
            <div className="col-span-5 overflow-hidden border border-white/25 bg-[#6B1D2B]">
              {!imgError && profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={`${profile.nameKo} 프로필 사진`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="aspect-[3/4] w-full object-cover object-top"
                />
              ) : (
                <div className="flex aspect-[3/4] w-full flex-col items-center justify-center bg-[#6B1D2B] p-3 text-center">
                  <User className="h-8 w-8 text-white/70" aria-hidden="true" />
                  <span className="mt-2 font-editorial text-sm">{profile.nameKo}</span>
                </div>
              )}
            </div>

            <div className="col-span-7 flex flex-col justify-end">
              <p className="text-xs tracking-[0.16em] text-white/70">PORTFOLIO CATALOG</p>
              <h2 className="mt-1 font-editorial text-3xl font-semibold tracking-tight text-white">
                {profile.nameKo}
              </h2>
              <p className="mt-0.5 text-xs tracking-wider text-white/80">{profile.nameEn}</p>
              <div className="mt-4 space-y-1 border-t border-white/20 pt-3 text-xs text-white/90">
                <p>소속 · {profile.university}</p>
                <p>전공 · {profile.major} / {profile.doubleMajor}</p>
                <p>희망 직무 · {profile.targetRole}</p>
              </div>
            </div>
          </div>

          {/* Hairline-framed Table of Contents (matching top-right spread in reference.jpg) */}
          <div className="mt-6 border border-white/25 p-5">
            <div className="flex items-center justify-between border-b border-white/20 pb-3">
              <span className="font-editorial text-base font-semibold tracking-wide">
                TABLE OF CONTENTS
              </span>
              <span className="font-mono-tabular text-[11px] text-white/70">01 — 04</span>
            </div>

            <div className="mt-3 divide-y divide-white/15">
              {tocItems.map((item) => (
                <button
                  key={item.num}
                  type="button"
                  onClick={item.action}
                  className="group flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white group-hover:underline">
                      {item.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/70">{item.subtitle}</p>
                  </div>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-white font-mono-tabular text-xs font-semibold text-[#52131F]">
                    {item.num}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width 4-Column Key Metrics Strip */}
      <section
        aria-label="핵심 데이터 요약"
        className="mt-6 grid grid-cols-2 border border-[#E4DFDF] bg-white sm:grid-cols-4"
      >
        <div className="border-b border-r border-[#E4DFDF] p-5 sm:border-b-0">
          <p className="font-mono-tabular text-2xl font-semibold text-[#6B1D2B] sm:text-3xl">
            {GRAPH_METRICS.totalNodes}
          </p>
          <p className="mt-1 text-xs font-medium text-[#191617]">지식그래프 전체 노드</p>
          <p className="mt-0.5 text-[11px] text-[#615B5D]">연예인 31 · 학생 84 · 조직 27</p>
        </div>

        <div className="border-b border-[#E4DFDF] p-5 sm:border-b-0 sm:border-r">
          <p className="font-mono-tabular text-2xl font-semibold text-[#6B1D2B] sm:text-3xl">
            {GRAPH_METRICS.totalRelationships}
          </p>
          <p className="mt-1 text-xs font-medium text-[#191617]">참여 및 운영 관계</p>
          <p className="mt-0.5 text-[11px] text-[#615B5D]">공연 83 · 부스 153 · 일자 6</p>
        </div>

        <div className="border-r border-[#E4DFDF] p-5">
          <p className="font-mono-tabular text-2xl font-semibold text-[#191617] sm:text-3xl">
            2025–2026
          </p>
          <p className="mt-1 text-xs font-medium text-[#191617]">석탑대동제 비교 분석</p>
          <p className="mt-0.5 text-[11px] text-[#615B5D]">KUdyssey vs Kulimax 6일간</p>
        </div>

        <div className="p-5">
          <p className="font-mono-tabular text-2xl font-semibold text-[#191617] sm:text-3xl">
            75.6%
          </p>
          <p className="mt-1 text-xs font-medium text-[#191617]">2026 학생부스 참여 비중</p>
          <p className="mt-0.5 text-[11px] text-[#615B5D]">전년(60.0%) 대비 +15.6%p</p>
        </div>
      </section>

      {/* Spread 2: Career Chronicle + Brochure Catalog Traits Grid */}
      <section id="career-chronicle" className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Career & Education Timeline */}
        <div className="border border-[#E4DFDF] bg-white p-6 sm:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DFDF] pb-4">
            <div>
              <p className="text-xs font-medium text-[#6B1D2B]">CAREER & EDUCATION</p>
              <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#191617]">
                학력 및 주요 이력
              </h2>
            </div>
            <button
              type="button"
              onClick={onOpenCareerManager}
              className="inline-flex items-center gap-1.5 border border-[#E4DFDF] px-3.5 py-2 text-xs font-medium text-[#191617] transition-colors hover:border-[#6B1D2B] hover:text-[#6B1D2B]"
            >
              <PenSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>이력 추가·수정</span>
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#E4DFDF]">
            {careers.map((item) => (
              <div key={item.id} className="py-5 first:pt-2 last:pb-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#615B5D]">
                  <span className="font-mono-tabular font-medium text-[#6B1D2B]">
                    {item.period}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#191617]">{item.organization}</span>
                </div>
                <h3 className="mt-1.5 text-base font-semibold text-[#191617]">{item.role}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#615B5D]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: 2x3 Catalog Grid (echoes PRODUCT NAME/CODE catalog spreads in reference.jpg) */}
        <div className="border border-[#E4DFDF] bg-white p-6 sm:p-8 lg:col-span-5">
          <div className="border-b border-[#E4DFDF] pb-4">
            <p className="text-xs font-medium text-[#6B1D2B]">PROFILE CATALOG</p>
            <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#191617]">
              진로 및 관심사 인덱스
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {catalogTraits.map((trait) => (
              <div
                key={trait.code}
                className={`flex flex-col justify-between p-4 ${
                  trait.dark
                    ? 'bg-[#6B1D2B] text-white'
                    : 'border border-[#E4DFDF] bg-[#F6F5F4] text-[#191617]'
                }`}
              >
                <div>
                  <p
                    className={`font-mono-tabular text-[11px] tracking-wider ${
                      trait.dark ? 'text-white/70' : 'text-[#6B1D2B]'
                    }`}
                  >
                    {trait.code}
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      trait.dark ? 'text-white/80' : 'text-[#615B5D]'
                    }`}
                  >
                    {trait.label}
                  </p>
                  <p className="mt-1.5 text-sm font-semibold leading-snug">{trait.value}</p>
                </div>
                <p
                  className={`mt-3 border-t pt-2 text-[11px] leading-relaxed ${
                    trait.dark
                      ? 'border-white/20 text-white/75'
                      : 'border-[#E4DFDF] text-[#615B5D]'
                  }`}
                >
                  {trait.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
