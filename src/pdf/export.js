/* global pdfMake */
export function exportToPdf(docDefinition, filename) {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  let toast;
  if (isMobile) {
    toast = document.createElement('div');
    toast.textContent = 'Generando PDF…';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '8px 12px';
    toast.style.borderRadius = '4px';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);
  }
  pdfMake.createPdf(docDefinition).download(filename, () => {
    if (toast) document.body.removeChild(toast);
  });
}

export function openPdf(docDefinition) {
  pdfMake.createPdf(docDefinition).open();
}

window.exportToPdf = exportToPdf;
window.openPdf = openPdf;
