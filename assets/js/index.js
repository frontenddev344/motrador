const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const headerMenu = document.querySelector(".header-menu");
const topbarClose = document.querySelector(".topbar-close");
const topbar = document.querySelector(".topbar");

// Hide .html in the browser URL for static hosts without rewrite support.
if (window.location.pathname.endsWith(".html")) {
    const cleanPath = window.location.pathname.replace(/\.html$/, "");
    const cleanUrl = `${cleanPath}${window.location.search}${window.location.hash}`;
    window.history.replaceState(null, "", cleanUrl);
}

if (window.AOS) {
    window.AOS.init({
        duration: 800,
        easing: "ease-out-cubic",
        once: true,
        offset: 60,
        anchorPlacement: "top-bottom"
    });
}

if (menuToggle && mainNav && headerMenu) {
    menuToggle.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!expanded));
        headerMenu.classList.toggle("show");
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) {
            menuToggle.setAttribute("aria-expanded", "false");
            headerMenu.classList.remove("show");
        }
    });
}

if (topbarClose && topbar) {
    topbarClose.addEventListener("click", () => {
        topbar.style.display = "none";
    });
}

const searchModal = document.querySelector("#searchModal");
const searchTrigger = document.querySelector(".header-search-trigger");
const searchInput = document.querySelector("#searchModalInput");
const searchResults = document.querySelector("#searchModalResults");
const searchStatus = document.querySelector("#searchModalStatus");
const searchForm = document.querySelector("#searchModalForm");
const searchModalCloseButtons = document.querySelectorAll("[data-search-modal-close]");

if (searchModal && searchTrigger && searchInput && searchResults && searchStatus && searchForm) {
    const searchableItems = [];
    let lastFocusedElement = null;

    function addSearchItem(title, href, type) {
        if (!title || !href) {
            return;
        }
        searchableItems.push({
            title: title.trim(),
            href,
            type
        });
    }

    document.querySelectorAll(".main-nav a").forEach((link) => {
        addSearchItem(link.textContent || "", link.getAttribute("href"), "Page");
    });

    document.querySelectorAll(".break-card h3").forEach((heading) => {
        const cardAction = heading.closest(".break-card")?.querySelector(".btn.wide");
        addSearchItem(heading.textContent || "", cardAction?.getAttribute("href") || "./shop-breaks.html", "Break");
    });

    document.querySelectorAll(".blog-card-title").forEach((heading) => {
        const blogLink = heading.closest(".blog-card");
        addSearchItem(heading.textContent || "", blogLink?.getAttribute("href"), "Blog");
    });

    addSearchItem("Login", "./login.html", "Page");
    addSearchItem("Join Now", "./join.html", "Page");
    addSearchItem("Shop Breaks", "./shop-breaks.html", "Page");

    const uniqueSearchableItems = Array.from(
        new Map(searchableItems.map((item) => [`${item.title}|${item.href}`, item])).values()
    );

    function renderResults(items, query) {
        searchResults.innerHTML = "";

        if (!query.trim()) {
            searchStatus.textContent = "Start typing to see matching results.";
            return;
        }

        if (!items.length) {
            searchStatus.textContent = `No results found for "${query}".`;
            return;
        }

        searchStatus.textContent = `${items.length} result${items.length > 1 ? "s" : ""} found.`;

        const fragment = document.createDocumentFragment();
        items.forEach((item) => {
            const link = document.createElement("a");
            link.href = item.href;
            link.className = "search-result-item";

            const title = document.createElement("span");
            title.className = "search-result-title";
            title.textContent = item.title;

            const meta = document.createElement("span");
            meta.className = "search-result-meta";
            meta.textContent = item.type;

            link.appendChild(title);
            link.appendChild(meta);
            fragment.appendChild(link);
        });

        searchResults.appendChild(fragment);
    }

    function getMatches(query) {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return [];
        }
        return uniqueSearchableItems
            .filter((item) => item.title.toLowerCase().includes(normalizedQuery))
            .slice(0, 10);
    }

    function openSearchModal() {
        lastFocusedElement = document.activeElement;
        searchModal.classList.add("is-open");
        searchModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("search-modal-open");
        searchInput.focus();
    }

    function closeSearchModal() {
        searchModal.classList.remove("is-open");
        searchModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("search-modal-open");
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    searchTrigger.addEventListener("click", openSearchModal);

    searchModalCloseButtons.forEach((button) => {
        button.addEventListener("click", closeSearchModal);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && searchModal.classList.contains("is-open")) {
            closeSearchModal();
        }
    });

    searchInput.addEventListener("input", (event) => {
        const query = event.target.value || "";
        renderResults(getMatches(query), query);
    });

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const query = searchInput.value || "";
        const matches = getMatches(query);

        if (matches.length) {
            window.location.href = matches[0].href;
            return;
        }

        renderResults([], query);
    });
}

