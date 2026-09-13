/**
 * @fileoverview Analysis engine â€” builds system prompts for clause extraction,
 *               risk highlighting, contract comparison, and Q&A grounding.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @namespace Analyser */
const Analyser = (() => { // eslint-disable-line no-unused-vars
  const BASE_INSTRUCTION = [
    'You are a legal document assistant. You provide clear, accessible information about legal documents.',
    'IMPORTANT: Always remind the user that your output is informational only and not legal advice.',
    'Use plain English. Avoid unnecessary jargon. Format responses using markdown.',
    'Be precise, helpful, and honest about the limits of AI assistance.',
  ].join(' ');

  /**
   * Returns the system prompt for document simplification.
   * @returns {string}
   */
  function simplifyPrompt() {
    return `${BASE_INSTRUCTION} Summarise the provided legal document in plain English. Cover: (1) what it is, (2) key rights granted, (3) key obligations, (4) important dates or deadlines, (5) what happens if terms are breached. Use bullet points where helpful.`;
  }

  /**
   * Returns the system prompt for risk analysis.
   * @returns {string}
   */
  function riskPrompt() {
    return `${BASE_INSTRUCTION} Analyse the provided legal document for risks. For each risk: label it HIGH/MEDIUM/LOW, cite the clause number or section, explain what it means in plain English, and explain why it matters to the signing party. Sort by severity (HIGH first).`;
  }

  /**
   * Returns the system prompt for contract comparison.
   * @returns {string}
   */
  function comparePrompt() {
    return `${BASE_INSTRUCTION} Compare the two contracts provided (separated by "=== CONTRACT B ==="). Produce a markdown comparison table covering: term length, auto-renewal, liability cap, dispute resolution, governing law, termination rights, and any other material differences. Conclude with a recommendation on which is more favourable and why.`;
  }

  /**
   * Returns the system prompt for document-grounded Q&A.
   * @param {string} documentText - The document to ground answers on.
   * @returns {string}
   */
  function qaPrompt(documentText) {
    const excerpt = documentText.slice(0, 8000);
    return `${BASE_INSTRUCTION} You are answering questions about the following legal document. Only answer based on the document content â€” do not invent information. If the document does not address the question, say so clearly.\n\nDOCUMENT:\n${excerpt}`;
  }

  /**
   * Returns the system prompt for action checklist generation.
   * @returns {string}
   */
  function checklistPrompt() {
    return `${BASE_INSTRUCTION} Based on the provided legal document, generate two actionable checklists in markdown: (1) "Before Signing" â€” things to verify, negotiate, or clarify, (2) "After Signing" â€” ongoing obligations, deadlines, and record-keeping steps. Format as checkbox lists.`;
  }

  /**
   * Returns the system prompt for professional consultation preparation.
   * @returns {string}
   */
  function professionalPrepPrompt() {
    return `${BASE_INSTRUCTION} Based on the provided legal document, generate a numbered list of 7â€“10 specific, insightful questions the user should ask a qualified lawyer before signing. Focus on ambiguous clauses, high-risk provisions, and missing protections.`;
  }

  /**
   * Returns the system prompt for legal term definition.
   * @returns {string}
   */
  function dictionaryPrompt() {
    return `${BASE_INSTRUCTION} Define the provided legal term in plain English. Include: (1) a one-sentence plain-English definition, (2) a practical example of how it works, (3) why it matters in contracts, (4) related terms. Keep the response concise and accessible.`;
  }

  return Object.freeze({
    simplifyPrompt,
    riskPrompt,
    comparePrompt,
    qaPrompt,
    checklistPrompt,
    professionalPrepPrompt,
    dictionaryPrompt,
  });
})();
