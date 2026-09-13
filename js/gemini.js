/**
 * @fileoverview Gemini AI client with LRU caching, rate limiting,
 *               AbortController timeout, and safety settings.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace GeminiClient */
const GeminiClient = (() => { // eslint-disable-line no-unused-vars
  /** @type {Map<string, string>} LRU cache keyed by prompt hash */
  const _cache = new Map();
  /** @type {number} Timestamp of last API call */
  let _lastCall = 0;

  /**
   * Returns the Gemini REST endpoint URL.
   * @param {string} key - API key.
   * @returns {string}
   */
  function _endpoint(key) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  }

  /**
   * Evicts the oldest entry from the LRU cache if over capacity.
   * @returns {void}
   */
  function _evictIfFull() {
    if (_cache.size >= CONFIG.CACHE_SIZE) {
      _cache.delete(_cache.keys().next().value);
    }
  }

  /**
   * Enforces the minimum time between consecutive API requests.
   * @returns {Promise<void>}
   */
  async function _enforceRateLimit() {
    const elapsed = Date.now() - _lastCall;
    if (elapsed < TIME_MS.RATE_LIMIT) {
      await new Promise((res) => setTimeout(res, TIME_MS.RATE_LIMIT - elapsed));
    }
    _lastCall = Date.now();
  }

  /**
   * Performs a fetch with a configurable AbortController timeout.
   * @param {string} url - Request URL.
   * @param {RequestInit} options - Fetch options.
   * @returns {Promise<Response>}
   * @throws {Error} On timeout or network failure.
   */
  async function _fetchWithTimeout(url, options) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIME_MS.TIMEOUT);
    try {
      return await fetch(url, { ...options, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Builds the Gemini API request body.
   * @param {string} systemPrompt - System instruction text.
   * @param {string} userPrompt  - User content.
   * @returns {object}
   */
  function _buildBody(systemPrompt, userPrompt) {
    return {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: { maxOutputTokens: CONFIG.MAX_TOKENS, temperature: 0.3 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };
  }

  /**
   * Extracts the text from a Gemini API response object.
   * @param {object} data - Parsed API response.
   * @returns {string}
   * @throws {Error} If response is blocked or malformed.
   */
  function _extractText(data) {
    if (data.promptFeedback && data.promptFeedback.blockReason) {
      throw new Error(AI_ERROR.SAFETY);
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) { throw new Error(AI_ERROR.GENERIC); }
    return text;
  }

  /**
   * Sends a prompt to the Gemini API and returns the response text.
   * Results are cached by prompt key; rate limiting is applied.
   * @param {string} key          - API key (may be empty for demo mode).
   * @param {string} systemPrompt - System instruction.
   * @param {string} userPrompt   - User content.
   * @returns {Promise<string>}   - AI response text.
   * @throws {Error} On timeout, rate limit, network, or safety errors.
   */
  async function query(key, systemPrompt, userPrompt) {
    if (!key) { return _getDemoResponse(systemPrompt); }
    const cacheKey = `${systemPrompt}|||${userPrompt}`;
    if (_cache.has(cacheKey)) { return _cache.get(cacheKey); }
    await _enforceRateLimit();
    let response;
    try {
      response = await _fetchWithTimeout(_endpoint(key), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(_buildBody(systemPrompt, userPrompt)),
      });
    } catch (err) {
      const msg = err.name === 'AbortError' ? AI_ERROR.TIMEOUT : AI_ERROR.NETWORK;
      throw new Error(msg);
    }
    if (!response.ok) { throw new Error(`${AI_ERROR.GENERIC} (HTTP ${response.status})`); }
    const data = await response.json();
    const text = _extractText(data);
    _evictIfFull();
    _cache.set(cacheKey, text);
    return text;
  }

  /**
   * Returns a demo response matched loosely to the system prompt.
   * @param {string} systemPrompt - System instruction text.
   * @returns {string}
   */
  function _getDemoResponse(systemPrompt) {
    const lower = systemPrompt.toLowerCase();
    if (lower.includes('simplif'))  { return DEMO.simplify; }
    if (lower.includes('risk'))     { return DEMO.risks; }
    if (lower.includes('compar'))   { return DEMO.compare; }
    if (lower.includes('question') && lower.includes('document')) { return DEMO.qa; }
    if (lower.includes('lawyer') || lower.includes('professional') || lower.includes('insightful')) { return DEMO.prep; }
    if (lower.includes('checklist')) { return DEMO.checklist; }
    if (lower.includes('define') || lower.includes('term')) { return DEMO.dictionary; }
    return DEMO.simplify;
  }

  return Object.freeze({ query });
})();

