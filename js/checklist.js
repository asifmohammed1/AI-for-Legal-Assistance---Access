/**
 * @fileoverview Checklist and professional-prep orchestration module.
 *               Coordinates Analyser prompts, GeminiClient calls, and
 *               UI rendering for the action-checklist and lawyer-prep sections.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace ChecklistGen */
const ChecklistGen = (() => { // eslint-disable-line no-unused-vars
  /**
   * Renders the result of an AI query into a container element.
   * @param {HTMLElement} container  - Target display element.
   * @param {string}      text       - AI response markdown text.
   * @returns {void}
   */
  function _render(container, text) {
    UIHelpers.renderMarkdown(container, text);
    UIHelpers.appendDisclaimer(container);
    container.removeAttribute('hidden');
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Renders an error message into a container element.
   * @param {HTMLElement} container - Target element.
   * @param {string}      message   - Error description.
   * @returns {void}
   */
  function _renderError(container, message) {
    container.innerHTML = `<p class="error-message" role="alert">${message}</p>`;
    container.removeAttribute('hidden');
  }

  /**
   * Runs the action-checklist generation flow.
   * @param {string}      apiKey    - Gemini API key.
   * @param {string}      docText   - Source document text.
   * @param {HTMLElement} container - Output container element.
   * @param {HTMLButtonElement} btn - Trigger button (for loading state).
   * @returns {Promise<void>}
   */
  async function runChecklist(apiKey, docText, container, btn) {
    UIHelpers.setLoading(btn, true);
    try {
      const text = await GeminiClient.query(apiKey, Analyser.checklistPrompt(), docText);
      _render(container, text);
      UIHelpers.toast('Checklist generated!', 'success');
    } catch (err) {
      _renderError(container, err.message);
      UIHelpers.toast(err.message, 'error');
    } finally {
      UIHelpers.setLoading(btn, false);
    }
  }

  /**
   * Runs the professional-preparation question generation flow.
   * @param {string}      apiKey    - Gemini API key.
   * @param {string}      docText   - Source document text.
   * @param {HTMLElement} container - Output container element.
   * @param {HTMLButtonElement} btn - Trigger button.
   * @returns {Promise<void>}
   */
  async function runPrepQuestions(apiKey, docText, container, btn) {
    UIHelpers.setLoading(btn, true);
    try {
      const text = await GeminiClient.query(apiKey, Analyser.professionalPrepPrompt(), docText);
      _render(container, text);
      UIHelpers.toast('Questions prepared!', 'success');
    } catch (err) {
      _renderError(container, err.message);
      UIHelpers.toast(err.message, 'error');
    } finally {
      UIHelpers.setLoading(btn, false);
    }
  }

  return Object.freeze({ runChecklist, runPrepQuestions });
})();
