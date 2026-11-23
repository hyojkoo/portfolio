import { PortfolioData } from '../types/portfolio';

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    nameKo: '구효정',
    nameEn: 'HYOJEONG KOO',
    headline: '언어의 맥락과 경영의 구조로 데이터를 읽는 예비 마케터, 구효정',
    subheadline:
      '고려대학교 언어학과 주전공 · 경영학 복수전공(2025 입학). 텍스트와 관계 데이터를 구조화하고 브랜드·문화 현상의 인사이트를 도출합니다.',
    bio: '인문학적 언어 분석력과 경영학적 의사결정 프레임워크를 연결해, 사람과 브랜드가 만나는 접점을 데이터로 해석합니다. 「디지털인문학응용」 프로젝트에서는 2025·2026 고려대학교 석탑대동제 참여 주체 150개 노드와 242개 관계를 Neo4j 지식그래프로 구축해 연도별 축제 운영 전략의 변화를 분석했습니다.',
    university: '고려대학교 (Korea University)',
    admissionYear: '2025',
    major: '언어학과',
    doubleMajor: '경영학 (복수전공)',
    targetRole: '마케터 (데이터 기반 브랜드 · 콘텐츠 마케팅)',
    targetLocation: '서울',
    mbti: 'INTJ',
    primaryAiTool: 'ChatGPT',
    clubInterest: '밴드 분과',
    soulFood: '떡볶이',
    dreamDestination: '스위스',
    photoUrl: '/assets/khj_profile.jpeg',
    contact: {
      email: 'hyoj.koo@gmail.com',
      wikiUrl: 'https://dh.aks.ac.kr/~kimseoyun/wiki/index.php/%EC%82%AC%EC%9A%A9%EC%9E%90:%EA%B5%AC%ED%9A%A8%EC%A0%95',
      instagram: '인스타그램 (@hyoj.koo)',
      linkedin: 'https://www.linkedin.com',
      github: 'https://github.com',
    },
  },
  careers: [
    {
      id: 'car-1',
      period: '2025.03 — 현재',
      category: '학력',
      organization: '고려대학교 문과대학 · 경영대학',
      role: '언어학과 주전공 / 경영학 복수전공',
      description:
        '언어 데이터 구조 분석과 마케팅·경영 전략 과목을 병행하며 데이터 기반 커뮤니케이션 및 소비자 인사이트 역량을 기르고 있습니다.',
    },
    {
      id: 'car-2',
      period: '2026.10 — 2026.12',
      category: '연구',
      organization: '고려대학교 「디지털인문학응용」 D팀',
      role: '지식그래프 연구원 · LLM 프롬프트 설계 및 데이터 추출',
      description:
        '2025 KUdyssey 및 2026 Kulimax 석탑대동제 아티스트·학생단체·외부 브랜드 부스 데이터를 수집하고, LLM 프롬프트 기반 정제 및 Neo4j 지식그래프 Cypher 분석을 수행했습니다.',
    },
    {
      id: 'car-3',
      period: '2025.03 — 현재',
      category: '대외활동',
      organization: '디지털 인문학 위키 아카이브',
      role: '위키 문서 작성 및 관계 데이터 아카이빙',
      description:
        'MediaWiki 기반 학술 위키 환경에서 개인 연구 기록과 문화 데이터 온톨로지 문서를 구조화해 관리하고 있습니다.',
    },
  ],
  projects: [
    {
      id: 'proj-seoktap-kg',
      indexLabel: 'PROJECT 01',
      title: '2025–2026 고려대학교 석탑대동제 지식그래프 분석',
      subtitle: 'Knowledge Graph Analysis of Korea University Seoktap Daedongje (2025–2026)',
      period: '2026.10 — 2026.12',
      courseOrContext: '고려대학교 「디지털인문학응용」 팀 프로젝트 (D팀)',
      team: '구효정, 최우진, 정민주, 심성민',
      myRole: '언어학과 · LLM 프롬프트 입력 및 데이터 결과 추출, 그래프 관계 모델링 보조',
      tools: ['Neo4j', 'Cypher', 'Knowledge Graph', 'ChatGPT', 'Gemini', 'Google Docs'],
      summary:
        '2025년(KUdyssey)과 2026년(Kulimax) 석탑대동제의 연예인 섭외, 학생 공연, 외부 조직 및 학생단체의 부스 운영 데이터를 총 150개 노드와 242개 관계의 Neo4j 지식그래프로 구축하고 Cypher 쿼리로 운영 구조의 변화를 비교 분석했습니다.',
      highlights: [
        '2026년 부스 운영 주체 총 45개(+12.5%) 중 학생참여주체 비중이 60.0%에서 75.6%(+15.6%p)로 크게 상승함을 확인',
        '2년 연속 무대에 오른 학생 공연 주체 7개(크림슨, TERRA, 와일드아이즈, KUDT, 라온제나, 1905, 오칼) 및 연속 부스 운영 주체 17개 도출',
        '2026년 3일 모두 부스를 운영한 주체는 16개→5개로 줄고 1일 단기 운영은 12개→26개로 증가해 축제 초반 집중·단기화 경향 규명',
      ],
      isFeaturedNeo4j: true,
    },
  ],
};
