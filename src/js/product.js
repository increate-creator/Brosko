"use strict";

/* =========================================================
   CONFIG
========================================================= */

const PRODUCTS_URL = "/products.json";

/* =========================================================
   STATE
========================================================= */

let currentProduct = null;
let currentImageIndex = 0;

/* =========================================================
   DOM
========================================================= */

const DOM = {
    productPage: document.querySelector("#productPage"),

    breadcrumbCategory: document.querySelector("#breadcrumbCategory"),
    breadcrumbProduct: document.querySelector("#breadcrumbProduct"),

    productCategory: document.querySelector("#productCategory"),
    productName: document.querySelector("#productName"),
    productDescription: document.querySelector("#productDescription"),

    addProductDescription: document.querySelector("#addDescription"),
    addProductDescriptionList: document.querySelector("#addDescriptionList"),

    mainProductImage: document.querySelector("#mainProductImage"),
    galleryMain: document.querySelector("#galleryMain"),
    galleryThumbs: document.querySelector("#galleryThumbs"),

    dimensionsGallery: document.querySelector("#dimensionsGallery"),
    detailsGrid: document.querySelector("#detailsGrid"),

    photoGallery: document.querySelector("#photoGallery"),
    metaDescription: document.querySelector("#metaDescription")
};


/* =========================================================
   INITIALIZATION
========================================================= */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}

/* Обновление контента при переключении языка */

document.addEventListener("languageChanged", () => {
    if (currentProduct) {
        renderProduct(currentProduct);
    }
});

/* =========================================================
   INIT
========================================================= */

async function init() {
    if (!DOM.productPage) return;

    console.log("Brosko PRODUCT PAGE INIT");

    try {
        const productId = getProductId();

        if (!productId) {
            throw new Error("Product ID is missing.");
        }

        const products = await loadProducts();

        currentProduct = findProduct(products, productId);

        if (!currentProduct) {
            throw new Error(`Product "${productId}" not found.`);
        }

        normalizeProduct(currentProduct);

        renderProduct(currentProduct);

        console.log("PRODUCT LOADED:", currentProduct);

    } catch (error) {
        console.error("PRODUCT PAGE ERROR:", error);
        showError(error.message);
    }
}


/* =========================================================
   PRODUCT ID
========================================================= */

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {
    const response = await fetch(PRODUCTS_URL, {
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            `Cannot load products.json. HTTP ${response.status}`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error("products.json must contain an array.");
    }

    return data;
}

/* =========================================================
   FIND PRODUCT
========================================================= */

function findProduct(products, id) {
    const normalizedId = String(id).trim().toLowerCase();

    return products.find(product =>
        String(product.id).trim().toLowerCase() === normalizedId
    );
}

/* =========================================================
   LANGUAGE HELPERS
========================================================= */

/*
 * Поддерживаются оба формата:
 *
 * "name": "Soffi"
 *
 * И двуязычный формат:
 *
 * "name": {
 *     "en": "Soffi",
 *     "ru": "Соффи"
 * }
 */

function getCurrentLanguage() {
    const language =
        window.currentLanguage ||
        document.documentElement.lang ||
        "en";

    return String(language).toLowerCase().startsWith("ru")
        ? "ru"
        : "en";
}

function getLocalizedText(value, fallback = "") {
    const language = getCurrentLanguage();

    if (value === null || value === undefined) {
        return fallback;
    }

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value.map(item => getLocalizedText(item)).join("");
    }

    if (typeof value === "object") {
        return String(
            value[language] ??
            value.en ??
            value.ru ??
            fallback
        );
    }

    return fallback;
}

/* =========================================================
   PRODUCT NAME
========================================================= */

function getProductName(product) {
    return String(
        getLocalizedText(product?.name) ||
        product?.id ||
        ""
    );
}

/* =========================================================
   PRODUCT CATEGORY
========================================================= */

