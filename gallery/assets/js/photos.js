document.title = "Gallery | 写真";
htmlFilePath = "photos"

$(document).ready(function () {
  $("#name").text("写真");
  $("#username").text("gallery");
  $("#url").text("links").attr("data-url", "/links");
  $("#about").text("リヨン ー 京都 | Samsung Z Flip 4; Canon EOS Kiss X5");
  $("#footer-content").children().last().html("<p>© 2024 写真. All rights reserved.</p>");
  $(".logo-text").text("写真");
  $("#profile-picture").css("background", "url('assets/img/photos/min/SKY.webp')");
});
