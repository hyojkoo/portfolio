import { ExplorerPreset, Neo4jNode, Neo4jNodeLabel, Neo4jRelationship, Neo4jRelType } from '../types/portfolio';
import { RAW_NEO4J_DATASET } from './rawNeo4jData';

export interface EnrichedNode {
  id: string;
  codeId: string;
  label: Neo4jNodeLabel;
  name: string;
  genre?: string;
  industry?: string;
  orgType?: string;
  participationType?: string;
  year?: number;
  days2025: string[];
  days2026: string[];
  allDays: string[];
  relTypes: Neo4jRelType[];
  isRecurringBothYears: boolean;
  isRecurringPerformer: boolean;
  isRecurringBooth: boolean;
  neighborIds: string[];
}

export interface CypherSnippet {
  id: string;
  number: string;
  title: string;
  description: string;
  preset: ExplorerPreset;
  query: string;
}

export const CYPHER_SNIPPETS: CypherSnippet[] = [
  {
    id: 'q-booth-year',
    number: '7.1',
    title: '연도별 부스 운영 주체 수 비교',
    description: '2025년(40개) 대비 2026년(45개) 부스 참여 주체 중 학생참여주체 비중(60.0% → 75.6%) 증가 비교',
    preset: 'organizations',
    query: `MATCH (f:축제)-[:HAS_DAY]->(d:일자)
MATCH (n)-[:OPERATED_BOOTH_IN]->(d)
WHERE f.year IN [2025, 2026]
  AND (n:조직 OR n:학생참여주체)

WITH f.year AS 연도, collect(DISTINCT n) AS 참여주체

RETURN
    연도,
    size([n IN 참여주체 WHERE n:조직]) AS 외부조직,
    size([n IN 참여주체 WHERE n:학생참여주체]) AS 학생참여주체,
    size(참여주체) AS 합계
ORDER BY 연도;`,
  },
  {
    id: 'q-recurring-booth',
    number: '7.2',
    title: '두 연도 모두 부스를 운영한 학생참여주체',
    description: '2025년과 2026년 연속으로 부스를 운영한 17개 교내 학생단체 추출',
    preset: 'recurring_booths',
    query: `MATCH (s:학생참여주체)-[:OPERATED_BOOTH_IN]->(d:일자)
MATCH (f:축제)-[:HAS_DAY]->(d)
WHERE f.year IN [2025, 2026]

WITH s, collect(DISTINCT f.year) AS 참여연도

WHERE 2025 IN 참여연도
  AND 2026 IN 참여연도

RETURN
    s.name AS 학생참여주체,
    참여연도
ORDER BY 학생참여주체;`,
  },
  {
    id: 'q-day-dist',
    number: '7.3',
    title: '연도별 일차별 부스 운영 관계 수',
    description: '2026년 3일 차 운영 관계가 28건에서 12건(-57.1%)으로 감소한 초반 집중 현상 확인',
    preset: 'year_2026',
    query: `MATCH (f:축제)-[:HAS_DAY]->(d:일자)
MATCH (n)-[r:OPERATED_BOOTH_IN]->(d)
WHERE f.year IN [2025, 2026]
  AND (n:조직 OR n:학생참여주체)

RETURN
    f.year AS 연도,
    d.name AS 운영일자,
    count(r) AS 운영관계수
ORDER BY 연도, 운영일자;`,
  },
  {
    id: 'q-duration',
    number: '7.4',
    title: '운영 기간별 참여 주체 수 비교',
    description: '3일 연속 운영 주체는 16개→5개로 줄고, 1일 단기 운영은 12개→26개로 증가한 패턴 분석',
    preset: 'recurring_performers',
    query: `MATCH (f:축제)-[:HAS_DAY]->(d:일자)
MATCH (n)-[:OPERATED_BOOTH_IN]->(d)
WHERE f.year IN [2025, 2026]
  AND (n:조직 OR n:학생참여주체)

WITH
    f.year AS 연도,
    n,
    count(DISTINCT d) AS 운영일수

RETURN
    연도,
    운영일수,
    count(n) AS 운영주체수
ORDER BY 연도, 운영일수;`,
  },
  {
    id: 'q-graph-path',
    number: '7.5',
    title: '부스 운영 관계 그래프 시각화',
    description: '축제–일자–부스 운영 주체 간 연결 경로 전체를 Neo4j 그래프 형태로 반환',
    preset: 'all',
    query: `MATCH path =
    (n)-[:OPERATED_BOOTH_IN]->(d:일자)
    <-[:HAS_DAY]-(f:축제)
WHERE f.year IN [2025, 2026]
  AND (n:조직 OR n:학생참여주체)

RETURN path;`,
  },
];

