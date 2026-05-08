// Scroll reveal functionality
document.addEventListener('DOMContentLoaded', () => {
    const analytics = window.promotionsAnalytics;

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

    const trackedLinks = document.querySelectorAll('a[data-track]');
    trackedLinks.forEach((link) => {
        link.addEventListener('click', () => {
            const label = link.dataset.track || link.textContent.trim();
            analytics?.trackEvent('cta_click', {
                cta_label: label,
                destination_url: link.href,
                link_text: link.textContent.trim()
            });

            if (link.dataset.conversion === 'install') {
                analytics?.sendConversion(
                    analytics?.getConfig?.().googleAdsConversionLabel,
                    link.href
                );
            }
        });
    });

    // Scroll depth tracking
    const scrollDepths = { 25: false, 50: false, 75: false, 100: false };
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100;

        [25, 50, 75, 100].forEach(depth => {
            if (scrollPercent >= depth && !scrollDepths[depth]) {
                scrollDepths[depth] = true;
                analytics?.trackEvent('scroll_depth', {
                    depth_percent: depth
                });
            }
        });
    });

    // FAQ tracking
    const faqs = document.querySelectorAll('details');
    faqs.forEach(faq => {
        faq.addEventListener('toggle', () => {
            if(faq.open) {
                analytics?.trackEvent('faq_open', {
                    faq_question: faq.querySelector('summary')?.textContent?.trim() || ''
                });
            }
        });
    });
});
