/**
 * @fileoverview Application bootstrap â€” event binding, section orchestration,
 *               service worker registration, and error boundary.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/* â”€â”€ Service Worker Registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Registers the service worker if supported by the browser.
 * @returns {void}
 */
function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) { return; }
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('SW registration failed:', err);
  });
}

/* â”€â”€ API Key Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Retrieves the Gemini API key from the key input field.
 * Returns empty string if the field is absent (demo mode).
 * @returns {string}
 */
function getApiKey() {
  const el = UIHelpers.getEl('api-key-input');
  return el ? el.value.trim() : '';
}

/* â”€â”€ Section Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Handles the "Simplify Document" action.
 * @returns {Promise<void>}
 */
async function handleSimplify() {
  const btn    = UIHelpers.getEl('btn-simplify');
  const ta     = UIHelpers.getEl('ta-simplify');
  const out    = UIHelpers.getEl('out-simplify');
  const result = DocProcessor.fromTextarea(ta);
  if (result.error) { UIHelpers.toast(result.error, 'warn'); return; }
  UIHelpers.setLoading(btn, true);
  try {
    const text = await GeminiClient.query(getApiKey(), Analyser.simplifyPrompt(), result.text);
    UIHelpers.renderMarkdown(out, text);
    UIHelpers.appendDisclaimer(out);
    out.removeAttribute('hidden');
    UIHelpers.toast('Document simplified!', 'success');
  } catch (err) { UIHelpers.toast(err.message, 'error'); }
  finally       { UIHelpers.setLoading(btn, false); }
}

/**
 * Handles the "Highlight Risks" action.
 * @returns {Promise<void>}
 */
async function handleRisk() {
  const btn    = UIHelpers.getEl('btn-risk');
  const ta     = UIHelpers.getEl('ta-risk');
  const out    = UIHelpers.getEl('out-risk');
  const result = DocProcessor.fromTextarea(ta);
  if (result.error) { UIHelpers.toast(result.error, 'warn'); return; }
  UIHelpers.setLoading(btn, true);
  try {
    const text = await GeminiClient.query(getApiKey(), Analyser.riskPrompt(), result.text);
    UIHelpers.renderMarkdown(out, text);
    UIHelpers.appendDisclaimer(out);
    out.removeAttribute('hidden');
    UIHelpers.toast('Risk analysis complete!', 'success');
  } catch (err) { UIHelpers.toast(err.message, 'error'); }
  finally       { UIHelpers.setLoading(btn, false); }
}

/**
 * Handles the "Compare Contracts" action.
 * @returns {Promise<void>}
 */
async function handleCompare() {
  const btn = UIHelpers.getEl('btn-compare');
  const taA = UIHelpers.getEl('ta-compare-a');
  const taB = UIHelpers.getEl('ta-compare-b');
  const out = UIHelpers.getEl('out-compare');
  const resA = DocProcessor.fromTextarea(taA);
  const resB = DocProcessor.fromTextarea(taB);
  if (resA.error) { UIHelpers.toast(`Contract A: ${resA.error}`, 'warn'); return; }
  if (resB.error) { UIHelpers.toast(`Contract B: ${resB.error}`, 'warn'); return; }
  const combined = `${resA.text}\n\n=== CONTRACT B ===\n\n${resB.text}`;
  UIHelpers.setLoading(btn, true);
  try {
    const text = await GeminiClient.query(getApiKey(), Analyser.comparePrompt(), combined);
    UIHelpers.renderMarkdown(out, text);
    UIHelpers.appendDisclaimer(out);
    out.removeAttribute('hidden');
    UIHelpers.toast('Comparison complete!', 'success');
  } catch (err) { UIHelpers.toast(err.message, 'error'); }
  finally       { UIHelpers.setLoading(btn, false); }
}

/**
 * Handles file upload for the Q&A section and stores text in a dataset attribute.
 * @param {Event} event - Change event from file input.
 * @returns {Promise<void>}
 */
async function handleFileUpload(event) {
  const file   = event.target.files[0];
  const status = UIHelpers.getEl('upload-status');
  const check  = DocProcessor.validateFile(file);
  if (!check.valid) { UIHelpers.toast(check.error, 'error'); return; }
  try {
    const text = await DocProcessor.readFile(file);
    event.target.dataset.text = text;
    const { words } = DocProcessor.stats(text);
    if (status) { status.textContent = `âœ“ Loaded: ${file.name} (${words} words)`; }
    UIHelpers.toast('Document loaded successfully!', 'success');
  } catch (err) { UIHelpers.toast(err.message, 'error'); }
}

/**
 * Handles the Q&A "Ask" action.
 * @returns {Promise<void>}
 */
