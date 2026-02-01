
module.exports = {
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  globDirectory: "public",
  globPatterns: ["**/*.{js,css,html,png,svg,ico,json}"],
  injectionPoint: "self.__WB_MANIFEST",
};
