
"use strict";

const translations = {
    ru: {
        "mainNav.catalog": "каталог",
        "mainNav.project": "Проекты",
        "mainNav.material": "материалы",
        "mainNav.about": "О нас",

        "nav.collection": "Коллекция",
        "nav.indoor": "Для интерьера",
        "nav.outdoor": "Для улицы",
        "nav.accessories": "Аксессуары",

        "megaMenu.beds":"Кровати",
        "megaMenu.sofas":"Диваны",
        "megaMenu.ottom":"Оттоманки",
        "megaMenu.sunloung":"Шезлонги",
        "megaMenu.armch":"Кресла",
        "megaMenu.table":"Столы",
        "megaMenu.all":"Смотреть все",
        "megaMenu.title":"BROSKO сегодня",

        "hero.text":"Дизайн вне Времени",

        "works.title":"Начни с",
        "works.text":"<span> Собственное изготовление металлокаркасов </span> <br><br> Создание монолитных конструкций требует не просто соединения деталей, а создания единого целого. На этом этапе каркас приобретает свою законченную форму. <br><br> Профессиональная сварка: глубокие, надёжные швы, рассчитанные на многолетнюю эксплуатацию без деформаций. <br><br> Контроль качества: проверка прочности каждого соединения перед отправкой на покраску. Металл в руках мастеров, знающих своё дело.",

        "newCollec.title":"Новое",
        "slide.large":"УВЕЛИЧИТЬ",
        "slide.view": "СМОТРЕТЬ ПРОДУКТ",

        "catalog.title1": "мебель 2026",
        "catalog.title2": "Коллекция мебели",
        "catalog.topInfo": "Продуманная коллекция современной мебели, в которой сочетаются пропорции, материалы и неподвластное времени мастерство исполнения.",
        "catalog.Info":"Коллекции современной мебели, созданные для \n изысканных интерьеров.",
        "catalog.loadMore": "Показать ещё",

        "product.info": "Эта кровать сочетает в себе элегантную функциональность и современный стиль. Минималистичный дизайн с мягким изголовьем и изысканной обивкой обеспечивает исключительный комфорт и долговечность, придавая вашей спальне особую атмосферу.",
        "product.techInfo": "Техническая информация",
        "product.dimensions": "Размеры и характеристики",
        "product.descript": "Размеры и характеристики",
        "product.Inspiration": "Вдохновение",
        "product.gallery": "Галерея",
        "product.details": "Подробнее",

        "common.contact": "Контакты",
        "common.tel": "тел.",

        "footer.Info":"Современная мебель\nсозданная для жизни",
        "footer.title1":"больше открытий",
        "footer.collections": "Коллекции",
        "footer.collectIn":"Коллекции Indoor",
        "footer.collectOut":"Коллекции Outdoor",
        "footer.acces":"Аксессуары",
        
    },

    en: {
        "mainNav.catalog": "catalog",
        "mainNav.project": "projects",
        "mainNav.material": "materials",
        "mainNav.about": "about us",

        "nav.collection": "Collection",
        "nav.indoor": "Indoor",
        "nav.outdoor": "Outdoor",
        "nav.accessories": "Accessories",

        "megaMenu.beds":"Beds",
        "megaMenu.sofas":"Sofas",
        "megaMenu.ottom":"Ottomans",
        "megaMenu.sunloung":"Sunloungers",
        "megaMenu.armch":"Armchairs",
        "megaMenu.table":"Tables",
        "megaMenu.all":"view all",
        "megaMenu.title":"BROSKO in life",

        "hero.text":"Timeless Design",

        "works.title":"Focus On",
        "works.textTitle":"Own production of metal frames",
        "works.text":"<span> Own production of metal frames </span> <br><br> Creating monolithic structures requires not just joining parts, but creating a single whole. At this stage, the frame acquires its final shape. <br><br> Professional welding: deep, reliable seams designed for long‑term operation without deformation. <br><br> Quality control: checking the strength of each joint before sending the parts for painting. Metal in the hands of craftsmen who know their job.",

        "newCollec.title":"New",
        "slide.large":"VIEW LARGE",
        "slide.view": "VIEW PRODUCT",

        "catalog.title1": "Collection 2026",
        "catalog.title2": "Furniture",
        "catalog.topInfo": "A considered collection of contemporary furniture shaped by proportion, material and timeless craftsmanship.",
        "catalog.Info":"Contemporary furniture collections designed for \n sophisticated interiors.",
        "catalog.loadMore": "Load More",

        "product.info": "This bed embodies elegant functionality and modern style. The minimalist design with a soft headboard and refined upholstery ensures exceptional comfort and durability, adding an exquisite atmosphere to your bedroom.",
        "product.techInfo": "Technical Information",
        "product.dimensions": "Dimensions & Details",
        "product.descript": "",
        "product.Inspiration": "Inspiration",
        "product.gallery": "Gallery",
        "product.details": "Details",

        "common.contact": "Contact Us",
        "common.tel": "tel.",

        "footer.Info":"Modern furniture,<br>Created for life.",
        "footer.title1":"explore",
        "footer.collections":"Collection",
        "footer.collectIn":"Collection Indoor",
        "footer.collectOut":"Collection Outdoor",
        "footer.acces":"Accessories",
    }
};

const supportedLanguages = ["ru", "en"];

function getInitialLanguage() {
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get("lang");

    if (supportedLanguages.includes(urlLanguage)) {
        return urlLanguage;
    }

    try {
        const savedLanguage = localStorage.getItem("brosko-language");

        if (supportedLanguages.includes(savedLanguage)) {
            return savedLanguage;
        }
    } catch (error) {
        // Сайт продолжит работать без localStorage.
    }

    return "en";
}

function setLanguage(language) {
    if (!supportedLanguages.includes(language)) return;

    window.currentLanguage = language;
    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.dataset.i18n;
        const translation = translations[language]?.[key];

        if (translation !== undefined) {
            // element.textContent = translation;
            element.innerHTML = translation;
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const key = element.dataset.i18nPlaceholder;
        const translation = translations[language]?.[key];

        if (translation !== undefined) {
            element.placeholder = translation;
        }
    });

    document.querySelectorAll(".topBar-lang").forEach((button) => {
        const isActive = button.dataset.lang === language;

        button.classList.toggle("is-active", isActive);

        if (isActive) {
            button.setAttribute("aria-current", "true");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    try {
        localStorage.setItem("brosko-language", language);
    } catch (error) {
        // Выбор сохранится только на текущей странице.
    }

    document.dispatchEvent(
    new CustomEvent("languageChanged", {
        detail: { language }
    })
    );
}


function initLanguageSwitcher() {
    document.querySelectorAll(".topBar-lang").forEach((button) => {
        button.addEventListener("click", () => {
            const language = button.dataset.lang;

            if (!supportedLanguages.includes(language)) return;

            setLanguage(language);

            const url = new URL(window.location.href);
            url.searchParams.set("lang", language);

            window.history.replaceState({}, "", url);
        });
    });

    setLanguage(getInitialLanguage());
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLanguageSwitcher, {
        once: true
    });
} else {
    initLanguageSwitcher();
}