const statsContainer = document.querySelector("#statsContainer");
const trustedStatsContainer = document.querySelector("#trustedStatsContainer");

const statsData = [
    { label: "Active Collectors", value: 25000, prefix: "", suffix: "+", compact: true },
    { label: "Cards Sold", value: 1200000, prefix: "", suffix: "+", compact: true, decimals: 1 },
    { label: "Live Breaks", value: 850, prefix: "", suffix: "+", compact: false },
    { label: "Hits Pulled", value: 50000, prefix: "", suffix: "+", compact: true }
];

const trustedStatsData = [
    { label: "Active Collectors", value: 25000, prefix: "", suffix: "+", compact: true },
    { label: "Hits Pulled", value: 50000, prefix: "", suffix: "+", compact: true },
    { label: "Cards Sold", value: 1200000, prefix: "", suffix: "+", compact: true, decimals: 1 },
    { label: "Live Breaks Hosted", value: 850, prefix: "", suffix: "+", compact: false }
];

function formatStat(value, stat) {
    if (stat.compact) {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(stat.decimals ?? 0)}M${stat.suffix}`;
        }
        if (value >= 1000) {
            return `${(value / 1000).toFixed(stat.decimals ?? 0)}K${stat.suffix}`;
        }
    }
    return `${Math.floor(value)}${stat.suffix}`;
}

function animateCount(element, stat, duration = 1600) {
    const start = performance.now();

    function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const currentValue = stat.value * easedProgress;
        element.textContent = `${stat.prefix}${formatStat(currentValue, stat)}`;

        if (progress < 1) {
            requestAnimationFrame(frame);
        }
    }

    requestAnimationFrame(frame);
}

if (statsContainer) {
    statsContainer.innerHTML = statsData
        .map(
            (stat, index) => `
            <article class="stat-card" data-aos="fade-up" data-aos-delay="${100 + (index * 70)}">
                <h3 data-stat-value="${stat.value}" data-compact="${stat.compact}" data-decimals="${stat.decimals ?? 0}">0</h3>
                <p>${stat.label}</p>
            </article>
        `
        )
        .join("");

    if (window.AOS) {
        window.AOS.refreshHard();
    }

    const statElements = statsContainer.querySelectorAll("h3");

    const statsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    statElements.forEach((el, index) => animateCount(el, statsData[index]));
                    observer.disconnect();
                }
            });
        },
        { threshold: 0.35 }
    );

    statsObserver.observe(statsContainer);
}

if (trustedStatsContainer) {
    trustedStatsContainer.innerHTML = trustedStatsData
        .map(
            (stat, index) => `
            <article data-aos="fade-up" data-aos-delay="${100 + (index * 70)}">
                <h3>0</h3>
                <p>${stat.label}</p>
            </article>
        `
        )
        .join("");

    const trustedStatElements = trustedStatsContainer.querySelectorAll("h3");

    const trustedStatsObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    trustedStatElements.forEach((el, index) => animateCount(el, trustedStatsData[index]));
                    observer.disconnect();
                }
            });
        },
        { threshold: 0.35 }
    );

    trustedStatsObserver.observe(trustedStatsContainer);
}

const reviewSlider = document.querySelector("#reviewSlider");

if (reviewSlider) {
    const track = reviewSlider.querySelector(".review-track");
    const slides = reviewSlider.querySelectorAll(".review-card");
    const dots = reviewSlider.querySelectorAll(".review-dot");

    let currentSlide = 0;
    let sliderInterval;

    function goToSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        const targetSlide = slides[currentSlide];
        const offsetX = targetSlide ? targetSlide.offsetLeft : 0;
        track.style.transform = `translateX(-${offsetX}px)`;
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("active", dotIndex === currentSlide);
        });
    }

    function startSlider() {
        sliderInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 3500);
    }

    function stopSlider() {
        if (sliderInterval) {
            clearInterval(sliderInterval);
        }
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            goToSlide(index);
            stopSlider();
            startSlider();
        });
    });

    reviewSlider.addEventListener("mouseenter", stopSlider);
    reviewSlider.addEventListener("mouseleave", startSlider);

    goToSlide(0);
    startSlider();
}

const categoryFilters = document.querySelector(".category-filters");
const breaksGrid = document.querySelector(".breaks-grid");

if (categoryFilters && breaksGrid) {
    const pills = categoryFilters.querySelectorAll(".filter-pill");
    const categoryOrder = Array.from(pills)
        .map((pill) => pill.dataset.filter)
        .filter(Boolean);

    function ensureThreeCardsPerCategory() {
        const cardsByCategory = new Map();
        categoryOrder.forEach((category) => cardsByCategory.set(category, []));

        breaksGrid.querySelectorAll(".break-card").forEach((card) => {
            const category = card.dataset.category;
            if (cardsByCategory.has(category)) {
                cardsByCategory.get(category).push(card);
            }
        });

        categoryOrder.forEach((category) => {
            const existingCards = cardsByCategory.get(category);
            const templateCard = existingCards[0];

            if (!templateCard) {
                return;
            }

            for (let i = existingCards.length; i < 3; i += 1) {
                const clone = templateCard.cloneNode(true);
                const title = clone.querySelector("h3");
                const spots = clone.querySelector(".meta-item .meta-text strong");
                const startsAt = clone.querySelectorAll(".meta-item .meta-text strong")[1];
                const price = clone.querySelectorAll(".meta-item .meta-text strong")[2];

                if (title) {
                    title.textContent = `${title.textContent} #${i + 1}`;
                }
                if (spots) {
                    spots.textContent = String(Math.max(2, Number(spots.textContent) - i * 2 || (12 - i * 2)));
                }
                if (startsAt) {
                    startsAt.textContent = i === 1 ? "01:10:00" : "03:25:00";
                }
                if (price) {
                    const numericPrice = Number(price.textContent.replace(/[^0-9]/g, "")) || 39;
                    price.textContent = `$${numericPrice + (i * 5)}`;
                }

                clone.setAttribute("data-aos-delay", String(220 + (i * 40)));
                breaksGrid.appendChild(clone);
            }
        });
    }

    ensureThreeCardsPerCategory();

    function applyBreakFilter(category) {
        const cards = breaksGrid.querySelectorAll(".break-card");
        cards.forEach((card) => {
            const isMatch = card.dataset.category === category;
            card.classList.toggle("is-hidden", !isMatch);
            card.setAttribute("aria-hidden", String(!isMatch));
        });
        pills.forEach((pill) => {
            const active = pill.dataset.filter === category;
            pill.classList.toggle("active", active);
            pill.setAttribute("aria-pressed", String(active));
        });
    }

    pills.forEach((pill) => {
        pill.addEventListener("click", () => {
            const category = pill.dataset.filter;
            if (category) {
                applyBreakFilter(category);
            }
        });
    });

    const initial = categoryFilters.querySelector(".filter-pill.active")?.dataset.filter;
    if (initial) {
        applyBreakFilter(initial);
    }
}

