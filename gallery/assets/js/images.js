document.addEventListener('DOMContentLoaded', function () {
    const galleryId = localStorage.getItem('galleryId');
    if (galleryId) {
        openGallery(galleryId);
        localStorage.removeItem('galleryId');
    }
});

function openGallery(galleryId) {
    loadGalleryScript(galleryId).then(() => {
        randomizeAndPlaceImages();
    }).catch(error => {
        console.error(error);
    });
    $("#selector").fadeOut(500);
}

var htmlFilePath = "";
let [imagePath, originalImagePath] = ["assets/img/" + htmlFilePath + "/min", "assets/img/" + htmlFilePath + "/original"];
const imageReductionFactor = 1;

const imageDictionary = JSON.parse(localStorage.getItem("imageDictionary")) || {};

let resizeTimer;
const gallery = $("#gallery");
const overlay = $("<div>").addClass("overlay").appendTo("body");
const overlayContent = $("<div>").addClass("overlay-content").appendTo(overlay);
const overlayImage = $("<img>").addClass("overlay-image").attr("alt", "Overlay Image").appendTo(overlayContent);
const imageInfo = $("<div>").addClass("image-info").appendTo(overlayContent);
const imageTitle = $("<p>").addClass("image-title").appendTo(imageInfo);
const downloadButton = $("<a>").addClass("download-button").html("Download").appendTo(imageInfo).attr("download", "");
const widthElement = $("<p>").addClass("image-width").text("Width: ").appendTo(imageInfo);
const heightElement = $("<p>").addClass("image-height").text("Height: ").appendTo(imageInfo);
const prevButton = $("<ion-icon>").attr("id", "prev-button").attr("name", "chevron-back-outline").prependTo(overlay);
const nextButton = $("<ion-icon>").attr("id", "next-button").attr("name", "chevron-forward-outline").appendTo(overlay);

let currentImageIndex = 0;
let windowWidth = $(window).width();

function processImage(fileName) {
    const modifiedDate = new Date();
    const currentDate = new Date();
    const imageKey = fileName.startsWith('/gallery/') ? fileName.replace('/gallery/', '') : fileName;
}

let imageLoadTimeout; // Variable globale pour stocker le timeout

function showImage(index) {
    const $clickedImage = gallery.find('.item[data-index="' + index + '"]');

    if (!$clickedImage || !$clickedImage.attr("src")) {
        console.error("Invalid image or source for index:", index);
        return;
    }

    const fileName = $clickedImage
        .attr("src")
        .split('/')
        .pop() // Obtenir uniquement le nom du fichier
        .replace(".webp", ""); // Retirer l'extension

    // Get the min version URL
    const minImageUrl = $clickedImage.attr("src");

    // Get the original image URL
    const originalImageUrl = minImageUrl.replace("/min/", "/original/").replace(".webp", ".jpg");

    // Display the min image first while the original is loading
    overlayImage.attr("src", minImageUrl); // Display the already loaded min image
    imageTitle.text(fileName); // Utilise seulement le nom du fichier pour le titre

    // Hide width and height elements initially
    widthElement.css("opacity", 0);
    heightElement.css("opacity", 0);

    overlay.addClass("visible");

    // Annule le chargement précédent si l'utilisateur change d'image
    clearTimeout(imageLoadTimeout);

    // Démarrer un nouveau chargement d'image avec un délai
    imageLoadTimeout = setTimeout(() => {
        const originalImage = new Image();
        originalImage.onload = function () {
            // Une fois l'image originale chargée, remplacer l'image min par l'originale
            overlayImage.attr("src", originalImageUrl);

            // Mettre à jour le bouton de téléchargement et les dimensions de l'image
            downloadButton.attr("href", originalImageUrl);
            widthElement.text("Width: " + Math.round(this.naturalWidth * imageReductionFactor) + " pixels");
            heightElement.text("Height: " + Math.round(this.naturalHeight * imageReductionFactor) + " pixels");

            // Afficher les dimensions une fois que l'image originale est chargée
            widthElement.css("opacity", 1);
            heightElement.css("opacity", 1);
        };

        // Commence à charger l'image originale
        originalImage.src = originalImageUrl;
    }, 3000); // Délai de 1 seconde avant de charger l'image originale
}

