/* -------------------------------------------------------------------- */
/*  submitForm — single helper for sending form data to a configurable   */
/*  external endpoint. The bundled legal copy currently names Formspree  */
/*  Inc. (United States) as the overseas processor. If a different       */
/*  overseas endpoint is configured, update src/i18n.js before launch.   */
/*                                                                       */
/*  Set the endpoint at build time with the env var:                     */
/*    VITE_FORM_ENDPOINT=https://formspree.io/f/xxxxxxx                  */
/*                                                                       */
/*  In Vercel: Project Settings → Environment Variables → add            */
/*    VITE_FORM_ENDPOINT  with your provider's endpoint URL.             */
/*                                                                       */
/*  If no endpoint is configured we return {ok: false, notConfigured:    */
/*  true} so the UI can show a clear "contact us by email" fallback      */
/*  instead of pretending the submission succeeded.                      */
/* -------------------------------------------------------------------- */

const ENDPOINT =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_FORM_ENDPOINT) || ''

if (!ENDPOINT) {
  console.warn('[Nexallure] VITE_FORM_ENDPOINT is not set. Forms will show fallback message.');
}

export async function submitForm(formType, payload) {
  if (!ENDPOINT) {
    return { ok: false, notConfigured: true }
  }

  try {
    const body = {
      _subject: `[Nexallure] ${formType}`,
      form_type: formType,
      submitted_at: new Date().toISOString(),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      transfer_method: 'Encrypted HTTPS POST from browser to configured form endpoint',
      ...payload,
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { ok: false, status: res.status }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