const shopBreaksGrid = document.querySelector("#shopBreaksGrid");
const shopBreaksSort = document.querySelector("#shopBreaksSort");
const shopBreaksShowing = document.querySelector("#shopBreaksShowing");
const shopBreaksEmpty = document.querySelector("#shopBreaksEmpty");

if (shopBreaksGrid && shopBreaksSort && shopBreaksShowing) {
    const originalCards = Array.from(shopBreaksGrid.querySelectorAll(".shop-break-card"));

    originalCards.forEach((card, index) => {
        card.dataset.originalIndex = String(index);
        const priceText = card.querySelector(".shop-break-price")?.textContent || "";
        const matches = priceText.match(/\d+(?:\.\d+)?/g);
        const minPrice = matches ? Math.min(...matches.map(Number)) : Number.POSITIVE_INFINITY;
        card.dataset.price = String(minPrice);
    });

    function getSortedCards(sortValue) {
        const cards = [...originalCards];

        switch (sortValue) {
            case "price-asc":
                return cards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
            case "price-desc":
                return cards.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
            case "newest":
                return cards.sort(
                    (a, b) => Number(b.dataset.originalIndex) - Number(a.dataset.originalIndex)
                );
            default:
                return cards;
        }
    }

    function applyShopBreaksFilters() {
        const sortValue = shopBreaksSort.value;
        const limit = Number(shopBreaksShowing.value) || originalCards.length;
        const sortedCards = getSortedCards(sortValue);

        sortedCards.forEach((card, index) => {
            const isVisible = index < limit;
            card.classList.toggle("is-hidden", !isVisible);
            card.setAttribute("aria-hidden", String(!isVisible));
            shopBreaksGrid.appendChild(card);
        });

        if (shopBreaksEmpty) {
            const visibleCount = sortedCards.filter((card) => !card.classList.contains("is-hidden")).length;
            shopBreaksEmpty.hidden = visibleCount > 0;
        }
    }

    shopBreaksSort.addEventListener("change", applyShopBreaksFilters);
    shopBreaksShowing.addEventListener("change", applyShopBreaksFilters);

    applyShopBreaksFilters();
}

const cookieConsentStorageKey = "motrador-cookie-consent";
const cookieDeclinedAtStorageKey = "motrador-cookie-declined-at";

