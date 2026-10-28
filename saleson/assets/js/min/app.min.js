var THEMETAGS = THEMETAGS || {};
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WQNBHFQS');
        
(function () {
  'use strict'; //preloader

  $(window).ready(function () {
    $('#preloader').delay(100).fadeOut('fade');
  }); //dropdown menu hover js

  $('ul.nav li.dropdown').hover(function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeIn(200);
  }, function () {
    $(this).find('.dropdown-menu').stop(true, true).delay(100).fadeOut(200);
  }); //sticky header

  function showMobileNav() {
    var nav = document.getElementsByClassName("offcanvas")[0];
    if (!nav) return;
    if(nav.classList.contains('showNav')){
        nav.classList.remove("showNav");
    }else{
        nav.classList.add("showNav");
    }
  }

  function showTestimonial(param) {
    if (typeof $.fn.slick !== "function" || !$(".appie-testimonial-slider").length) return;
    $(".appie-testimonial-slider").not('.slick-initialized').slick({
        dots: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 2000,
        arrows: true,
        prevArrow: '<span class="prev"><i class="bi bi-arrow-left"></i></span>',
        nextArrow: '<span class="next"><i class="bi bi-arrow-right"></i></span>',
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode: true,
        centerPadding: "0",
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    arrows: false,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    arrows: false,
                }
            }
        ]
    });
};
  /* social sharing for blog */

  $('.blog-section .footer-social-list').on('click', function (e) {
    const fb = document.getElementById("fbShare");
    const twitter = document.getElementById("twitterShare");
    const linkedIn = document.getElementById("linkedInShare");
    var navUrl = '';
    if(fb.contains(e.target)){
      navUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + window.location.href;
    }else if (linkedIn.contains(e.target)){
      navUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + window.location.href;
    }else {
      const arr = window.location.href.split('/');
      const topic = arr[arr.length - 1];
      navUrl = 'http://twitter.com/share?text='+ encodeURI(topic.substring(0, topic.indexOf(".html"))) + '&url=' + window.location.href;
    }
    window.open(navUrl , '_blank');
  });

  $('.navbar.sticky-header .navbar-toggler').on('click', function(){
    showMobileNav();
  })

  $('.offcanvas-header button.close-btn').on('click', function(){
    showMobileNav();
  })

  $('.offcanvas-body ul.main-menu li.nav-item>a').on('click',function(){
    showMobileNav();
  })

  $(window).on('scroll', function () {
    var scroll = $(window).scrollTop();

    if (scroll < 2) {
      $('nav.sticky-header').removeClass('affix');
    } else {
      $('nav.sticky-header').addClass('affix');
    }
  }); //swiper slide js

  THEMETAGS.initialize = {
    init: function () {
    },
  };
  THEMETAGS.documentOnReady = {
    init: function () {
      THEMETAGS.initialize.init();
      showTestimonial();
    }
  };
  $(document).ready(THEMETAGS.documentOnReady.init);

})();