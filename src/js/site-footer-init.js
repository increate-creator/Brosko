import { mountSiteFooter } from "/src/components/site-footer.js";

// Mount the shared footer before the page's language module initializes.
document.querySelectorAll("[data-site-footer]").forEach(mountSiteFooter);

// If the language module has already initialized, translate the newly mounted footer.
if (window.currentLanguage && typeof window.applyLanguage === "function") {
    window.applyLanguage(window.currentLanguage);
}