function randomizeAndPlaceImages() {
    const owner = 'ungaul';
    const repo = 'ungaul.github.io';
    const branch = 'main';
    const directoryPath = 'gallery/assets/img/' + htmlFilePath + '/min';

    return new Promise((resolve, reject) => {
        gallery.fadeOut(500, function () { // Attendre que fadeOut soit terminé
            $.ajax({
                url: `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}?ref=${branch}`,
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                },
                success: function (data) {
                    const imageLinks = data.filter(file => file.type === 'file' && file.name.endsWith('.webp'));
                    imageLinks.sort(() => 0.5 - Math.random());

                    const totalImages = imageLinks.length;

                    gallery.empty();

                    for (let j = 0; j < totalImages; j++) {
                        const fileName = imageLinks[j].name;

                        const imageElement = $("<img>").attr({
                            src: imageLinks[j].download_url,
                            class: "item",
                            draggable: "false",
                            id: fileName.replace(".webp", ""),
                            alt: fileName.replace(".webp", ""),
                            "data-index": j,
                            rel: "preload",
                            fetchpriority: "high",
                        });

                        const wrapperDiv = $("<div>").addClass("image-wrapper");

                        (function (currentImage) {
                            currentImage.on("load", function () {
                                if (this.naturalWidth > this.naturalHeight) {
                                    wrapperDiv.addClass('landscape');
                                } else {
                                    wrapperDiv.addClass('portrait');
                                }

                                $(this).show();
                                if (j === totalImages - 1) {
                                    searchBarImages();
                                    gallery.fadeIn(200);
                                }
                            });
                        })(imageElement);

                        wrapperDiv.append(imageElement);
                        gallery.append(wrapperDiv);
                    }

                    resolve();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status === 404) {
                        console.error("GitHub content not found, loading local assets...");
                        loadLocalImages(); // Fallback to local assets if 404 error occurs
                    } else {
                        reject(new Error("Erreur lors de la récupération des fichiers : " + textStatus + " " + errorThrown));
                    }
                }
            });
        });
    }).catch((error) => {
        console.error(error);
    });
}

function loadLocalImages() {
    const localDirectoryPath = 'assets/img/' + htmlFilePath + '/original/';

    $.ajax({
        url: localDirectoryPath,  // Le chemin vers votre dossier local
        success: function (data) {
            $(data).find("a:contains(.webp), a:contains(.jpg), a:contains(.jpeg), a:contains(.png)").each(function () {
                const fileName = $(this).attr("href");

                // Correction : retirer le chemin complet si présent dans fileName
                const cleanedFileName = fileName.split('/').pop();  // Prend uniquement le nom du fichier

                const imageElement = $("<img>").attr({
                    src: localDirectoryPath + cleanedFileName,  // Concatène proprement le chemin et le nom du fichier
                    class: "item",
                    draggable: "false",
                    id: cleanedFileName.replace(/\.(webp|jpg|jpeg|png)/, ""),  // ID basé sur le nom sans extension
                    alt: cleanedFileName.replace(/\.(webp|jpg|jpeg|png)/, ""),  // Alt texte basé sur le nom sans extension
                    "data-index": gallery.find(".item").length,
                    rel: "preload",
                    fetchpriority: "high",
                });

                const wrapperDiv = $("<div>").addClass("image-wrapper");

                imageElement.on("load", function () {
                    if (this.naturalWidth > this.naturalHeight) {
                        wrapperDiv.addClass('landscape');
                    } else {
                        wrapperDiv.addClass('portrait');
                    }

                    $(this).show();
                });

                wrapperDiv.append(imageElement);
                gallery.append(wrapperDiv);
            });

            searchBarImages();
            gallery.fadeIn(200);  // Fade in après avoir placé les images
        },
        error: function () {
            console.error("Erreur lors de la récupération des fichiers locaux.");
        }
    });
}

