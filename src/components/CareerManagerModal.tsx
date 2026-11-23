import { ChangeEvent, useState } from 'react';
import {
  Download,
  FileCode2,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { CareerEntry, PortfolioData, ProjectEntry } from '../types/portfolio';
import { generateStandaloneHtml } from '../utils/exportStandaloneHtml';

interface CareerManagerModalProps {
  isOpen: boolean;
  data: PortfolioData;
  onSave: (nextData: PortfolioData) => void;
  onReset: () => void;
  onClose: () => void;
}

type ManagerTab = 'profile' | 'careers' | 'projects' | 'export';

export function CareerManagerModal({
  isOpen,
  data,
  onSave,
  onReset,
  onClose,
}: CareerManagerModalProps) {
  const [activeTab, setActiveTab] = useState<ManagerTab>('profile');
  const [draft, setDraft] = useState<PortfolioData>(data);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [newCareer, setNewCareer] = useState<Omit<CareerEntry, 'id'>>({
    period: '',
    category: '대외활동',
    organization: '',
    role: '',
    description: '',
  });

  const [newProject, setNewProject] = useState({
    title: '',
    subtitle: '',
    period: '',
    courseOrContext: '',
    myRole: '',
    toolsText: '',
    summary: '',
    highlightsText: '',
  });

  if (!isOpen) return null;

  const handleSaveAndClose = () => {
    onSave(draft);
    onClose();
  };

  const handleAddCareer = () => {
    if (!newCareer.period.trim() || !newCareer.organization.trim() || !newCareer.role.trim()) return;
    const updated: PortfolioData = {
      ...draft,
      careers: [
        { ...newCareer, id: `car-${Date.now()}` },
        ...draft.careers,
      ],
    };
    setDraft(updated);
    onSave(updated);
    setNewCareer({
      period: '',
      category: '대외활동',
      organization: '',
      role: '',
      description: '',
    });
  };

  const handleDeleteCareer = (id: string) => {
    const updated: PortfolioData = {
      ...draft,
      careers: draft.careers.filter((c) => c.id !== id),
    };
    setDraft(updated);
    onSave(updated);
  };

  const handleAddProject = () => {
    if (!newProject.title.trim() || !newProject.summary.trim()) return;
    const nextIdx = draft.projects.length + 1;
    const entry: ProjectEntry = {
      id: `proj-${Date.now()}`,
      indexLabel: `PROJECT 0${nextIdx}`,
      title: newProject.title.trim(),
      subtitle: newProject.subtitle.trim(),
      period: newProject.period.trim() || '2026',
      courseOrContext: newProject.courseOrContext.trim() || '개인 프로젝트',
      team: draft.profile.nameKo,
      myRole: newProject.myRole.trim() || '기획 및 분석',
      tools: newProject.toolsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      summary: newProject.summary.trim(),
      highlights: newProject.highlightsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const updated: PortfolioData = {
      ...draft,
      projects: [...draft.projects, entry],
    };
    setDraft(updated);
    onSave(updated);
    setNewProject({
      title: '',
      subtitle: '',
      period: '',
      courseOrContext: '',
      myRole: '',
      toolsText: '',
      summary: '',
      highlightsText: '',
    });
  };

  const handleDeleteProject = (id: string) => {
    const updated: PortfolioData = {
      ...draft,
      projects: draft.projects.filter((p) => p.id !== id),
    };
    setDraft(updated);
    onSave(updated);
  };

  const handleExportJson = () => {
    onSave(draft);
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hyojeong-portfolio-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus('JSON 이력 백업 파일이 다운로드되었습니다.');
  };

  const handleImportJson = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as PortfolioData;
        if (!parsed.profile || !Array.isArray(parsed.careers) || !Array.isArray(parsed.projects)) {
          throw new Error('Invalid format');
        }
        setDraft(parsed);
        onSave(parsed);
        setImportError(null);
        setExportStatus('백업 JSON 데이터를 성공적으로 불러왔습니다.');
      } catch {
        setImportError('올바른 포트폴리오 JSON 파일 형식이 아닙니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadStandaloneHtml = async () => {
    onSave(draft);
    setExportStatus('GitHub Pages용 단일 index.html을 생성하는 중...');
    const html = await generateStandaloneHtml(draft);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
    setExportStatus(
      '빌드 없이 바로 열리는 단일 index.html이 다운로드되었습니다. GitHub 저장소에 그대로 업로드해 GitHub Pages로 배포하세요.',
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="career-manager-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col border border-[#E4DFDF] bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E4DFDF] px-6 py-4">
          <div>
            <p className="text-[11px] font-medium tracking-wider text-[#6B1D2B]">
              CAREER & PORTFOLIO MANAGER
            </p>
            <h2 id="career-manager-title" className="font-editorial text-2xl font-semibold text-[#191617]">
              이력 관리 및 GitHub Pages 내보내기
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#E4DFDF] p-2 text-[#615B5D] hover:border-[#6B1D2B] hover:text-[#191617]"
            aria-label="닫기"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-[#E4DFDF] bg-[#F6F5F4] px-6 py-2.5">
          {(
            [
              { id: 'profile', label: '기본 프로필·연락처' },
              { id: 'careers', label: `학력·경력 이력 (${draft.careers.length})` },
              { id: 'projects', label: `프로젝트 관리 (${draft.projects.length})` },
              { id: 'export', label: 'GitHub Pages 배포·백업' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'bg-[#6B1D2B] text-white'
                  : 'text-[#615B5D] hover:bg-white hover:text-[#191617]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#615B5D]">메인 헤드라인</label>
                <input
                  type="text"
                  value={draft.profile.headline}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, headline: e.target.value },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#615B5D]">서브 소개</label>
                <textarea
                  rows={2}
                  value={draft.profile.subheadline}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, subheadline: e.target.value },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#615B5D]">상세 자기소개</label>
                <textarea
                  rows={3}
                  value={draft.profile.bio}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, bio: e.target.value },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#615B5D]">희망 직무</label>
                <input
                  type="text"
                  value={draft.profile.targetRole}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, targetRole: e.target.value },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#615B5D]">이메일</label>
                <input
                  type="email"
                  value={draft.profile.contact.email}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: {
                        ...draft.profile,
                        contact: { ...draft.profile.contact, email: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#615B5D]">LinkedIn URL</label>
                <input
                  type="url"
                  value={draft.profile.contact.linkedin}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: {
                        ...draft.profile,
                        contact: { ...draft.profile.contact, linkedin: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#615B5D]">GitHub URL</label>
                <input
                  type="url"
                  value={draft.profile.contact.github}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: {
                        ...draft.profile,
                        contact: { ...draft.profile.contact, github: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#615B5D]">활동 SNS (인스타그램 등)</label>
                <input
                  type="text"
                  value={draft.profile.contact.instagram}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: {
                        ...draft.profile,
                        contact: { ...draft.profile.contact, instagram: e.target.value },
                      },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#615B5D]">희망 근무지역</label>
                <input
                  type="text"
                  value={draft.profile.targetLocation}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, targetLocation: e.target.value },
                    })
                  }
                  className="mt-1 w-full border border-[#E4DFDF] px-3 py-2 text-sm focus:border-[#6B1D2B] focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'careers' && (
            <div className="space-y-6">
              <div className="border border-[#E4DFDF] bg-[#F6F5F4] p-4">
                <h3 className="text-sm font-semibold text-[#191617]">새 학력 · 활동 · 경력 추가</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="기간 (예: 2027.03 — 2027.08)"
                    value={newCareer.period}
                    onChange={(e) => setNewCareer({ ...newCareer, period: e.target.value })}
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                  <select
                    value={newCareer.category}
                    onChange={(e) =>
                      setNewCareer({
                        ...newCareer,
                        category: e.target.value as CareerEntry['category'],
                      })
                    }
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  >
                    <option value="학력">학력</option>
                    <option value="연구">연구</option>
                    <option value="대외활동">대외활동</option>
                    <option value="경력">경력</option>
                    <option value="수상·자격">수상·자격</option>
                  </select>
                  <input
                    type="text"
                    placeholder="기관 / 단체명"
                    value={newCareer.organization}
                    onChange={(e) => setNewCareer({ ...newCareer, organization: e.target.value })}
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  placeholder="역할 또는 직책"
                  value={newCareer.role}
                  onChange={(e) => setNewCareer({ ...newCareer, role: e.target.value })}
                  className="mt-3 w-full border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="주요 활동 및 성과 설명"
                  value={newCareer.description}
                  onChange={(e) => setNewCareer({ ...newCareer, description: e.target.value })}
                  className="mt-3 w-full border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCareer}
                  className="mt-3 inline-flex items-center gap-1.5 bg-[#6B1D2B] px-4 py-2 text-xs font-medium text-white hover:bg-[#52131F]"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>이력 항목 추가</span>
                </button>
              </div>

              <div className="divide-y divide-[#E4DFDF] border border-[#E4DFDF]">
                {draft.careers.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-xs text-[#615B5D]">
                        <span className="font-mono-tabular font-semibold text-[#6B1D2B]">
                          {item.period}
                        </span>{' '}
                        · {item.category} · {item.organization}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#191617]">{item.role}</p>
                      <p className="mt-1 text-xs text-[#615B5D]">{item.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCareer(item.id)}
                      className="border border-[#E4DFDF] p-2 text-[#615B5D] hover:border-[#6B1D2B] hover:text-[#6B1D2B]"
                      aria-label="이력 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="border border-[#E4DFDF] bg-[#F6F5F4] p-4">
                <h3 className="text-sm font-semibold text-[#191617]">새 프로젝트 추가</h3>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="프로젝트명"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="영문 부제 (선택)"
                    value={newProject.subtitle}
                    onChange={(e) => setNewProject({ ...newProject, subtitle: e.target.value })}
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="진행 기간 (예: 2027.03 — 2027.06)"
                    value={newProject.period}
                    onChange={(e) => setNewProject({ ...newProject, period: e.target.value })}
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="수업 / 학회 / 소속"
                    value={newProject.courseOrContext}
                    onChange={(e) =>
                      setNewProject({ ...newProject, courseOrContext: e.target.value })
                    }
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="담당 역할"
                    value={newProject.myRole}
                    onChange={(e) => setNewProject({ ...newProject, myRole: e.target.value })}
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="사용 도구 (쉼표 구분: Python, GA4, Figma)"
                    value={newProject.toolsText}
                    onChange={(e) => setNewProject({ ...newProject, toolsText: e.target.value })}
                    className="border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="프로젝트 요약 설명"
                  value={newProject.summary}
                  onChange={(e) => setNewProject({ ...newProject, summary: e.target.value })}
                  className="mt-3 w-full border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="핵심 성과 (줄바꿈으로 구분)"
                  value={newProject.highlightsText}
                  onChange={(e) =>
                    setNewProject({ ...newProject, highlightsText: e.target.value })
                  }
                  className="mt-3 w-full border border-[#E4DFDF] bg-white px-3 py-2 text-xs focus:border-[#6B1D2B] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="mt-3 inline-flex items-center gap-1.5 bg-[#6B1D2B] px-4 py-2 text-xs font-medium text-white hover:bg-[#52131F]"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>프로젝트 추가</span>
                </button>
              </div>

              <div className="divide-y divide-[#E4DFDF] border border-[#E4DFDF]">
                {draft.projects.map((proj) => (
                  <div key={proj.id} className="flex items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-xs text-[#615B5D]">
                        <span className="font-mono-tabular font-semibold text-[#6B1D2B]">
                          {proj.indexLabel}
                        </span>{' '}
                        · {proj.period} · {proj.courseOrContext}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#191617]">{proj.title}</p>
                      <p className="mt-1 text-xs text-[#615B5D]">{proj.summary}</p>
                    </div>
                    {!proj.isFeaturedNeo4j && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(proj.id)}
                        className="border border-[#E4DFDF] p-2 text-[#615B5D] hover:border-[#6B1D2B] hover:text-[#6B1D2B]"
                        aria-label="프로젝트 삭제"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Primary Zero-Build Single index.html Export */}
              <div className="bg-[#6B1D2B] p-6 text-white">
                <p className="font-mono-tabular text-[11px] tracking-widest text-white/75">
                  ZERO-BUILD GITHUB PAGES DEPLOYMENT
                </p>
                <h3 className="mt-1 font-editorial text-2xl font-semibold">
                  단일 index.html 파일로 내보내기
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/85">
                  현재 수정한 자기소개·이력·프로젝트와 프로필 이미지, Neo4j 지식그래프 데이터(150 노드·242 관계)를 모두 하나의 HTML 파일 안에 내장해 다운로드합니다. 별도 설치나 빌드 과정 없이 브라우저에서 바로 열리며 GitHub Pages 저장소에 그대로 업로드할 수 있습니다.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadStandaloneHtml}
                  className="mt-4 inline-flex items-center gap-2 bg-white px-5 py-2.5 text-xs font-semibold text-[#6B1D2B] transition-colors hover:bg-[#F6F5F4]"
                >
                  <FileCode2 className="h-4 w-4" aria-hidden="true" />
                  <span>GitHub Pages용 단일 index.html 다운로드</span>
                </button>
              </div>

              {/* JSON Backup & Restore */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border border-[#E4DFDF] p-5">
                  <h4 className="text-sm font-semibold text-[#191617]">이력 데이터 JSON 백업</h4>
                  <p className="mt-1 text-xs text-[#615B5D]">
                    현재 입력된 프로필, 학력·경력, 프로젝트 목록을 JSON 파일로 저장합니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="mt-3 inline-flex items-center gap-1.5 border border-[#E4DFDF] bg-[#F6F5F4] px-3.5 py-2 text-xs font-medium text-[#191617] hover:border-[#6B1D2B]"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>JSON 내보내기</span>
                  </button>
                </div>

                <div className="border border-[#E4DFDF] p-5">
                  <h4 className="text-sm font-semibold text-[#191617]">백업 JSON 불러오기</h4>
                  <p className="mt-1 text-xs text-[#615B5D]">
                    이전에 저장한 포트폴리오 JSON 파일을 불러와 상태를 복원합니다.
                  </p>
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 border border-[#E4DFDF] bg-[#F6F5F4] px-3.5 py-2 text-xs font-medium text-[#191617] hover:border-[#6B1D2B]">
                    <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>JSON 파일 선택</span>
                    <input
                      type="file"
                      accept="application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {exportStatus && (
                <p className="border border-[#6B1D2B]/30 bg-[#6B1D2B]/5 px-4 py-3 text-xs text-[#6B1D2B]">
                  {exportStatus}
                </p>
              )}
              {importError && (
                <p className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {importError}
                </p>
              )}

              <div className="border-t border-[#E4DFDF] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#615B5D] hover:text-[#6B1D2B]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>기본 위키·프로젝트 데이터로 초기화</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E4DFDF] bg-[#F6F5F4] px-6 py-3.5">
          <span className="text-xs text-[#615B5D]">
            변경사항은 브라우저에 자동 저장되며 단일 index.html로 내보낼 수 있습니다.
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#E4DFDF] bg-white px-4 py-2 text-xs font-medium text-[#615B5D] hover:text-[#191617]"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="bg-[#6B1D2B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#52131F]"
            >
              저장 및 적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