function getProductCategory(product) {
    const language = getCurrentLanguage();
    const categoryLabel = product?.categoryLabel;

    /*
     * Если категория задана объектом переводов,
     * используем перевод для выбранного языка.
     */

    if (
        categoryLabel &&
        typeof categoryLabel === "object"
    ) {
        const translated = getLocalizedText(categoryLabel);

        if (translated) {
            return translated;
        }
    }

    /*
     * Если categoryLabel — обычная строка,
     * используем её для английского языка.
     */

    if (
        typeof categoryLabel === "string" &&
        categoryLabel.trim() &&
        language !== "ru"
    ) {
        return categoryLabel;
    }

    const category = String(
        product?.category || ""
    ).trim().toLowerCase();

    const ruCategories = {
        beds: "Кровати",
        sofas: "Диваны",
        chairs: "Стулья",
        armchairs: "Кресла",
        tables: "Столы",
        coffee_tables: "Журнальные столы",
        dining_tables: "Обеденные столы",
        sideboards: "Комоды",
        storage: "Системы хранения",
        lighting: "Освещение",
        accessories: "Аксессуары",
        outdoor: "Уличная мебель",
        indoor: "Мебель для интерьера"
    };

    if (language === "ru" && ruCategories[category]) {
        return ruCategories[category];
    }

    return categoryLabel || formatCategory(category);
}

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(product) {

    /* PRODUCT IMAGES */

    if (!Array.isArray(product.images)) {
        product.images = [];
    }

    if (product.images.length === 0 && product.image) {
        if (Array.isArray(product.image)) {
            product.images = [...product.image];
        } else if (typeof product.image === "string") {
            product.images = [product.image];
        }
    }

    if (
        product.mainImage &&
        !product.images.includes(product.mainImage)
    ) {
        product.images.unshift(product.mainImage);
    }

    /* Убираем пустые значения и вложенные массивы */

    product.images = product.images
        .flat(Infinity)
        .filter(image => typeof image === "string" && image.trim())
        .map(image => image.trim());

    product.images = product.images.map(normalizeImagePath);

    product.mainImage = normalizeImagePath(product.mainImage);

    product.dimensionsImages =
        product.dimensionsImages.map(normalizeImagePath);

    product.gallery = product.gallery.map(normalizeImagePath);

    /* PHOTO GALLERY */

    if (!Array.isArray(product.gallery)) {
        product.gallery = [];
    }

    /* MATERIALS */

    if (!Array.isArray(product.materials)) {
        product.materials = [];
    }

    /* COLORS */

    if (!Array.isArray(product.colors)) {
        product.colors = [];
    }

    /* DIMENSIONS IMAGES */

    if (!Array.isArray(product.dimensionsImages)) {
        product.dimensionsImages = [];
    }

    /* DIMENSIONS DETAILS */

    if (
        product.dimensionsDetails &&
        typeof product.dimensionsDetails === "object"
    ) {
        const details = product.dimensionsDetails;

        if (
            details.layout === "grid" &&
            !Array.isArray(details.details)
        ) {
            details.details = [];
        }

        if (
            details.layout === "single" &&
            !Array.isArray(details.details)
        ) {
            details.details = details.image
                ? [{ image: details.image }]
                : [];
        }

    } else if (Array.isArray(product.details)) {

        /*
         * Поддержка старого формата:
         * "details": [...]
         */

        product.dimensionsDetails = {
            layout: "grid",
            details: product.details
        };

        if (product.dimensionsDetails?.details) {
            product.dimensionsDetails.details =
                product.dimensionsDetails.details.map(detail => ({
                ...detail,
                    icon: normalizeImagePath(detail.icon),
                    image: normalizeImagePath(detail.image)
        }));
    }

    } else {
        product.dimensionsDetails = null;
    }
}


/* =========================================================
   NORMALIZE IMAGE PATH
========================================================= */