async function handleQa() {
  const btn      = UIHelpers.getEl('btn-qa');
  const input    = UIHelpers.getEl('qa-input');
  const fileEl   = UIHelpers.getEl('qa-file');
  const out      = UIHelpers.getEl('out-qa');
  const docText  = fileEl ? fileEl.dataset.text || '' : '';
  const question = input ? input.value.trim() : '';
  if (!docText)  { UIHelpers.toast('Please upload a document first.', 'warn'); return; }
  if (!question) { UIHelpers.toast('Please enter a question.', 'warn'); return; }
  UIHelpers.setLoading(btn, true);
  try {
    const text = await GeminiClient.query(getApiKey(), Analyser.qaPrompt(docText), question);
    UIHelpers.renderMarkdown(out, text);
    UIHelpers.appendDisclaimer(out);
    out.removeAttribute('hidden');
  } catch (err) { UIHelpers.toast(err.message, 'error'); }
  finally       { UIHelpers.setLoading(btn, false); }
}

/**
 * Handles the "Generate Checklist" action.
 * @returns {Promise<void>}
 */
async function handleChecklist() {
  const ta  = UIHelpers.getEl('ta-checklist');
  const out = UIHelpers.getEl('out-checklist');
  const btn = UIHelpers.getEl('btn-checklist');
  const res = DocProcessor.fromTextarea(ta);
  if (res.error) { UIHelpers.toast(res.error, 'warn'); return; }
  await ChecklistGen.runChecklist(getApiKey(), res.text, out, btn);
}

/**
 * Handles the "Prepare Questions" action.
 * @returns {Promise<void>}
 */
async function handlePrep() {
  const ta  = UIHelpers.getEl('ta-prep');
  const out = UIHelpers.getEl('out-prep');
  const btn = UIHelpers.getEl('btn-prep');
  const res = DocProcessor.fromTextarea(ta);
  if (res.error) { UIHelpers.toast(res.error, 'warn'); return; }
  await ChecklistGen.runPrepQuestions(getApiKey(), res.text, out, btn);
}

/**
 * Handles the "Lookup Term" action.
 * @returns {Promise<void>}
 */
async function handleDictionary() {
  const btn  = UIHelpers.getEl('btn-dict');
  const inp  = UIHelpers.getEl('dict-input');
  const out  = UIHelpers.getEl('out-dict');
  const term = inp ? inp.value.trim() : '';
  if (!term || term.length < 2) { UIHelpers.toast('Please enter a legal term to look up.', 'warn'); return; }
  UIHelpers.setLoading(btn, true);
  try {
    const text = await GeminiClient.query(getApiKey(), Analyser.dictionaryPrompt(), term);
    UIHelpers.renderMarkdown(out, text);
    UIHelpers.appendDisclaimer(out);
    out.removeAttribute('hidden');
    UIHelpers.toast('Term defined!', 'success');
  } catch (err) { UIHelpers.toast(err.message, 'error'); }
  finally       { UIHelpers.setLoading(btn, false); }
}

/* â”€â”€ Tab Navigation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/**
 * Activates the clicked nav tab and shows the corresponding section.
 * @param {MouseEvent} event - Click event on a nav tab button.
 * @returns {void}
 */
function handleTabClick(event) {
  const btn    = event.currentTarget;
  const target = btn.dataset.target;
  if (!target) { return; }
  document.querySelectorAll('.nav__tab').forEach((t) => {
    t.setAttribute('aria-selected', 'false');
    t.classList.remove('nav__tab--active');
  });
  document.querySelectorAll('.section').forEach((s) => s.setAttribute('hidden', ''));
  btn.setAttribute('aria-selected', 'true');
  btn.classList.add('nav__tab--active');
  const section = document.getElementById(target);
  if (section) { section.removeAttribute('hidden'); }
}

/* â”€â”€ Bootstrap â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

/** @type {Array<{id: string, handler: Function}>} */
const HANDLER_MAP = Object.freeze([
  { id: 'btn-simplify', handler: handleSimplify },
  { id: 'btn-risk',     handler: handleRisk },
  { id: 'btn-compare',  handler: handleCompare },
  { id: 'btn-qa',       handler: handleQa },
  { id: 'qa-file',      handler: handleFileUpload, event: 'change' },
  { id: 'btn-checklist',handler: handleChecklist },
  { id: 'btn-prep',     handler: handlePrep },
  { id: 'btn-dict',     handler: handleDictionary },
]);

/**
 * Binds all application event handlers and initialises UI.
 * @returns {void}
 */
function init() {
  HANDLER_MAP.forEach(({ id, handler, event: ev }) => {
    const el = UIHelpers.getEl(id);
    if (el) { el.addEventListener(ev || 'click', handler); }
  });

  document.querySelectorAll('.nav__tab').forEach((btn) => {
    btn.addEventListener('click', handleTabClick);
  });

  UIHelpers.initCounters();
  registerServiceWorker();
}

document.addEventListener('DOMContentLoaded', init);
