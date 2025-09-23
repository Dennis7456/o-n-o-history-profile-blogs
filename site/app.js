const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const state = {
  chronology: null,
  blog: null,
  company: null,
  filters: { category: '', year: '' },
};

function categoryColor(category) {
  const map = {
    'Constitutional Law': 'dot-constitutional',
    'Election Law': 'dot-election',
    'International Criminal Law': 'dot-international',
    'International Investment Law': 'dot-investment',
    'Government Appointments': 'dot-appointment',
    'International Criminal Court': 'dot-international',
    'Elections & Parties Law': 'dot-election',
  };
  return map[category] || 'dot-constitutional';
}

async function loadData() {
  const [chron, blog, company] = await Promise.all([
    fetch('./data/kennedy-ogetto-cases-chronological.json').then(r => r.json()),
    fetch('./data/blog.json').then(r => r.json()),
    fetch('./data/company-profile.json').then(r => r.json()),
  ]);
  state.chronology = chron.kennedy_ogetto_cases;
  state.blog = blog.blog;
  state.company = company.company_profile;
}

function buildFilters() {
  const years = new Set();
  (state.chronology.blog_posts || []).forEach(p => years.add((p.publication_date || '').slice(0,4)));
  (state.blog.posts || []).forEach(p => years.add((p.publication_date || '').slice(0,4)));
  const yearArr = Array.from(years).filter(Boolean).sort();
  const yearSel = $('#yearFilter');
  yearArr.forEach(y => { const o = document.createElement('option'); o.value = y; o.textContent = y; yearSel.appendChild(o); });

  const cats = new Set();
  (state.chronology.blog_posts || []).forEach(p => cats.add(p.category));
  (state.blog.posts || []).forEach(p => cats.add(p.category));
  const catSel = $('#categoryFilter');
  Array.from(cats).filter(Boolean).sort().forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; catSel.appendChild(o); });
}

function entryMatchesFilters(entry) {
  const y = (entry.publication_date || '').slice(0,4);
  if (state.filters.year && y !== state.filters.year) return false;
  if (state.filters.category && entry.category !== state.filters.category) return false;
  return true;
}

function renderTimeline() {
  const list = $('#timelineList');
  list.innerHTML = '';
  const posts = (state.chronology.blog_posts || []).slice().sort((a,b) => (a.publication_date||'').localeCompare(b.publication_date));
  posts.forEach(p => {
    if (!entryMatchesFilters(p)) return;
    const li = document.createElement('li');
    li.className = 'timeline-item';
    const dot = categoryColor(p.category);
    const date = p.publication_date || '';
    li.innerHTML = `
      <div class="meta"><span class="dot ${dot}"></span><span>${date}</span><span class="badge">${p.category||''}</span></div>
      <div class="title">${p.title}</div>
      <div class="excerpt">${p.excerpt || ''}</div>
      <div class="actions-row">
        ${Array.isArray(p.sources) ? p.sources.map(s => `<a class="btn btn-small" href="${s.url}" target="_blank" rel="noopener">Source</a>`).join('') : ''}
        <button class="btn btn-small" data-print>Download PDF</button>
      </div>
    `;
    li.querySelector('[data-print]')?.addEventListener('click', () => printSingleEntry(p));
    list.appendChild(li);
  });
}

function renderBlog() {
  const grid = $('#blogGrid');
  grid.innerHTML = '';
  const posts = (state.blog.posts || []).slice().sort((a,b) => (b.publication_date||'').localeCompare(a.publication_date));
  posts.forEach(p => {
    if (!entryMatchesFilters(p)) return;
    const card = document.createElement('article');
    card.className = 'card';
    const dot = categoryColor(p.category);
    card.innerHTML = `
      <div class="meta"><span class="dot ${dot}"></span> <span class="badge">${p.category||''}</span> · <span>${p.publication_date||''}</span></div>
      <h3>${p.title}</h3>
      <p>${p.excerpt || ''}</p>
      <div class="actions-row">
        ${Array.isArray(p.sources) ? p.sources.map(s => `<a class="btn btn-small" href="${s.url}" target="_blank" rel="noopener">Source</a>`).join('') : ''}
        <button class="btn btn-small" data-print>Download PDF</button>
      </div>
    `;
    card.querySelector('[data-print]')?.addEventListener('click', () => printSingleEntry(p));
    grid.appendChild(card);
  });
}