function normalizeImagePath(path) {
    if (typeof path !== "string" || !path.trim()) {
        return "";
    }

    const cleanPath = path.trim();

    // Внешние URL и Data URL оставляем без изменений
    if (
        cleanPath.startsWith("http://") ||
        cleanPath.startsWith("https://") ||
        cleanPath.startsWith("data:")
    ) {
        return cleanPath;
    }

    // src/img/... превращаем в /img/...
    return cleanPath
        .replace(/^\/?src\/img\//, "/img/")
        .replace(/^img\//, "/img/");
}


/* =========================================================
   RENDER PRODUCT
========================================================= */

function renderProduct(product) {
    const productName = getProductName(product);
    const productCategory = getProductCategory(product);
    const productDescription = getLocalizedText(
        product.description
    );

    /* PAGE TITLE */

    document.title = `${productName} | Brosko`;

    /* META DESCRIPTION */

    if (DOM.metaDescription) {
        DOM.metaDescription.content = productDescription || "";
    }

    /* BREADCRUMB */

    setText(DOM.breadcrumbCategory, productCategory);
    setText(DOM.breadcrumbProduct, productName);

    /* PRODUCT INFORMATION */

    setText(DOM.productCategory, productCategory);
    setText(DOM.productName, productName);
    setText(DOM.productDescription, productDescription || "—");

    /* MAIN GALLERY */

    renderMainGallery(product);

    /* DIMENSIONS */

    renderDimensionsGallery(
        product.dimensionsImages,
        productName
    );

    /* DETAILS */

    renderDetails(product.dimensionsDetails, productName);

    /* OPTIONAL ADDITIONAL DESCRIPTION */

    renderAddDescription(product);

    /* PHOTO GALLERY */

    renderPhotoGallery(
        product.gallery,
        productName
    );
}

/* =========================================================
   MAIN PRODUCT GALLERY
========================================================= */

function renderMainGallery(product) {
    const images = product.images || [];

    if (images.length === 0) {
        showGalleryError(
            getCurrentLanguage() === "ru"
                ? "Изображения товара отсутствуют."
                : "No product images."
        );

        return;
    }

    currentImageIndex = 0;

    const productName = getProductName(product);

    setMainImage(images[0], productName);

    createThumbnails(images, productName);
}

/* =========================================================
   MAIN IMAGE
========================================================= */

function setMainImage(imagePath, productName) {
    if (!DOM.mainProductImage) {
        return;
    }

    DOM.mainProductImage.style.opacity = "0";

    const testImage = new Image();

    testImage.onload = function () {
        DOM.mainProductImage.src = imagePath;
        DOM.mainProductImage.alt = productName;
        DOM.mainProductImage.style.opacity = "1";
    };

    testImage.onerror = function () {
        console.error("IMAGE ERROR:", imagePath);

        DOM.mainProductImage.removeAttribute("src");
        DOM.mainProductImage.alt =
            getCurrentLanguage() === "ru"
                ? "Изображение товара недоступно"
                : "Product image unavailable";

        DOM.mainProductImage.style.opacity = "1";
    };

    testImage.src = imagePath;

    updateActiveThumbnail();
}

/* =========================================================
   THUMBNAILS
========================================================= */

function createThumbnails(images, productName) {
    if (!DOM.galleryThumbs) {
        return;
    }

    DOM.galleryThumbs.innerHTML = "";

    images.forEach((imagePath, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "gallery-thumb";

        if (index === 0) {
            button.classList.add("active");
        }

        const img = document.createElement("img");

        img.src = imagePath;
        img.alt = `${productName} ${index + 1}`;
        img.loading = index === 0 ? "eager" : "lazy";

        img.onerror = function () {
            console.error("THUMBNAIL ERROR:", imagePath);
        };

        button.appendChild(img);

        button.addEventListener("click", () => {
            currentImageIndex = index;

            setMainImage(imagePath, productName);

            updateActiveThumbnail();
        });

        DOM.galleryThumbs.appendChild(button);
    });
}

/* =========================================================
   ACTIVE THUMBNAIL
========================================================= */

function updateActiveThumbnail() {
    if (!DOM.galleryThumbs) {
        return;
    }

    const thumbnails = DOM.galleryThumbs.querySelectorAll(
        ".gallery-thumb"
    );

    thumbnails.forEach((thumbnail, index) => {
        thumbnail.classList.toggle(
            "active",
            index === currentImageIndex
        );
    });
}

/* =========================================================
   DIMENSIONS GALLERY
========================================================= */

function renderDimensionsGallery(images, productName) {
    if (!DOM.dimensionsGallery) {
        return;
    }

    DOM.dimensionsGallery.innerHTML = "";

    if (!Array.isArray(images) || images.length === 0) {
        DOM.dimensionsGallery.innerHTML = `
            <div class="image-error">
                ${
                    getCurrentLanguage() === "ru"
                        ? "Изображения размеров отсутствуют."
                        : "No dimensions images available."
                }
            </div>
        `;

        return;
    }

    images.forEach((imagePath, index) => {
        const wrapper = document.createElement("div");

        wrapper.className = "dimension-image";

        const img = document.createElement("img");

        img.src = imagePath;
        img.alt = `${productName} dimensions ${index + 1}`;
        img.loading = index === 0 ? "eager" : "lazy";

        img.onerror = function () {
            console.error("DIMENSION IMAGE ERROR:", imagePath);

            wrapper.innerHTML = `
                <div class="image-error">
                    ${
                        getCurrentLanguage() === "ru"
                            ? "Изображение недоступно"
                            : "Image unavailable"
                    }
                </div>
            `;
        };

        wrapper.appendChild(img);

        DOM.dimensionsGallery.appendChild(wrapper);
    });
}

/* =========================================================
   DETAILS
========================================================= */

function renderDetails(dimensionsDetails, productName) {
    if (!DOM.detailsGrid) {
        return;
    }

    DOM.detailsGrid.innerHTML = "";

    if (
        !dimensionsDetails ||
        typeof dimensionsDetails !== "object"
    ) {
        DOM.detailsGrid.style.display = "none";
        return;
    }

    /* GRID LAYOUT */

    if (dimensionsDetails.layout === "grid") {
        const details = dimensionsDetails.details;

        if (!Array.isArray(details) || details.length === 0) {
            DOM.detailsGrid.style.display = "none";
            return;
        }

        DOM.detailsGrid.style.display = "";
        DOM.detailsGrid.className =
            "details-grid details-grid--grid";

        details.forEach(detail => {
            const card = document.createElement("article");

            card.className = "detail-card";

            /* VISUAL */

            const visual = document.createElement("div");
            visual.className = "detail-card__visual";

            /* ICON */

            if (detail.icon) {
                const iconWrapper = document.createElement("div");
                iconWrapper.className = "detail-card__icon";

                const icon = document.createElement("img");

                icon.src = detail.icon;
                icon.alt = "";
                icon.loading = "lazy";

                iconWrapper.appendChild(icon);
                visual.appendChild(iconWrapper);
            }

            /* DETAIL IMAGE */

            if (detail.image) {
                const imageWrapper = document.createElement("div");
                imageWrapper.className = "detail-card__image";

                const image = document.createElement("img");

                image.src = detail.image;
                image.alt = getLocalizedText(detail.title);
                image.loading = "lazy";

                image.onerror = function () {
                    console.error(
                        "DETAIL IMAGE ERROR:",
                        detail.image
                    );
                };

                imageWrapper.appendChild(image);
                visual.appendChild(imageWrapper);
            }

            /* TEXT CONTENT */

            const content = document.createElement("div");
            content.className = "detail-card__content";

            const title = document.createElement("h3");
            title.textContent = getLocalizedText(detail.title);

            const description = document.createElement("p");
            description.textContent = getLocalizedText(
                detail.description
            );

            if (title.textContent) {
                content.appendChild(title);
            }

            if (description.textContent) {
                content.appendChild(description);
            }

            card.appendChild(visual);
            card.appendChild(content);

            DOM.detailsGrid.appendChild(card);
        });

        return;
    }

    /* SINGLE IMAGE LAYOUT */

    if (dimensionsDetails.layout === "single") {
        const details = Array.isArray(dimensionsDetails.details)
            ? dimensionsDetails.details
            : [];

        const imagePath =
            dimensionsDetails.image ||
            details[0]?.image ||
            "";

        if (!imagePath) {
            DOM.detailsGrid.style.display = "none";
            return;
        }

        DOM.detailsGrid.className = "details-single";

        const card = document.createElement("article");
        card.className = "detailImg-card";

        const image = document.createElement("img");

        image.className = "detailImg-card__image";
        image.src = imagePath;
        image.alt = `${productName} details`;
        image.loading = "lazy";

        image.onerror = function () {
            console.error(
                "SINGLE DETAILS IMAGE ERROR:",
                imagePath
            );

            DOM.detailsGrid.innerHTML = "";
            DOM.detailsGrid.style.display = "none";
        };

        card.appendChild(image);
        DOM.detailsGrid.appendChild(card);

        DOM.detailsGrid.style.display = "";
    }
}

/* =========================================================
   ADDITIONAL DESCRIPTION
========================================================= */

function renderAddDescription(product) {
    const section = DOM.addProductDescription;
    const list = DOM.addProductDescriptionList;

    if (!section || !list) return;

    list.innerHTML = "";

    const addDescription =
        product.add_description ??
        product.addDescription ??
        null;

    if (!addDescription || !addDescription.items) {
        section.hidden = true;
        return;
    }

    const language = getCurrentLanguage();

    const itemsData = addDescription.items;

    let items;

    if (Array.isArray(itemsData)) {
        // Поддержка старого формата: items: [...]
        items = itemsData;

    } else if (itemsData && typeof itemsData === "object") {
        // Новый формат: items: { en: [...], ru: [...] }
        items =
            itemsData[language] ??
            itemsData.en ??
            itemsData.ru ??
            [];

    } else {
        items = [];
    }

    if (!Array.isArray(items) || items.length === 0) {
        section.hidden = true;
        return;
    }

    items.forEach(item => {
        const text = getLocalizedText(item).trim();

        if (!text) return;

        const listItem = document.createElement("div");
        listItem.className = "product-add-description__item";

        // Убираем начальный дефис, если он остался в JSON.
        // listItem.textContent = text.replace(/^\s*[-–—]\s*/, "");

        listItem.textContent = text.replace(/^\s*[-–—]\s*/, "");

        list.appendChild(listItem);
    });

    section.hidden = list.children.length === 0;
}

/* =========================================================
   PHOTO GALLERY
========================================================= */

function renderPhotoGallery(images, productName) {
    if (!DOM.photoGallery) {
        return;
    }

    DOM.photoGallery.innerHTML = "";

    if (!Array.isArray(images) || images.length === 0) {
        DOM.photoGallery.innerHTML = `
            <div class="image-error">
                ${
                    getCurrentLanguage() === "ru"
                        ? "Изображения галереи отсутствуют."
                        : "No gallery images available."
                }
            </div>
        `;

        return;
    }

    images.forEach((imagePath, index) => {
        const figure = document.createElement("figure");

        figure.className = "gallery-photo";

        const img = document.createElement("img");

        img.src = imagePath;
        img.alt = `${productName} gallery ${index + 1}`;
        img.loading = "lazy";

        img.onerror = function () {
            console.error("GALLERY IMAGE ERROR:", imagePath);

            figure.innerHTML = `
                <div class="image-error">
                    ${
                        getCurrentLanguage() === "ru"
                            ? "Изображение недоступно"
                            : "Image unavailable"
                    }
                </div>
            `;
        };

        figure.appendChild(img);
        DOM.photoGallery.appendChild(figure);
    });
}

/* =========================================================
   SIMPLE LIST
========================================================= */

function renderSimpleList(element, items) {
    if (!element) {
        return;
    }

    element.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
        element.textContent = "—";
        return;
    }

    items.forEach(item => {
        const span = document.createElement("span");

        span.textContent = getLocalizedText(item);

        element.appendChild(span);
    });
}

/* =========================================================
   FORMAT DIMENSION
========================================================= */

function formatDimensionName(key) {
    const language = getCurrentLanguage();

    const labels = {
        en: {
            width: "Width",
            height: "Height",
            depth: "Depth",
            length: "Length",
            diameter: "Diameter",
            seatHeight: "Seat height",
            armHeight: "Arm height",
            totalHeight: "Total height"
        },

        ru: {
            width: "Ширина",
            height: "Высота",
            depth: "Глубина",
            length: "Длина",
            diameter: "Диаметр",
            seatHeight: "Высота сиденья",
            armHeight: "Высота подлокотника",
            totalHeight: "Общая высота"
        }
    };

    return labels[language]?.[key] ||
        labels.en[key] ||
        key;
}

/* =========================================================
   FORMAT CATEGORY
========================================================= */

function formatCategory(category) {
    if (!category) {
        return "";
    }

    return String(category)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

/* =========================================================
   SET TEXT
========================================================= */

function setText(element, value) {
    if (!element) {
        return;
    }

    element.textContent = value ?? "";
}

/* =========================================================
   GALLERY ERROR
========================================================= */

function showGalleryError(message) {
    if (!DOM.galleryMain) {
        return;
    }

    DOM.galleryMain.innerHTML = `
        <div class="image-error">
            ${message}
        </div>
    `;
}

/* =========================================================
   PAGE ERROR
========================================================= */

function showError(message) {
    if (!DOM.productPage) {
        return;
    }

    DOM.productPage.innerHTML = `
        <div class="image-error">
            ${message}
        </div>
    `;
}

