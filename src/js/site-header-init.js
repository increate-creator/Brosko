
import "/src/sass/style.scss";
import { mountSiteHeader } from "/src/components/site-header.js";

document.querySelectorAll("[data-site-header]").forEach((host) => {
    mountSiteHeader(host);
});
