
"use strict";

/* =========================================================
   BROSKO — CATALOG
   ========================================================= */

/* =========================================================
   CONFIG
   ========================================================= */

const PRODUCTS_URL = "/products.json";
const CATEGORIES_URL = "/categories.json";

const PRODUCTS_PER_PAGE = 8;


/* =========================================================
   LANGUAGE
   ========================================================= */

function getCurrentLanguage() {
    return window.currentLanguage || "en";
}


function getLocalizedText(value) {
    const language = getCurrentLanguage();

    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "object" && !Array.isArray(value)) {
        return value[language] || value.en || value.ru || "";
    }

    return String(value);
}


/* =========================================================
   STATE
   ========================================================= */

let products = [];
let categories = [];

let currentCategory = "indoor";
let currentSubcategory = "all";

let visibleProductsCount = PRODUCTS_PER_PAGE;

let isCatalogInitialized = false;


/* =========================================================
   DOM
   ========================================================= */

const DOM = {
    categoryNav: document.querySelector("#categoryNav"),

    subcategoryNav: document.querySelector("#subcategoryList"),

    productsGrid: document.querySelector("#productsGrid"),

    catalogTitle: document.querySelector("#catalogTitle"),

    categoryDescription: document.querySelector("#categoryDescription"),

    loadMore: document.querySelector("#loadMore"),

    loading: document.querySelector("#catalogLoading"),

    empty: document.querySelector("#catalogEmpty"),

    error: document.querySelector("#catalogError")
};


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeValue(value) {

    if (value === undefined || value === null) {
        return "";
    }

    if (typeof value === "object" && !Array.isArray(value)) {
        value = getLocalizedText(value);
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/_/g, "-");
}


function formatName(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());

}


function getLocalizedName(value) {

    return getLocalizedText(value);
}


/* =========================================================
   LOAD JSON
   ========================================================= */

async function fetchJSON(url) {

    const response = await fetch(url, {
        cache: "no-cache"
    });

    if (!response.ok) {
        throw new Error(
            `Cannot load ${url}. HTTP ${response.status}`
        );
    }

    return response.json();
}


async function loadCategories() {

    const data = await fetchJSON(CATEGORIES_URL);

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.categories)) {
        return data.categories;
    }

    throw new Error(
        "categories.json must contain an array or { categories: [] }."
    );
}


async function loadProducts() {

    const data = await fetchJSON(PRODUCTS_URL);

    if (Array.isArray(data)) {
        return data;
    }

    if (Array.isArray(data.products)) {
        return data.products;
    }

    throw new Error(
        "products.json must contain an array or { products: [] }."
    );
}


/* =========================================================
   NORMALIZE CATEGORIES
   ========================================================= */

function normalizeCategories(data) {

    return data.map(category => {

        const id =
            category.id ||
            category.slug ||
            category.key ||
            category.name;

        const name =
            category.name ||
            category.title ||
            category.label ||
            id;

        let subcategories =
            category.subcategories ||
            category.children ||
            category.categories ||
            [];

        // Object format:
        // { sofas: "Sofas", chairs: "Chairs" }

        if (
            !Array.isArray(subcategories) &&
            typeof subcategories === "object" &&
            subcategories !== null
        ) {

            subcategories = Object.entries(subcategories).map(
                ([key, value]) => {

                    if (typeof value === "string") {
                        return {
                            id: key,
                            name: value,
                            title: value
                        };
                    }

                    return {
                        ...value,
                        id: value.id || value.slug || key,
                        name: value.name || value.title || value.label || key,
                        title: value.title || value.name || value.label || key
                    };

                }
            );

        }

        if (!Array.isArray(subcategories)) {
            subcategories = [];
        }

        subcategories = subcategories.map(subcategory => {

            if (typeof subcategory === "string") {

                return {
                    id: normalizeValue(subcategory),
                    name: subcategory,
                    title: subcategory
                };

            }

            const subcategoryId =
                subcategory.id ||
                subcategory.slug ||
                subcategory.key ||
                getLocalizedText(subcategory.name) ||
                getLocalizedText(subcategory.title);

            return {
                ...subcategory,

                id: normalizeValue(subcategoryId),

                name:
                    subcategory.name ||
                    subcategory.title ||
                    subcategory.label ||
                    subcategoryId,

                title:
                    subcategory.title ||
                    subcategory.name ||
                    subcategory.label ||
                    subcategoryId
            };

        });

        return {
            ...category,

            id: normalizeValue(id),

            name,

            title:
                category.title ||
                category.name ||
                category.label ||
                id,

            description: category.description || "",

            subcategories
        };

    });

}


