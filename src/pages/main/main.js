$(document).ready(function () {
  // переменные
  const EXCHANGE_RATE = 70;

  $('.price-currency .currency').on('click', function () {
    const $clicked = $(this);
    const $priceBlock = $clicked.closest('.price-body__prices');
    const $currencies = $priceBlock.find('.currency');

    const $oldPrice = $priceBlock.find('s.d-block');
    const $mainPrice = $priceBlock.find('span.h2');

    function rememberRub($el) {
      if (!$el.data('rub')) {
        const rubText = $el.text().replace(/\s|₽/g, '');
        $el.data('rub', parseFloat(rubText));
      }
      return $el.data('rub');
    }

    const rubOld = rememberRub($oldPrice);
    const rubMain = rememberRub($mainPrice);

    if ($clicked.hasClass('currency-rub')) {
      $oldPrice.text(rubOld.toLocaleString('ru-RU') + ' ₽');
      $mainPrice.text(rubMain.toLocaleString('ru-RU') + ' ₽');
    } else if ($clicked.hasClass('currency-usd')) {
      $oldPrice.text(`$${(rubOld / EXCHANGE_RATE).toFixed(2)}`);
      $mainPrice.text(`$${(rubMain / EXCHANGE_RATE).toFixed(2)}`);
    }

    $currencies.removeClass('active-currency').addClass('opacity-half');
    $clicked.removeClass('opacity-half').addClass('active-currency');
  });


  $('.faq-toggle').on('click', function () {
    const $item = $(this).closest('.faq-item');

    $('.faq-item.active').not($item).removeClass('active');

    $item.toggleClass('active');
  });
  debugLog('success', 'Accordion switcher is successfully loaded');


  debugLog('success', 'Main page is successfully loaded');
});
