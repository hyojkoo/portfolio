import { useState } from 'react';
import { ArrowRight, Check, Copy, Database, PenSquare } from 'lucide-react';
import { CYPHER_SNIPPETS, GRAPH_METRICS } from '../data/neo4jGraph';
import { ExplorerPreset, ProjectEntry } from '../types/portfolio';

interface ProjectsSectionProps {
  projects: ProjectEntry[];
  onExplorePreset: (preset: ExplorerPreset) => void;
  onOpenCareerManager: () => void;
}

export function ProjectsSection({
  projects,
  onExplorePreset,
  onOpenCareerManager,
}: ProjectsSectionProps) {
  const [activeCypherIdx, setActiveCypherIdx] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const featured = projects.find((p) => p.isFeaturedNeo4j) || projects[0];
  const additionalProjects = projects.filter((p) => p.id !== featured?.id);
  const activeCypher = CYPHER_SNIPPETS[activeCypherIdx];

  const handleCopyQuery = async (id: string, query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const boothComparison = [
    { label: '전체 참여 주체', y2025: 40, y2026: 45, delta: '+5개 (+12.5%)' },
    { label: '학생참여주체', y2025: 24, y2026: 34, delta: '+10개' },
    { label: '외부 조직', y2025: 16, y2026: 11, delta: '-5개' },
    { label: '학생참여주체 비중', y2025: '60.0%', y2026: '75.6%', delta: '+15.6%p' },
  ];

  const dayBoothCounts = [
    { day: '1일 차', y2025: 25, y2026: 29 },
    { day: '2일 차', y2025: 31, y2026: 28 },
    { day: '3일 차', y2025: 28, y2026: 12 },
  ];

  const durationCounts = [
    { label: '1일만 운영', y2025: 12, y2026: 26 },
    { label: '2일 운영', y2025: 12, y2026: 14 },
    { label: '3일 모두 운영', y2025: 16, y2026: 5 },
  ];

  const researchQuestions = [
    {
      q: 'Q1. 연예인 무대 라인업 구성',
      body: '2025·2026 석탑대동제 무대에 참여한 총 31팀의 연예인을 걸그룹, 보이그룹, 여성·남성 솔로, 록 밴드, 힙합 장르로 구조화해 연도별 섭외 유형과 공연 구성을 비교했습니다.',
      preset: 'celebrities' as ExplorerPreset,
      cta: '연예인 31팀 탐색',
    },
    {
      q: 'Q2. 학생 공연 주체와 연속 참여',
      body: '중앙동아리·애기능·학부/학과소속단체·개별참여단체로 구분해 2년 연속 무대에 오른 7개 주체(크림슨, TERRA, 와일드아이즈, KUDT, 라온제나, 1905, 오칼)를 도출했습니다.',
      preset: 'recurring_performers' as ExplorerPreset,
      cta: '연속 공연 7팀 탐색',
    },
    {
      q: 'Q3. 외부 조직 부스 참여 변화',
      body: '식음료·미디어·IT·의료 등 27개 외부 조직의 참여 현황을 추적한 결과, 2025년 16개에서 2026년 11개로 감소하며 학생 중심 부스로 전환됨을 확인했습니다.',
      preset: 'organizations' as ExplorerPreset,
      cta: '외부 조직 27개 탐색',
    },
    {
      q: 'Q4. 학생단체 부스 운영 및 지속성',
      body: '두 연도 모두 부스를 운영한 17개 교내 주체를 추출하고, 2026년에는 단기(1일) 부스가 급증(12→26개)하고 3일 차 운영이 축소(-57.1%)된 특징을 발견했습니다.',
      preset: 'recurring_booths' as ExplorerPreset,
      cta: '연속 부스 17팀 탐색',
    },
  ];

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E4DFDF] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#6B1D2B]">PROJECTS & RESEARCH</p>
          <h1 className="mt-1 font-editorial text-3xl font-semibold text-[#191617] sm:text-4xl">
            대표 프로젝트 및 연구 아카이브
          </h1>
        </div>
        <button
          type="button"
          onClick={onOpenCareerManager}
          className="inline-flex items-center gap-2 border border-[#E4DFDF] bg-white px-4 py-2 text-xs font-medium text-[#191617] transition-colors hover:border-[#6B1D2B] hover:text-[#6B1D2B]"
        >
          <PenSquare className="h-3.5 w-3.5" aria-hidden="true" />
          <span>프로젝트 추가·편집</span>
        </button>
      </div>

      {/* Featured Case Study Spread */}
      {featured && (
        <article className="mt-8 border border-[#E4DFDF] bg-white shadow-sm">
          {/* Top Brochure Header Split */}
          <div className="grid grid-cols-1 border-b border-[#E4DFDF] lg:grid-cols-12">
            <div className="flex gap-5 p-6 sm:p-10 lg:col-span-8">
              <div className="hidden shrink-0 items-start sm:flex">
                <div className="border border-[#E4DFDF] px-2.5 py-4">
                  <span className="writing-vertical block font-editorial text-xs font-semibold tracking-[0.22em] text-[#6B1D2B]">
                    {featured.indexLabel}
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#615B5D]">
                  <span className="font-medium text-[#6B1D2B]">{featured.courseOrContext}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{featured.period}</span>
                  <span aria-hidden="true">·</span>
                  <span>팀원: {featured.team}</span>
                </div>

                <h2
                  className="mt-3 font-editorial text-2xl font-semibold leading-snug text-[#191617] sm:text-3xl"
                  style={{ textWrap: 'balance' }}
                >
                  {featured.title}
                </h2>
                <p className="mt-1 text-xs text-[#615B5D]">{featured.subtitle}</p>

                <p className="mt-4 text-[15px] leading-[1.7] text-[#191617]">{featured.summary}</p>

                <div className="mt-5 border-t border-[#E4DFDF] pt-4 text-xs text-[#615B5D]">
                  <p>
                    <span className="font-semibold text-[#191617]">담당 역할:</span> {featured.myRole}
                  </p>
                  <p className="mt-1.5">
                    <span className="font-semibold text-[#191617]">활용 기술 및 도구:</span>{' '}
                    {featured.tools.join(' · ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Deep Burgundy Highlights Box */}
            <div className="flex flex-col justify-between bg-[#6B1D2B] p-6 text-white sm:p-8 lg:col-span-4">
              <div>
                <p className="font-mono-tabular text-[11px] tracking-widest text-white/75">
                  KEY FINDINGS SUMMARY
                </p>
                <h3 className="mt-1 font-editorial text-xl font-semibold">핵심 분석 인사이트</h3>
                <ul className="mt-4 space-y-3 border-t border-white/20 pt-4 text-xs leading-relaxed text-white/90">
                  {featured.highlights.map((hl, idx) => (
                    <li key={idx} className="flex gap-2.5">
                      <span className="font-mono-tabular font-semibold text-white">
                        0{idx + 1}.
                      </span>
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onExplorePreset('all')}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-white px-4 py-2.5 text-xs font-semibold text-[#6B1D2B] transition-colors hover:bg-[#F6F5F4]"
              >
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                <span>실제 Neo4j 데이터 그래프 탐색하기</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Ontology Schema & Analysis Scope */}
          <div className="grid grid-cols-1 border-b border-[#E4DFDF] lg:grid-cols-12">
            <div className="border-b border-[#E4DFDF] p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
              <p className="text-xs font-medium text-[#6B1D2B]">DATA SCOPE & MODEL</p>
              <h3 className="mt-1 font-editorial text-xl font-semibold text-[#191617]">
                분석 대상 및 데이터베이스 구성
              </h3>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E4DFDF] text-[#615B5D]">
                      <th className="py-2 pr-3 font-medium">연도</th>
                      <th className="py-2 pr-3 font-medium">축제명</th>
                      <th className="py-2 font-medium">개최 기간 (3일)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4DFDF]">
                    <tr>
                      <td className="py-2.5 pr-3 font-mono-tabular font-semibold text-[#6B1D2B]">
                        2025
                      </td>
                      <td className="py-2.5 pr-3 font-medium">KUdyssey</td>
                      <td className="py-2.5 font-mono-tabular text-[#615B5D]">2025.05.20. – 05.22.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-3 font-mono-tabular font-semibold text-[#6B1D2B]">
                        2026
                      </td>
                      <td className="py-2.5 pr-3 font-medium">Kulimax</td>
                      <td className="py-2.5 font-mono-tabular text-[#615B5D]">2026.05.19. – 05.21.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#E4DFDF] pt-4 text-xs">
                <div>
                  <p className="font-semibold text-[#191617]">노드 (총 150개)</p>
                  <p className="mt-1 font-mono-tabular text-[#615B5D]">
                    축제 2 · 일자 6 · 연예인 31 · 학생참여주체 84 · 조직 27
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-[#191617]">관계 (총 242건)</p>
                  <p className="mt-1 font-mono-tabular text-[#615B5D]">
                    HAS_DAY 6 · PERFORMED_IN 83 · OPERATED_BOOTH_IN 153
                  </p>
                </div>
              </div>
            </div>

            {/* Clean SVG Graph Schema Diagram */}
            <div className="bg-[#F6F5F4] p-6 sm:p-8 lg:col-span-7">
              <p className="text-xs font-medium text-[#6B1D2B]">ONTOLOGY SCHEMA</p>
              <h3 className="mt-1 font-editorial text-xl font-semibold text-[#191617]">
                일자 매개 지식그래프 관계 모델
              </h3>
              <p className="mt-1 text-xs text-[#615B5D]">
                축제와 참여 주체 사이에 일자(DAY001–DAY006) 노드를 매개하여 정확한 참여 일자와 연속성을 추적합니다.
              </p>

              <div className="mt-5 overflow-x-auto border border-[#E4DFDF] bg-white p-4">
                <svg
                  viewBox="0 0 640 210"
                  className="mx-auto h-auto w-full max-w-[600px]"
                  role="img"
                  aria-label="석탑대동제 지식그래프 온톨로지 구조도"
                >
                  {/* Lines */}
                  <line x1="115" y1="105" x2="275" y2="105" stroke="#6B1D2B" strokeWidth="2" />
                  <polygon points="275,105 266,100 266,110" fill="#6B1D2B" />
                  <rect x="155" y="92" width="76" height="22" fill="#FFFFFF" />
                  <text
                    x="193"
                    y="107"
                    textAnchor="middle"
                    className="fill-[#6B1D2B] font-mono text-[11px] font-semibold"
                  >
                    HAS_DAY
                  </text>

                  {/* Top Performers -> Day */}
                  <line x1="510" y1="45" x2="355" y2="95" stroke="#191617" strokeWidth="1.5" />
                  <polygon points="355,95 365,97 362,88" fill="#191617" />
                  <rect x="382" y="54" width="98" height="20" fill="#FFFFFF" />
                  <text
                    x="431"
                    y="68"
                    textAnchor="middle"
                    className="fill-[#191617] font-mono text-[10px] font-semibold"
                  >
                    PERFORMED_IN
                  </text>

                  {/* Bottom Booth -> Day */}
                  <line x1="510" y1="165" x2="355" y2="115" stroke="#615B5D" strokeWidth="1.5" />
                  <polygon points="355,115 362,122 365,113" fill="#615B5D" />
                  <rect x="370" y="132" width="124" height="20" fill="#FFFFFF" />
                  <text
                    x="432"
                    y="146"
                    textAnchor="middle"
                    className="fill-[#615B5D] font-mono text-[10px] font-semibold"
                  >
                    OPERATED_BOOTH_IN
                  </text>

                  {/* Nodes */}
                  <rect x="20" y="77" width="95" height="56" fill="#6B1D2B" />
                  <text x="67.5" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600">
                    축제 (2)
                  </text>
                  <text x="67.5" y="120" textAnchor="middle" fill="#F6D5DB" fontSize="10">
                    2025 / 2026
                  </text>

                  <rect x="275" y="77" width="85" height="56" fill="#52131F" />
                  <text x="317.5" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="600">
                    일자 (6)
                  </text>
                  <text x="317.5" y="120" textAnchor="middle" fill="#F6D5DB" fontSize="10">
                    DAY001–006
                  </text>

                  <rect
                    x="510"
                    y="18"
                    width="115"
                    height="54"
                    fill="#FFFFFF"
                    stroke="#6B1D2B"
                    strokeWidth="1.5"
                  />
                  <text x="567.5" y="42" textAnchor="middle" fill="#191617" fontSize="12" fontWeight="600">
                    무대 공연 주체
                  </text>
                  <text x="567.5" y="59" textAnchor="middle" fill="#615B5D" fontSize="10">
                    연예인 · 학생단체
                  </text>

                  <rect
                    x="510"
                    y="138"
                    width="115"
                    height="54"
                    fill="#FFFFFF"
                    stroke="#191617"
                    strokeWidth="1.5"
                  />
                  <text x="567.5" y="162" textAnchor="middle" fill="#191617" fontSize="12" fontWeight="600">
                    부스 운영 주체
                  </text>
                  <text x="567.5" y="179" textAnchor="middle" fill="#615B5D" fontSize="10">
                    학생단체 · 외부 조직
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Research Questions Q1-Q4 */}
          <div className="border-b border-[#E4DFDF] p-6 sm:p-8">
            <p className="text-xs font-medium text-[#6B1D2B]">RESEARCH QUESTIONS</p>
            <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#191617]">
              핵심 연구 질문 및 탐색 결과 (Q1–Q4)
            </h3>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {researchQuestions.map((item) => (
                <div
                  key={item.q}
                  className="flex flex-col justify-between border border-[#E4DFDF] bg-[#F6F5F4] p-5"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-[#191617]">{item.q}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-[#615B5D]">{item.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onExplorePreset(item.preset)}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B1D2B] hover:underline"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quantitative Comparative Visualizations (6.1 - 6.5) */}
          <div className="grid grid-cols-1 border-b border-[#E4DFDF] lg:grid-cols-12">
            {/* Booth Comparison Table + Day Distribution */}
            <div className="border-b border-[#E4DFDF] p-6 sm:p-8 lg:col-span-6 lg:border-b-0 lg:border-r">
              <p className="text-xs font-medium text-[#6B1D2B]">QUANTITATIVE COMPARISON</p>
              <h3 className="mt-1 font-editorial text-xl font-semibold text-[#191617]">
                연도별 부스 운영 주체 및 일차별 분포
              </h3>

              <table className="mt-4 w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4DFDF] text-[#615B5D]">
                    <th className="py-2 pr-3 font-medium">구분</th>
                    <th className="py-2 pr-3 text-right font-medium">2025년</th>
                    <th className="py-2 pr-3 text-right font-medium">2026년</th>
                    <th className="py-2 text-right font-medium">변화</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DFDF] tabular-nums">
                  {boothComparison.map((row) => (
                    <tr key={row.label}>
                      <td className="py-2.5 pr-3 font-medium text-[#191617]">{row.label}</td>
                      <td className="py-2.5 pr-3 text-right font-mono-tabular text-[#615B5D]">
                        {row.y2025}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono-tabular font-semibold text-[#6B1D2B]">
                        {row.y2026}
                      </td>
                      <td className="py-2.5 text-right font-mono-tabular text-[#191617]">
                        {row.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 border-t border-[#E4DFDF] pt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#191617]">일자별 부스 운영 관계 수</span>
                  <div className="flex items-center gap-4 text-[11px] text-[#615B5D]">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 bg-[#191617]" aria-hidden="true" />
                      2025년 (84건)
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 bg-[#6B1D2B]" aria-hidden="true" />
                      2026년 (69건)
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {dayBoothCounts.map((item) => (
                    <div key={item.day} className="space-y-1">
                      <div className="flex justify-between text-xs tabular-nums">
                        <span className="font-medium text-[#191617]">{item.day}</span>
                        <span className="font-mono-tabular text-[#615B5D]">
                          2025: {item.y2025}건 / 2026: {item.y2026}건
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        <div className="h-2 w-full bg-[#F6F5F4]">
                          <div
                            className="h-full bg-[#191617]"
                            style={{ width: `${(item.y2025 / 35) * 100}%` }}
                          />
                        </div>
                        <div className="h-2 w-full bg-[#F6F5F4]">
                          <div
                            className="h-full bg-[#6B1D2B]"
                            style={{ width: `${(item.y2026 / 35) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration Shift + Recurring Entities */}
            <div className="p-6 sm:p-8 lg:col-span-6">
              <p className="text-xs font-medium text-[#6B1D2B]">CONTINUITY & DURATION</p>
              <h3 className="mt-1 font-editorial text-xl font-semibold text-[#191617]">
                운영 기간 변화 및 2년 연속 참여 주체
              </h3>

              <div className="mt-4 space-y-3">
                {durationCounts.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs tabular-nums">
                      <span className="font-medium text-[#191617]">{item.label}</span>
                      <span className="font-mono-tabular text-[#615B5D]">
                        2025: {item.y2025}개 → 2026: {item.y2026}개
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      <div className="h-2 w-full bg-[#F6F5F4]">
                        <div
                          className="h-full bg-[#191617]"
                          style={{ width: `${(item.y2025 / 28) * 100}%` }}
                        />
                      </div>
                      <div className="h-2 w-full bg-[#F6F5F4]">
                        <div
                          className="h-full bg-[#6B1D2B]"
                          style={{ width: `${(item.y2026 / 28) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#E4DFDF] pt-5 sm:grid-cols-2">
                <div className="border border-[#E4DFDF] bg-[#F6F5F4] p-4">
                  <p className="font-mono-tabular text-xs font-semibold text-[#6B1D2B]">
                    2년 연속 공연 주체 ({GRAPH_METRICS.recurringPerformers.length}팀)
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#191617]">
                    {GRAPH_METRICS.recurringPerformers.map((n) => n.name).join(' · ')}
                  </p>
                </div>
                <div className="border border-[#E4DFDF] bg-[#F6F5F4] p-4">
                  <p className="font-mono-tabular text-xs font-semibold text-[#6B1D2B]">
                    2년 연속 부스 운영 ({GRAPH_METRICS.recurringBooths.length}팀)
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[#191617]">
                    {GRAPH_METRICS.recurringBooths
                      .slice(0, 8)
                      .map((n) => n.name)
                      .join(' · ')}{' '}
                    외 {GRAPH_METRICS.recurringBooths.length - 8}개 단체
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Cypher Query Showcase (7.1 - 7.5) */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-[#6B1D2B]">CYPHER QUERY ARCHIVE</p>
                <h3 className="mt-1 font-editorial text-2xl font-semibold text-[#191617]">
                  핵심 Cypher 분석 쿼리 (7.1 — 7.5)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onExplorePreset(activeCypher.preset)}
                className="inline-flex items-center gap-2 bg-[#6B1D2B] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#52131F]"
              >
                <Database className="h-3.5 w-3.5" aria-hidden="true" />
                <span>데이터 탐색에서 결과 보기</span>
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-b border-[#E4DFDF] pb-4">
              {CYPHER_SNIPPETS.map((snippet, idx) => (
                <button
                  key={snippet.id}
                  type="button"
                  onClick={() => setActiveCypherIdx(idx)}
                  className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCypherIdx === idx
                      ? 'bg-[#6B1D2B] text-white'
                      : 'border border-[#E4DFDF] bg-[#F6F5F4] text-[#191617] hover:border-[#6B1D2B]'
                  }`}
                >
                  {snippet.number} {snippet.title}
                </button>
              ))}
            </div>

            <div className="mt-4 border border-[#E4DFDF] bg-[#191617] text-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 px-4 py-3">
                <p className="text-xs text-white/85">{activeCypher.description}</p>
                <button
                  type="button"
                  onClick={() => handleCopyQuery(activeCypher.id, activeCypher.query)}
                  className="inline-flex items-center gap-1.5 border border-white/25 px-3 py-1 text-[11px] text-white hover:bg-white/10"
                >
                  {copiedId === activeCypher.id ? (
                    <>
                      <Check className="h-3 w-3" aria-hidden="true" />
                      <span>복사 완료</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      <span>쿼리 복사</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-5 font-mono-tabular text-xs leading-relaxed text-[#F3EAEC]">
                <code>{activeCypher.query}</code>
              </pre>
            </div>
          </div>
        </article>
      )}

      {/* Additional Custom Projects Added via Career Manager */}
      {additionalProjects.length > 0 && (
        <section className="mt-8 space-y-6">
          <h2 className="font-editorial text-2xl font-semibold text-[#191617]">
            추가 프로젝트
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {additionalProjects.map((proj) => (
              <article key={proj.id} className="border border-[#E4DFDF] bg-white p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#615B5D]">
                  <span className="font-mono-tabular font-semibold text-[#6B1D2B]">
                    {proj.indexLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">{proj.period}</span>
                  <span aria-hidden="true">·</span>
                  <span>{proj.courseOrContext}</span>
                </div>
                <h3 className="mt-2 font-editorial text-xl font-semibold text-[#191617]">
                  {proj.title}
                </h3>
                {proj.subtitle && (
                  <p className="mt-0.5 text-xs text-[#615B5D]">{proj.subtitle}</p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-[#615B5D]">{proj.summary}</p>
                {proj.highlights.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-[#E4DFDF] pt-3 text-xs text-[#191617]">
                    {proj.highlights.map((h, i) => (
                      <li key={i}>· {h}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs text-[#615B5D]">
                  <span className="font-medium text-[#191617]">도구:</span>{' '}
                  {proj.tools.join(' · ')}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
