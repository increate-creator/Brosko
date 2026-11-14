
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/* -----------------------------
   GSAP Plugins
------------------------------*/

gsap.registerPlugin(ScrollTrigger);


/* -----------------------------
   Smooth Scroll — Lenis
------------------------------*/

const lenis = new Lenis({
    duration: 0.4,
    smoothWheel: true,
    touchMultiplier: 1.3
});

// Синхронизация Lenis с GSAP ScrollTrigger
lenis.on("scroll", ScrollTrigger.update);

// Передача времени GSAP в Lenis
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

// Отключаем сглаживание времени GSAP
gsap.ticker.lagSmoothing(0);


/* -----------------------------
   Header Animation
------------------------------*/

const header = document.querySelector(".brosko-header");

if (header) {
    const updateHeader = () => {
        header.classList.toggle("scrolled", window.scrollY > 40);
    };

    window.addEventListener("scroll", updateHeader, {
        passive: true
    });

    updateHeader();
}


/* -----------------------------
   Reveal Animation
------------------------------*/

gsap.utils.toArray(".card").forEach((card) => {
    gsap.from(card, {
        opacity: 0,
        y: 120,
        duration: 1,
        ease: "power3.out",

        scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true
        }
    });
});


/* -----------------------------
   Hero Animation
------------------------------*/

const heroText = document.querySelector(".hero-content p");
const heroTitle = document.querySelector(".hero-content h1");
const heroButton = document.querySelector(".btn");

if (heroText) {
    gsap.from(heroText, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.1,
        ease: "power3.out"
    });
}

if (heroTitle) {
    gsap.from(heroTitle, {
        y: 80,
        opacity: 0,
        duration: 1.3,
        delay: 0.3,
        ease: "power3.out"
    });
}

if (heroButton) {
    gsap.from(heroButton, {
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.5,
        ease: "power3.out"
    });
}
