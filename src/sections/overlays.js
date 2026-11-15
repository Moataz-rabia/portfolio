import { content, projects, stations, timeline, ui } from '../data/content.js';

const PROJECT_NUMBERS = {
  deephysolver: '09',
  cyberpark: '07',
  'cafe-temps-reel': '11',
};

/** Échappe les textes insérés dans le HTML. */
function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function star() {
  return '<span class="star-mark" aria-hidden="true"></span>';
}

function tagList(items) {
  return `<ul class="tag-list">${items
    .map((item) => `<li>${esc(item)}</li>`)
    .join('')}</ul>`;
}

function projectCardMarkup(project) {
  const number = PROJECT_NUMBERS[project.id] || '10';
  return `
    <details class="project-card" id="project-${esc(project.id)}" data-project="${esc(project.id)}">
      <summary class="project-card__summary">
        <span class="project-card__number" aria-hidden="true">${number}</span>
        <span class="project-card__heading">
          <span class="project-card__kind">${esc(project.kind)}</span>
          <span class="project-card__title">${esc(project.title)}</span>
          <span class="project-card__meta">${esc(project.role)} · ${esc(project.date)}</span>
        </span>
        <span class="project-card__chevron" aria-hidden="true"></span>
      </summary>
      <div class="project-card__detail">
        <p>${esc(project.description)}</p>
        ${project.highlight ? `<p class="project-card__highlight">${star()} ${esc(project.highlight)}</p>` : ''}
        ${tagList(project.stack)}
        <p class="project-card__place">${esc(project.org)} · ${esc(project.place)}</p>
      </div>
    </details>
  `;
}

function timelineMarkup() {
  return timeline
    .map((entry, index) => {
      const isEducation = entry.id === 'formation';
      return `
        <li class="timeline__item">
          <span class="timeline__marker" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
          <div class="timeline__content">
            <div class="timeline__top">
              <span class="chip ${isEducation ? 'chip--gold' : ''}">${esc(entry.kind)}</span>
              <span class="timeline__date">${esc(entry.date)}</span>
            </div>
            <h3>${esc(entry.title)}</h3>
            <p class="timeline__org">${esc(entry.org)} · ${esc(entry.place)}</p>
            <p class="timeline__description">${esc(entry.description)}</p>
            ${tagList(entry.stack)}
          </div>
        </li>
      `;
    })
    .join('');
}

function skillsMarkup() {
  return content.skillGroups
    .map(
      (group, index) => `
        <article class="skill-group" id="skill-${esc(group.id)}" data-skill="${esc(group.id)}" data-index="${index}">
          <header class="skill-group__header">
            <span class="skill-group__number" aria-hidden="true">${esc(group.number)}</span>
            <h3>${esc(group.title)}</h3>
          </header>
          ${tagList(group.items)}
        </article>
      `,
    )
    .join('');
}

function languagesMarkup() {
  return `
    <ul class="language-list">
      ${content.languages
        .map(
          (language) => `
            <li>
              <span>${esc(language.name)}</span>
              <strong>${esc(language.level)}</strong>
            </li>
          `,
        )
        .join('')}
    </ul>
  `;
}

function contactLinksMarkup() {
  const links = [];
  if (content.links.linkedin) {
    links.push(
      `<a class="btn btn--ghost" href="${esc(content.links.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`,
    );
  }
  if (content.links.github) {
    links.push(
      `<a class="btn btn--ghost" href="${esc(content.links.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>`,
    );
  }
  return links.join('');
}

function panelNavMarkup(index) {
  const previous = stations[index - 1];
  const next = stations[index + 1];
  return `
    <nav class="panel-nav" aria-label="${esc(ui.navLabel)}">
      <button type="button" class="panel-nav__button" data-goto="${index - 1}" ${previous ? '' : 'disabled'}>
        <span aria-hidden="true">←</span>
        <span>${previous ? esc(previous.name) : esc(ui.navStart)}</span>
      </button>
      <button type="button" class="panel-nav__button" data-goto="${index + 1}" ${next ? '' : 'disabled'}>
        <span>${next ? esc(next.name) : esc(ui.navEnd)}</span>
        <span aria-hidden="true">→</span>
      </button>
    </nav>
  `;
}

