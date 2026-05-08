// Scroll reveal functionality
document.addEventListener('DOMContentLoaded', () => {
    // Reveal elements on scroll
    const reveals = document.querySelectorAll('.shot-card, .feature-row, .problem-card, .comparison-card, .pricing-card');
    
    // Add reveal class to items
    reveals.forEach(el => {
        el.classList.add('reveal');
    });

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 100;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    // Trigger once on load
    revealOnScroll();

    // Event Tracking for Analytics (Mockup)
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // GA4 or Meta Pixel tracking would go here
            console.log('CTA Clicked:', e.target.textContent);
            // We allow the default link behavior to navigate
        });
    });

    // Scroll depth tracking
    let scrollDepths = { 25: false, 50: false, 75: false, 100: false };
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

        [25, 50, 75, 100].forEach(depth => {
            if (scrollPercent >= depth && !scrollDepths[depth]) {
                scrollDepths[depth] = true;
                console.log(`Scroll Depth Reached: ${depth}%`);
            }
        });
    });

    // FAQ tracking
    const faqs = document.querySelectorAll('details');
    faqs.forEach(faq => {
        faq.addEventListener('toggle', (e) => {
            if(faq.open) {
                console.log('FAQ Opened:', faq.querySelector('summary').textContent);
            }
        });
    });
});
