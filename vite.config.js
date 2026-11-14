
// import { dirname, resolve } from "node:path";
// import { fileURLToPath } from "node:url";
// import { defineConfig } from "vite";
// import viteImagemin from "vite-plugin-imagemin";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// export default defineConfig({
//   plugins: [
//     viteImagemin({
//       gifsicle: {
//         optimizationLevel: 7,
//         interlaced: false,
//       },
//       optipng: {
//         optimizationLevel: 7,
//       },
//       mozjpeg: {
//         quality: 70,
//       },
//       pngquant: {
//         quality: [0.8, 0.9],
//         speed: 4,
//       },
//       svgo: {
//         plugins: [
//           {
//             name: "removeViewBox",
//             active: false,
//           },
//           {
//             name: "removeEmptyAttrs",
//             active: false,
//           },
//         ],
//       },
//     }),
//   ],

//   build: {
//     rollupOptions: {
//       input: {
//         main: resolve(__dirname, "index.html"),
//         catalog: resolve(__dirname, "catalog.html"),
//         product: resolve(__dirname, "product.html"),
//       },
//     },
//   },
// });


import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        catalog: resolve(__dirname, "catalog.html"),
        product: resolve(__dirname, "product.html"),
      },
    },
  },
});