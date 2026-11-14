
import logoUrl from "/src/logo/Brosko2W_3_html.png";

const HEADER_BREAKPOINT = "(max-width: 1023px)";

const navigationItems = [
    { key: "catalog", href: "catalog.html", label: "Catalog", i18n: "mainNav.catalog" },
    { key: "projects", href: "#", label: "Projects", i18n: "mainNav.project" },
    { key: "materials", href: "#", label: "Materials", i18n: "mainNav.material" },
    { key: "about", href: "#", label: "About Us", i18n: "mainNav.about" }
];

function createNavigation(page) {
    return navigationItems
        .filter(item => !(page === "catalog" && item.key === "catalog"))
        .map(item => `
            <li class="brosko-header__nav-item">
                <a
                    class="brosko-header__link navlink"
                    href="${item.href}"
                    data-i18n="${item.i18n}"
                >
                    ${item.label}
                </a>
            </li>
        `).join("");
}

function headerTemplate(page) {
    return `
        <header class="brosko-header" data-brosko-header>
            <div class="brosko-header__bar">
                <div class="brosko-header__inner">

                    <div class="brosko-header__left">
                        <button
                            class="brosko-header__toggle"
                            type="button"
                            aria-label="Open navigation"
                            aria-expanded="false"
                            aria-controls="broskoMainNavigation"
                        >
                            <span class="brosko-header__toggle-label">MENU</span>
                            <span class="brosko-header__toggle-icon" aria-hidden="true"></span>
                        </button>

                        <nav
                            class="brosko-header__nav"
                            id="broskoMainNavigation"
                            aria-label="Main navigation"
                            aria-hidden="false"
                        >
                            <ul class="brosko-header__nav-list">
                                ${createNavigation(page)}
                            </ul>
                        </nav>
                    </div>

                    <a class="brosko-header__logo" href="index.html" aria-label="Brosko — Home">
                        <img src="${logoUrl}" alt="Brosko">
                    </a>

                    <div class="brosko-header__social">
                        <a href="mailto:broskoby@gmail.com" aria-label="Email Brosko">
                            <span class="icon-mail navlink" aria-hidden="true"></span>
                        </a>

                        <a
                            href="https://www.instagram.com/broskoby?obrf=MXdjbWxsaDU2bnN1OQ=="
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Brosko on Instagram"
                        >
                            <span class="icon-instagram navlink" aria-hidden="true"></span>
                        </a>
                    </div>

                </div>
            </div>

            <button
                class="brosko-header__overlay"
                type="button"
                tabindex="-1"
                aria-label="Close navigation"
                aria-hidden="true"
                hidden
            ></button>
        </header>
    `;
}

export function mountSiteHeader(host) {
    if (!(host instanceof HTMLElement)) return null;

    if (host.dataset.headerMounted === "true") {
        return host.querySelector("[data-brosko-header]");
    }

    const page = host.dataset.page || "default";

    host.innerHTML = headerTemplate(page);
    host.dataset.headerMounted = "true";

    const header = host.querySelector("[data-brosko-header]");
    const toggle = header.querySelector(".brosko-header__toggle");
    const nav = header.querySelector(".brosko-header__nav");
    const overlay = header.querySelector(".brosko-header__overlay");

    const media = window.matchMedia(HEADER_BREAKPOINT);

    const setOpen = (open, restoreFocus = false) => {
        const isOpen = Boolean(open && media.matches);

        header.classList.toggle("is-open", isOpen);
        document.body.classList.toggle("brosko-menu-open", isOpen);

        toggle.setAttribute("aria-expanded", String(isOpen));
        toggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation" : "Open navigation"
        );

        nav.setAttribute(
            "aria-hidden",
            String(media.matches && !isOpen)
        );

        overlay.hidden = !isOpen;
        overlay.setAttribute("aria-hidden", String(!isOpen));

        if (restoreFocus && media.matches) {
            toggle.focus();
        }
    };

    toggle.addEventListener("click", () => {
        const currentlyOpen =
            toggle.getAttribute("aria-expanded") === "true";

        setOpen(!currentlyOpen);
    });

    overlay.addEventListener("click", () => {
        setOpen(false, true);
    });

    nav.addEventListener("click", event => {
        if (event.target.closest("a")) {
            setOpen(false);
        }
    });

    document.addEventListener("keydown", event => {
        if (
            event.key === "Escape" &&
            toggle.getAttribute("aria-expanded") === "true"
        ) {
            setOpen(false, true);
        }
    });

    const onBreakpointChange = () => {
        setOpen(false);
    };

    if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onBreakpointChange);
    } else {
        media.addListener(onBreakpointChange);
    }

    setOpen(false);

    return header;
}
