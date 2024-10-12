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

  $('#termsOfUse').on('click', function (e) {
    e.preventDefault();
    showPopup('Terms of Use', 'Welcome to our website. By accessing this site, you agree to our terms of use. These terms govern the use of our website and its services. Please read them carefully before using our site.</p><p>You agree not to use the site for any unlawful or harmful purposes. We reserve the right to modify these terms at any time without prior notice.');
  });

  $('#privacyPolicy').on('click', function (e) {
    e.preventDefault();
    showPopup('Privacy Policy', 'Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal data when you use our website.</p><p>We do not share your personal information with third parties without your consent, except as required by law. For more information on how we protect your data, please read our full policy.');
  });

  $('#cookieNotice').on('click', function (e) {
    e.preventDefault();
    showPopup('Cookie Notice', 'This website uses cookies to enhance your browsing experience and analyze site usage. By continuing to use this site, you consent to our use of cookies in accordance with our cookie policy.</p><p>You can manage your cookie preferences through your browser settings or by using the cookie settings we provide.');
  });

  $('#cookieSettings').on('click', function (e) {
    e.preventDefault();
    showPopup('Cookie Settings', 'You can manage your cookie preferences by adjusting your browser settings or using this interface. Some cookies are essential for the proper functioning of our site, while others help us improve your user experience.</p><p>Please select the types of cookies you accept, or disable those you do not wish to use.');
  });

  function showPopup(title, content) {
    // Met à jour le contenu de la pop-up
    $('#popup').find('p').first().text(title);
    $('#popup').find('p').last().text(content);

    // Affiche la pop-up
    $('#popup').fadeIn();

    // Ferme la pop-up
    $('.closePopup').on('click', function () {
      $('#popup').fadeOut();
    });
  }
});