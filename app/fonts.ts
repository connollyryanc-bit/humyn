import localFont from "next/font/local";

export const valtechNeue = localFont({
  src: [
    { path: "../public/fonts/ValtechNeue-Light.woff2",       weight: "300", style: "normal" },
    { path: "../public/fonts/ValtechNeue-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "../public/fonts/ValtechNeue-Book.woff2",        weight: "400", style: "normal" },
    { path: "../public/fonts/ValtechNeue-BookItalic.woff2",  weight: "400", style: "italic" },
    { path: "../public/fonts/ValtechNeue-Bold.woff2",        weight: "700", style: "normal" },
    { path: "../public/fonts/ValtechNeue-BoldItalic.woff2",  weight: "700", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

export const sons = localFont({
  src: [
    { path: "../public/fonts/sons-light.woff2",           weight: "300", style: "normal" },
    { path: "../public/fonts/sons-light-italic.woff2",    weight: "300", style: "italic" },
    { path: "../public/fonts/sons-regular.woff2",         weight: "400", style: "normal" },
    { path: "../public/fonts/sons-regular-italic.woff2",  weight: "400", style: "italic" },
    { path: "../public/fonts/sons-semibold.woff2",        weight: "600", style: "normal" },
    { path: "../public/fonts/sons-semibold-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});
