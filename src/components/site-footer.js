const footerLinks = {
    catalog: "/catalog.html",
    indoor: "/catalog.html?category=indoor",
    outdoor: "/catalog.html?category=outdoor",
    accessories: "/catalog.html?category=accessories"
};

function footerTemplate() {
    return `
        <footer class="site-footer" data-brosko-footer>
            <div class="container">
                <div class="site-footer__wrapper">
                    <div class="site-footer__col1">
                        <div class="site-footer__brand">
                            <a href="/" class="site-footer__logo" aria-label="Brosko — home">Brosko</a>
                            <p class="brand-text" data-i18n="footer.Info">
                                Modern furniture,<br>created for life.
                            </p>
                        </div>
                    </div>

                    <div class="site-footer__col2">
                        <div class="site-footer__columns">
                            <section class="site-footer__column" aria-labelledby="footerExploreTitle">
                                <h3 class="footer-title-h3" id="footerExploreTitle" data-i18n="footer.title1">explore</h3>
                                <nav class="site-footer__nav" aria-label="Explore">
                                    <ul>
                                        <li><a href="${footerLinks.catalog}" class="footer-title-h2 link" data-i18n="footer.collections">Collection</a></li>
                                        <li><a href="#" class="footer-title-h2 link" data-i18n="mainNav.project">Projects</a></li>
                                        <li><a href="#" class="footer-title-h2 link" data-i18n="mainNav.about">About</a></li>
                                    </ul>
                                </nav>
                            </section>

                            <section class="site-footer__column" aria-labelledby="footerCollectionsTitle">
                                <h3 class="footer-title-h3" id="footerCollectionsTitle" data-i18n="footer.collections">collection</h3>
                                <nav class="site-footer__nav" aria-label="Collections">
                                    <div class="site-footer__collection-group">
                                        <h4 class="footer-title-h2 footer-title">indoor</h4>
                                        <ul>
                                            <li><a href="${footerLinks.indoor}" class="footer-title-h2 link" data-i18n="footer.collectIn">Indoor Collection</a></li>
                                        </ul>
                                    </div>
                                    <div class="site-footer__collection-group">
                                        <h4 class="footer-title-h2 footer-title">outdoor</h4>
                                        <ul>
                                            <li><a href="${footerLinks.outdoor}" class="footer-title-h2 link" data-i18n="footer.collectOut">Outdoor Collection</a></li>
                                        </ul>
                                    </div>
                                    <div class="site-footer__collection-group">
                                        <h4 class="footer-title-h2 footer-title">accessories</h4>
                                        <ul>
                                            <li><a href="${footerLinks.accessories}" class="footer-title-h2 link" data-i18n="footer.acces">Accessories</a></li>
                                        </ul>
                                    </div>
                                </nav>
                            </section>

                            <section class="site-footer__column" aria-labelledby="footerContactTitle">
                                <h3 class="footer-title-h3" id="footerContactTitle" data-i18n="common.contact">contact</h3>
                                <nav class="site-footer__nav" aria-label="Contact">
                                    <ul>
                                        <li class="footer-contact-item">
                                            <button
                                                class="footer-title-h2 link footer-contact-toggle"
                                                type="button"
                                                aria-expanded="false"
                                                aria-controls="footerEmailAddress"
                                            >e-mail</button>
                                            <a
                                                class="footer-contact-value"
                                                id="footerEmailAddress"
                                                href="mailto:broskoby@gmail.com"
                                                hidden
                                            >broskoby@gmail.com</a>
                                        </li>
                                        <li class="footer-contact-item">
                                            <button
                                                class="footer-title-h2 link footer-contact-toggle"
                                                type="button"
                                                aria-expanded="false"
                                                aria-controls="footerPhoneNumber"
                                            >
                                                <span data-i18n="common.tel">tel</span>
                                            </button>
                                            <a
                                                class="footer-contact-value"
                                                id="footerPhoneNumber"
                                                href="tel:+375295122532"
                                                hidden
                                            >+375 29 512 25 32</a>
                                        </li>
                                    </ul>
                                </nav>
                            </section>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <span class="footer-copyright">© ${new Date().getFullYear()} Brosko</span>
                    <nav class="footer-social" aria-label="Social media">
                        <a href="https://www.instagram.com/broskoby?obrf=MXdjbWxsaDU2bnN1OQ==" target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
                        <a href="#" aria-label="Pinterest">PINTEREST</a>
                        <a href="#" aria-label="Facebook">FACEBOOK</a>
                    </nav>
                </div>
            </div>
        </footer>
    `;
}

/** Mount the single shared Brosko footer into [data-site-footer]. */
export function mountSiteFooter(host) {
    if (!(host instanceof HTMLElement)) return null;

    if (host.dataset.footerMounted === "true") {
        return host.querySelector("[data-brosko-footer]");
    }

    host.innerHTML = footerTemplate();
    host.dataset.footerMounted = "true";

    const footer = host.querySelector("[data-brosko-footer]");

    // Email and phone use the same accessible reveal interaction.
    footer.querySelectorAll(".footer-contact-toggle").forEach((toggle) => {
        const targetId = toggle.getAttribute("aria-controls");
        const target = targetId ? footer.querySelector(`#${CSS.escape(targetId)}`) : null;

        if (!target) return;

        toggle.addEventListener("click", () => {
            const isExpanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!isExpanded));
            target.hidden = isExpanded;
        });
    });

    return footer;
}
