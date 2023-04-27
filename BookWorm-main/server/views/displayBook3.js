 var pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js';
  var pdfDoc = null;
  var scale = 1.5; //Set Scale for zooming PDF.
  var resolution = 2; //Set Resolution to Adjust PDF clarity.

  function LoadPdfFromUrl(url) {
    fetch(url).then(function (response) {
      return response.arrayBuffer();
    }).then(function (data) {
      pdfjsLib.getDocument({data: data}).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;

        //Reference the Container DIV.
        var pdf_container = document.getElementById("pdf_container");
        pdf_container.style.display = "block";

        //Wait for PDF to fully load before rendering.
        setTimeout(function() {
          //Loop and render all pages.
          for (var i = 1; i <= pdfDoc.numPages; i++) {
            RenderPage(pdf_container, i);
          }
        }, 1000);
      });
    });
  }

  function RenderPage(pdf_container, num) {
    pdfDoc.getPage(num).then(function (page) {
      //Create Canvas element and append to the Container DIV.
      var canvas = document.createElement('canvas');
      canvas.id = 'pdf-' + num;
      ctx = canvas.getContext('2d');
      pdf_container.appendChild(canvas);

      //Create and add empty DIV to add SPACE between pages.
      var spacer = document.createElement("div");
      spacer.style.height = "20px";
      pdf_container.appendChild(spacer);

      //Set the Canvas dimensions using ViewPort and Scale.
      var viewport = page.getViewport({ scale: scale });
      canvas.height = resolution * viewport.height;
      canvas.width = resolution * viewport.width;
    });
  }