const DAY_NAME_MAP: Record<string, string> = {};
RAW_NEO4J_DATASET.nodes.forEach((n) => {
  if (n.labels[0] === '일자') {
    DAY_NAME_MAP[n.id] = n.properties.name;
  }
});

const nodeMap = new Map<string, Neo4jNode>();
RAW_NEO4J_DATASET.nodes.forEach((n) => nodeMap.set(n.id, n));

export const ENRICHED_NODES: EnrichedNode[] = RAW_NEO4J_DATASET.nodes.map((node) => {
  const days2025: string[] = [];
  const days2026: string[] = [];
  const relTypesSet = new Set<Neo4jRelType>();
  const neighborSet = new Set<string>();
  let hasPerf2025 = false;
  let hasPerf2026 = false;
  let hasBooth2025 = false;
  let hasBooth2026 = false;

  RAW_NEO4J_DATASET.relationships.forEach((rel) => {
    if (rel.source === node.id || rel.target === node.id) {
      const otherId = rel.source === node.id ? rel.target : rel.source;
      neighborSet.add(otherId);
      relTypesSet.add(rel.type);

      if (rel.source === node.id && (rel.type === 'PERFORMED_IN' || rel.type === 'OPERATED_BOOTH_IN')) {
        const dayName = DAY_NAME_MAP[rel.target];
        if (dayName) {
          if (dayName.startsWith('2025')) {
            if (!days2025.includes(dayName)) days2025.push(dayName);
            if (rel.type === 'PERFORMED_IN') hasPerf2025 = true;
            if (rel.type === 'OPERATED_BOOTH_IN') hasBooth2025 = true;
          } else if (dayName.startsWith('2026')) {
            if (!days2026.includes(dayName)) days2026.push(dayName);
            if (rel.type === 'PERFORMED_IN') hasPerf2026 = true;
            if (rel.type === 'OPERATED_BOOTH_IN') hasBooth2026 = true;
          }
        }
      }
    }
  });

  days2025.sort();
  days2026.sort();

  const label = node.labels[0];
  const isRecurringBothYears = days2025.length > 0 && days2026.length > 0;
  const isRecurringPerformer = label === '학생참여주체' && hasPerf2025 && hasPerf2026;
  const isRecurringBooth = label === '학생참여주체' && hasBooth2025 && hasBooth2026;

  return {
    id: node.id,
    codeId: node.properties.id,
    label,
    name: node.properties.name,
    genre: node.properties.genre,
    industry: node.properties.industry,
    orgType: node.properties.orgType?.trim(),
    participationType: node.properties.participationType,
    year: node.properties.year,
    days2025,
    days2026,
    allDays: [...days2025, ...days2026],
    relTypes: Array.from(relTypesSet),
    isRecurringBothYears,
    isRecurringPerformer,
    isRecurringBooth,
    neighborIds: Array.from(neighborSet),
  };
});

export const ENRICHED_NODE_BY_ID = new Map<string, EnrichedNode>(
  ENRICHED_NODES.map((n) => [n.id, n]),
);

export const ALL_RELATIONSHIPS: Neo4jRelationship[] = RAW_NEO4J_DATASET.relationships;

export function getNodeAttributeSummary(node: EnrichedNode): string {
  if (node.label === '연예인') return node.genre || '아티스트';
  if (node.label === '조직') return node.industry || '외부 조직';
  if (node.label === '학생참여주체') {
    return `${node.orgType || '학생단체'} · ${node.participationType || '참여'}`;
  }
  if (node.label === '축제') return `${node.year} 석탑대동제`;
  return '축제 운영 일자';
}

export const GRAPH_METRICS = {
  totalNodes: ENRICHED_NODES.length,
  totalRelationships: ALL_RELATIONSHIPS.length,
  festivals: ENRICHED_NODES.filter((n) => n.label === '축제').length,
  days: ENRICHED_NODES.filter((n) => n.label === '일자').length,
  celebrities: ENRICHED_NODES.filter((n) => n.label === '연예인').length,
  students: ENRICHED_NODES.filter((n) => n.label === '학생참여주체').length,
  organizations: ENRICHED_NODES.filter((n) => n.label === '조직').length,
  recurringPerformers: ENRICHED_NODES.filter((n) => n.isRecurringPerformer),
  recurringBooths: ENRICHED_NODES.filter((n) => n.isRecurringBooth),
};
