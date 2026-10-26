
    function checkInView() {
      $('.scroll-animate, .zoom-animate').each(function () {
        const elementTop = $(this).offset().top;
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();

        if (elementTop < scrollTop + windowHeight - 100) {
          $(this).addClass('visible');
        }
      });
    }


    

    $(function () {
      checkInView();
      $(window).on('scroll resize', function () {
        checkInView();
      });
    });
    const image = document.getElementById('mainImage');

    const imageMap = {
        1: './assets/img/industry/agriculture.jpg',
        2: './assets/img/industry/automotive.jpg',
        3: './assets/img/industry/cosmetic.jpg'
      };
    
    const sections = document.querySelectorAll('.text-section');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imgId = entry.target.dataset.img;
          image.style.opacity = 0;
          setTimeout(() => {
            image.src = imageMap[imgId];
            image.style.opacity = 1;
          }, 300);


      
      // Blur all sections, clear the one in view
      sections.forEach(sec => sec.classList.remove('active-section'));
      entry.target.classList.add('active-section');
    }
  });
}, {
  threshold: 0.6
});

sections.forEach(section => observer.observe(section));
    