import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import JustValidate from 'just-validate';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import "/src/sass/style.scss";




/* ================================
   HEADER / SCROLL EFFECTS
================================ */

const close = document.querySelector(".topBar__overlay");
const top_nav = document.querySelector(".header__wrapper");
const header_nav_overlay = document.querySelector(".header__nav-overlay");
const megaMenu_nav_overlay_open = document.querySelector(".mega-menu");
const hero_content = document.querySelector(".hero__content");

window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;

    if (close) {
        close.classList.toggle(
            "topBar__overlay-close",
            scrollY > 40
        );
    }

    if (top_nav) {
        top_nav.classList.toggle(
            "header__wrapper-top_nav",
            scrollY > 110
        );
    }

    if (header_nav_overlay) {
        header_nav_overlay.classList.toggle(
            "header__nav-overlay-open",
            scrollY > 110
        );
    }

    if (megaMenu_nav_overlay_open) {
        megaMenu_nav_overlay_open.classList.toggle(
            "mega-menu-nav-overlay-open",
            scrollY > 110
        );
    }

    if (hero_content) {
        hero_content.classList.toggle(
            "hero__content-visible",
            scrollY > 90
        );
    }
});


/* ================================
   MEGA MENU — desktop dropdown + mobile drawer
================================ */
const megaMenuContToggle = document.querySelector(".mega-menu-cont");
const topbar_btn_cont_toggle = document.querySelector(".topbar-btn-cont-toggle");
const menuBtnToggle = document.querySelector(".menu-btn-toggle");
const megaMenu = document.querySelector(".mega-menu");

function closeCatalogMenu() {
    if (megaMenu) megaMenu.classList.remove("open");
    if (menuBtnToggle) {
        menuBtnToggle.setAttribute("aria-expanded", "false");
        menuBtnToggle.setAttribute("aria-label", "Open catalog menu");
    }
    document.body.classList.remove("no-scroll");
}

if (megaMenu && menuBtnToggle) {
    menuBtnToggle.setAttribute("aria-controls", "broskoCatalogMenu");
    menuBtnToggle.setAttribute("aria-label", "Open catalog menu");
    menuBtnToggle.setAttribute("aria-expanded", "false");
    megaMenu.id = "broskoCatalogMenu";

    // Keep the secondary desktop navigation available in the mobile drawer.
    const sourceNav = document.querySelector(".header-nav ul");
    const drawerContent = megaMenu.querySelector(".mega-menu__wrapper");
    if (sourceNav && drawerContent && !megaMenu.querySelector(".mobile-drawer-nav")) {
        const mobileNav = document.createElement("nav");
        mobileNav.className = "mobile-drawer-nav";
        mobileNav.setAttribute("aria-label", "Main navigation");
        const mobileList = document.createElement("ul");

        sourceNav.querySelectorAll("li:not(:first-child) a").forEach((sourceLink) => {
            const item = document.createElement("li");
            const link = sourceLink.cloneNode(true);
            item.appendChild(link);
            mobileList.appendChild(item);
        });

        mobileNav.appendChild(mobileList);
        drawerContent.parentNode.insertBefore(mobileNav, drawerContent);
    }

    // Add a close control without changing the existing HTML template.
    if (!megaMenu.querySelector(".mega-menu__close")) {
        const closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "mega-menu__close";
        closeButton.setAttribute("aria-label", "Close menu");
        // closeButton.innerHTML = "&times;";
        closeButton.innerHTML = `
    <svg
        class="mega-menu__close-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <path
            d="M5 5L19 19M19 5L5 19"
            stroke="currentColor"
            stroke-width="0.8"
            stroke-linecap="round"
        />
    </svg>
`;
        megaMenu.appendChild(closeButton);
        closeButton.addEventListener("click", closeCatalogMenu);
    }

    menuBtnToggle.addEventListener("click", () => {
        const isOpen = megaMenu.classList.toggle("open");
        menuBtnToggle.setAttribute("aria-expanded", String(isOpen));
        menuBtnToggle.setAttribute("aria-label", isOpen ? "Close catalog menu" : "Open catalog menu");
        document.body.classList.toggle("no-scroll", isOpen);
        if (megaMenuContToggle) megaMenuContToggle.classList.remove("open");
    });

    megaMenu.addEventListener("click", (event) => {
        if (event.target.closest("a")) closeCatalogMenu();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeCatalogMenu();
    });
}

