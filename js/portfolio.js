document.addEventListener('DOMContentLoaded', () => {
    // Navbar mobile menu toggle (works on all pages that include the same nav ids)
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const openIcon = document.getElementById('menu-icon-open');
    const closeIcon = document.getElementById('menu-icon-close');

    if (menuButton && mobileMenu && openIcon && closeIcon) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            openIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                openIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        });
    }

    // Contact form -> Telegram (via serverless API)
    const contactForm = document.getElementById('portfolioContactForm');
    const formStatus = document.getElementById('formStatus');
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                formStatus.textContent = '❌ Please fill out all required fields.';
                formStatus.classList.remove('hidden', 'text-primary-color', 'text-gray-400');
                formStatus.classList.add('text-error-red');
                return;
            }

            const submitButton = contactForm.querySelector('button[type="submit"]');
            const setBusy = (busy) => {
                if (!submitButton) return;
                submitButton.disabled = busy;
                submitButton.classList.toggle('opacity-75', busy);
                submitButton.classList.toggle('cursor-not-allowed', busy);
            };

            formStatus.textContent = '🚀 Sending your message...';
            formStatus.classList.remove('hidden', 'text-error-red', 'text-primary-color');
            formStatus.classList.add('text-gray-400');
            setBusy(true);

            const body = {
                name: contactForm.querySelector('#full-name')?.value ?? '',
                email: contactForm.querySelector('#email')?.value ?? '',
                subject: contactForm.querySelector('#subject')?.value ?? '',
                message: contactForm.querySelector('#message')?.value ?? '',
            };

            try {
                const response = await fetch('/api/telegram', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => null);
                    const message =
                        (err && (err.error || err.message)) ||
                        `Request failed (${response.status})`;
                    throw new Error(message);
                }

                formStatus.textContent = '✅ Sent! I will reply soon.';
                formStatus.classList.remove('text-gray-400', 'text-error-red');
                formStatus.classList.add('text-primary-color');
                contactForm.reset();
            } catch (error) {
                const details = error instanceof Error ? error.message : '';
                formStatus.textContent = details
                    ? `❌ Failed to send: ${details}`
                    : '❌ Failed to send. Please try again later.';
                formStatus.classList.remove('text-gray-400', 'text-primary-color');
                formStatus.classList.add('text-error-red');
            } finally {
                setBusy(false);
                setTimeout(() => formStatus.classList.add('hidden'), 6000);
            }
        });
    }

    const nameSpans = document.querySelectorAll('h1 span');
    let isPulsing = false;
    const togglePulse = () => {
        isPulsing = !isPulsing;
        nameSpans.forEach(span => {
            span.classList.toggle('text-amber-400', isPulsing);
            span.classList.toggle('text-amber-500', !isPulsing);
        });
    };
    setInterval(togglePulse, 3000); 
});
async function fetchWithExponentialBackoff(url, options = {}, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error("HTTP error! status:" + (response.status));
            }
            return response;
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed. Retrying in ${Math.pow(2, i)} seconds...`, error);
            if (i === maxRetries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
}
