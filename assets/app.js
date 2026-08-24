(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const menuButton = $('[data-menu-toggle]');
  const nav = $('[data-nav]');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
    });
    $$('a', nav).forEach((link) => link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
    }));
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.08, rootMargin: '0px 0px -5% 0px' })
    : null;
  $$('.reveal').forEach((item) => observer ? observer.observe(item) : item.classList.add('visible'));

  const form = $('[data-contact-form]');
  if (form) {
    const status = $('[data-form-status]', form);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.className = 'form-status';
      if (!form.checkValidity()) {
        form.reportValidity();
        status.textContent = window.BIZLEGAL_I18N?.get('form_invalid') || 'Vui lòng hoàn tất các trường bắt buộc.';
        status.classList.add('error');
        return;
      }
      const submit = $('button[type="submit"]', form);
      submit.disabled = true;
      status.textContent = window.BIZLEGAL_I18N?.get('form_sending') || 'Đang gửi…';
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        form.reset();
        status.textContent = window.BIZLEGAL_I18N?.get('form_success') || 'Đã nhận yêu cầu. BizLegal sẽ phản hồi sớm.';
        status.classList.add('success');
      } catch (error) {
        status.textContent = window.BIZLEGAL_I18N?.get('form_error') || 'Biểu mẫu chưa được kết nối máy chủ. Vui lòng thử lại sau.';
        status.classList.add('error');
      } finally {
        submit.disabled = false;
      }
    });
  }

  const CONSENT_KEY = 'bizlegal_cookie_consent_v1';
  const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const banner = $('[data-cookie-banner]');
  const dialog = $('[data-cookie-dialog]');
  const consentForm = $('[data-cookie-form]');

  const readConsent = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CONSENT_KEY));
      if (!value || !value.savedAt || Date.now() - value.savedAt > CONSENT_MAX_AGE) return null;
      return value;
    } catch (_) { return null; }
  };

  const applyConsent = (value) => {
    document.documentElement.dataset.consentAnalytics = String(Boolean(value.analytics));
    document.documentElement.dataset.consentMarketing = String(Boolean(value.marketing));
    window.dispatchEvent(new CustomEvent('bizlegal:consent-changed', { detail: value }));
  };

  const saveConsent = (analytics, marketing, source) => {
    const value = { necessary: true, analytics, marketing, source, savedAt: Date.now(), version: 1 };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    applyConsent(value);
    if (banner) banner.hidden = true;
    document.body.classList.remove('cookie-pending');
    if (dialog?.open) dialog.close();
    document.body.classList.remove('dialog-open');
  };

  const openPreferences = () => {
    if (!dialog || !consentForm) return;
    const current = readConsent() || { analytics: false, marketing: false };
    consentForm.elements.analytics.checked = Boolean(current.analytics);
    consentForm.elements.marketing.checked = Boolean(current.marketing);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  };

  const existingConsent = readConsent();
  if (existingConsent) applyConsent(existingConsent);
  else if (banner) {
    banner.hidden = false;
    document.body.classList.add('cookie-pending');
  }
  $$('[data-cookie-accept]').forEach((button) => button.addEventListener('click', () => saveConsent(true, true, 'accept-all')));
  $$('[data-cookie-reject], [data-cookie-dialog-reject]').forEach((button) => button.addEventListener('click', () => saveConsent(false, false, 'necessary-only')));
  $$('[data-cookie-customize], [data-cookie-settings]').forEach((button) => button.addEventListener('click', openPreferences));
  consentForm?.addEventListener('submit', (event) => {
    if (event.submitter?.value !== 'save') return;
    event.preventDefault();
    saveConsent(consentForm.elements.analytics.checked, consentForm.elements.marketing.checked, 'preferences');
  });
  dialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));
})();
