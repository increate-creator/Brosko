"use strict";

/* =========================================================
   Brosko — CATALOG
   ========================================================= */

function getLocalizedText(value) {
    const language = window.currentLanguage || "en";

    // Если значение уже содержит переводы
    if (value && typeof value === "object") {
        return value[language] || value.en || value.ru || "";
    }

    // Если значение — обычная строка
    return value || "";
}

const PRODUCTS_URL = "products.json";
const CATEGORIES_URL = "categories.json";
const PRODUCTS_PER_PAGE = 8;

/* =========================================================
   STATE
   ========================================================= */

let products = [];
let categories = [];

let currentCategory = "indoor";
let currentSubcategory = "all";

let visibleProductsCount = PRODUCTS_PER_PAGE;


/* =========================================================
   DOM
   ========================================================= */

const DOM = {
    categoryNav: document.querySelector("#categoryNav"),
    subcategoryNav: document.querySelector("#subcategoryList"),
    productsGrid: document.querySelector("#productsGrid"),

    catalogTitle: document.querySelector("#catalogTitle"),

    categoryDescription: document.querySelector("#categoryDescription"),
    // catalogCategory: document.querySelector("#categoryTitle"),

    loadMore: document.querySelector("#loadMore"),

    loading: document.querySelector("#catalogLoading"),
    empty: document.querySelector("#catalogEmpty"),
    error: document.querySelector("#catalogError")
};

/* =========================================================
   INIT
   ========================================================= */

// document.addEventListener("DOMContentLoaded", init);

async function init() {

    console.log("Brosko CATALOG INIT");

    try {
        /*
         * Получаем категорию из URL
         *
         * catalog.html?category=outdoor
         */
        const params = new URLSearchParams(window.location.search);

        const urlCategory = params.get("category");
        const urlSubcategory = params.get("subcategory");

        if (urlCategory) {
            currentCategory = normalizeValue(urlCategory);
        }

        if (urlSubcategory) {
            currentSubcategory = normalizeValue(urlSubcategory);
        }

        console.log("URL category:", currentCategory);
        console.log("URL subcategory:", currentSubcategory);

        showLoading();

        /*
         * Загружаем JSON
         */

        const [categoriesData, productsData] = await Promise.all([
            loadCategories(),
            loadProducts()
        ]);

        categories = normalizeCategories(categoriesData);
        products = normalizeProducts(productsData);

        console.log("Categories:", categories);
        console.log("Products:", products);

        /*
         * Если категории из URL нет в JSON,
         * возвращаемся к первой доступной категории.
         */

        if (!categoryExists(currentCategory)) {

            currentCategory =
                categories.length > 0
                    ? normalizeValue(categories[0].id || categories[0].slug || categories[0].name)
                    : "indoor";

        }

        /*
         * Первоначально показываем только 8
         */
        visibleProductsCount =
            PRODUCTS_PER_PAGE;

        /*
         * Рисуем верхние категории
         */

        renderCategories();

        /*
         * Рисуем подкатегории
         */

        renderSubcategories();

        /*
         * Показываем товары
         */

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
   LOAD JSON
   ========================================================= */
async function loadCategories() {

    const response = await fetch(
        CATEGORIES_URL,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            `Cannot load categories.json. HTTP ${response.status}`
        );

    }

    const data = await response.json();

    /*
     * Поддерживаем:
     *
     * [...]
     *
     * и
     *
     * {
     *    categories: [...]
     * }
     */

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

    const response = await fetch(
        PRODUCTS_URL,
        {
            cache: "no-store"
        }
    );

    if (!response.ok) {

        throw new Error(
            `Cannot load products.json. HTTP ${response.status}`
        );

    }

    const data = await response.json();
    /*
     * Поддерживаем:
     *
     * [...]
     *
     * и
     *
     * {
     *    products: [...]
     * }
     */

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
   NORMALIZE
   ========================================================= */
function normalizeCategories(data) {

    return data.map(category => {

        /*
         * Поддерживаем разные варианты JSON
         */

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

        const title = category.title || category.name || category.label || id;

        const description = category.description || "";


        let subcategories =
            category.subcategories ||
            category.children ||
            category.categories ||
            [];

        /*
         * Если subcategories записаны объектом:
         *
         * {
         *   all: "All",
         *   sofas: "Sofas"
         * }
         */

        if (
            !Array.isArray(subcategories) &&
            typeof subcategories === "object"
        ) {

            subcategories = Object.entries(subcategories)
                .map(([key, value]) => {

                    if (typeof value === "string") {

                        return {
                            id: key,
                            name: value
                        };

                    }

                    return {
                        id:
                            value.id ||
                            value.slug ||
                            key,

                        name:
                            value.name ||
                            value.title ||
                            value.label ||
                            key
                    };

                });

        }

        /*
         * Нормализуем массив подкатегорий
         */

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
        (
            typeof subcategory.name === "string"
                ? subcategory.name
                : subcategory.name?.en || subcategory.title?.en
        );

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
            name: name,
            title: title,
            description: description,
            subcategories: subcategories
        };
    });
}


function normalizeProducts(data) {

    return data.map(product => {

        return {

            ...product,

            id: String(product.id || "").trim(),

            name:
                product.name ||
                product.title ||
                "Untitled",

            category:
                normalizeValue(
                    product.category ||
                    product.collection ||
                    ""
                ),

            subcategory:
                normalizeValue(
                    product.subcategory ||
                    product.subCategory ||
                    product.type ||
                    product.category ||
                    ""
                )

        };
    });
}


/* =========================================================
   CATEGORY
   ========================================================= */

function categoryExists(categoryId) {

    return categories.some(
        category =>
            normalizeValue(category.id) ===
            normalizeValue(categoryId)
    );

}


function getCurrentCategory() {

    return categories.find(
        category =>
            normalizeValue(category.id) ===
            normalizeValue(currentCategory)
    );

}


function getCurrentSubcategories() {

    const category = getCurrentCategory();

    if (!category) {
        return [];
    }

    return category.subcategories || [];

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

        const button = document.createElement("button");

        button.type = "button";

        button.className = "main-category";

        const categoryId =
            normalizeValue(category.id);

        if (categoryId === currentCategory) {
            button.classList.add("active");
        }

        button.dataset.category = categoryId;

        button.textContent =
            getLocalizedText(
                category.title || category.name
            ).toUpperCase();

        button.addEventListener(
            "click",
            () => {

                selectCategory(categoryId);

            }
        );

        DOM.categoryNav.appendChild(button);

    });
}