function renderCompany() {
  const container = $('#companyContent');
  if (!state.company) return;
  
  const company = state.company;
  
  container.innerHTML = `
    <div style="padding: 16px;">
      <!-- Firm Overview -->
      <section class="company-section">
        <h2 style="color: var(--brand); margin-bottom: 16px;">${company.firm_name}</h2>
        <p style="margin-bottom: 16px; font-size: 16px; line-height: 1.6;">${company.firm_description}</p>
        <div style="background: var(--panel); padding: 12px; border-radius: 8px; margin-bottom: 24px;">
          <strong>Established:</strong> ${new Date(company.established).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </section>

      <!-- Vision & Mission -->
      <section class="company-section">
        <h3 style="color: var(--brand); margin-bottom: 12px;">Vision & Mission</h3>
        <div style="display: grid; gap: 16px; margin-bottom: 24px;">
          <div style="background: var(--panel); padding: 12px; border-radius: 8px;">
            <strong>Vision:</strong> ${company.vision}
          </div>
          <div style="background: var(--panel); padding: 12px; border-radius: 8px;">
            <strong>Mission:</strong> ${company.mission}
          </div>
        </div>
      </section>

      <!-- Founding Partners -->
      <section class="company-section">
        <h3 style="color: var(--brand); margin-bottom: 16px;">Founding Partners</h3>
        <div style="display: grid; gap: 16px; margin-bottom: 24px;">
          ${company.founding_partners.map(partner => `
            <div style="background: var(--panel); padding: 16px; border-radius: 8px;">
              <h4 style="color: var(--brand); margin-bottom: 8px;">${partner.name}</h4>
              <p style="margin-bottom: 12px;"><strong>Title:</strong> ${partner.title}</p>
              ${partner.qualifications ? `<p style="margin-bottom: 12px;"><strong>Qualifications:</strong> ${partner.qualifications}</p>` : ''}
              
              ${partner.government_positions && partner.government_positions.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <strong>Government Positions:</strong>
                  <ul style="margin: 8px 0 0 16px;">
                    ${partner.government_positions.map(pos => `
                      <li>${pos.position}${pos.organization ? ` - ${pos.organization}` : ''} (${pos.period})</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${partner.international_experience && partner.international_experience.length > 0 ? `
                <div>
                  <strong>International Experience:</strong>
                  <ul style="margin: 8px 0 0 16px;">
                    ${partner.international_experience.map(exp => `<li>${exp}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Values -->
      <section class="company-section">
        <h3 style="color: var(--brand); margin-bottom: 12px;">Our Values</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 24px;">
          ${company.values.map(value => `
            <div style="background: var(--panel); padding: 12px; border-radius: 8px; text-align: center;">
              <strong>${value}</strong>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Practice Areas -->
      <section class="company-section">
        <h3 style="color: var(--brand); margin-bottom: 16px;">Areas of Practice</h3>
        <div style="display: grid; gap: 16px;">
          ${company.areas_of_practice.map(area => `
            <div style="background: var(--panel); padding: 16px; border-radius: 8px;">
              <h4 style="color: var(--brand); margin-bottom: 8px;">${area.name}</h4>
              <p style="margin-bottom: 12px;">${area.description}</p>
              
              ${area.services && area.services.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <strong>Services:</strong>
                  <ul style="margin: 8px 0 0 16px;">
                    ${area.services.map(service => `<li>${service}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${area.legislation_covered && area.legislation_covered.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <strong>Legislation Covered:</strong>
                  <ul style="margin: 8px 0 0 16px;">
                    ${area.legislation_covered.map(law => `<li>${law}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${area.notable_cases && area.notable_cases.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  <strong>Notable Cases:</strong>
                  <ul style="margin: 8px 0 0 16px;">
                    ${area.notable_cases.map(case_item => `<li>${case_item}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              ${area.client_types && area.client_types.length > 0 ? `
                <div>
                  <strong>Client Types:</strong>
                  <ul style="margin: 8px 0 0 16px;">
                    ${area.client_types.map(client => `<li>${client}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Pro Bono -->
      <section class="company-section">
        <h3 style="color: var(--brand); margin-bottom: 12px;">Pro Bono Services</h3>
        <div style="background: var(--panel); padding: 16px; border-radius: 8px;">
          <p style="margin-bottom: 12px;">${company.areas_of_practice.find(area => area.name === 'Pro Bono Services')?.description || ''}</p>
          <p><strong>Target Groups:</strong> ${company.areas_of_practice.find(area => area.name === 'Pro Bono Services')?.target_groups?.join(', ') || ''}</p>
        </div>
      </section>
    </div>
  `;
}

function printSingleEntry(entry) {
  const w = window.open('', '_blank');
  const style = `
    <style>
      body{font-family:Inter,system-ui,sans-serif;padding:24px;}
      h1{font-size:20px;margin:0 0 8px}
      .meta{color:#555;font-size:12px;margin-bottom:12px}
      .section{margin:12px 0}
      .small{color:#555;font-size:12px}
      a{color:#0645ad}
    </style>`;
  const sources = Array.isArray(entry.sources) ? entry.sources.map(s => `<div>- <a href="${s.url}">${s.title||s.url}</a></div>`).join('') : '';
  const content = entry.content?.introduction || entry.excerpt || '';
  const main = entry.content?.main_content ? `<div class="section">${entry.content.main_content.replace(/\n/g,'<br/>')}</div>` : '';
  const conclusion = entry.content?.conclusion ? `<div class="section">${entry.content.conclusion}</div>` : '';
  w.document.write(`
    <html><head><title>${entry.title}</title>${style}</head><body>
      <h1>${entry.title}</h1>
      <div class="meta">${entry.publication_date||''} · ${entry.category||''}</div>
      <div class="section">${content}</div>
      ${main}
      ${conclusion}
      <div class="section"><strong>Sources</strong>${sources}</div>
      <div class="small">Generated from Ogeto History Docs</div>
    </body></html>
  `);
  w.document.close();
  w.focus();
  w.print();
}

function wireUI() {
  $('#printPageBtn')?.addEventListener('click', () => window.print());
  $('#categoryFilter')?.addEventListener('change', (e) => { state.filters.category = e.target.value; refresh(); });
  $('#yearFilter')?.addEventListener('change', (e) => { state.filters.year = e.target.value; refresh(); });
  $('#clearFiltersBtn')?.addEventListener('click', () => { state.filters = { category: '', year: '' }; $('#categoryFilter').value=''; $('#yearFilter').value=''; refresh(); });
  $$('#sidebar .nav-link').forEach(a => a.addEventListener('click', (ev) => {
    ev.preventDefault();
    $$('#sidebar .nav-link').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
    const target = a.getAttribute('href');
    $$('#timeline, #blog, #company').forEach(sec => sec.hidden = true);
    $(target).hidden = false;
  }));
  $('#timelineSearch')?.addEventListener('input', (e) => doSearch(e.target.value, 'timeline'));
  $('#blogSearch')?.addEventListener('input', (e) => doSearch(e.target.value, 'blog'));
  $('#companySearch')?.addEventListener('input', (e) => doSearch(e.target.value, 'company'));
  $('#yearNow').textContent = new Date().getFullYear();
}

function doSearch(q, which) {
  q = (q||'').trim().toLowerCase();
  if (which === 'timeline') {
    const list = $('#timelineList');
    $$('.timeline-item', list).forEach(item => {
      const txt = item.textContent.toLowerCase();
      item.style.display = txt.includes(q) ? '' : 'none';
    });
  } else if (which === 'blog') {
    const grid = $('#blogGrid');
    $$('.card', grid).forEach(card => {
      const txt = card.textContent.toLowerCase();
      card.style.display = txt.includes(q) ? '' : 'none';
    });
  } else if (which === 'company') {
    const container = $('#companyContent');
    $$('.company-section', container).forEach(section => {
      const txt = section.textContent.toLowerCase();
      section.style.display = txt.includes(q) ? '' : 'none';
    });
  }
}

function refresh() {
  renderTimeline();
  renderBlog();
  renderCompany();
}

(async function init(){
  await loadData();
  buildFilters();
  wireUI();
  refresh();
})();