function panelMarkup(station, index) {
  const header = `
    <header class="panel__header">
      <span class="panel__kicker">${star()} ${esc(station.kicker)} · ${esc(station.minuteLabel)}</span>
      <span class="panel__number" aria-hidden="true">${esc(station.number)}</span>
    </header>
  `;

  let body = '';

  if (station.id === 'accueil') {
    body = `
      <div class="hero">
        <p class="eyebrow">${esc(content.identity.location)} · ${esc(content.identity.role)}</p>
        <h1 class="hero__name" id="station-accueil-title">
          ${esc(content.identity.firstName)}<br /><span>${esc(content.identity.lastName)}</span>
        </h1>
        <p class="hero__title">${esc(content.identity.title)}</p>
        <p class="availability"><span class="availability__dot" aria-hidden="true"></span>${esc(content.identity.badge)}</p>
        <p class="hero__summary">${esc(content.identity.summary)}</p>
        <div class="hero__stats" aria-label="${esc(ui.statsLabel)}">
          <div><strong>${esc(content.identity.number)}</strong><span>${esc(ui.statNumber)}</span></div>
          <div><strong>${esc(content.identity.position)}</strong><span>${esc(ui.statPosition)}</span></div>
          <div><strong>${esc(ui.statTargetValue)}</strong><span>${esc(ui.statTarget)}</span></div>
        </div>
        <div class="cta-row">
          <button type="button" class="btn btn--primary" data-goto="1">
            ${esc(ui.homeCtaProjects)} <span aria-hidden="true">→</span>
          </button>
          <button type="button" class="btn btn--ghost" data-goto="4">${esc(ui.homeCtaContact)}</button>
        </div>
        <p class="hero__contact">
          <a href="mailto:${esc(content.identity.email)}">${esc(content.identity.email)}</a>
          <span aria-hidden="true">·</span>
          <a href="tel:${esc(content.identity.phoneHref)}">${esc(content.identity.phone)}</a>
        </p>
      </div>
    `;
  }

  if (station.id === 'projets') {
    body = `
      <p class="section-intro" id="station-projets-title">${esc(ui.projectsHint)}</p>
      <div class="project-list">
        ${projects.map(projectCardMarkup).join('')}
      </div>
      <p class="micro-hint">${star()} ${esc(ui.projectsSupport)}</p>
    `;
  }

  if (station.id === 'parcours') {
    body = `
      <p class="section-intro" id="station-parcours-title">${esc(ui.parcoursHint)}</p>
      <ol class="timeline">
        ${timelineMarkup()}
      </ol>
    `;
  }

  if (station.id === 'competences') {
    body = `
      <p class="section-intro" id="station-competences-title">${esc(ui.skillsHint)}</p>
      <div class="skill-groups">
        ${skillsMarkup()}
      </div>
      <section class="languages" aria-labelledby="languages-title">
        <h3 id="languages-title">${esc(ui.languagesTitle)}</h3>
        ${languagesMarkup()}
      </section>
    `;
  }

  if (station.id === 'contact') {
    body = `
      <div id="station-contact-title">
        <p class="eyebrow">${star()} ${esc(station.kicker)} · ${esc(station.minuteLabel)}</p>
        <h2 class="contact__title">${esc(ui.contactTitle)}</h2>
        <p class="section-intro">${esc(ui.contactHint)}</p>
      </div>
      <div class="contact-card">
        <p class="contact-card__availability"><span class="availability__dot" aria-hidden="true"></span>${esc(content.identity.availability)}</p>
        <div class="cta-row cta-row--stack">
          <a class="btn btn--primary" href="mailto:${esc(content.identity.email)}">
            ${esc(content.identity.email)}
          </a>
          <a class="btn btn--ghost" href="tel:${esc(content.identity.phoneHref)}">
            ${esc(content.identity.phone)}
          </a>
          ${contactLinksMarkup()}
        </div>
        <ul class="contact-facts">
          <li><span>${esc(ui.labelLocation)}</span><strong>${esc(content.identity.location)}</strong></li>
          <li><span>${esc(ui.labelSearch)}</span><strong>${esc(ui.searchValue)}</strong></li>
          <li><span>${esc(ui.labelProfile)}</span><strong>${esc(content.identity.role)}</strong></li>
        </ul>
      </div>
      <section class="languages" aria-labelledby="contact-languages-title">
        <h3 id="contact-languages-title">${esc(ui.languagesTitle)}</h3>
        ${languagesMarkup()}
      </section>
    `;
  }

  const labelledBy = station.id === 'contact'
    ? 'station-contact-title'
    : `station-${station.id}-title`;

  return `
    <section
      class="station-panel panel--${station.side}"
      id="station-${station.id}"
      data-station="${station.id}"
      data-index="${index}"
      role="region"
      aria-labelledby="${labelledBy}"
      aria-hidden="${index === 0 ? 'false' : 'true'}"
    >
      ${header}
      <div class="panel__body">${body}</div>
      ${panelNavMarkup(index)}
    </section>
  `;
}