/* =========================================================
   SELECT CATEGORY
   ========================================================= */

function selectCategory(categoryId) {

    currentCategory =
        normalizeValue(categoryId);

    /*
     * При смене основной категории
     * всегда начинаем с All
     */

    currentSubcategory = "all";
    visibleProductsCount = PRODUCTS_PER_PAGE;

    /*
     * Обновляем URL
     */

    updateURL();

    /*
     * Обновляем интерфейс
     */

    renderCategories();

    renderSubcategories();

    renderProducts();

    /*
     * Возвращаемся наверх каталога
     */

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

    const subcategories =
        getCurrentSubcategories();

    /*
     * Всегда добавляем All
     */

    const allButton =
        createSubcategoryButton(
            "all",
            {
                en: "All",
                ru: "Все"
            }
    );

    DOM.subcategoryNav.appendChild(allButton);


    /*
     * Остальные подкатегории
     */

    subcategories.forEach(subcategory => {

        const id =
            normalizeValue(subcategory.id);

        /*
         * Если JSON уже содержит All,
         * второй All не создаём
         */

        if (id === "all") {
            return;
        }

        const button =
            createSubcategoryButton(
                id,
                subcategory.name
            );

        DOM.subcategoryNav.appendChild(button);

    });


    /*
     * Заголовок каталога
     */

    const category =
        getCurrentCategory();

    if (DOM.catalogCategory) {

        DOM.catalogCategory.textContent =
            category
                ? String(category.name).toUpperCase()
                : currentCategory.toUpperCase();

    }

    if (DOM.catalogTitle) {
    DOM.catalogTitle.textContent = category
        ? getLocalizedText(category.title || category.name)
        : formatName(currentCategory);
    }

    if (DOM.categoryDescription) {
    DOM.categoryDescription.textContent = category
        ? getLocalizedText(category.description)
        : "";
    }

}


