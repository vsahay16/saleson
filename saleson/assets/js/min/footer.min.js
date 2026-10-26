class Footer extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      const source = this.getAttribute('source');
      const path = source === 'compare' ? '../' : '';
      this.innerHTML = `
      <footer class="footer-section">
      <!--footer top start-->
      <!--for light footer add .footer-light class and for dark footer add .bg-dark .text-white class-->
      <div class="footer-top bg-dark text-white ptb-70 pb-0">
          <div class="container">
              <div class="row justify-content-between">
                          <div class="col-md-12 col-lg-12 pb-5 mt-md-0 mt-lg-0">
                              <div class="row text-center">
                              <h5 class="col-lg-4 support"><i class="bi bi-telephone"></i>+91 8092856577</h5>
                              <h5 class="col-lg-4 support"><i class="bi bi-envelope"></i>support@saleson.co.in</h5>
                              <h5 class="col-lg-4 support"><i class="bi bi-whatsapp"></i>8092856577</h5>
                              </div>
                          </div>
                          <div class="col-md-12 col-lg-12 mt-4 mt-md-0 mt-lg-0">
                              <div class="row">
                                  <div class="col-md-2 col-lg-2 mt-4 mt-md-0 mt-lg-0 col-6">
                                      <div class="footer-single-col">
                                          <h3>Resources</h3>
                                          <ul class="list-unstyled footer-nav-list mb-lg-0">
                                              <!-- <li><a href="https://saleson.co.in#promo" target="_blank" class="text-decoration-none">Product</a></li> -->
                                              <li><a href="/pricing" target="_blank" class="text-decoration-none">Pricing</a></li>
                                              <li><a href="/#testimonials" target="_blank" class="text-decoration-none">Testimonials</a></li>
                                              <li><a href="/about" target="_blank" class="text-decoration-none">About</a></li>
                                              <li><a href="/" target="_blank" class="text-decoration-none">Support</a></li>
                                              <li><a href="/saleson-vs-other-field-sales" target="_blank" class="text-decoration-none">SalesOn vs other apps</a></li>
                                              <li><a href="/calculators/sales-leakage-calculator" target="_blank" class="text-decoration-none">Sales Leakage Calculator</a></li>
                                              <li><a href="/blogs" target="_blank" class="text-decoration-none">Blogs</a></li>
                                          </ul>
                                      </div>
                                  </div>
                                  <div class="col-md-2 col-lg-2 mt-4 mt-md-0 mt-lg-0 col-6">
                                      <div class="footer-single-col">
                                          <h3>Policy</h3>
                                          <ul class="list-unstyled footer-nav-list mb-lg-0">
                                              <li><a href="/privacy-policy" target="_blank" class="text-decoration-none">Privacy
                                              <li><a href="/terms" target="_blank" class="text-decoration-none">Terms</a></li>
                                              <li><a href="/refund" target="_blank" class="text-decoration-none">Refund Policy</a></li>
                                          </ul>
                                      </div>
                                  </div>
                                  <div class="col-md-4 col-lg-4 mt-4 mt-md-0 mt-lg-0 col-6">
                                      <div class="footer-single-col text-center">
                                          <ul class="list-unstyled list-inline footer-social-list mb-0">
                                              <li class="list-inline-item"><a href="https://www.facebook.com/profile.php?id=100075697946636" target="_blank"><i class="bi bi-facebook"></i></a></li>
                                              <li class="list-inline-item"><a href="https://www.linkedin.com/company/saleson-technologies/" target="_blank"><i class="bi bi-linkedin"></i></a></li>
                                              <li class="list-inline-item"><a href="https://www.youtube.com/@sales-order-app" target="_blank"><i class="bi bi-youtube"></i></a></li>
                                          </ul>
                                          <a href="https://play.google.com/store/apps/details?id=com.saleson.app" target="_blank" class="my-3 d-block">
                                            <img src="/assets/img/google-play.png" height="37.5px" width="120" class="g-play"
                                                alt="google-play" /></a>
                                          <a href="https://apps.apple.com/in/app/saleson/id6541757577" target="_blank">
                                          <img src="/assets/img/app-store.png" height="40.5px" width="120"
                                              alt="app-store" /></a>
                                      </div>
                                  </div>
                                  <div class="col-md-4 col-lg-4 mt-4 mt-md-0 mt-lg-0 col-12">
                                      <div class="row">
                                          <h6>Corporate Headquarter: </h6>
                                          <span>8066, Prestige Lakeside Habitat, Varthur Road, Bangalore-560087, Karnataka</span>
                                      </div>
                                      <div class="row mt-4">
                                          <h6>Sales Office: </h6>
                                          <span>6B/26, Tilak Marg, North S.K Puri, Patna-800013, Bihar</span>
                                  </div>
                                  </div>
                              </div>
                          </div>
              </div>
          </div>
      </div>
      <!--footer top end-->

      <!--footer bottom start-->
      <div class="footer-bottom bg-dark text-white py-4">
          <div class="container">
              <div class="row justify-content-between align-items-center">
                  <div class="col-md-12 col-lg-12 text-center">
                      <div class="copyright-text">
                          <p class="mb-lg-0 mb-md-0"><span>&#169;</span> 2026 Swarnshlok Software Pvt. Ltd. All rights reserved</p>
                      </div>
                  </div>
                  
              </div>
          </div>
      </div>

      <a target="_blank" href="https://api.whatsapp.com/send?phone=918092856577&text=Hi%20SalesOn%20Team,%20I%20need%20help" class="whatsapp" data-amp="Whatsapp Clicked"><img src="/assets/img/whatsapp_icon.png" alt="WhatsApp" width='70' height='70'></a>
      <!--footer bottom end-->
  </footer>
        `;
    }
  }
  
  customElements.define("footer-component", Footer);
  