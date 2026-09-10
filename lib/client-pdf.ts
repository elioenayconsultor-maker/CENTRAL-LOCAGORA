"use client";

/**
 * Gera o PDF preservando exatamente a composição visual exibida no app.
 *
 * Regra principal: NÃO recriar a página em 1920x1080 antes da captura.
 * A proposta usa tipografia responsiva (vw/clamp) e ajustes individuais via
 * CSS variables. Se o DOM for redimensionado antes do html2canvas, o PDF pode
 * recalcular fontes/posições e ficar diferente do preview.
 *
 * Aqui capturamos a página no tamanho CSS em que ela já está renderizada e
 * usamos apenas `scale` para aumentar a densidade até Full HD. Assim o layout,
 * os deslocamentos, a escala do texto e o enquadramento permanecem idênticos.
 */
export async function generateProposalPdfBlob(){
  const pages=Array.from(document.querySelectorAll<HTMLElement>("#proposalDeck .proposalPage"));
  if(!pages.length) throw new Error("proposal_pages_not_found");

  const [{default:html2canvas},{jsPDF}]=await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const captureW=1920;
  const captureH=1080;
  const pdfW=960;
  const pdfH=540;
  const pdf=new jsPDF({orientation:"landscape",unit:"pt",format:[pdfW,pdfH],compress:true});

  for(let i=0;i<pages.length;i++){
    const page=pages[i];
    const rect=page.getBoundingClientRect();
    if(rect.width<10||rect.height<10) throw new Error(`proposal_page_not_visible_${i+1}`);

    // O fator de escala aumenta somente a resolução. Não altera a geometria CSS.
    const scale=captureW/rect.width;

    const sourceCanvas=await html2canvas(page,{
      scale,
      useCORS:true,
      allowTaint:false,
      backgroundColor:"#03153a",
      logging:false,
      scrollX:0,
      scrollY:-window.scrollY,
      // Mantém o mesmo viewport do preview para vw/clamp/media queries.
      windowWidth:window.innerWidth,
      windowHeight:window.innerHeight,
      onclone:(doc)=>{
        const cloned=doc.querySelectorAll<HTMLElement>("#proposalDeck .proposalPage");
        cloned.forEach(el=>{
          el.classList.remove("selected");
          el.style.boxShadow="none";
          el.style.outline="none";
        });
      },
    });

    // Normaliza a saída para 1920x1080 sem mudar a proporção do deck 16:9.
    const finalCanvas=document.createElement("canvas");
    finalCanvas.width=captureW;
    finalCanvas.height=captureH;
    const ctx=finalCanvas.getContext("2d");
    if(!ctx) throw new Error("proposal_pdf_canvas_context_unavailable");
    ctx.fillStyle="#03153a";
    ctx.fillRect(0,0,captureW,captureH);
    ctx.drawImage(sourceCanvas,0,0,captureW,captureH);

    const img=finalCanvas.toDataURL("image/jpeg",0.98);
    if(i>0) pdf.addPage([pdfW,pdfH],"landscape");
    pdf.addImage(img,"JPEG",0,0,pdfW,pdfH,undefined,"FAST");
  }

  return pdf.output("blob");
}