/* =========================================================
   NORMALIZE PRODUCTS
   ========================================================= */

function normalizeProducts(data) {

    return data.map(product => {

        return {
            ...product,

            id: String(product.id || "").trim(),

            name:
                product.name ||
                product.title ||
                "Untitled",

            collection:
                product.collection || "",

            category:
                product.category || "",

            subcategory:
                product.subcategory ||
                product.subCategory ||
                product.type ||
                ""
        };

    });

}


/* =========================================================
   CATEGORY
   ========================================================= */

function categoryExists(categoryId) {

    return categories.some(category =>
        normalizeValue(category.id) === normalizeValue(categoryId)
    );

}


function getCurrentCategory() {

    return categories.find(category =>
        normalizeValue(category.id) === normalizeValue(currentCategory)
    );

}


function getCurrentSubcategories() {

    const category = getCurrentCategory();

    return category?.subcategories || [];

}


/* =========================================================
   INIT
   ========================================================= */

async function init() {

    if (isCatalogInitialized) {
        return;
    }

    isCatalogInitialized = true;

    console.log("Brosko CATALOG INIT");

    if (!DOM.productsGrid) {
        console.warn("Catalog grid not found. Catalog initialization skipped.");
        return;
    }

    try {

        const params = new URLSearchParams(window.location.search);

        const urlCategory = params.get("category");
        const urlSubcategory = params.get("subcategory");

        if (urlCategory) {
            currentCategory = normalizeValue(urlCategory);
        }

        if (urlSubcategory) {
            currentSubcategory = normalizeValue(urlSubcategory);
        }

        showLoading();

        const [categoriesData, productsData] = await Promise.all([
            loadCategories(),
            loadProducts()
        ]);

        categories = normalizeCategories(categoriesData);

        products = normalizeProducts(productsData);

        console.log("Categories:", categories);
        console.log("Products:", products);

        if (!categoryExists(currentCategory)) {

            currentCategory = categories.length
                ? categories[0].id
                : "indoor";

        }

        if (
            currentSubcategory !== "all" &&
            !getCurrentSubcategories().some(
                item => item.id === currentSubcategory
            )
        ) {
            currentSubcategory = "all";
        }

        visibleProductsCount = PRODUCTS_PER_PAGE;

        renderCategories();

        renderSubcategories();

        renderProducts();

        hideLoading();

        console.log("CATALOG LOADED");

    } catch (error) {

        console.error("CATALOG ERROR:", error);

        hideLoading();

        showError(error.message);

    }

}


/* =========================================================
   RENDER TOP CATEGORIES
   ========================================================= */

function renderCategories() {

    if (!DOM.categoryNav) {
        console.warn("#categoryNav not found");
        return;
    }

    DOM.categoryNav.innerHTML = "";

    categories.forEach(category => {

        const categoryId = normalizeValue(category.id);

        const button = document.createElement("button");

        button.type = "button";

        button.className = "main-category";

        button.dataset.category = categoryId;

        if (categoryId === currentCategory) {
            button.classList.add("active");
        }

        button.textContent = getLocalizedName(
            category.title || category.name
        ).toUpperCase();

        button.addEventListener("click", () => {
            selectCategory(categoryId);
        });

        DOM.categoryNav.appendChild(button);

    });

}


/* =========================================================
   SELECT CATEGORY
   ========================================================= */

