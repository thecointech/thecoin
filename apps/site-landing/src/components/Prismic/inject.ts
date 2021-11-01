export function injectPrismicPreviewScript() {
  // Allow previewing Prismic documents in test/beta
  var prismicScript = document.createElement('script');
  prismicScript.setAttribute('src',"https://static.cdn.prismic.io/prismic.js?new=true&repo=thecointech");
  prismicScript.setAttribute('async', "true");
  prismicScript.setAttribute('defer', "true");
  document.head.appendChild(prismicScript);
}
