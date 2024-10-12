$(document).ready(function () {
  document.documentElement.style.setProperty("--sidebar-height", $("#sidebar")[0].offsetHeight + "px");
  var phoneMenuClosed = true;

  $("#mobileMenuToggle").click(function () {
    $("#sidebar").toggleClass("toggled");
    phoneMenuClosed = !phoneMenuClosed;
    $("#mobileMenuToggle ion-icon").attr("name", phoneMenuClosed ? "pause-outline" : "close-outline");
  });

  $("#page").click(function () {
    $("#sidebar").removeClass("toggled");
    $("#mobileMenuToggle ion-icon").attr("name", "pause-outline");
  });

  $(".overlay").on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function () {
    if ($(this).hasClass("visible")) {
      $("body").addClass("locked-body");
    } else {
      $("body").removeClass("locked-body");
    }
  });
});