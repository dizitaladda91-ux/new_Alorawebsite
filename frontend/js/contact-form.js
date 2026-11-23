import BASE_URL from './config.js';

const form = document.getElementById('contact-form');
const status = document.getElementById('contact-status');

form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const payload = {
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        message: String(formData.get('message') || '').trim()
    };
    if (!payload.name || !payload.email || !payload.message) {
        if (status) status.textContent = 'Please complete all fields.';
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        if (status) status.textContent = 'Please enter a valid email address.';
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalText = button?.textContent || 'Send Message';
    if (button) {
        button.disabled = true;
        button.textContent = 'Sending...';
    }
    if (status) status.textContent = '';

    try {
        const response = await fetch(`${BASE_URL}/api/queries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to send your message. Please try again.');
        if (status) status.textContent = 'Your message has been sent.';
        form.reset();
    } catch (error) {
        console.error('Contact form submission failed:', error);
        if (status) status.textContent = error.message || 'Unable to send your message. Please try again.';
    } finally {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }
});