/* =========================================================
   SUBCATEGORY BUTTON
   ========================================================= */

function createSubcategoryButton(
    id,
    name
) {

    const button =
        document.createElement("button");

    button.type = "button";

    button.className =
        "subcategory";

    button.dataset.subcategory =
        id;

    if (
        normalizeValue(id) ===
        normalizeValue(currentSubcategory)
    ) {

        button.classList.add("active");

    }

    button.textContent =
        getLocalizedText(name).toUpperCase();

    button.addEventListener(
        "click",
        () => {

            selectSubcategory(id);

        }
    );

    return button;

}


/* =========================================================
   SELECT SUBCATEGORY
   ========================================================= */

function selectSubcategory(
    subcategoryId
) {

    currentSubcategory =
        normalizeValue(subcategoryId);

        visibleProductsCount = PRODUCTS_PER_PAGE;

    updateURL();

    renderSubcategories();

    renderProducts();

}


/* =========================================================
   URL
   ========================================================= */

function updateURL() {

    const params =
        new URLSearchParams();

    params.set(
        "category",
        currentCategory
    );

    /*
     * Для All subcategory не добавляем
     */

    if (
        currentSubcategory &&
        currentSubcategory !== "all"
    ) {

        params.set(
            "subcategory",
            currentSubcategory
        );

    }

    const newURL =
        `${window.location.pathname}?${params.toString()}`;

    window.history.pushState(
        {},
        "",
        newURL
    );

}


/* =========================================================
   PRODUCTS
   ========================================================= */

function getFilteredProducts() {

    /*
     * Сначала фильтруем по основной категории
     */

    let result =
        products.filter(product => {

            return productBelongsToCategory(
                product,
                currentCategory
            );
        });


    /*
     * Затем по подкатегории
     */

    if (
        currentSubcategory &&
        currentSubcategory !== "all"
    ) {

        result =
            result.filter(product => {

                return productBelongsToSubcategory(
                    product,
                    currentSubcategory
                );

            });

    }

    return result;

}


/* =========================================================
   PRODUCT CATEGORY CHECK
   ========================================================= */

function productBelongsToCategory(
    product,
    category
) {

    const target =
        normalizeValue(category);

    const productCollection =
        normalizeValue(
            product.collection
        );

    const productCategory =
        normalizeValue(
            product.category
        );

    /*
     * collection === outdoor
     */

    if (
        productCollection === target
    ) {

        return true;

    }

    /*
     * category === outdoor
     */

    if (
        productCategory === target
    ) {

        return true;

    }

    /*
     * Иногда category может быть массивом
     */

    if (
        Array.isArray(product.collection) &&
        product.collection
            .map(normalizeValue)
            .includes(target)
    ) {

        return true;

    }

    if (
        Array.isArray(product.category) &&
        product.category
            .map(normalizeValue)
            .includes(target)
    ) {

        return true;

    }

    return false;

}


/* =========================================================
   PRODUCT SUBCATEGORY CHECK
   ========================================================= */

function productBelongsToSubcategory(
    product,
    subcategory
) {

    const target =
        normalizeValue(subcategory);


    const values = [

        product.subcategory,

        product.subCategory,

        product.categoryType,

        product.type,

        product.productCategory

    ];


    /*
     * Проверяем обычные строки
     */

    for (
        const value of values
    ) {

        if (
            normalizeValue(value) ===
            target
        ) {

            return true;

        }

    }


    /*
     * Проверяем массивы
     */

    for (
        const value of values
    ) {

        if (
            Array.isArray(value) &&
            value
                .map(normalizeValue)
                .includes(target)
        ) {

            return true;

        }

    }


    return false;

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts() {

    if (!DOM.productsGrid) {

        console.warn(
            "#productsGrid not found"
        );

        return;

    }

    const filteredProducts =
        getFilteredProducts();


    DOM.productsGrid.innerHTML = "";


    /*
     * Empty
     */

    if (
        filteredProducts.length === 0
    ) {

        showEmpty();

        updateLoadMore();

        return;

    }

    hideEmpty();


    /*
     * Cards
     */

    const productsToShow =
        filteredProducts.slice(
            0,
            visibleProductsCount
        );


    /*
     * Создаём карточки
     */

    productsToShow.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );


            DOM.productsGrid.appendChild(
                card
            );

        }
    );


    /*
     * Обновляем кнопку
     */

    updateLoadMore();

}


