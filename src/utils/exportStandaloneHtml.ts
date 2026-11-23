import { RAW_NEO4J_DATASET } from '../data/rawNeo4jData';
import { PortfolioData } from '../types/portfolio';

async function imageUrlToDataUrl(url: string): Promise<string> {
  if (!url || url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : url);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export async function generateStandaloneHtml(portfolio: PortfolioData): Promise<string> {
  const embeddedPhoto = await imageUrlToDataUrl(portfolio.profile.photoUrl);
  const safePortfolio: PortfolioData = {
    ...portfolio,
    profile: {
      ...portfolio.profile,
      photoUrl: embeddedPhoto,
    },
  };

  const portfolioJson = JSON.stringify(safePortfolio).replace(/<\/script/gi, '<\\/script');
  const neo4jJson = JSON.stringify(RAW_NEO4J_DATASET).replace(/<\/script/gi, '<\\/script');
  const titleEscaped = `${portfolio.profile.nameKo} 포트폴리오 | ${portfolio.profile.nameEn}`;

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titleEscaped}</title>
  <meta name="description" content="${portfolio.profile.subheadline.replace(/"/g, '&quot;')}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --crimson: #6B1D2B;
      --crimson-deep: #52131F;
      --paper: #F6F5F4;
      --ink: #191617;
      --muted: #615B5D;
      --hairline: #E4DFDF;
      --font-sans: 'Plus Jakarta Sans', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-serif: 'Cormorant Garamond', 'Noto Serif KR', Georgia, serif;
      --font-mono: 'JetBrains Mono', ui-monospace, monospace;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--font-sans); background: var(--paper); color: var(--ink); line-height: 1.6; }
    h1, h2, h3, .serif { font-family: var(--font-serif); }
    .mono { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
    a { color: inherit; text-decoration: none; }
    button { font-family: inherit; cursor: pointer; }
    header { position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,0.96); border-bottom: 1px solid var(--hairline); }
    .nav-wrap { max-width: 1280px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
    .brand { display: flex; align-items: center; gap: 10px; border: none; background: none; padding: 0; color: var(--ink); }
    .brand-icon { width: 32px; height: 32px; background: var(--crimson); color: #fff; display: grid; place-items: center; font-weight: 700; font-size: 13px; }
    .nav-links { display: flex; align-items: center; gap: 22px; }
    .nav-btn { background: none; border: none; border-bottom: 2px solid transparent; padding: 6px 0; font-size: 14px; font-weight: 500; color: var(--muted); white-space: nowrap; }
    .nav-btn.active { color: var(--crimson); font-weight: 600; border-bottom-color: var(--crimson); }
    .btn-primary { background: var(--crimson); color: #fff; border: 1px solid var(--crimson); padding: 8px 14px; font-size: 12px; font-weight: 600; white-space: nowrap; }
    .btn-outline { background: #fff; color: var(--ink); border: 1px solid var(--hairline); padding: 8px 14px; font-size: 12px; font-weight: 500; white-space: nowrap; }
    .container { max-width: 1280px; margin: 0 auto; padding: 32px 24px 64px; }
    .spread { display: grid; grid-template-columns: 7fr 5fr; border: 1px solid var(--hairline); background: #fff; }
    .spread-left { padding: 36px; display: flex; flex-direction: column; justify-content: space-between; }
    .spread-right { background: var(--crimson-deep); color: #fff; padding: 36px; display: flex; flex-direction: column; justify-content: space-between; }
    .contact-box { margin-top: 28px; background: var(--crimson); color: #fff; padding: 24px; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; font-size: 12px; }
    .contact-item { border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.15); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .metrics-strip { margin-top: 24px; display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid var(--hairline); background: #fff; }
    .metric-cell { padding: 20px; border-right: 1px solid var(--hairline); }
    .metric-cell:last-child { border-right: none; }
    .two-col { margin-top: 32px; display: grid; grid-template-columns: 7fr 5fr; gap: 28px; }
    .panel { border: 1px solid var(--hairline); background: #fff; padding: 28px; }
    .catalog-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 18px; }
    .cat-dark { background: var(--crimson); color: #fff; padding: 16px; }
    .cat-light { background: var(--paper); border: 1px solid var(--hairline); color: var(--ink); padding: 16px; }
    .toc-box { border: 1px solid rgba(255,255,255,0.25); padding: 18px; margin-top: 24px; }
    .toc-item { width: 100%; background: none; border: none; border-top: 1px solid rgba(255,255,255,0.15); padding: 12px 0; color: #fff; display: flex; justify-content: space-between; align-items: center; text-align: left; }
    .toc-num { background: #fff; color: var(--crimson-deep); width: 26px; height: 26px; display: grid; place-items: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--hairline); text-align: left; }
    th { background: var(--paper); color: var(--muted); font-weight: 600; }
    .filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .chip-btn { border: 1px solid var(--hairline); background: var(--paper); color: var(--ink); padding: 7px 12px; font-size: 12px; }
    .chip-btn.active { background: var(--crimson); color: #fff; border-color: var(--crimson); }
    .hidden { display: none !important; }
    .modal-backdrop { position: fixed; inset: 0; background: rgba(25,22,23,0.6); z-index: 60; display: grid; place-items: center; padding: 16px; }
    .modal-box { background: #fff; border: 1px solid var(--hairline); width: 100%; max-width: 720px; max-height: 88vh; overflow: auto; padding: 28px; }
    .field { width: 100%; border: 1px solid var(--hairline); padding: 8px 10px; font-size: 13px; margin-top: 4px; }
    label { display: block; font-size: 12px; color: var(--muted); margin-top: 12px; font-weight: 500; }
    @media (max-width: 900px) {
      .spread, .two-col { grid-template-columns: 1fr; }
      .metrics-strip { grid-template-columns: 1fr 1fr; }
      .contact-grid, .catalog-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="nav-wrap">
      <button class="brand" onclick="switchView('about')">
        <span class="brand-icon">HK</span>
        <span class="serif" style="font-size:18px;font-weight:600;" id="brand-title">${portfolio.profile.nameKo} · ${portfolio.profile.nameEn}</span>
      </button>
      <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
        <nav class="nav-links">
          <button class="nav-btn active" data-tab="about" onclick="switchView('about')">자기소개</button>
          <button class="nav-btn" data-tab="projects" onclick="switchView('projects')">프로젝트</button>
          <button class="nav-btn" data-tab="explorer" onclick="switchView('explorer')">데이터 탐색</button>
        </nav>
        <button class="btn-primary" onclick="openManager()">이력 관리</button>
      </div>
    </div>
  </header>

  <main class="container">
    <section id="view-about"></section>
    <section id="view-projects" class="hidden"></section>
    <section id="view-explorer" class="hidden"></section>
  </main>

  <footer style="border-top:1px solid var(--hairline);background:#fff;padding:24px;text-align:center;font-size:12px;color:var(--muted);">
    <span id="footer-copy"></span>
  </footer>

  <div id="manager-modal" class="modal-backdrop hidden"></div>

  <script>
    const INITIAL_PORTFOLIO = ${portfolioJson};
    const NEO4J_DATA = ${neo4jJson};
    const STORAGE_KEY = 'hyoj_portfolio_standalone_v1';

    let portfolio = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO;
      } catch { return INITIAL_PORTFOLIO; }
    })();

    let currentView = 'about';
    let explorerState = { preset: 'all', search: '', selectedId: null };

    function savePortfolio() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio)); } catch {}
      renderAll();
    }

    function switchView(tab) {
      currentView = tab;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
      ['about', 'projects', 'explorer'].forEach(id => {
        document.getElementById('view-' + id).classList.toggle('hidden', id !== tab);
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const dayNameMap = {};
    NEO4J_DATA.nodes.forEach(n => { if (n.labels[0] === '일자') dayNameMap[n.id] = n.properties.name; });

    const enrichedNodes = NEO4J_DATA.nodes.map(n => {
      const days2025 = [], days2026 = [], relTypes = new Set(), neighbors = new Set();
      let p25=false, p26=false, b25=false, b26=false;
      NEO4J_DATA.relationships.forEach(r => {
        if (r.source === n.id || r.target === n.id) {
          neighbors.add(r.source === n.id ? r.target : r.source);
          relTypes.add(r.type);
          if (r.source === n.id && (r.type === 'PERFORMED_IN' || r.type === 'OPERATED_BOOTH_IN')) {
            const dn = dayNameMap[r.target] || '';
            if (dn.startsWith('2025')) { if (!days2025.includes(dn)) days2025.push(dn); if (r.type==='PERFORMED_IN') p25=true; else b25=true; }
            if (dn.startsWith('2026')) { if (!days2026.includes(dn)) days2026.push(dn); if (r.type==='PERFORMED_IN') p26=true; else b26=true; }
          }
        }
      });
      return {
        id: n.id,
        codeId: n.properties.id,
        label: n.labels[0],
        name: n.properties.name,
        attr: n.properties.genre || n.properties.industry || ((n.properties.orgType || '') + (n.properties.participationType ? ' · ' + n.properties.participationType : '')) || n.labels[0],
        year: n.properties.year,
        days2025: days2025.sort(),
        days2026: days2026.sort(),
        isRecurringPerf: n.labels[0]==='학생참여주체' && p25 && p26,
        isRecurringBooth: n.labels[0]==='학생참여주체' && b25 && b26,
        neighbors: Array.from(neighbors)
      };
    });
    const nodeById = new Map(enrichedNodes.map(n => [n.id, n]));

    function esc(s) {
      return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function renderAbout() {
      const p = portfolio.profile;
      const el = document.getElementById('view-about');
      el.innerHTML = \`
        <div class="spread">
          <div class="spread-left">
            <div>
              <div style="font-size:12px;color:var(--muted);">
                <strong style="color:var(--crimson);">${'${esc(p.university)}'}</strong> · ${'${esc(p.major)}'} · ${'${esc(p.doubleMajor)}'} · ${'${esc(p.admissionYear)}'} 입학
              </div>
              <h1 style="font-size:36px;line-height:1.2;margin:14px 0 0;">${'${esc(p.headline)}'}</h1>
              <p style="margin:14px 0 0;color:var(--muted);font-size:15px;">${'${esc(p.subheadline)}'}</p>
              <p style="margin:12px 0 0;color:var(--muted);font-size:14px;">${'${esc(p.bio)}'}</p>
            </div>
            <div class="contact-box">
              <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:14px;">
                <div>
                  <div class="serif" style="font-size:20px;font-weight:600;">연락 방법 · GET IN TOUCH</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.8);">LinkedIn 포트폴리오 및 협업 문의</div>
                </div>
                <div style="display:flex;gap:8px;">
                  <button class="btn-outline" style="color:var(--crimson);font-weight:600;" onclick="switchView('projects')">프로젝트 보기</button>
                  <button class="btn-primary" style="border-color:rgba(255,255,255,0.5);" onclick="switchView('explorer')">데이터 탐색</button>
                </div>
              </div>
              <div class="contact-grid">
                <a class="contact-item" href="mailto:${'${esc(p.contact.email)}'}"><span>Email: ${'${esc(p.contact.email)}'}</span><span>↗</span></a>
                <a class="contact-item" href="${'${esc(p.contact.wikiUrl)}'}" target="_blank" rel="noopener"><span>디지털인문학 위키</span><span>↗</span></a>
                <a class="contact-item" href="${'${esc(p.contact.linkedin)}'}" target="_blank" rel="noopener"><span>LinkedIn</span><span>↗</span></a>
                <a class="contact-item" href="${'${esc(p.contact.github)}'}" target="_blank" rel="noopener"><span>GitHub · ${'${esc(p.contact.instagram)}'}</span><span>↗</span></a>
              </div>
            </div>
          </div>
          <div class="spread-right">
            <div style="display:grid;grid-template-columns:5fr 7fr;gap:18px;align-items:end;border-bottom:1px solid rgba(255,255,255,0.2);padding-bottom:20px;">
              <img src="${'${esc(p.photoUrl)}'}" alt="${'${esc(p.nameKo)}'}" style="width:100%;aspect-ratio:3/4;object-fit:cover;border:1px solid rgba(255,255,255,0.3);" />
              <div>
                <div style="font-size:11px;letter-spacing:0.14em;color:rgba(255,255,255,0.7);">PORTFOLIO CATALOG</div>
                <h2 style="font-size:28px;margin:4px 0 0;">${'${esc(p.nameKo)}'}</h2>
                <div style="font-size:12px;color:rgba(255,255,255,0.8);">${'${esc(p.nameEn)}'}</div>
                <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,0.2);padding-top:10px;font-size:12px;color:rgba(255,255,255,0.9);">
                  <div>소속 · ${'${esc(p.university)}'}</div>
                  <div>전공 · ${'${esc(p.major)}'} / ${'${esc(p.doubleMajor)}'}</div>
                  <div>희망 직무 · ${'${esc(p.targetRole)}'}</div>
                </div>
              </div>
            </div>
            <div class="toc-box">
              <div class="serif" style="font-size:16px;font-weight:600;margin-bottom:8px;">TABLE OF CONTENTS</div>
              <button class="toc-item" onclick="document.getElementById('career-list').scrollIntoView({behavior:'smooth'})"><span>학력 및 활동 이력</span><span class="toc-num">01</span></button>
              <button class="toc-item" onclick="switchView('projects')"><span>석탑대동제 지식그래프 프로젝트</span><span class="toc-num">02</span></button>
              <button class="toc-item" onclick="switchView('explorer')"><span>Neo4j 데이터 탐색 (150 노드)</span><span class="toc-num">03</span></button>
              <button class="toc-item" onclick="openManager()"><span>이력 추가·수정 및 내보내기</span><span class="toc-num">04</span></button>
            </div>
          </div>
        </div>

        <div class="metrics-strip">
          <div class="metric-cell"><div class="mono" style="font-size:26px;font-weight:700;color:var(--crimson);">150</div><div style="font-size:12px;font-weight:600;">지식그래프 노드</div></div>
          <div class="metric-cell"><div class="mono" style="font-size:26px;font-weight:700;color:var(--crimson);">242</div><div style="font-size:12px;font-weight:600;">참여·운영 관계</div></div>
          <div class="metric-cell"><div class="mono" style="font-size:26px;font-weight:700;">2025–2026</div><div style="font-size:12px;font-weight:600;">석탑대동제 비교</div></div>
          <div class="metric-cell"><div class="mono" style="font-size:26px;font-weight:700;">75.6%</div><div style="font-size:12px;font-weight:600;">2026 학생부스 비중</div></div>
        </div>

        <div class="two-col" id="career-list">
          <div class="panel">
            <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--hairline);padding-bottom:12px;">
              <h2 style="margin:0;font-size:24px;">학력 및 주요 이력</h2>
              <button class="btn-outline" onclick="openManager()">이력 수정</button>
            </div>
            ${'${portfolio.careers.map(c => `<div style="padding:16px 0;border-bottom:1px solid var(--hairline);"><div style="font-size:12px;color:var(--muted);"><span class="mono" style="color:var(--crimson);font-weight:600;">${esc(c.period)}</span> · ${esc(c.category)} · <strong>${esc(c.organization)}</strong></div><div style="font-size:15px;font-weight:600;margin-top:4px;">${esc(c.role)}</div><div style="font-size:13px;color:var(--muted);margin-top:4px;">${esc(c.description)}</div></div>`).join("")}'}
          </div>
          <div class="panel">
            <div style="border-bottom:1px solid var(--hairline);padding-bottom:12px;">
              <h2 style="margin:0;font-size:24px;">진로 및 관심사 인덱스</h2>
            </div>
            <div class="catalog-grid">
              <div class="cat-dark"><div style="font-size:11px;opacity:.75;">CAREER 01</div><div style="font-weight:600;margin-top:4px;">${'${esc(p.targetRole)}'}</div><div style="font-size:11px;margin-top:6px;opacity:.85;">희망 근무지: ${'${esc(p.targetLocation)}'}</div></div>
              <div class="cat-light"><div style="font-size:11px;color:var(--crimson);">WORKSTYLE 02</div><div style="font-weight:600;margin-top:4px;">${'${esc(p.mbti)}'} · ${'${esc(p.primaryAiTool)}'}</div><div style="font-size:11px;margin-top:6px;color:var(--muted);">구조화 및 데이터 정제</div></div>
              <div class="cat-dark"><div style="font-size:11px;opacity:.75;">CHANNEL 03</div><div style="font-weight:600;margin-top:4px;">${'${esc(p.contact.instagram)}'}</div><div style="font-size:11px;margin-top:6px;opacity:.85;">콘텐츠 트렌드 탐색</div></div>
              <div class="cat-light"><div style="font-size:11px;color:var(--crimson);">COMMUNITY 04</div><div style="font-weight:600;margin-top:4px;">${'${esc(p.clubInterest)}'} · ${'${esc(p.soulFood)}'}</div><div style="font-size:11px;margin-top:6px;color:var(--muted);">여행 희망: ${'${esc(p.dreamDestination)}'}</div></div>
            </div>
          </div>
        </div>
      \`;
    }

    function renderProjects() {
      const el = document.getElementById('view-projects');
      el.innerHTML = portfolio.projects.map(pr => \`
        <div class="panel" style="margin-bottom:24px;">
          <div style="font-size:12px;color:var(--muted);"><strong style="color:var(--crimson);">${'${esc(pr.indexLabel)}'}</strong> · ${'${esc(pr.period)}'} · ${'${esc(pr.courseOrContext)}'}</div>
          <h2 style="font-size:28px;margin:8px 0 4px;">${'${esc(pr.title)}'}</h2>
          <div style="font-size:12px;color:var(--muted);">${'${esc(pr.subtitle)}'}</div>
          <p style="margin-top:14px;font-size:14px;">${'${esc(pr.summary)}'}</p>
          <div style="margin-top:14px;font-size:12px;color:var(--muted);"><strong>담당 역할:</strong> ${'${esc(pr.myRole)}'} | <strong>도구:</strong> ${'${esc((pr.tools||[]).join(" · "))}'}</div>
          <ul style="margin:14px 0 0;padding-left:18px;font-size:13px;">${'${(pr.highlights||[]).map(h => `<li>${esc(h)}</li>`).join("")}'}</ul>
          ${'${pr.isFeaturedNeo4j ? `<div style="margin-top:18px;"><button class="btn-primary" onclick="switchView(\'explorer\')">Neo4j 데이터 탐색기로 이동</button></div>` : ""}'}
        </div>
      \`).join('');
    }

    function renderExplorer() {
      const el = document.getElementById('view-explorer');
      const presets = [
        ['all', '전체 (150)'],
        ['recurring_perf', '2년 연속 공연 (7)'],
        ['recurring_booth', '2년 연속 부스 (17)'],
        ['celebrity', '연예인 (31)'],
        ['org', '외부 조직 (27)']
      ];
      const q = explorerState.search.trim().toLowerCase();
      const entities = enrichedNodes.filter(n => {
        if (n.label === '축제' || n.label === '일자') return false;
        if (explorerState.preset === 'recurring_perf' && !n.isRecurringPerf) return false;
        if (explorerState.preset === 'recurring_booth' && !n.isRecurringBooth) return false;
        if (explorerState.preset === 'celebrity' && n.label !== '연예인') return false;
        if (explorerState.preset === 'org' && n.label !== '조직') return false;
        if (q && !(n.name + ' ' + n.attr + ' ' + n.codeId).toLowerCase().includes(q)) return false;
        return true;
      });

      const sel = explorerState.selectedId ? nodeById.get(explorerState.selectedId) : null;

      // Build clean bipartite SVG
      const f25 = {x:240,y:60}, f26 = {x:760,y:60};
      const dayCoords = {DAY001:{x:120,y:150},DAY002:{x:240,y:150},DAY003:{x:360,y:150},DAY004:{x:640,y:150},DAY005:{x:760,y:150},DAY006:{x:880,y:150}};
      const pos = new Map();
      enrichedNodes.forEach(n => {
        if (n.codeId === 'FEST2025') pos.set(n.id, f25);
        if (n.codeId === 'FEST2026') pos.set(n.id, f26);
        if (dayCoords[n.codeId]) pos.set(n.id, dayCoords[n.codeId]);
      });
      const o25 = entities.filter(n => n.days2025.length && !n.days2026.length);
      const both = entities.filter(n => n.days2025.length && n.days2026.length);
      const o26 = entities.filter(n => !n.days2025.length && n.days2026.length);
      function place(arr, x0, x1) {
        const cols = Math.max(1, Math.ceil(Math.sqrt(arr.length * 1.4)));
        const rows = Math.max(1, Math.ceil(arr.length / cols));
        arr.forEach((n, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const x = cols > 1 ? x0 + (c * (x1 - x0)) / (cols - 1) : (x0 + x1) / 2;
          const y = rows > 1 ? 235 + (r * 250) / (rows - 1) : 340;
          pos.set(n.id, {x, y});
        });
      }
      place(o25, 60, 360); place(both, 430, 570); place(o26, 640, 940);
      const entIds = new Set(entities.map(n => n.id));
      const edgesSvg = NEO4J_DATA.relationships.filter(r => r.type==='HAS_DAY' || entIds.has(r.source)).map(r => {
        const s = pos.get(r.source), t = pos.get(r.target);
        if (!s || !t) return '';
        const hi = sel && (r.source === sel.id || r.target === sel.id);
        return \`<line x1="${'${s.x}'}" y1="${'${s.y}'}" x2="${'${t.x}'}" y2="${'${t.y}'}" stroke="${'${hi ? "#6B1D2B" : "#CFC9CA"}'}" stroke-width="${'${hi ? 2 : 0.8}'}" opacity="${'${sel && !hi ? 0.15 : 0.75}'}"/>\`;
      }).join('');
      const nodesSvg = Array.from(pos.entries()).map(([id, pt]) => {
        const n = nodeById.get(id);
        const col = n.label==='축제'||n.label==='일자' ? '#6B1D2B' : n.label==='연예인' ? '#A13D4D' : n.label==='학생참여주체' ? '#191617' : '#615B5D';
        const r = n.label==='축제' ? 20 : n.label==='일자' ? 14 : 7;
        return \`<g transform="translate(${'${pt.x}'},${'${pt.y}'})" style="cursor:pointer" onclick="explorerState.selectedId='${'${id}'}';renderExplorer();"><circle r="${'${r}'}" fill="${'${col}'}" stroke="#fff" stroke-width="1.5"/>${'${n.label==="축제"||n.label==="일자"||entities.length<=35||id===explorerState.selectedId ? `<text y="${r+11}" text-anchor="middle" font-size="9" fill="#191617">${esc(n.name)}</text>` : ""}'}</g>\`;
      }).join('');

      el.innerHTML = \`
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
            <h2 style="margin:0;font-size:26px;">석탑대동제 Neo4j 지식그래프 탐색 (${'${entities.length}'}개 주체)</h2>
            <input class="field" style="max-width:280px;margin:0;" placeholder="이름·장르·산업 검색..." value="${'${esc(explorerState.search)}'}" oninput="explorerState.search=this.value;renderExplorer();" />
          </div>
          <div class="filter-bar">
            ${'${presets.map(([id,lbl]) => `<button class="chip-btn ${explorerState.preset===id?"active":""}" onclick="explorerState.preset=\'${id}\';explorerState.selectedId=null;renderExplorer();">${lbl}</button>`).join("")}'}
          </div>
          <div style="display:grid;grid-template-columns:8fr 4fr;gap:16px;">
            <div style="border:1px solid var(--hairline);background:#FAF9F8;">
              <svg viewBox="0 0 1000 520" style="width:100%;height:auto;display:block;">${'${edgesSvg}'}${'${nodesSvg}'}</svg>
            </div>
            <div style="border:1px solid var(--hairline);padding:16px;">
              <div style="font-size:11px;color:var(--crimson);font-weight:600;">NODE INSPECTOR</div>
              ${'${sel ? `<h3 style="margin:6px 0 4px;">${esc(sel.name)}</h3><div style="font-size:12px;color:var(--muted);">${esc(sel.codeId)} · ${esc(sel.label)} · ${esc(sel.attr)}</div><div style="margin-top:12px;font-size:12px;"><strong>2025:</strong> ${sel.days2025.join(", ")||"미참여"}<br/><strong>2026:</strong> ${sel.days2026.join(", ")||"미참여"}</div>` : `<p style="font-size:12px;color:var(--muted);margin-top:8px;">노드 또는 테이블 행을 클릭해 상세 정보를 확인하세요.</p>`}'}
            </div>
          </div>
          <div style="margin-top:20px;max-height:320px;overflow:auto;border:1px solid var(--hairline);">
            <table>
              <thead><tr><th>코드</th><th>이름</th><th>유형</th><th>세부 속성</th><th>2025</th><th>2026</th></tr></thead>
              <tbody>
                ${'${entities.map(r => `<tr style="cursor:pointer" onclick="explorerState.selectedId=\'${r.id}\';renderExplorer();"><td class="mono">${esc(r.codeId)}</td><td><strong>${esc(r.name)}</strong></td><td>${esc(r.label)}</td><td>${esc(r.attr)}</td><td class="mono">${esc(r.days2025.join(", ")||"—")}</td><td class="mono">${esc(r.days2026.join(", ")||"—")}</td></tr>`).join("")}'}
              </tbody>
            </table>
          </div>
        </div>
      \`;
    }

    function openManager() {
      const m = document.getElementById('manager-modal');
      m.classList.remove('hidden');
      const p = portfolio.profile;
      m.innerHTML = \`
        <div class="modal-box">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--hairline);padding-bottom:12px;">
            <h2 style="margin:0;font-size:22px;">이력 관리 (브라우저 저장)</h2>
            <button class="btn-outline" onclick="closeManager()">닫기</button>
          </div>
          <label>한 줄 소개<input class="field" id="m-headline" value="${'${esc(p.headline)}'}" /></label>
          <label>이메일<input class="field" id="m-email" value="${'${esc(p.contact.email)}'}" /></label>
          <label>희망 직무<input class="field" id="m-role" value="${'${esc(p.targetRole)}'}" /></label>
          <label>새 이력 추가 (기간 | 기관 | 역할)<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;"><input class="field" id="c-period" placeholder="2026.07 — 현재" /><input class="field" id="c-org" placeholder="기관명" /><input class="field" id="c-role" placeholder="역할" /></div></label>
          <div style="display:flex;gap:8px;margin-top:18px;flex-wrap:wrap;">
            <button class="btn-primary" onclick="applyManager()">저장하기</button>
            <button class="btn-outline" onclick="downloadJson()">JSON 백업 다운로드</button>
          </div>
        </div>
      \`;
    }
    function closeManager() { document.getElementById('manager-modal').classList.add('hidden'); }
    function applyManager() {
      portfolio.profile.headline = document.getElementById('m-headline').value;
      portfolio.profile.contact.email = document.getElementById('m-email').value;
      portfolio.profile.targetRole = document.getElementById('m-role').value;
      const per = document.getElementById('c-period').value.trim();
      const org = document.getElementById('c-org').value.trim();
      const role = document.getElementById('c-role').value.trim();
      if (per && org && role) {
        portfolio.careers.unshift({ id: 'car-' + Date.now(), period: per, category: '경력', organization: org, role, description: '' });
      }
      savePortfolio();
      closeManager();
    }
    function downloadJson() {
      const blob = new Blob([JSON.stringify(portfolio, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'portfolio-data.json';
      a.click();
    }

    function renderAll() {
      document.getElementById('brand-title').textContent = portfolio.profile.nameKo + ' · ' + portfolio.profile.nameEn;
      document.getElementById('footer-copy').textContent = '© ' + new Date().getFullYear() + ' ' + portfolio.profile.nameKo + ' (' + portfolio.profile.contact.email + ') · Standalone GitHub Pages Portfolio';
      renderAbout();
      renderProjects();
      renderExplorer();
    }
    renderAll();
  </script>
</body>
</html>`;
}