function selectCategory(categoryId) {

    currentCategory = normalizeValue(categoryId);

    currentSubcategory = "all";

    visibleProductsCount = PRODUCTS_PER_PAGE;

    updateURL();

    renderCategories();

    renderSubcategories();

    renderProducts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   RENDER SUBCATEGORIES
   ========================================================= */

function renderSubcategories() {

    if (!DOM.subcategoryNav) {
        console.warn("#subcategoryList not found");
        return;
    }

    DOM.subcategoryNav.innerHTML = "";

    const allButton = createSubcategoryButton(
        "all",
        {
            en: "All",
            ru: "Все"
        }
    );

    DOM.subcategoryNav.appendChild(allButton);

    const subcategories = getCurrentSubcategories();

    subcategories.forEach(subcategory => {

        const id = normalizeValue(subcategory.id);

        if (!id || id === "all") {
            return;
        }

        const button = createSubcategoryButton(
            id,
            subcategory.name
        );

        DOM.subcategoryNav.appendChild(button);

    });

    const category = getCurrentCategory();

    if (DOM.catalogTitle) {

        DOM.catalogTitle.textContent = category
            ? getLocalizedName(category.title || category.name)
            : formatName(currentCategory);

    }

    if (DOM.categoryDescription) {

        DOM.categoryDescription.textContent = category
            ? getLocalizedName(category.description)
            : "";

    }

}


/* =========================================================
   SUBCATEGORY BUTTON
   ========================================================= */

function createSubcategoryButton(id, name) {

    const button = document.createElement("button");

    button.type = "button";

    button.className = "subcategory";

    button.dataset.subcategory = id;

    if (normalizeValue(id) === currentSubcategory) {
        button.classList.add("active");
    }

    button.textContent = getLocalizedName(name).toUpperCase();

    button.addEventListener("click", () => {
        selectSubcategory(id);
    });

    return button;

}


/* =========================================================
   SELECT SUBCATEGORY
   ========================================================= */

function selectSubcategory(subcategoryId) {

    currentSubcategory = normalizeValue(subcategoryId);

    visibleProductsCount = PRODUCTS_PER_PAGE;

    updateURL();

    renderSubcategories();

    renderProducts();

}


/* =========================================================
   URL
   ========================================================= */

function updateURL() {

    const params = new URLSearchParams();

    params.set("category", currentCategory);

    if (currentSubcategory && currentSubcategory !== "all") {
        params.set("subcategory", currentSubcategory);
    }

    const newURL =
        `${window.location.pathname}?${params.toString()}`;

    window.history.pushState({}, "", newURL);

}


/* =========================================================
   PRODUCT VALUE HELPERS
   ========================================================= */

function getProductValues(value) {

    if (Array.isArray(value)) {
        return value.map(normalizeValue);
    }

    if (value === undefined || value === null) {
        return [];
    }

    return [normalizeValue(value)];

}


/* =========================================================
   FILTER PRODUCTS BY CATEGORY
   ========================================================= */

function productBelongsToCategory(product, category) {

    const target = normalizeValue(category);

    const collectionValues = getProductValues(product.collection);

    const categoryValues = getProductValues(product.category);

    return (
        collectionValues.includes(target) ||
        categoryValues.includes(target)
    );

}


/* =========================================================
   FILTER PRODUCTS BY SUBCATEGORY
   ========================================================= */

function productBelongsToSubcategory(product, subcategory) {

    const target = normalizeValue(subcategory);

    const values = [
        product.subcategory,
        product.subCategory,
        product.categoryType,
        product.type,
        product.productCategory
    ];

    return values.some(value =>
        getProductValues(value).includes(target)
    );

}


/* =========================================================
   GET FILTERED PRODUCTS
   ========================================================= */

function getFilteredProducts() {

    let result = products.filter(product =>
        productBelongsToCategory(product, currentCategory)
    );

    if (currentSubcategory && currentSubcategory !== "all") {

        result = result.filter(product =>
            productBelongsToSubcategory(product, currentSubcategory)
        );

    }

    return result;

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {

    if (!DOM.productsGrid) {
        return;
    }

    const filteredProducts = getFilteredProducts();

    DOM.productsGrid.innerHTML = "";

    if (filteredProducts.length === 0) {

        showEmpty();

        updateLoadMore();

        return;

    }

    hideEmpty();

    const productsToShow = filteredProducts.slice(
        0,
        visibleProductsCount
    );

    productsToShow.forEach(product => {

        const card = createProductCard(product);

        DOM.productsGrid.appendChild(card);

    });

    animateProducts();

    updateLoadMore();

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(product) {

    const card = document.createElement("article");

    card.className = "product-card";

    const link = document.createElement("a");

    link.className = "product-card__link";

    link.href =
        `product.html?id=${encodeURIComponent(product.id)}`;


    /* IMAGE */

    const imageWrapper = document.createElement("div");

    imageWrapper.className = "product-card__image";

    const image = document.createElement("img");

    const imagePath = getProductImage(product);

    image.alt = getLocalizedName(product.name);

    image.loading = "lazy";

    image.decoding = "async";

    if (imagePath) {

        image.src = imagePath;

        console.log(
            "PRODUCT IMAGE:",
            getLocalizedName(product.name),
            imagePath
        );

    } else {

        console.warn(
            "PRODUCT IMAGE PATH IS EMPTY:",
            product
        );

        imageWrapper.classList.add("image-error");

    }

    image.addEventListener("error", () => {

        console.error("PRODUCT IMAGE ERROR:", {
            product: product.name,
            path: imagePath
        });

        imageWrapper.classList.add("image-error");

    });

    image.addEventListener("load", () => {

        console.log("IMAGE LOADED:", imagePath);

    });

    imageWrapper.appendChild(image);


    /* INFORMATION */

    const information = document.createElement("div");

    information.className = "product-card__information";


    /* PRODUCT NAME */

    const name = document.createElement("div");

    name.className = "product-card__name";

    name.textContent = getLocalizedName(product.name);


    /* PRODUCT CATEGORY */

    const category = document.createElement("div");

    category.className = "product-card__category";

    category.textContent = getProductCategoryLabel(product);


    /* BUILD */

    information.appendChild(name);

    information.appendChild(category);

    link.appendChild(imageWrapper);

    link.appendChild(information);

    card.appendChild(link);

    return card;

}


/* =========================================================
   PRODUCT IMAGE
   ========================================================= */

function getProductImage(product) {

    if (!product) {
        return "";
    }

    const imagePath =
        product.mainImage ||
        product.image ||
        (
            Array.isArray(product.images)
                ? product.images[0]
                : ""
        );

    if (!imagePath) {
        return "";
    }

    return normalizeImagePath(imagePath);

}


/* =========================================================
   IMAGE PATH
   ========================================================= */

function normalizeImagePath(path) {

    if (!path) {
        return "";
    }

    let imagePath = String(path).trim();

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://") ||
        imagePath.startsWith("data:")
    ) {
        return imagePath;
    }

    imagePath = imagePath.replace(/^\.\/+/, "");

    /*
     * The JSON may contain:
     *
     * /img/products/...
     * src/img/products/...
     * /src/img/products/...
     *
     * In the production build, public/img is served as /img.
     */

    imagePath = imagePath.replace(/^\/?src\/img\//, "/img/");

    if (!imagePath.startsWith("/")) {
        imagePath = `/${imagePath}`;
    }

    return imagePath;

}


/* =========================================================
   PRODUCT CATEGORY LABEL
   ========================================================= */

function getProductCategoryLabel(product) {

    if (product.categoryLabel) {
        return getLocalizedName(product.categoryLabel);
    }

    if (product.subcategory) {

        const value = product.subcategory;

        return typeof value === "object"
            ? getLocalizedName(value)
            : formatName(value);

    }

    if (product.category) {

        const value = product.category;

        return typeof value === "object"
            ? getLocalizedName(value)
            : formatName(value);

    }

    return "";

}


/* =========================================================
   LOAD MORE
   ========================================================= */

function loadMoreProducts() {

    const oldVisibleCount = visibleProductsCount;

    const filteredProducts = getFilteredProducts();

    if (oldVisibleCount >= filteredProducts.length) {
        return;
    }

    visibleProductsCount = Math.min(
        oldVisibleCount + PRODUCTS_PER_PAGE,
        filteredProducts.length
    );

    renderProducts();

    requestAnimationFrame(() => {

        const productCards =
            DOM.productsGrid.querySelectorAll(".product-card");

        const firstNewCard = productCards[oldVisibleCount];

        if (!firstNewCard) {
            return;
        }

        const cardRect = firstNewCard.getBoundingClientRect();

        const targetScroll =
            window.scrollY +
            cardRect.top -
            window.innerHeight * 0.15;

        window.scrollTo({
            top: targetScroll,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   UPDATE LOAD MORE
   ========================================================= */

function updateLoadMore() {

    if (!DOM.loadMore) {
        return;
    }

    const filteredProducts = getFilteredProducts();

    const remaining =
        filteredProducts.length - visibleProductsCount;

    if (remaining <= 0) {

        DOM.loadMore.style.display = "none";

        return;

    }

    DOM.loadMore.style.display = "flex";

    const label = DOM.loadMore.querySelector(
        "[data-load-more-label]"
    );

    if (label) {

        label.textContent = getLocalizedText({
            en: "LOAD MORE",
            ru: "ПОКАЗАТЬ ЕЩЁ"
        });

    }

    const count = DOM.loadMore.querySelector(
        "[data-load-more-count]"
    );

    if (count) {

        count.textContent = "";

        // To display the remaining number:
        // count.textContent = `(${remaining})`;

    }

}


/* =========================================================
   ANIMATION
   ========================================================= */

function animateProducts() {

    const cards = DOM.productsGrid.querySelectorAll(".product-card");

    cards.forEach((card, index) => {

        card.animate(
            [
                {
                    opacity: 0,
                    transform: "translateY(25px)"
                },
                {
                    opacity: 1,
                    transform: "translateY(0)"
                }
            ],
            {
                duration: 650,

                delay: Math.min(index * 45, 350),

                easing: "cubic-bezier(.2,.7,.2,1)",

                fill: "both"
            }
        );

    });

}


/* =========================================================
   LOADING / ERROR / EMPTY
   ========================================================= */

function showLoading() {

    if (DOM.loading) {
        DOM.loading.style.display = "block";
    }

    if (DOM.empty) {
        DOM.empty.style.display = "none";
    }

    if (DOM.error) {
        DOM.error.style.display = "none";
    }

}


function hideLoading() {

    if (DOM.loading) {
        DOM.loading.style.display = "none";
    }

}


function showEmpty() {

    if (DOM.empty) {
        DOM.empty.style.display = "block";
    }

}


function hideEmpty() {

    if (DOM.empty) {
        DOM.empty.style.display = "none";
    }

}


function showError(message) {

    if (DOM.error) {

        DOM.error.style.display = "block";

        DOM.error.textContent = message;

    } else {

        console.error("CATALOG ERROR:", message);

    }

}


/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

window.addEventListener("popstate", () => {

    const params = new URLSearchParams(window.location.search);

    currentCategory = normalizeValue(
        params.get("category") || "indoor"
    );

    currentSubcategory = normalizeValue(
        params.get("subcategory") || "all"
    );

    if (!categoryExists(currentCategory)) {

        currentCategory = categories.length
            ? categories[0].id
            : "indoor";

    }

    if (
        currentSubcategory !== "all" &&
        !getCurrentSubcategories().some(
            item => item.id === currentSubcategory
        )
    ) {
        currentSubcategory = "all";
    }

    visibleProductsCount = PRODUCTS_PER_PAGE;

    renderCategories();

    renderSubcategories();

    renderProducts();

});


/* =========================================================
   LOAD MORE EVENT
   ========================================================= */

if (DOM.loadMore) {

    DOM.loadMore.addEventListener(
        "click",
        loadMoreProducts
    );

}


/* =========================================================
   LANGUAGE CHANGED
   ========================================================= */

document.addEventListener("languageChanged", event => {

    if (event.detail?.language) {
        window.currentLanguage = event.detail.language;
    }

    if (categories.length === 0) {
        return;
    }

    renderCategories();

    renderSubcategories();

    renderProducts();

});


/* =========================================================
   START
   ========================================================= */

init();
