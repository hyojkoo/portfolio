import { useMemo, useState } from 'react';
import {
  RotateCcw,
  Search,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  ALL_RELATIONSHIPS,
  ENRICHED_NODES,
  ENRICHED_NODE_BY_ID,
  EnrichedNode,
  getNodeAttributeSummary,
} from '../data/neo4jGraph';
import { ExplorerPreset, Neo4jNodeLabel, Neo4jRelType } from '../types/portfolio';

interface DataExplorerSectionProps {
  initialPreset?: ExplorerPreset;
}

interface PositionedNode extends EnrichedNode {
  x: number;
  y: number;
  radius: number;
}

const PRESET_OPTIONS: { id: ExplorerPreset; label: string }[] = [
  { id: 'all', label: '전체 그래프 (150)' },
  { id: 'recurring_performers', label: '2년 연속 공연 (7)' },
  { id: 'recurring_booths', label: '2년 연속 부스 (17)' },
  { id: 'celebrities', label: '연예인 라인업 (31)' },
  { id: 'organizations', label: '외부 조직·브랜드 (27)' },
  { id: 'year_2025', label: '2025 KUdyssey' },
  { id: 'year_2026', label: '2026 Kulimax' },
];

const LABEL_COLORS: Record<Neo4jNodeLabel, string> = {
  축제: '#6B1D2B',
  일자: '#52131F',
  연예인: '#A13D4D',
  학생참여주체: '#191617',
  조직: '#615B5D',
};

