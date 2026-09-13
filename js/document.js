/**
 * @fileoverview Document processor â€” text extraction from pasted or uploaded
 *               content, XSS sanitisation, and word-count utilities.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace DocProcessor */
const DocProcessor = (() => { // eslint-disable-line no-unused-vars
  const MAX_BYTES      = 500 * 1024; // 500 KB
  const MIN_CHARS      = 50;
  const ALLOWED_TYPES  = Object.freeze(['text/plain']);

  /**
   * Sanitises a raw text string against XSS and control characters.
   * @param {string} raw - Untrusted input text.
   * @returns {string} Sanitised string.
   */
  function sanitise(raw) {
    if (typeof raw !== 'string') { return ''; }
    return raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, '');
  }

  /**
   * Validates a File object against type and size constraints.
   * @param {File} file - File to validate.
   * @returns {{ valid: boolean, error?: string }}
   */
  function validateFile(file) {
    if (!file) { return { valid: false, error: 'No file provided.' }; }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only plain text (.txt) files are supported.' };
    }
    if (file.size > MAX_BYTES) {
      return { valid: false, error: `File exceeds the 500 KB limit (${(file.size / 1024).toFixed(0)} KB).` };
    }
    return { valid: true };
  }

  /**
   * Reads a File object and resolves with its text content.
   * @param {File} file - Text file to read.
   * @returns {Promise<string>} File text content.
   * @throws {Error} If file reading fails.
   */
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = (e) => resolve(/** @type {string} */ (e.target.result));
      reader.onerror = ()  => reject(new Error('Failed to read file.'));
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Processes the text from a textarea element with validation.
   * @param {HTMLTextAreaElement} textarea - Source textarea.
   * @returns {{ text: string, error?: string }}
   */
  function fromTextarea(textarea) {
    const raw = textarea ? textarea.value.trim() : '';
    if (raw.length < MIN_CHARS) {
      return { text: '', error: `Please enter at least ${MIN_CHARS} characters of legal text.` };
    }
    return { text: sanitise(raw) };
  }

  /**
   * Returns word count and estimated read time for a text string.
   * @param {string} text - Input text.
   * @returns {{ words: number, readMinutes: number }}
   */
  function stats(text) {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return { words, readMinutes: Math.ceil(words / 200) };
  }

  /**
   * Truncates text to a maximum number of characters for API submission.
   * @param {string} text     - Input text.
   * @param {number} maxChars - Maximum character count.
   * @returns {string}
   */
  function truncateForApi(text, maxChars) {
    if (text.length <= maxChars) { return text; }
    return `${text.slice(0, maxChars)}\n\n[... document truncated for analysis ...]`;
  }

  return Object.freeze({ sanitise, validateFile, readFile, fromTextarea, stats, truncateForApi });
})();