/**
 * Construit les panneaux HTML synchronisés avec la caméra.
 */
export function createOverlays(root, { onNavigate, onProjectFocus, onSkillHover } = {}) {
  root.innerHTML = stations.map(panelMarkup).join('');
  const panels = Array.from(root.querySelectorAll('.station-panel'));
  const projectDetails = Array.from(root.querySelectorAll('.project-card'));
  const skillGroups = Array.from(root.querySelectorAll('.skill-group'));
  let activeIndex = 0;

  function setInert(panel, inert) {
    if (inert) {
      panel.setAttribute('inert', '');
      if (panel.contains(document.activeElement)) {
        root.focus?.({ preventScroll: true });
      }
    } else {
      panel.removeAttribute('inert');
    }
  }

  function show(index, { focus = false } = {}) {
    activeIndex = index;
    panels.forEach((panel, panelIndex) => {
      const active = panelIndex === index;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', active ? 'false' : 'true');
      setInert(panel, !active);
      if (active) panel.scrollTop = 0;
    });

    // Met à jour les boutons précédent / suivant de tous les panneaux.
    panels.forEach((panel) => {
      const panelIndex = Number(panel.dataset.index);
      const buttons = panel.querySelectorAll('.panel-nav__button');
      if (buttons[0]) buttons[0].disabled = panelIndex === 0;
      if (buttons[1]) buttons[1].disabled = panelIndex === stations.length - 1;
    });

    if (focus) {
      const active = panels[index];
      active?.querySelector('.panel__header')?.focus?.({ preventScroll: true });
    }
  }

  function focusProject(projectId) {
    const details = root.querySelector(`#project-${CSS.escape(projectId)}`);
    if (!details) return;
    projectDetails.forEach((item) => {
      if (item !== details && item.open) item.open = false;
    });
    details.open = true;
    details.classList.remove('is-focused');
    void details.offsetWidth;
    details.classList.add('is-focused');
    window.setTimeout(() => details.classList.remove('is-focused'), 2200);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    details.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    details.querySelector('summary')?.focus({ preventScroll: true });
    onProjectFocus?.(projectId);
  }

  function highlightSkill(skillId) {
    skillGroups.forEach((group) => {
      group.classList.toggle('is-highlighted', group.dataset.skill === skillId);
    });
  }

  root.addEventListener('click', (event) => {
    const goto = event.target.closest('[data-goto]');
    if (goto && !goto.disabled) {
      const target = Number(goto.dataset.goto);
      if (Number.isFinite(target)) onNavigate?.(target);
    }
  });

  projectDetails.forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) {
        projectDetails.forEach((other) => {
          if (other !== details && other.open) other.open = false;
        });
      }
    });
  });

  skillGroups.forEach((group) => {
    const index = Number(group.dataset.index);
    const activate = () => {
      highlightSkill(group.dataset.skill);
      onSkillHover?.(index);
    };
    const deactivate = () => {
      highlightSkill(null);
      onSkillHover?.(null);
    };
    group.addEventListener('mouseenter', activate);
    group.addEventListener('focusin', activate);
    group.addEventListener('mouseleave', deactivate);
    group.addEventListener('focusout', deactivate);
  });

  show(0);

  return {
    show,
    focusProject,
    highlightSkill,
    getActiveIndex: () => activeIndex,
  };
}

/**
 * Version 2D complète, utilisée sans WebGL ou en cas d'échec du renderer.
 */
