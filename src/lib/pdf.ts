/** Utilitário de PDF com jsPDF (carregamento dinâmico para não quebrar SSR). */

export async function gerarPdfSimples(opts: {
  titulo: string;
  subtitulo?: string;
  linhas: string[];
  nomeArquivo?: string;
}) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 16;
  let y = 20;
  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - margin * 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(opts.titulo, margin, y);
  y += 8;

  if (opts.subtitulo) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(opts.subtitulo, margin, y);
    y += 8;
  }

  doc.setDrawColor(180);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  doc.setTextColor(20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  for (const linha of opts.linhas) {
    const parts = doc.splitTextToSize(linha || '—', maxW) as string[];
    for (const p of parts) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(p, margin, y);
      y += 5.5;
    }
    y += 1.5;
  }

  y = Math.max(y, 260);
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    'SISGESC · Escola Municipal Dimas Nasser · Bom Jardim de Goiás',
    margin,
    290,
  );

  const nome = opts.nomeArquivo || `sisgesc-${Date.now()}.pdf`;
  doc.save(nome);
}

export async function gerarPdfHtmlArea(elementId: string, nomeArquivo?: string) {
  // Fallback: se o elemento existir, tenta imprimir via janela (browser PDF)
  // jsPDF texto puro é mais confiável sem html2canvas.
  const el = document.getElementById(elementId);
  if (!el) {
    window.print();
    return;
  }
  const texto = el.innerText || '';
  await gerarPdfSimples({
    titulo: 'Documento SISGESC',
    subtitulo: 'Escola Municipal Dimas Nasser',
    linhas: texto.split('\n').map((l) => l.trim()).filter(Boolean),
    nomeArquivo: nomeArquivo || 'documento-sisgesc.pdf',
  });
}
