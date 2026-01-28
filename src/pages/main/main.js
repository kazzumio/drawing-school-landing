function initSmoothScroll(speed) {
  if (typeof speed !== 'number') speed = 800;

  $('a[href^="#"]').on('click', function (e) {
    e.preventDefault();

    const target = $(this).attr('href');
    const $targetEl = $(target);

    if ($targetEl.length) {
      $('html, body').animate({
        scrollTop: $targetEl.offset().top
      }, speed);
    }
  });
  debugLog('success', 'Smooth scrolling is successfully initialized');
}



function initAccordionSwitcher() {
  $('.faq-toggle').on('click', function () {
    const $item = $(this).closest('.faq-item');

    $('.faq-item.active').not($item).removeClass('active');

    $item.toggleClass('active');
  });
  debugLog('success', 'Accordion switcher is successfully initialized');
}



function initCurrencyCalculator() {
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

  debugLog('success', 'Currency calculator is successfully initialized');
}


// инициализация всех функций при готовности DOM
$(document).ready(function () {
  initSmoothScroll(800);
  initCurrencyCalculator()
  initAccordionSwitcher();

  debugLog('success', 'Main page is successfully loaded');
});