function hasAcceptedCookieConsent() {
    return window.localStorage.getItem(cookieConsentStorageKey) === "accepted";
}

function hasDeclinedCookieConsent() {
    return window.localStorage.getItem(cookieConsentStorageKey) === "declined";
}

function setCookieConsentAccepted() {
    window.localStorage.setItem(cookieConsentStorageKey, "accepted");
    window.localStorage.removeItem(cookieDeclinedAtStorageKey);
}

function setCookieConsentDeclined() {
    window.localStorage.setItem(cookieConsentStorageKey, "declined");
    window.localStorage.removeItem(cookieDeclinedAtStorageKey);
}

function createCookieBanner() {
    const banner = document.createElement("aside");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie consent");

    banner.innerHTML = `
        <p class="cookie-banner-text">
            We use cookies to improve your experience on Motrador.
            <a href="./privacy-policy.html">Learn more</a>.
        </p>
        <div class="cookie-banner-actions">
            <button type="button" class="btn btn-outline small cookie-banner-decline">Decline</button>
            <button type="button" class="btn btn-primary small cookie-banner-accept">Accept</button>
        </div>
    `;

    return banner;
}

function initCookieConsentBanner() {
    if (hasAcceptedCookieConsent() || hasDeclinedCookieConsent()) {
        return;
    }

    const banner = createCookieBanner();
    const acceptButton = banner.querySelector(".cookie-banner-accept");
    const declineButton = banner.querySelector(".cookie-banner-decline");
    if (!acceptButton || !declineButton) {
        return;
    }

    function closeBanner() {
        banner.classList.add("is-hidden");
        window.setTimeout(() => {
            banner.remove();
        }, 220);
    }

    acceptButton.addEventListener("click", () => {
        setCookieConsentAccepted();
        closeBanner();
    });

    declineButton.addEventListener("click", () => {
        setCookieConsentDeclined();
        closeBanner();
    });

    document.body.appendChild(banner);
}

initCookieConsentBanner();

const presellsSearchInput = document.querySelector(".presells-search-input");
const presellsGrid = document.querySelector(".presells-grid");
const presellsSort = document.querySelector(".presells-select");

if (presellsSearchInput && presellsGrid) {
    const presellCards = Array.from(presellsGrid.querySelectorAll(".presell-card"));

    const presellsEmpty = document.createElement("p");
    presellsEmpty.className = "presells-empty";
    presellsEmpty.textContent = "No breaks match your search.";
    presellsEmpty.hidden = true;
    presellsGrid.insertAdjacentElement("afterend", presellsEmpty);

    function getCardText(card) {
        const title = card.querySelector(".presell-title")?.textContent || "";
        const desc = card.querySelector(".presell-desc")?.textContent || "";
        const details = Array.from(card.querySelectorAll(".presell-detail-text"))
            .map((el) => el.textContent)
            .join(" ");
        return `${title} ${desc} ${details}`.toLowerCase();
    }

    function getCardPrice(card) {
        const priceText = card.querySelector(".presell-detail-text")?.textContent || "";
        const match = priceText.match(/\d+/);
        return match ? Number(match[0]) : 0;
    }

    function getCardSpotsRemaining(card) {
        const spotsText = Array.from(card.querySelectorAll(".presell-detail-text"))
            .find((el) => el.textContent.includes("Remaining Spots"))?.textContent || "";
        const match = spotsText.match(/(\d+)\//);
        return match ? Number(match[1]) : 0;
    }

    function applyPresellsFilters() {
        const query = (presellsSearchInput.value || "").trim().toLowerCase();
        const sortValue = presellsSort ? presellsSort.value : "Newest First";

        let filtered = presellCards.filter((card) => !query || getCardText(card).includes(query));

        if (sortValue === "Price: Low to High") {
            filtered.sort((a, b) => getCardPrice(a) - getCardPrice(b));
        } else if (sortValue === "Price: High to Low") {
            filtered.sort((a, b) => getCardPrice(b) - getCardPrice(a));
        } else if (sortValue === "Spots Remaining") {
            filtered.sort((a, b) => getCardSpotsRemaining(b) - getCardSpotsRemaining(a));
        }

        const hiddenSet = new Set(
            presellCards.filter((card) => !filtered.includes(card))
        );

        presellCards.forEach((card) => {
            const hide = hiddenSet.has(card);
            card.classList.toggle("is-hidden", hide);
            card.setAttribute("aria-hidden", String(hide));
        });

        filtered.forEach((card) => presellsGrid.appendChild(card));

        presellsEmpty.hidden = filtered.length > 0;
    }

    presellsSearchInput.addEventListener("input", applyPresellsFilters);

    if (presellsSort) {
        presellsSort.addEventListener("change", applyPresellsFilters);
    }
}
