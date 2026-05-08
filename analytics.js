(function () {
    const config = window.TRACKING_CONFIG || {};
    const trackedQueryParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_id",
        "utm_term",
        "utm_content",
        "gclid",
        "gbraid",
        "wbraid",
        "gad_source",
        "fbclid",
        "msclkid",
        "ttclid"
    ];

    const dataLayer = window.dataLayer = window.dataLayer || [];
    const gtagIds = [config.ga4MeasurementId, config.googleAdsId].filter(Boolean);
    let gtagReady = false;

    function debugLog() {
        if (!config.debug) return;
        // eslint-disable-next-line no-console
        console.log.apply(console, ["[tracking]"].concat(Array.from(arguments)));
    }

    function injectScript(src) {
        if (!src || document.querySelector(`script[src="${src}"]`)) return;
        const script = document.createElement("script");
        script.async = true;
        script.src = src;
        document.head.appendChild(script);
    }

    function gtag() {
        dataLayer.push(arguments);
    }

    function normalizeBaseUrl(value) {
        return String(value || "").trim().replace(/\/+$/, "");
    }

    function getCurrentPath() {
        const path = window.location.pathname || "/";
        return path === "/index.html" ? "/" : path;
    }

    function getCanonicalUrl() {
        const baseUrl = normalizeBaseUrl(config.siteUrl);
        const path = getCurrentPath();
        return baseUrl ? `${baseUrl}${path}` : `${window.location.origin}${path}`;
    }

    function getAnalyticsPageLocation() {
        return `${window.location.origin}${window.location.pathname}${window.location.search}`;
    }

    function updateSeoUrls() {
        const canonicalHref = getCanonicalUrl();
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute("href", canonicalHref);

        let ogUrl = document.querySelector('meta[property="og:url"]');
        if (!ogUrl) {
            ogUrl = document.createElement("meta");
            ogUrl.setAttribute("property", "og:url");
            document.head.appendChild(ogUrl);
        }
        ogUrl.setAttribute("content", canonicalHref);
    }

    function setupGtm() {
        if (!config.gtmId) return;
        dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
        injectScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`);
        debugLog("GTM initialized", config.gtmId);
    }

    function setupGtag() {
        if (gtagIds.length === 0) return;
        injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagIds[0])}`);
        gtag("js", new Date());

        gtagIds.forEach((id) => {
            gtag("config", id, {
                page_title: document.title,
                page_location: getAnalyticsPageLocation(),
                send_page_view: id !== config.ga4MeasurementId
            });
        });

        if (config.ga4MeasurementId) {
            gtag("event", "page_view", {
                page_title: document.title,
                page_location: getAnalyticsPageLocation(),
                language: document.documentElement.lang || ""
            });
        }

        gtagReady = true;
        debugLog("gtag initialized", gtagIds);
    }

    function passAttributionParams() {
        const pageParams = new URLSearchParams(window.location.search);
        const links = document.querySelectorAll("a[data-pass-query='true']");

        links.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;

            const url = new URL(href, window.location.href);
            trackedQueryParams.forEach((key) => {
                const value = pageParams.get(key);
                if (value) url.searchParams.set(key, value);
            });
            link.href = url.toString();
        });
    }

    function sendConversion(label, destinationUrl) {
        if (!gtagReady || !config.googleAdsId || !label) return;

        gtag("event", "conversion", {
            send_to: `${config.googleAdsId}/${label}`,
            transport_type: "beacon",
            destination_url: destinationUrl || ""
        });
    }

    function trackEvent(eventName, params) {
        const eventParams = Object.assign(
            {
                page_language: document.body.dataset.pageLanguage || document.documentElement.lang || "",
                page_location: getAnalyticsPageLocation()
            },
            params || {}
        );

        dataLayer.push(Object.assign({ event: eventName }, eventParams));

        if (gtagReady && config.ga4MeasurementId) {
            gtag("event", eventName, eventParams);
        }

        debugLog(eventName, eventParams);
    }

    window.promotionsAnalytics = {
        trackEvent,
        sendConversion,
        getConfig: function () {
            return Object.assign({}, config);
        }
    };

    updateSeoUrls();
    passAttributionParams();
    setupGtm();
    setupGtag();
})();
