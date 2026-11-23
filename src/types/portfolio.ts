export type ViewTab = 'about' | 'projects' | 'explorer';

export interface ProfileInfo {
  nameKo: string;
  nameEn: string;
  headline: string;
  subheadline: string;
  bio: string;
  university: string;
  admissionYear: string;
  major: string;
  doubleMajor: string;
  targetRole: string;
  targetLocation: string;
  mbti: string;
  primaryAiTool: string;
  clubInterest: string;
  soulFood: string;
  dreamDestination: string;
  photoUrl: string;
  contact: {
    email: string;
    wikiUrl: string;
    instagram: string;
    linkedin: string;
    github: string;
  };
}

export interface CareerEntry {
  id: string;
  period: string;
  category: '학력' | '연구' | '대외활동' | '경력' | '수상·자격';
  organization: string;
  role: string;
  description: string;
}

export interface ProjectEntry {
  id: string;
  indexLabel: string;
  title: string;
  subtitle: string;
  period: string;
  courseOrContext: string;
  team: string;
  myRole: string;
  tools: string[];
  summary: string;
  highlights: string[];
  isFeaturedNeo4j?: boolean;
}

export interface PortfolioData {
  profile: ProfileInfo;
  careers: CareerEntry[];
  projects: ProjectEntry[];
}

export type Neo4jNodeLabel = '축제' | '일자' | '연예인' | '학생참여주체' | '조직';
export type Neo4jRelType = 'HAS_DAY' | 'PERFORMED_IN' | 'OPERATED_BOOTH_IN';

export interface Neo4jNode {
  id: string;
  labels: Neo4jNodeLabel[];
  properties: {
    id: string;
    name: string;
    class: Neo4jNodeLabel;
    year?: number;
    genre?: string;
    industry?: string;
    orgType?: string;
    participationType?: string;
  };
}

export interface Neo4jRelationship {
  id: string;
  type: Neo4jRelType;
  source: string;
  target: string;
  properties: Record<string, unknown>;
}

export interface RawNeo4jDataset {
  nodes: Neo4jNode[];
  relationships: Neo4jRelationship[];
}

export type ExplorerPreset =
  | 'all'
  | 'recurring_performers'
  | 'recurring_booths'
  | 'celebrities'
  | 'organizations'
  | 'year_2025'
  | 'year_2026';
