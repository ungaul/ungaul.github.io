window.transitionToPage = function (href) {
  if (href.includes("https://")) {
    window.open(href, "_blank");
    return;
  }

  if (href !== "") {
    document.body.style.opacity = 0;
    setTimeout(function () {
      window.location.href = href;
    }, 500);
  }
};

window.addEventListener('popstate', function () {
  document.body.style.opacity = 0;
  setTimeout(function () {
    document.body.style.opacity = 1;
  }, 500);
});

window.addEventListener('pageshow', function (event) {
  if (event.persisted) {
    document.body.style.opacity = 1;
  }
});

$("[data-url]").click(function (e) {
  const url = this.getAttribute("data-url");
  const galleryId = this.getAttribute("gallery-id");
  if (galleryId) {
    storeGalleryIdAndNavigate(url, galleryId);
  } else {
    transitionToPage(url);
  }
});

function storeGalleryIdAndNavigate(url, galleryId) {
  localStorage.setItem('galleryId', galleryId);
  transitionToPage(url);
}

// if ("serviceWorker" in navigator) {
//   $(window).on("load", function () {
//     navigator.serviceWorker.register("/assets/js/service-worker.js");
//   });
// }

$(window).on("load", function () {
  $("header a:first").html(
    '<img src="/assets/img/favicon.png" alt="Logo">' + "ホーム"
  );

  $("img:not([alt])").each(function () {
    var src = $(this).attr("src");
    if (src) {
      $(this).attr(
        "alt",
        src.replace("/gallery/assets/img/min/", "").replace(".jpg", "")
      );
    }
  });
  // $("a:not([href])").each(function () {
  //   $(this).attr("href", "");
  // });
});

$(document).ready(function () {
  var lines = [
    "<!--                   ++++++++++++++++++++++++++++++++                 -->",
    "<!--        ++++++++++++++++++++++++++++++++++++++++++++++++++++++      -->",
    "<!--   +++++++++++                                +++++  +++++++++++++  -->",
    "<!-- +++++++                                       ++++          ++++++ -->",
    "<!--++++++                                        +++            +++++  -->",
    "<!--  +++++                                      +++             ++++   -->",
    "<!--            ++++++++++++++                 ++++             ++++    -->",
    "<!--       +++++++++++++++++++++++            +++              ++++     -->",
    "<!--      +++++          ++++++++++++        +++             +++++      -->",
    "<!--      ++++               ++++++++++++  +++              +++++       -->",
    "<!--       ++++                 +++++++++++++             +++++         -->",
    "<!--         +++                   +++++++++++++      ++++++++          -->",
    "<!--          ++++                    ++++++++++++++++++++++            -->",
    "<!--            +++                +++++  +++++++++++++++               -->",
    "<!--             ++++            +++++         +++++                    -->",
    "<!--               +++        +++++                                     -->",
    "<!--                 ++++++++++++               +++++                   -->",
    "<!--                   +++++                  ++++++                    -->",
    "<!--                     ++++              +++++++                      -->",
    "<!--                       +++++         ++++++                         -->",
    "<!--                          +++++++++++++++                           -->",
    "<!--                              +++++++                               -->",
  ];

  var htmlString = lines.join("\n");

  var tempElement = $("<div>").html(htmlString);

  $("body").append(tempElement.contents());

  tempElement.remove();
});

$(document).ready(function () {
  if (window.location.href.startsWith("https://192.168.0.102:5500/")) {
    $('.section[gallery-id="sus"]').css('display', 'flex');
  }
});