const lazyLoadingEnabled = true;

document.addEventListener('DOMContentLoaded', function () {
    const galleryId = localStorage.getItem('galleryId');
    if (galleryId) {
        openGallery(galleryId);
        localStorage.removeItem('galleryId');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const galleryId = urlParams.get('gallery') || localStorage.getItem('galleryId');

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

let imageLoadTimeout;

function showImage(index) {
    const $clickedImage = gallery.find('.item[data-index="' + index + '"]');

    if (!$clickedImage || !$clickedImage.attr("src")) {
        console.error("Invalid image or source for index:", index);
        return;
    }

    const fileName = decodeURIComponent($clickedImage.attr("src").split('/').pop().replace(".webp", ""));

    const minImageUrl = $clickedImage.attr("src");
    const originalImageUrl = minImageUrl.replace("/min/", "/original/").replace(".webp", ".jpg");

    overlayImage.attr("src", minImageUrl);
    imageTitle.text(decodeURIComponent(fileName));

    widthElement.text("Width: Loading...");
    heightElement.text("Height: Loading...");

    overlay.addClass("visible");

    clearTimeout(imageLoadTimeout);

    imageLoadTimeout = setTimeout(() => {
        const originalImage = new Image();
        originalImage.onload = function () {
            overlayImage.attr("src", originalImageUrl);
            downloadButton.attr("href", originalImageUrl);
            widthElement.text("Width: " + Math.round(this.naturalWidth * imageReductionFactor) + " pixels");
            heightElement.text("Height: " + Math.round(this.naturalHeight * imageReductionFactor) + " pixels");
        };

        originalImage.src = originalImageUrl;
    }, 3000);
}

function randomizeAndPlaceImages() {
    gallery.fadeOut(500, function () {
        loadLocalImages()
            .then(() => {
                gallery.fadeIn(200);
            })
            .catch(() => {
                loadFromGithub()
                    .then(() => {
                        gallery.fadeIn(200);
                    })
                    .catch((error) => {
                        console.error("Erreur lors du chargement des images depuis GitHub :", error);
                    });
            });
    });
}

function loadLocalImages() {
    const localDirectoryPath = 'assets/img/' + htmlFilePath + '/min/';

    return new Promise((resolve, reject) => {
        $.ajax({
            url: localDirectoryPath,
            success: function (data) {
                let foundImages = false;
                $(data).find("a:contains(.webp), a:contains(.jpg), a:contains(.jpeg), a:contains(.png)").each(function () {
                    const fileName = $(this).attr("href");
                    const cleanedFileName = fileName.split('/').pop();

                    const imageElement = $("<img>").attr({
                        src: lazyLoadingEnabled ? "" : localDirectoryPath + cleanedFileName,
                        "data-src": lazyLoadingEnabled ? localDirectoryPath + cleanedFileName : "",
                        class: "item lazy-image",
                        draggable: "false",
                        id: cleanedFileName.replace(/\.(webp|jpg|jpeg|png)/, ""),
                        alt: cleanedFileName.replace(/\.(webp|jpg|jpeg|png)/, ""),
                        "data-index": gallery.find(".item").length,
                        rel: "preload",
                        fetchpriority: "high"
                    }).css("opacity", 0);

                    const wrapperDiv = $("<div>").addClass("image-wrapper");

                    imageElement.on("load", function () {
                        if (this.naturalWidth > this.naturalHeight) {
                            wrapperDiv.addClass('landscape');
                        } else {
                            wrapperDiv.addClass('portrait');
                        }

                        $(this).animate({ opacity: 1 }, 1000);
                    });

                    if (!lazyLoadingEnabled) {
                        imageElement.attr("src", localDirectoryPath + cleanedFileName);
                    }

                    wrapperDiv.append(imageElement);
                    gallery.append(wrapperDiv);
                    foundImages = true;
                });

                if (foundImages) {
                    if (lazyLoadingEnabled) {
                        lazyLoadImages();
                    }
                    searchBarImages();
                    resolve();
                } else {
                    reject();
                }
            },
            error: function () {
                reject();
            }
        });
    });
}

function loadFromGithub() {
    const owner = 'ungaul';
    const repo = 'ungaul.github.io';
    const branch = 'main';
    const directoryPath = 'gallery/assets/img/' + htmlFilePath + '/min';

    return new Promise((resolve, reject) => {
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
                        src: lazyLoadingEnabled ? "" : imageLinks[j].download_url,
                        "data-src": lazyLoadingEnabled ? imageLinks[j].download_url : "",
                        class: "item lazy-image",
                        draggable: "false",
                        id: fileName.replace(".webp", ""),
                        alt: fileName.replace(".webp", ""),
                        "data-index": j
                    }).css("opacity", 0);

                    const wrapperDiv = $("<div>").addClass("image-wrapper");

                    imageElement.on("load", function () {
                        if (this.naturalWidth > this.naturalHeight) {
                            wrapperDiv.addClass('landscape');
                        } else {
                            wrapperDiv.addClass('portrait');
                        }
                        $(this).animate({ opacity: 1 }, 1000);
                    });

                    if (!lazyLoadingEnabled) {
                        imageElement.attr("src", imageLinks[j].download_url);
                    }

                    wrapperDiv.append(imageElement);
                    gallery.append(wrapperDiv);
                }

                if (lazyLoadingEnabled) {
                    lazyLoadImages();
                }
                searchBarImages();
                resolve();
            },
            error: function () {
                reject();
            }
        });
    });
}

function searchBarImages() {
    const searchResults = $("#image-names");
    searchResults.empty();

    $(".item").each(function () {
        const imageSrc = $(this).attr("src") || $(this).attr("data-src");
        if (!imageSrc) {
            return;
        }

        let imageFileName = decodeURIComponent(imageSrc.split('/').pop().replace(".webp", ""));

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

        const img = new Image();
        img.src = imageSrc;
        img.onload = function () {
            $("<p>")
                .addClass("searchbarItemWidth")
                .text("Width: " + Math.round(this.naturalWidth) + " pixels")
                .appendTo(imageNameInfo);

            $("<p>")
                .addClass("searchbarItemHeight")
                .text("Height: " + Math.round(this.naturalHeight) + " pixels")
                .appendTo(imageNameInfo);
        };

        $("<p>").addClass("searchbarItemSize").appendTo(imageNameInfo);

        $("<a>")
            .addClass("searchbarDownloadButton")
            .text("Download")
            .attr("download", "")
            .attr("href", imageSrc.replace("/min/", "/original/").replace(".webp", ".jpg"))
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
    overlayImage.attr("src", "");
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

function lazyLoadImages() {
    const lazyImages = document.querySelectorAll(".lazy-image");

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                image.src = image.getAttribute("data-src");

                image.onload = () => {
                    $(image).animate({ opacity: 1 }, 1000);
                };

                observer.unobserve(image);
            }
        });
    });

    lazyImages.forEach(image => {
        imageObserver.observe(image);
    });
}
