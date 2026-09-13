/**
 * @fileoverview Application-wide constants for the AI Legal Assistance platform.
 * All objects are frozen to prevent accidental mutation.
 * @version 1.0.0
 * @author  Asif | AntiGravity
 */

'use strict';

/** @type {Readonly<{API_KEY_PARAM: string, MODEL: string, MAX_TOKENS: number, CACHE_SIZE: number, DISCLAIMER: string}>} */
const CONFIG = Object.freeze({
  API_KEY_PARAM: 'apiKey',
  MODEL:         'gemini-2.0-flash-exp',
  MAX_TOKENS:    2048,
  CACHE_SIZE:    50,
  DISCLAIMER:    'AI-generated information only â€” always consult a qualified legal professional for advice on your specific situation.',
});

/** @type {Readonly<{SECOND: number, MINUTE: number, DEBOUNCE: number, TIMEOUT: number, RATE_LIMIT: number}>} */
const TIME_MS = Object.freeze({
  SECOND:     1000,
  MINUTE:     60000,
  DEBOUNCE:   300,
  TIMEOUT:    15000,
  RATE_LIMIT: 1500,
});

/** @type {Readonly<{TIMEOUT: string, RATE: string, NETWORK: string, SAFETY: string, GENERIC: string}>} */
const AI_ERROR = Object.freeze({
  TIMEOUT: 'Request timed out. Please try again.',
  RATE:    'Too many requests. Please wait a moment.',
  NETWORK: 'Network error. Check your connection.',
  SAFETY:  'Content blocked by safety filters.',
  GENERIC: 'An unexpected error occurred.',
});

/** @type {Readonly<Record<string, string>>} */
const DEMO = Object.freeze({
  simplify: `**Plain-English Summary**\n\nThis agreement creates a binding relationship between you (the "Licensee") and the software provider (the "Licensor").\n\n**What you can do:**\n- Use the software on up to 3 devices\n- Make one backup copy\n- Transfer the license once to another person\n\n**What you cannot do:**\n- Reverse-engineer or decompile the software\n- Share your login credentials\n- Use the software for commercial resale\n\n**Key obligations:**\n- Pay the annual subscription fee by the renewal date\n- Keep your account information accurate\n- Notify the provider of any security breaches within 48 hours\n\n*Disclaimer: This is AI-generated assistance, not legal advice.*`,

  risks: `**âš ï¸ Risk Analysis â€” 4 Items Found**\n\nðŸ”´ **HIGH â€” Auto-Renewal Clause (Â§12.3)**\nThis contract renews automatically for 12-month terms unless cancelled in writing 90 days before the renewal date. Failure to cancel on time locks you into another year.\n\nðŸ”´ **HIGH â€” Broad Indemnification (Â§18.1)**\nYou agree to indemnify the company against "any and all claims arising from your use." This is exceptionally broad and could expose you to significant liability.\n\nðŸŸ¡ **MEDIUM â€” Limitation of Liability (Â§19.2)**\nThe company's total liability is capped at the fees paid in the prior 3 months. This may be very low compared to potential damages.\n\nðŸŸ¡ **MEDIUM â€” Unilateral Amendment (Â§22)**\nThe company can change these terms at any time with 14 days' notice. You have no veto right â€” continued use implies acceptance.\n\n*Disclaimer: This is AI-generated assistance, not legal advice.*`,

  compare: `**Contract Comparison Report**\n\n| Factor | Contract A | Contract B | Better For You |\n|--------|-----------|-----------|----------------|\n| Term Length | 12 months | 6 months | âœ… B |\n| Auto-Renewal | Yes (90-day notice) | No | âœ… B |\n| Liability Cap | 3 months' fees | 12 months' fees | âœ… B |\n| Dispute Resolution | Arbitration only | Litigation or mediation | âœ… B |\n| Governing Law | Delaware | Your home state | âœ… B |\n| Termination for Convenience | 90-day notice | 30-day notice | âœ… B |\n\n**Recommendation:** Contract B is significantly more favourable. The shorter term, absence of auto-renewal, higher liability cap, and flexible dispute resolution are all material advantages.\n\n*Disclaimer: This is AI-generated assistance, not legal advice.*`,

  qa: `**Answer based on your document:**\n\nYes, the document grants you the right to sublicense the software to your subsidiaries (Â§4.2), provided that:\n1. Each subsidiary signs a separate addendum\n2. You remain liable for any breach by subsidiaries\n3. Total sublicensed seats do not exceed your purchased volume\n\nThe right to sublicense does **not** extend to third-party contractors or clients unless separately agreed in writing.\n\n*Disclaimer: This is AI-generated assistance, not legal advice.*`,

  checklist: `**Your Action Checklist**\n\n**Before Signing:**\n- [ ] Have a lawyer review Â§18 (Indemnification) and Â§22 (Amendments)\n- [ ] Negotiate a cap on the indemnification clause\n- [ ] Request removal or modification of the auto-renewal clause\n- [ ] Confirm the governing law is acceptable to you\n- [ ] Verify the liability cap is proportionate to potential risk\n\n**After Signing:**\n- [ ] Calendar the 90-day auto-renewal cancellation deadline\n- [ ] Store a signed copy in a secure, accessible location\n- [ ] Set up email alerts for any "Notice of Amendment" emails\n- [ ] Review the contract at 6-month intervals\n\n*Disclaimer: This is AI-generated assistance, not legal advice.*`,

  prep: `**Questions for Your Lawyer**\n\n1. Is the indemnification clause in Â§18 standard for this type of agreement, and can it be narrowed?\n2. What are my realistic options if the company unilaterally amends terms unfavourably (Â§22)?\n3. Does the mandatory arbitration clause (Â§20) prevent me from joining class actions?\n4. How does the "Force Majeure" clause interact with my service-level agreement rights?\n5. Is the governing law clause enforceable in my jurisdiction?\n6. What is the practical effect of the 90-day auto-renewal cancellation window?\n7. Are there any red flags I may have missed?\n\n*Disclaimer: This is AI-generated assistance, not legal advice.*`,

  dictionary: `**Legal Term Explained**\n\n**Indemnification** (also: "hold harmless")\n\n*Plain English:* A promise that you will cover another party's losses, costs, or legal fees if something goes wrong that is connected to your actions.\n\n*Example:* If you indemnify a landlord against tenant lawsuits, and a tenant sues the landlord because of something you did, you would have to pay the landlord's legal costs and any damages.\n\n*Why it matters:* Broad indemnification clauses can expose you to significant financial risk. Look for language like "any and all claims" â€” this is usually worth negotiating to a narrower scope.\n\n*Related terms:* Liability, Hold Harmless, Subrogation\n\n*Disclaimer: This is AI-generated assistance, not legal advice.*`,
});