export function DataExplorerSection({ initialPreset = 'all' }: DataExplorerSectionProps) {
  const [preset, setPreset] = useState<ExplorerPreset>(initialPreset);
  const [labelFilter, setLabelFilter] = useState<'all' | '연예인' | '학생참여주체' | '조직'>('all');
  const [relFilter, setRelFilter] = useState<'all' | 'PERFORMED_IN' | 'OPERATED_BOOTH_IN'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const [sortBy, setSortBy] = useState<'degree' | 'name'>('degree');

  const handleSelectPreset = (nextPreset: ExplorerPreset) => {
    setPreset(nextPreset);
    setSelectedNodeId(null);
    if (nextPreset === 'celebrities') {
      setLabelFilter('연예인');
      setRelFilter('PERFORMED_IN');
    } else if (nextPreset === 'organizations') {
      setLabelFilter('조직');
      setRelFilter('OPERATED_BOOTH_IN');
    } else if (nextPreset === 'recurring_performers') {
      setLabelFilter('학생참여주체');
      setRelFilter('PERFORMED_IN');
    } else if (nextPreset === 'recurring_booths') {
      setLabelFilter('학생참여주체');
      setRelFilter('OPERATED_BOOTH_IN');
    } else {
      setLabelFilter('all');
      setRelFilter('all');
    }
  };

  // Filter entity nodes (exclude 축제/일자 from filterable entities, keep structural hubs visible)
  const filteredEntities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return ENRICHED_NODES.filter((n) => {
      if (n.label === '축제' || n.label === '일자') return false;

      if (preset === 'recurring_performers' && !n.isRecurringPerformer) return false;
      if (preset === 'recurring_booths' && !n.isRecurringBooth) return false;
      if (preset === 'celebrities' && n.label !== '연예인') return false;
      if (preset === 'organizations' && n.label !== '조직') return false;
      if (preset === 'year_2025' && n.days2025.length === 0) return false;
      if (preset === 'year_2026' && n.days2026.length === 0) return false;

      if (labelFilter !== 'all' && n.label !== labelFilter) return false;
      if (relFilter !== 'all' && !n.relTypes.includes(relFilter)) return false;

      if (q) {
        const hay = `${n.name} ${n.codeId} ${n.genre || ''} ${n.industry || ''} ${n.orgType || ''} ${n.participationType || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [preset, labelFilter, relFilter, searchQuery]);

  // Build deterministic bipartite/architectural layout for SVG graph
  const graphLayout = useMemo(() => {
    const visibleEntityIds = new Set(filteredEntities.map((n) => n.id));
    const structuralNodes = ENRICHED_NODES.filter((n) => n.label === '축제' || n.label === '일자');

    const positioned = new Map<string, PositionedNode>();

    // Structural coordinates (1000 x 620 canvas)
    const festPositions: Record<string, { x: number; y: number }> = {
      FEST2025: { x: 240, y: 72 },
      FEST2026: { x: 760, y: 72 },
    };

    const dayPositions: Record<string, { x: number; y: number }> = {
      DAY001: { x: 115, y: 175 },
      DAY002: { x: 240, y: 175 },
      DAY003: { x: 365, y: 175 },
      DAY004: { x: 635, y: 175 },
      DAY005: { x: 760, y: 175 },
      DAY006: { x: 885, y: 175 },
    };

    structuralNodes.forEach((n) => {
      const pos = festPositions[n.codeId] || dayPositions[n.codeId] || { x: 500, y: 100 };
      positioned.set(n.id, {
        ...n,
        x: pos.x,
        y: pos.y,
        radius: n.label === '축제' ? 24 : 16,
      });
    });

    // Partition entities into 2025-only, Both-years (Bridge), 2026-only
    const only2025: EnrichedNode[] = [];
    const bothYears: EnrichedNode[] = [];
    const only2026: EnrichedNode[] = [];

    filteredEntities.forEach((n) => {
      if (n.days2025.length > 0 && n.days2026.length > 0) {
        bothYears.push(n);
      } else if (n.days2025.length > 0) {
        only2025.push(n);
      } else {
        only2026.push(n);
      }
    });

    const placeBand = (
      list: EnrichedNode[],
      xMin: number,
      xMax: number,
      yMin: number,
      yMax: number,
    ) => {
      const cols = Math.max(1, Math.ceil(Math.sqrt(list.length * 1.45)));
      const rows = Math.max(1, Math.ceil(list.length / cols));
      list.forEach((node, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const xStep = cols > 1 ? (xMax - xMin) / (cols - 1) : 0;
        const yStep = rows > 1 ? (yMax - yMin) / (rows - 1) : 0;
        const jitterX = (row % 2 === 1 ? 14 : -14) * (cols > 1 ? 0.5 : 0);
        const x = cols > 1 ? xMin + col * xStep + jitterX : (xMin + xMax) / 2;
        const y = rows > 1 ? yMin + row * yStep : (yMin + yMax) / 2;
        positioned.set(node.id, {
          ...node,
          x,
          y,
          radius: node.isRecurringBothYears ? 9.5 : 7.5,
        });
      });
    };

    placeBand(only2025, 55, 365, 270, 565);
    placeBand(bothYears, 425, 575, 250, 565);
    placeBand(only2026, 635, 945, 270, 565);

    const visibleEdges = ALL_RELATIONSHIPS.filter((rel) => {
      if (rel.type === 'HAS_DAY') return true;
      if (relFilter !== 'all' && rel.type !== relFilter) return false;
      return visibleEntityIds.has(rel.source);
    });

    return {
      nodes: Array.from(positioned.values()),
      positionedMap: positioned,
      edges: visibleEdges,
    };
  }, [filteredEntities, relFilter]);

  const activeFocusId = hoveredNodeId || selectedNodeId;
  const activeFocusNode = activeFocusId ? ENRICHED_NODE_BY_ID.get(activeFocusId) : undefined;
  const activeNeighborSet = useMemo(() => {
    if (!activeFocusNode) return new Set<string>();
    return new Set([activeFocusNode.id, ...activeFocusNode.neighborIds]);
  }, [activeFocusNode]);

  // Analytics Breakdown for current filtered entities
  const breakdownStats = useMemo(() => {
    const counts = new Map<string, number>();
    filteredEntities.forEach((n) => {
      let key = '';
      if (n.label === '연예인') key = `연예인 · ${n.genre || '기타'}`;
      else if (n.label === '조직') key = `조직 · ${n.industry || '기타'}`;
      else key = `학생 · ${n.orgType || '기타'}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);
  }, [filteredEntities]);

  const sortedTableRows = useMemo(() => {
    return [...filteredEntities].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ko');
      if (b.allDays.length !== a.allDays.length) return b.allDays.length - a.allDays.length;
      return a.name.localeCompare(b.name, 'ko');
    });
  }, [filteredEntities, sortBy]);

  const selectedNode = selectedNodeId ? ENRICHED_NODE_BY_ID.get(selectedNodeId) : undefined;

  const relTypeLabel = (type: Neo4jRelType) => {
    if (type === 'PERFORMED_IN') return '무대 공연';
    if (type === 'OPERATED_BOOTH_IN') return '부스 운영';
    return '개최 일자';
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-8 sm:py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E4DFDF] pb-6">
        <div>
          <p className="text-xs font-medium tracking-wider text-[#6B1D2B]">
            NEO4J DATA EXPLORER
          </p>
          <h1 className="mt-1 font-editorial text-3xl font-semibold text-[#191617] sm:text-4xl">
            석탑대동제 지식그래프 데이터 탐색
          </h1>
          <p className="mt-1.5 text-sm text-[#615B5D]">
            실제 Neo4j 내보내기 데이터(150개 노드 · 242개 관계)를 조건별로 필터링하고 노드 연결 구조를 직접 탐색합니다.
          </p>
        </div>

        <div className="flex items-center gap-4 border border-[#E4DFDF] bg-white px-4 py-2.5 text-xs tabular-nums">
          <span>
            표시 주체 <strong className="font-mono-tabular text-[#6B1D2B]">{filteredEntities.length}</strong>개
          </span>
          <span className="text-[#E4DFDF]">|</span>
          <span>
            연결 관계{' '}
            <strong className="font-mono-tabular text-[#191617]">
              {graphLayout.edges.length}
            </strong>
            건
          </span>
        </div>
      </div>

      {/* Preset Query Bar & Filters */}
      <section className="mt-6 border border-[#E4DFDF] bg-white p-5">
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectPreset(opt.id)}
              className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                preset === opt.id
                  ? 'bg-[#6B1D2B] text-white'
                  : 'border border-[#E4DFDF] bg-[#F6F5F4] text-[#191617] hover:border-[#6B1D2B]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#E4DFDF] pt-4 md:grid-cols-12">
          {/* Search Input */}
          <div className="relative md:col-span-5">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#615B5D]"
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 장르(걸그룹), 산업(식음료), 소속(중앙동아리) 검색..."
              aria-label="노드 검색"
              className="w-full border border-[#E4DFDF] bg-[#F6F5F4] py-2 pr-3 pl-9 text-xs text-[#191617] placeholder:text-[#615B5D] focus:border-[#6B1D2B] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Label Filter */}
          <div className="flex flex-wrap items-center gap-1.5 md:col-span-4">
            {(['all', '연예인', '학생참여주체', '조직'] as const).map((lbl) => (
              <button
                key={lbl}
                type="button"
                onClick={() => setLabelFilter(lbl)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  labelFilter === lbl
                    ? 'bg-[#191617] text-white'
                    : 'border border-[#E4DFDF] bg-white text-[#615B5D] hover:text-[#191617]'
                }`}
              >
                {lbl === 'all' ? '전체 주체' : lbl}
              </button>
            ))}
          </div>

          {/* Relation Filter */}
          <div className="flex flex-wrap items-center gap-1.5 md:col-span-3 md:justify-end">
            {(
              [
                { id: 'all', label: '전체 관계' },
                { id: 'PERFORMED_IN', label: '공연' },
                { id: 'OPERATED_BOOTH_IN', label: '부스' },
              ] as const
            ).map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => setRelFilter(rel.id)}
                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  relFilter === rel.id
                    ? 'bg-[#6B1D2B] text-white'
                    : 'border border-[#E4DFDF] bg-white text-[#615B5D] hover:text-[#191617]'
                }`}
              >
                {rel.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Split: Interactive SVG Graph + Node Inspector */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: SVG Interactive Graph Canvas */}
        <div className="flex flex-col border border-[#E4DFDF] bg-white lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DFDF] px-5 py-3">
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#615B5D]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#6B1D2B]" aria-hidden="true" />
                축제·일자
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#A13D4D]" aria-hidden="true" />
                연예인
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#191617]" aria-hidden="true" />
                학생참여주체
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 bg-[#615B5D]" aria-hidden="true" />
                외부 조직
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.4, +(z + 0.25).toFixed(2)))}
                className="border border-[#E4DFDF] p-1.5 text-[#191617] hover:border-[#6B1D2B]"
                aria-label="그래프 확대"
              >
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.25).toFixed(2)))}
                className="border border-[#E4DFDF] p-1.5 text-[#191617] hover:border-[#6B1D2B]"
                aria-label="그래프 축소"
              >
                <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPan({ x: 0, y: 0 });
                  setSelectedNodeId(null);
                }}
                className="inline-flex items-center gap-1 border border-[#E4DFDF] px-2.5 py-1.5 text-[11px] text-[#191617] hover:border-[#6B1D2B]"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>초기화</span>
              </button>
            </div>
          </div>

          <div
            className="relative h-[500px] w-full cursor-grab overflow-hidden bg-[#FAF9F8] active:cursor-grabbing"
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).dataset.nodeClick) return;
              setDragging({
                startX: e.clientX,
                startY: e.clientY,
                origX: pan.x,
                origY: pan.y,
              });
            }}
            onMouseMove={(e) => {
              if (!dragging) return;
              setPan({
                x: dragging.origX + (e.clientX - dragging.startX),
                y: dragging.origY + (e.clientY - dragging.startY),
              });
            }}
            onMouseUp={() => setDragging(null)}
            onMouseLeave={() => setDragging(null)}
          >
            <svg
              viewBox="0 0 1000 600"
              className="h-full w-full select-none"
              role="img"
              aria-label="석탑대동제 Neo4j 지식그래프 시각화"
            >
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* Zone Guides */}
                <text x="240" y="28" textAnchor="middle" fill="#615B5D" fontSize="11" fontWeight="600">
                  2025 KUdyssey 참여군
                </text>
                <text x="500" y="28" textAnchor="middle" fill="#6B1D2B" fontSize="11" fontWeight="600">
                  2년 연속 교집합 ({ENRICHED_NODES.filter((n) => n.isRecurringBothYears).length})
                </text>
                <text x="760" y="28" textAnchor="middle" fill="#615B5D" fontSize="11" fontWeight="600">
                  2026 Kulimax 참여군
                </text>
                <line x1="402" y1="40" x2="402" y2="580" stroke="#E4DFDF" strokeDasharray="4 4" />
                <line x1="598" y1="40" x2="598" y2="580" stroke="#E4DFDF" strokeDasharray="4 4" />

                {/* Edges */}
                {graphLayout.edges.map((rel) => {
                  const s = graphLayout.positionedMap.get(rel.source);
                  const t = graphLayout.positionedMap.get(rel.target);
                  if (!s || !t) return null;

                  const isHighlighted =
                    activeFocusId &&
                    (rel.source === activeFocusId || rel.target === activeFocusId);
                  const isDimmed = activeFocusId && !isHighlighted;

                  return (
                    <line
                      key={rel.id}
                      x1={s.x}
                      y1={s.y}
                      x2={t.x}
                      y2={t.y}
                      stroke={
                        isHighlighted
                          ? '#6B1D2B'
                          : rel.type === 'HAS_DAY'
                            ? '#6B1D2B'
                            : rel.type === 'PERFORMED_IN'
                              ? '#C49AA2'
                              : '#C9C4C5'
                      }
                      strokeWidth={isHighlighted ? 2 : rel.type === 'HAS_DAY' ? 1.8 : 0.85}
                      strokeOpacity={isDimmed ? 0.12 : isHighlighted ? 0.95 : 0.6}
                    />
                  );
                })}

                {/* Nodes */}
                {graphLayout.nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isConnected = activeNeighborSet.has(node.id);
                  const isDimmed = activeFocusId && !isConnected;
                  const color = LABEL_COLORS[node.label];
                  const showLabel =
                    node.label === '축제' ||
                    node.label === '일자' ||
                    isSelected ||
                    hoveredNodeId === node.id ||
                    (activeFocusId && isConnected) ||
                    filteredEntities.length <= 35;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      style={{ opacity: isDimmed ? 0.2 : 1 }}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
                      }}
                    >
                      <circle
                        data-node-click="true"
                        r={isSelected ? node.radius + 3 : node.radius}
                        fill={color}
                        stroke={isSelected ? '#191617' : '#FFFFFF'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                      />
                      {node.label === '축제' && (
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="700"
                          pointerEvents="none"
                        >
                          {node.year}
                        </text>
                      )}
                      {node.label === '일자' && (
                        <text
                          y="3"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="8.5"
                          fontWeight="600"
                          pointerEvents="none"
                        >
                          {node.name.replace('2025 ', '').replace('2026 ', '').toUpperCase()}
                        </text>
                      )}
                      {showLabel && node.label !== '축제' && node.label !== '일자' && (
                        <text
                          y={node.radius + 11}
                          textAnchor="middle"
                          fill="#191617"
                          fontSize="9.5"
                          fontWeight={isSelected ? '700' : '500'}
                          pointerEvents="none"
                        >
                          {node.name.length > 12 ? `${node.name.slice(0, 12)}…` : node.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
            <div className="pointer-events-none absolute right-3 bottom-3 bg-white/90 px-2.5 py-1 text-[11px] text-[#615B5D] border border-[#E4DFDF]">
              노드 클릭: 상세 정보 · 빈 공간 드래그: 이동 · 배율 {Math.round(zoom * 100)}%
            </div>
          </div>
        </div>

        {/* Right: Node Inspector & Distribution Breakdown */}
        <aside className="flex flex-col gap-6 lg:col-span-4">
          {/* Inspector Card */}
          <div className="border border-[#E4DFDF] bg-white p-6">
            <p className="text-xs font-medium text-[#6B1D2B]">NODE INSPECTOR</p>
            {selectedNode ? (
              <div className="mt-2">
                <div className="flex items-center justify-between gap-2 border-b border-[#E4DFDF] pb-3">
                  <div>
                    <p className="font-mono-tabular text-xs text-[#615B5D]">
                      {selectedNode.codeId} · {selectedNode.label}
                    </p>
                    <h2 className="mt-0.5 font-editorial text-2xl font-semibold text-[#191617]">
                      {selectedNode.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNodeId(null)}
                    className="text-xs text-[#615B5D] hover:text-[#191617]"
                  >
                    선택 해제
                  </button>
                </div>

                <dl className="mt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#615B5D]">세부 속성</dt>
                    <dd className="text-right font-medium text-[#191617]">
                      {getNodeAttributeSummary(selectedNode)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#615B5D]">관계 유형</dt>
                    <dd className="text-right font-medium text-[#191617]">
                      {selectedNode.relTypes.map(relTypeLabel).join(' · ') || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#615B5D]">2025 KUdyssey</dt>
                    <dd className="text-right font-mono-tabular text-[#191617]">
                      {selectedNode.days2025.length > 0 ? selectedNode.days2025.join(', ') : '미참여'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#615B5D]">2026 Kulimax</dt>
                    <dd className="text-right font-mono-tabular text-[#191617]">
                      {selectedNode.days2026.length > 0 ? selectedNode.days2026.join(', ') : '미참여'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#615B5D]">연속 참여 여부</dt>
                    <dd className="text-right font-semibold text-[#6B1D2B]">
                      {selectedNode.isRecurringBothYears ? '2025–2026 연속 참여' : '단일 연도 참여'}
                    </dd>
                  </div>
                </dl>

                {selectedNode.neighborIds.length > 0 && (
                  <div className="mt-4 border-t border-[#E4DFDF] pt-3">
                    <p className="text-xs font-medium text-[#615B5D]">
                      연결된 노드 ({selectedNode.neighborIds.length})
                    </p>
                    <div className="mt-2 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                      {selectedNode.neighborIds.slice(0, 20).map((nid) => {
                        const nb = ENRICHED_NODE_BY_ID.get(nid);
                        if (!nb) return null;
                        return (
                          <button
                            key={nid}
                            type="button"
                            onClick={() => setSelectedNodeId(nid)}
                            className="border border-[#E4DFDF] bg-[#F6F5F4] px-2 py-1 text-[11px] text-[#191617] hover:border-[#6B1D2B]"
                          >
                            {nb.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-3 text-xs leading-relaxed text-[#615B5D]">
                <p>
                  그래프의 노드 또는 아래 표의 행을 클릭하면 해당 주체의 코드, 세부 속성, 참여 일자(2025/2026), 연결된 이웃 노드를 즉시 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* Live Breakdown Analytics */}
          <div className="border border-[#E4DFDF] bg-[#52131F] p-6 text-white">
            <p className="font-mono-tabular text-[11px] tracking-wider text-white/75">
              FILTERED DISTRIBUTION
            </p>
            <h3 className="mt-1 font-editorial text-xl font-semibold">현재 조건 내 분류 분포</h3>
            <div className="mt-4 space-y-3">
              {breakdownStats.length > 0 ? (
                breakdownStats.map(([label, count]) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-xs tabular-nums">
                      <span className="truncate pr-2 text-white/90">{label}</span>
                      <span className="font-mono-tabular font-semibold text-white">{count}개</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/15">
                      <div
                        className="h-full bg-white"
                        style={{
                          width: `${Math.max(6, (count / Math.max(1, filteredEntities.length)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/75">현재 검색 조건에 일치하는 노드가 없습니다.</p>
              )}
            </div>
          </div>
        </aside>
      </section>

      {/* Searchable Data Table */}
      <section className="mt-8 border border-[#E4DFDF] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4DFDF] pb-4">
          <div>
            <p className="text-xs font-medium text-[#6B1D2B]">ENTITY DIRECTORY</p>
            <h2 className="mt-1 font-editorial text-2xl font-semibold text-[#191617]">
              참여 주체 상세 테이블 ({sortedTableRows.length}건)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#615B5D]">정렬:</span>
            <button
              type="button"
              onClick={() => setSortBy('degree')}
              className={`px-3 py-1.5 font-medium ${
                sortBy === 'degree'
                  ? 'bg-[#6B1D2B] text-white'
                  : 'border border-[#E4DFDF] text-[#191617]'
              }`}
            >
              참여 일수순
            </button>
            <button
              type="button"
              onClick={() => setSortBy('name')}
              className={`px-3 py-1.5 font-medium ${
                sortBy === 'name'
                  ? 'bg-[#6B1D2B] text-white'
                  : 'border border-[#E4DFDF] text-[#191617]'
              }`}
            >
              가나다순
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-[420px] overflow-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="sticky top-0 bg-[#F6F5F4] text-[#615B5D]">
              <tr className="border-b border-[#E4DFDF]">
                <th className="px-3 py-2.5 font-medium">코드</th>
                <th className="px-3 py-2.5 font-medium">이름</th>
                <th className="px-3 py-2.5 font-medium">유형</th>
                <th className="px-3 py-2.5 font-medium">세부 속성</th>
                <th className="px-3 py-2.5 font-medium">2025 KUdyssey</th>
                <th className="px-3 py-2.5 font-medium">2026 Kulimax</th>
                <th className="px-3 py-2.5 text-right font-medium">총 일수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4DFDF] tabular-nums">
              {sortedTableRows.length > 0 ? (
                sortedTableRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedNodeId(row.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedNodeId === row.id
                        ? 'bg-[#6B1D2B]/10'
                        : 'hover:bg-[#F6F5F4]'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-mono-tabular text-[#615B5D]">{row.codeId}</td>
                    <td className="px-3 py-2.5 font-semibold text-[#191617]">{row.name}</td>
                    <td className="px-3 py-2.5 text-[#615B5D]">{row.label}</td>
                    <td className="px-3 py-2.5 text-[#615B5D]">{getNodeAttributeSummary(row)}</td>
                    <td className="px-3 py-2.5 font-mono-tabular text-[#191617]">
                      {row.days2025.length > 0
                        ? row.days2025.map((d) => d.replace('2025 ', '')).join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-2.5 font-mono-tabular text-[#191617]">
                      {row.days2026.length > 0
                        ? row.days2026.map((d) => d.replace('2026 ', '')).join(', ')
                        : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono-tabular font-semibold text-[#6B1D2B]">
                      {row.allDays.length}일
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-[#615B5D]">
                    검색 조건에 해당하는 참여 주체가 없습니다. 필터를 초기화해 보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