export function createFallback2D(app, root) {
  const canvas = app.querySelector('#scene');
  const hud = app.querySelector('#hud-root');
  const overlay = app.querySelector('#overlay-root');
  const loader = app.querySelector('#loader-root');
  const cursor = app.querySelector('#cursor-root');
  const flash = app.querySelector('#flash');

  if (canvas) canvas.hidden = true;
  if (hud) {
    hud.hidden = true;
    hud.innerHTML = '';
  }
  if (overlay) {
    overlay.hidden = true;
    overlay.innerHTML = '';
  }
  if (loader) loader.hidden = true;
  if (cursor) {
    cursor.hidden = true;
    cursor.innerHTML = '';
  }
  if (flash) flash.hidden = true;

  document.body.classList.remove('is-loading');
  document.body.classList.add('is-fallback');

  const skipLink = document.querySelector('.skip-link');
  if (skipLink) skipLink.setAttribute('href', '#fallback-top');

  root.hidden = false;
  root.innerHTML = `
    <div class="fallback">
      <header class="fallback__header">
        <a class="fallback__brand" href="#fallback-top">
          ${star()} <span>${esc(content.identity.firstName.toUpperCase())} <strong>${esc(content.identity.lastName.toUpperCase())}</strong></span>
          <span class="fallback__number">${esc(content.identity.number)}</span>
        </a>
        <nav class="fallback__nav" aria-label="${esc(ui.navLabel)}">
          ${stations
            .map((station) => `<a href="#fallback-${station.id}">${esc(station.name)}</a>`)
            .join('')}
        </nav>
      </header>

      <main class="fallback__main" id="fallback-top" tabindex="-1">
        <section class="fallback__hero" id="fallback-accueil">
          <p class="eyebrow">${esc(content.identity.location)} · ${esc(content.identity.role)}</p>
          <h1>${esc(content.identity.name)}</h1>
          <p class="fallback__title">${esc(content.identity.title)}</p>
          <p class="availability"><span class="availability__dot" aria-hidden="true"></span>${esc(content.identity.badge)}</p>
          <p class="fallback__summary">${esc(content.identity.summary)}</p>
          <p class="fallback__notice">${esc(ui.fallbackText)}</p>
          <div class="cta-row">
            <a class="btn btn--primary" href="mailto:${esc(content.identity.email)}">${esc(content.identity.email)}</a>
            <a class="btn btn--ghost" href="tel:${esc(content.identity.phoneHref)}">${esc(content.identity.phone)}</a>
          </div>
        </section>

        <section class="fallback__section" id="fallback-projets">
          <p class="eyebrow">${star()} ${esc(stations[1].kicker)}</p>
          <h2>${esc(stations[1].name)}</h2>
          <div class="project-list">
            ${projects.map(projectCardMarkup).join('')}
          </div>
        </section>

        <section class="fallback__section" id="fallback-parcours">
          <p class="eyebrow">${star()} ${esc(stations[2].kicker)}</p>
          <h2>${esc(stations[2].name)}</h2>
          <ol class="timeline">${timelineMarkup()}</ol>
        </section>

        <section class="fallback__section" id="fallback-competences">
          <p class="eyebrow">${star()} ${esc(stations[3].kicker)}</p>
          <h2>${esc(stations[3].name)}</h2>
          <div class="skill-groups">${skillsMarkup()}</div>
          <section class="languages">
            <h3>${esc(ui.languagesTitle)}</h3>
            ${languagesMarkup()}
          </section>
        </section>

        <section class="fallback__section" id="fallback-contact">
          <p class="eyebrow">${star()} ${esc(stations[4].kicker)}</p>
          <h2>${esc(ui.contactTitle)}</h2>
          <div class="contact-card">
            <p class="contact-card__availability"><span class="availability__dot" aria-hidden="true"></span>${esc(content.identity.availability)}</p>
            <div class="cta-row">
              <a class="btn btn--primary" href="mailto:${esc(content.identity.email)}">${esc(content.identity.email)}</a>
              <a class="btn btn--ghost" href="tel:${esc(content.identity.phoneHref)}">${esc(content.identity.phone)}</a>
              ${contactLinksMarkup()}
            </div>
            <ul class="contact-facts">
              <li><span>${esc(ui.labelLocation)}</span><strong>${esc(content.identity.location)}</strong></li>
              <li><span>${esc(ui.labelSearch)}</span><strong>${esc(ui.searchValue)}</strong></li>
              <li><span>${esc(ui.labelProfile)}</span><strong>${esc(content.identity.role)}</strong></li>
            </ul>
          </div>
          <section class="languages">
            <h3>${esc(ui.languagesTitle)}</h3>
            ${languagesMarkup()}
          </section>
        </section>
      </main>

      <footer class="fallback__footer">
        <span>${esc(content.identity.name)} · ${esc(content.identity.role)}</span>
        <span>${esc(content.identity.email)} · ${esc(content.identity.phone)}</span>
      </footer>
    </div>
  `;
}
