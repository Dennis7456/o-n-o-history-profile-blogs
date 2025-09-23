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
    
    // Add click handler for the entire item
    li.addEventListener('click', (e) => {
      console.log('Timeline item clicked:', e.target);
      // Only show modal if not clicking on buttons or links
      if (!e.target.closest('.btn') && !e.target.closest('a')) {
        console.log('Showing modal for timeline item:', p.title);
        showModal(p);
      }
    });
    
    // Add click handler for print button
    li.querySelector('[data-print]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      printSingleEntry(p);
    });
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
    
    // Add click handler for the entire card
    card.addEventListener('click', (e) => {
      console.log('Blog card clicked:', e.target);
      // Only show modal if not clicking on buttons or links
      if (!e.target.closest('.btn') && !e.target.closest('a')) {
        console.log('Showing modal for blog item:', p.title);
        showModal(p);
      }
    });
    
    // Add click handler for print button
    card.querySelector('[data-print]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      printSingleEntry(p);
    });
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
  $('#mobileMenuBtn')?.addEventListener('click', toggleMobileMenu);
  $('#testModalBtn')?.addEventListener('click', () => {
    console.log('Test modal button clicked');
    const testEntry = {
      title: 'Test Entry',
      category: 'Test',
      publication_date: '2024-01-01',
      excerpt: 'This is a test entry to verify the modal functionality.',
      content: {
        introduction: 'This is the introduction of the test entry.',
        main_content: 'This is the main content of the test entry with detailed information.',
        conclusion: 'This is the conclusion of the test entry.'
      },
      sources: [
        { url: '#', title: 'Test Source' }
      ]
    };
    showModal(testEntry);
  });
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
    
    // Close mobile menu after navigation
    if (window.innerWidth <= 768) {
      $('#sidebar').classList.remove('open');
    }
  }));
  $('#timelineSearch')?.addEventListener('input', (e) => doSearch(e.target.value, 'timeline'));
  $('#blogSearch')?.addEventListener('input', (e) => doSearch(e.target.value, 'blog'));
  $('#companySearch')?.addEventListener('input', (e) => doSearch(e.target.value, 'company'));
  $('#yearNow').textContent = new Date().getFullYear();
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    const sidebar = $('#sidebar');
    const mobileMenuBtn = $('#mobileMenuBtn');
    
    if (window.innerWidth <= 768 && 
        sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
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

// Modal functions
function showModal(entry) {
  console.log('showModal called with:', entry);
  const modal = $('#itemModal');
  const title = $('#modalTitle');
  const body = $('#modalBody');
  
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  
  title.textContent = entry.title;
  
  // Build modal content
  let content = `
    <div class="modal-section">
      <div style="color: var(--muted); font-size: 14px; margin-bottom: 16px;">
        <span style="background: var(--panel); padding: 4px 8px; border-radius: 4px; margin-right: 8px;">${entry.category || 'General'}</span>
        <span>${entry.publication_date || 'No date'}</span>
        ${entry.author ? `<span style="margin-left: 8px;">by ${entry.author}</span>` : ''}
      </div>
    </div>
  `;
  
  // Add excerpt/introduction
  if (entry.excerpt || entry.content?.introduction) {
    content += `
      <div class="modal-section">
        <h3>Overview</h3>
        <p>${entry.excerpt || entry.content?.introduction || ''}</p>
      </div>
    `;
  }
  
  // Add main content
  if (entry.content?.main_content) {
    content += `
      <div class="modal-section">
        <h3>Details</h3>
        <p>${entry.content.main_content.replace(/\n/g, '<br/>')}</p>
      </div>
    `;
  }
  
  // Add conclusion
  if (entry.content?.conclusion) {
    content += `
      <div class="modal-section">
        <h3>Conclusion</h3>
        <p>${entry.content.conclusion}</p>
      </div>
    `;
  }
  
  // Add metadata if available
  if (entry.metadata) {
    content += `
      <div class="modal-section">
        <h3>Additional Information</h3>
        <p><strong>Tags:</strong> ${entry.metadata.tags ? entry.metadata.tags.join(', ') : 'None'}</p>
        ${entry.metadata.reading_time ? `<p><strong>Reading Time:</strong> ${entry.metadata.reading_time}</p>` : ''}
        ${entry.metadata.word_count ? `<p><strong>Word Count:</strong> ${entry.metadata.word_count}</p>` : ''}
      </div>
    `;
  }
  
  // Add sources
  if (Array.isArray(entry.sources) && entry.sources.length > 0) {
    content += `
      <div class="modal-section">
        <h3>Sources</h3>
        <div class="modal-sources">
          <ul>
            ${entry.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title || s.url}</a></li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }
  
  // Add related posts if available
  if (entry.related_posts && entry.related_posts.length > 0) {
    content += `
      <div class="modal-section">
        <h3>Related Posts</h3>
        <ul>
          ${entry.related_posts.map(rp => `<li><a href="#" onclick="showModal(${JSON.stringify(rp).replace(/"/g, '&quot;')}); return false;">${rp.title}</a></li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  body.innerHTML = content;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  console.log('Modal displayed:', modal.style.display);
  
  // Store current entry for PDF printing
  window.currentModalEntry = entry;
}

function closeModal() {
  const modal = $('#itemModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
  window.currentModalEntry = null;
}

function printModalContent() {
  if (window.currentModalEntry) {
    printSingleEntry(window.currentModalEntry);
  }
}

// Mobile menu functions
function toggleMobileMenu() {
  const sidebar = $('#sidebar');
  sidebar.classList.toggle('open');
}

// Make functions globally available
window.showModal = showModal;
window.closeModal = closeModal;
window.printModalContent = printModalContent;
window.toggleMobileMenu = toggleMobileMenu;

(async function init(){
  await loadData();
  buildFilters();
  wireUI();
  refresh();
})();


