tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Roboto Mono', 'monospace'],
            },
            colors: {
                'dark-bg': '#060025', 
                'dark-bga': '#041724', 
                'accent-teal': 'orange',
                'primary-dark': '#143C40',          
            }
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
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