if (topbar_btn_cont_toggle && megaMenuContToggle) {
    topbar_btn_cont_toggle.addEventListener("click", () => {
        const isOpen = megaMenuContToggle.classList.toggle("open");
        document.body.classList.toggle("no-scroll", isOpen);
        if (isOpen) closeCatalogMenu();
    });
}

/* ================================
   NEW COLLECTION IMAGES
================================ */

const collectionImages = {
    "my-imgGroup1_1": "/img/beds/newCollection/imgGroup1/imgGroup1_img1.jpg",
    "my-imgGroup1_2": "/img/beds/newCollection/imgGroup1/imgGroup1_img2.jpg",

    "my-imgGroup2_1": "/img/beds/newCollection/imgGroup2/imgGroup2_img1.jpg",
    "my-imgGroup2_2": "/img/beds/newCollection/imgGroup2/imgGroup2_img2.jpg",

    "my-imgGroup3_1": "/img/beds/newCollection/imgGroup3/imgGroup3_img1.jpg",
    "my-imgGroup3_2": "/img/beds/newCollection/imgGroup3/imgGroup3_img2.jpg",

    "my-imgGroup4_1": "/img/beds/newCollection/imgGroup4/imgGroup4_img1.jpg",
    "my-imgGroup4_2": "/img/beds/newCollection/imgGroup4/imgGroup4_img2.jpg"
};

Object.entries(collectionImages).forEach(([id, src]) => {
    const image = document.getElementById(id);

    if (image) {
        image.src = src;
    }
});

/* =========================================================
   NEW COLLECTION — PRODUCT LINKS + VIEW LARGE
========================================================= */

// В каждой паре изображений одна и та же модель.
// Замени ID, если на фотографиях изображены другие модели.


function initCollectionLightbox() {
    const section = document.querySelector(".newCollection");
    const lightbox = document.getElementById("productLightbox");
    const preview = document.getElementById("lightboxImage");
    const closeButton = document.getElementById("lightboxClose");
    const productLink = document.getElementById("lightboxProductLink");

    if (!section) return;

    if (!lightbox || !preview || !closeButton || !productLink) {
    console.warn("Lightbox: отсутствуют необходимые элементы.");
    return;
    }

    const productIds = {
        "my-imgGroup1_1": "duo",
        "my-imgGroup1_2": "duo",
        "my-imgGroup2_1": "soffi",
        "my-imgGroup2_2": "soffi",
        "my-imgGroup3_1": "elora",
        "my-imgGroup3_2": "elora"
    };

    function openLightbox(image, productId) {
        if (!image || !image.getAttribute("src")) {
            console.error("Lightbox: у изображения не задан src.");
            return;
        }

        preview.src = image.src;
        preview.alt = image.alt || "Product";
        productLink.href = `product.html?id=${encodeURIComponent(productId)}`;

        lightbox.classList.add("is-active");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
    }

    function closeLightbox() {
        lightbox.classList.remove("is-active");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
        preview.removeAttribute("src");
    }

    section.addEventListener("click", (event) => {
        const trigger = event.target.closest(".slide__view-large");

        if (trigger) {
            const card = trigger.closest(".slide__card");
            const image = card?.querySelector(".slide__image img");
            const productId = image ? productIds[image.id] : null;

            if (!image || !productId) {
                console.error("Lightbox: не найдена карточка или ID товара.");
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            openLightbox(image, productId);
        }
    });

    closeButton.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox.classList.contains("is-active")) {
            closeLightbox();
        }
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCollectionLightbox);
} else {
    initCollectionLightbox();
}


/* =================================
   HEADER MEDIA SWIPER
================================= */

/* ================================
   FOOTER TEL
================================ */

const footermail = document.querySelector(".footer-mail");
const footmail = document.querySelector(".Footmail");

if (footermail && footmail) {
    footmail.addEventListener("click", () => {
        footermail.classList.toggle("open");
    });
}

/* ================================
   FOOTER TEL
================================ */

const footerTel = document.querySelector(".footer-tel");
const footTel = document.querySelector(".FootTel");

if (footerTel && footTel) {
    footTel.addEventListener("click", () => {
        footerTel.classList.toggle("open");
    });
}
