$(document).ready(function () {
    $.get('/env', function (data) {
      $("#gallery-list").append('<div id="custom" class="gallery-item">CUSTOM</div>');

      $("#custom").on('click', async function () {
        try {
          const directoryHandle = await window.showDirectoryPicker();
          console.log("Dossier sélectionné :", directoryHandle.name);
        } catch (error) {
          console.error("Erreur lors de la sélection du dossier :", error);
        }
      });
    });
  });
