$(document).ready(function () {

  $('.faq-toggle').on('click', function () {
    const $item = $(this).closest('.faq-item');

    $('.faq-item.active').not($item).removeClass('active');

    $item.toggleClass('active');
  });
  debugLog('success', 'Accordion switcher is successfully loaded');


  debugLog('success', 'Main page is successfully loaded');
});