/* =========================================================
   PRODUCT CARD
   ========================================================= */

function createProductCard(
    product
) {

    const card =
        document.createElement("article");

    card.className =
        "product-card";


    /*
     * Link
     */

    const link =
        document.createElement("a");

    link.className =
        "product-card__link";

    link.href =
        `product.html?id=${encodeURIComponent(product.id)}`;


    /*
     * Image
     */

    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "product-card__image";


    const image =
        document.createElement("img");

    const imagePath =
        getProductImage(product);


    if (imagePath) {

        image.src =
            imagePath;

    }

    image.alt =
        product.name;

    image.loading =
        "lazy";


    /*
     * Image error
     */

    image.addEventListener(
        "error",
        () => {

            console.error(
                "PRODUCT IMAGE ERROR:",
                imagePath
            );

            imageWrapper.classList.add(
                "image-error"
            );

        }
    );


    imageWrapper.appendChild(
        image
    );


    /*
     * Product information
     */

    const information =
        document.createElement("div");

    information.className =
        "product-card__information";


    const name =
        document.createElement("div");

    name.className =
        "product-card__name";

    name.textContent =
        product.name;


    const category =
        document.createElement("div");

    category.className =
        "product-card__category";

    category.textContent =
        getProductCategoryLabel(
            product
        );


    
    information.appendChild(
        name
    );

    information.appendChild(
        category
    );

   
    /*
     * Собираем карточку
     */

    link.appendChild(
        imageWrapper
    );

    link.appendChild(
        information
    );

    card.appendChild(
        link
    );


    return card;

}


/* =========================================================
   PRODUCT IMAGE
   ========================================================= */

function getProductImage(
    product
) {

    /*
     * Приоритет:
     *
     * mainImage
     * image
     * первый images[]
     */

    if (
        product.mainImage
    ) {

        return normalizeImagePath(
            product.mainImage
        );

    }


    if (
        product.image
    ) {

        return normalizeImagePath(
            product.image
        );

    }


    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {

        return normalizeImagePath(
            product.images[0]
        );

    }


    return "";

}


/* =========================================================
   IMAGE PATH
   ========================================================= */

function normalizeImagePath(
    path
) {

    if (!path) {
        return "";
    }

    let imagePath =
        String(path).trim();


    /*
     * Если путь уже абсолютный:
     *
     * http://
     * https://
     */

    if (
        imagePath.startsWith("http://") ||
        imagePath.startsWith("https://")
    ) {

        return imagePath;

    }


    /*
     * Убираем ./ в начале
     */

    imagePath =
        imagePath.replace(
            /^\.\/+/,
            ""
        );


    /*
     * Если путь начинается с /,
     * оставляем его root-relative
     */

    if (
        imagePath.startsWith("/")
    ) {

        return imagePath;

    }


    /*
     * Для твоего проекта:
     *
     * src/img/products/...
     */

    return imagePath;

}


/* =========================================================
   LABELS
   ========================================================= */

function getProductCategoryLabel(product) {

    if (product.categoryLabel) {
        return getLocalizedText(product.categoryLabel);
    }

    if (product.subcategory) {
        return typeof product.subcategory === "object"
            ? getLocalizedText(product.subcategory)
            : formatName(product.subcategory);
    }

    if (product.category) {
        return typeof product.category === "object"
            ? getLocalizedText(product.category)
            : formatName(product.category);
    }

    return "";
}


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeValue(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/_/g, "-");

}


function formatName(
    value
) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/[-_]/g, " ")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}

/* =========================================================
   LOAD MORE
========================================================= */

