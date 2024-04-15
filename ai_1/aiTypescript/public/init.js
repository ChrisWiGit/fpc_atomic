(async function loadModule() {
  const {default : pageInstance  } = await import('./src/page/gameboard.js');
  pageInstance.init();
  window.pageInstance = pageInstance;
})()
