function LoadPdfFromUrl (url) {
    //Read PDF from URL.
    pdfjsLib.getDocument(url).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
 
        //Reference the Container DIV.
        var pdf_container = document.getElementById("pdf_container");
        pdf_container.style.display = "block";
 
        //Loop and render all pages.
        for (var i = 1; i <= pdfDoc.numPages; i++) {
            RenderPage(pdf_container, i);
        }
    });
};

LoadPdfFromUrl("https://example.com/PacMan_Ball_Manual.pdf");