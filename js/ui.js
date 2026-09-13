/**
 * @fileoverview UI utility helpers â€” toast notifications, loading states,
 *               DOM caching, IntersectionObserver counter animation, and
 *               markdown-to-safe-HTML renderer.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace UIHelpers */
const UIHelpers = (() => { // eslint-disable-line no-unused-vars
  /** @type {Map<string, HTMLElement>} */
  const _cache = new Map();

  /**
   * Returns a cached DOM element by ID.
   * @param {string} id - Element ID.
   * @returns {HTMLElement|null}
   */
  function getEl(id) {
    if (!_cache.has(id)) {
      _cache.set(id, document.getElementById(id));
    }
    return _cache.get(id);
  }

  /**
   * Displays a toast notification.
   * @param {string} message - Notification text.
   * @param {'info'|'success'|'warn'|'error'} [type='info'] - Visual variant.
   * @returns {void}
   */
  function toast(message, type = 'info') {
    const container = getEl('toast-container');
    if (!container) { return; }
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    el.textContent = message;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast--visible'));
    setTimeout(() => {
      el.classList.remove('toast--visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
    }, 4000);
  }

  /**
   * Sets loading state on a button element.
   * @param {HTMLButtonElement} btn - Target button.
   * @param {boolean} isLoading - Loading state.
   * @returns {void}
   */
  function setLoading(btn, isLoading) {
    if (!btn) { return; }
    btn.disabled = isLoading;
    btn.setAttribute('aria-busy', String(isLoading));
    const label = btn.dataset.label || btn.textContent;
    if (isLoading) {
      btn.dataset.label = label;
      btn.textContent = 'Analysingâ€¦';
    } else {
      btn.textContent = btn.dataset.label || label;
    }
  }

  /**
   * Renders a safe markdown subset to HTML inside the given container.
   * Supports: **bold**, *italic*, `code`, ## headings, - lists, | tables.
   * @param {HTMLElement} container - Target element.
   * @param {string} markdown - Input markdown string.
   * @returns {void}
   */
  function renderMarkdown(container, markdown) {
    const safe = markdown
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^#{1,3} (.+)$/gm, '<h3 class="md-heading">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>[\s\S]+?<\/li>)/g, '<ul>$1</ul>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>')
      .replace(/\n{2,}/g, '</p><p>')
      .replace(/\n/g, '<br>');
    container.innerHTML = `<p>${safe}</p>`;
  }

  /**
   * Appends a disclaimer banner after an AI response element.
   * @param {HTMLElement} container - Parent element.
   * @returns {void}
   */
  function appendDisclaimer(container) {
    const d = document.createElement('p');
    d.className = 'disclaimer-banner';
    d.setAttribute('role', 'note');
    d.textContent = CONFIG.DISCLAIMER;
    container.appendChild(d);
  }

  /**
   * Initialises IntersectionObserver-driven counter animation for stat elements.
   * @returns {void}
   */
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!('IntersectionObserver' in window)) { return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    els.forEach((el) => obs.observe(el));
  }

  /**
   * Animates a numeric counter element to its data-count value.
   * @param {HTMLElement} el - Element with data-count attribute.
   * @returns {void}
   */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(progress * target);
      if (progress < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  return Object.freeze({ getEl, toast, setLoading, renderMarkdown, appendDisclaimer, initCounters });
})();