function loadMoreProducts() {
    const oldVisibleCount = visibleProductsCount;

    visibleProductsCount += PRODUCTS_PER_PAGE;

    renderProducts();

    requestAnimationFrame(() => {
        const productCards = DOM.productsGrid.querySelectorAll(".product-card");
        const firstNewCard = productCards[oldVisibleCount];

        if (!firstNewCard) return;

        const cardRect = firstNewCard.getBoundingClientRect();

        const targetScroll =
            window.scrollY +
            cardRect.top -
            (window.innerHeight * 0.15);

        window.scrollTo({
            top: targetScroll,
            behavior: "smooth"
        });
    });
}

/* =========================================================
   LOAD MORE BUTTON
   ========================================================= */

function updateLoadMore() {

    if (!DOM.loadMore) {

        return;

    }


    const filteredProducts =
        getFilteredProducts();


    /*
     * Все товары уже показаны
     */

    if (
        visibleProductsCount >=
        filteredProducts.length
    ) {

        DOM.loadMore.style.display =
            "none";

        return;

    }


    /*
     * Есть ещё товары
     */

    DOM.loadMore.style.display =
        "flex";


    /*
     * Показываем количество
     */

    const remaining =
        filteredProducts.length -
        visibleProductsCount;


    const label =
        DOM.loadMore.querySelector(
           ("[data-load-more-label]")
        );


    if (label) {
        label.textContent = getLocalizedText({
            en: "LOAD MORE",
            ru: "ПОКАЗАТЬ ЕЩЁ"
        });
    }


    const count =
        DOM.loadMore.querySelector(
            "[data-load-more-count]"
        );


    // if (count) {

    //     count.textContent =
    //         `${remaining} remaining`;

    // }

}

/* =========================================================
   LOADING / ERROR / EMPTY
   ========================================================= */

function showLoading() {

    if (DOM.loading) {

        DOM.loading.style.display =
            "block";

    }

    if (DOM.empty) {

        DOM.empty.style.display =
            "none";

    }

    if (DOM.error) {

        DOM.error.style.display =
            "none";

    }

}


function hideLoading() {

    if (DOM.loading) {

        DOM.loading.style.display =
            "none";

    }

}


function showEmpty() {

    if (DOM.empty) {

        DOM.empty.style.display =
            "block";

    }

}


function hideEmpty() {

    if (DOM.empty) {

        DOM.empty.style.display =
            "none";

    }

}


function showError(
    message
) {

    if (DOM.error) {

        DOM.error.style.display =
            "block";

        DOM.error.textContent =
            message;

    } else {

        console.error(
            message
        );

    }

}

/* =========================================================
   ANIMATION
========================================================= */

function animateProducts() {

    const cards =
        document.querySelectorAll(
            ".product-card"
        );


    cards.forEach(
        (card, index) => {

            card.animate(

                [

                    {
                        opacity: 0,

                        transform:
                            "translateY(25px)"

                    },

                    {
                        opacity: 1,

                        transform:
                            "translateY(0)"

                    }

                ],

                {

                    duration: 650,

                    delay:
                        Math.min(
                            index * 45,
                            350
                        ),

                    easing:
                        "cubic-bezier(.2,.7,.2,1)",

                    fill: "both"

                }

            );

        }
    );

}

/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

window.addEventListener(
    "popstate",
    () => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        currentCategory =
            normalizeValue(
                params.get("category") ||
                "indoor"
            );

        currentSubcategory =
            normalizeValue(
                params.get("subcategory") ||
                "all"
            );


        if (
            !categoryExists(
                currentCategory
            )
        ) {

            currentCategory =
                categories.length
                    ? normalizeValue(
                        categories[0].id
                    )
                    : "indoor";

        }


        renderCategories();
        renderSubcategories();
        renderProducts();
        updateLoadMore();

    }
);

/* =========================================================
   LOAD MORE BUTTON EVENT
   ========================================================= */

if (DOM.loadMore) {

    DOM.loadMore.addEventListener(
        "click",
        loadMoreProducts
    );

}

document.addEventListener("languageChanged", (event) => {
    window.currentLanguage = event.detail.language;

    // Если JSON ещё загружается, дождёмся первоначальной отрисовки.
    if (categories.length === 0) {
        return;
    }

    renderCategories();
    renderSubcategories();
    renderProducts();
});


/* =========================================================
   MOBILE MENU
========================================================= */





/* =========================================================
   START
========================================================= */

init();