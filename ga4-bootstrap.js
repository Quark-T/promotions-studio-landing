(function () {
    const ga4Id = window.TRACKING_CONFIG && window.TRACKING_CONFIG.ga4MeasurementId;
    if (!ga4Id) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", ga4Id);
    window.__PROMOTIONS_GA4_BOOTSTRAPPED__ = ga4Id;
})();
