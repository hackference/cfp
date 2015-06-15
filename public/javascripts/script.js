$(document).ready(function() {

  $('.talk-type').on('change', function() {
    var showAll = 0;
    $('.talk-type').each(function() {
      if ($(this).is(':checked')) {
        $('.row.' + $(this).val()).show();
      } else {
        $('.row.' + $(this).val()).hide();
        showAll++;
      }
    });

    if (showAll == $('.talk-type').length) {
      $('.talk-type').each(function() {
        $('.row.' + $(this).val()).show();
      });
    }
  });

});