function searchBarImages() {
    const searchResults = $("#image-names");
    searchResults.empty();

    $(".item").each(function () {
        const imageSrc = $(this).attr("src");
        let imageFileName = imageSrc.split('/').pop().replace(".webp", "");

        const imageElement = $("<img>").attr({
            src: imageSrc,
            id: imageFileName,
            draggable: "false",
        });
        const imageNameParagraph = $("<div>")
            .addClass("searchbar-item")
            .append(imageElement);
        searchResults.append(imageNameParagraph);

        const imageNameInfo = $("<div>")
            .addClass("searchbarItemInfo")
            .appendTo(imageNameParagraph);

        $("<p>")
            .addClass("searchbarItemName")
            .text(imageFileName)
            .appendTo(imageNameInfo);

        $("<p>")
            .addClass("searchbarItemWidth")
            .text(
                "Width: " +
                Math.round(this.naturalWidth * imageReductionFactor) +
                " pixels"
            )
            .appendTo(imageNameInfo);

        $("<p>")
            .addClass("searchbarItemHeight")
            .text(
                "Height: " +
                Math.round(this.naturalHeight * imageReductionFactor) +
                " pixels"
            )
            .appendTo(imageNameInfo);

        $("<p>").addClass("searchbarItemSize").appendTo(imageNameInfo);

        $("<a>")
            .addClass("searchbarDownloadButton")
            .text("Download")
            .attr("download", "")
            .attr("href", imageSrc.replace("/min/", "/original/").replace(".webp", ".jpg")) // Correction ici
            .appendTo(imageNameInfo);
    });
}

searchBarImages();

function loadGalleryScript(scriptId) {
    return new Promise((resolve, reject) => {
        $.getScript(`assets/js/${scriptId}.js`, function () {
            htmlFilePath = scriptId;
            [imagePath, originalImagePath] = ["assets/img/" + htmlFilePath + "/min", "assets/img/" + htmlFilePath + "/original"];
            resolve();
        }).fail(function (jqxhr, settings, exception) {
            reject(new Error("Script load failed: " + exception));
        });
    });
}

overlayImage.on('click', function () {
    if ($(window).width() < 1000) {
        overlay.removeClass("visible");
    }
});

imageTitle.on('click', function () {
    if ($(window).width() < 1000) {
        overlay.removeClass("visible");
    }
});

overlay.click(function (e) {
    if ($(e.target).is("img, p, #prev-button, #next-button, .download-button")) {
        return;
    }
    overlay.removeClass("visible");
});

gallery.on("click", ".item", function () {
    showImage(parseInt($(this).attr("data-index")));
    imageTitle.text($(this).attr("id").replace(".webp", ""));
});

prevButton.click(function () {
    if (currentImageIndex - 1 < 0) {
        currentImageIndex = gallery.find(".item").length - 1;
    } else {
        currentImageIndex = currentImageIndex - 1;
    }
    showImage(currentImageIndex);
});

nextButton.click(function () {
    if (currentImageIndex + 1 > gallery.find(".item").length) {
        currentImageIndex = 0;
    } else {
        currentImageIndex = currentImageIndex + 1;
    }
    showImage(currentImageIndex);
});

$("#randomizeButton").on("click", function () {
    randomizeAndPlaceImages();
});

$("#gallery-list div").on("click", function () {
    $("#selector").fadeOut(300);
    $("body").removeClass("locked-body");
    const scriptId = this.getAttribute("id");
    loadGalleryScript(scriptId).then(() => {
        randomizeAndPlaceImages();
    }).catch(error => {
        console.error(error);
    });
});

$("#viewButton").on("click", function () {
    $("#imageNotification").fadeOut();

    $(".item").each(function () {
        const index = parseInt($(this).attr("data-index"));
        if (imageDictionary.hasOwnProperty(index)) {
            imageDictionary[index].isNew = false;
        }
    });

    localStorage.setItem("imageDictionary", JSON.stringify(imageDictionary));
});

$(document).on('click', '.searchbar-item img', function () {
    const clickedImageId = $(this).attr('id');
    const $galleryImage = $('#gallery .item[id="' + clickedImageId + '"]');

    if ($galleryImage.length > 0) {
        const index = $galleryImage.data('index');
        showImage(index);
    } else {
        console.error('Image not found in gallery for ID: ' + clickedImageId);
    }
});