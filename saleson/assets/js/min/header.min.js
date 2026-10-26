class Header extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const source = this.getAttribute('source');
    const path = source === 'compare' ? '../' : '';
    this.innerHTML = `
    <!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WQNBHFQS"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) --> 
      <header class="main-header w-100">
      <nav class="navbar navbar-expand-xl navbar-light sticky-header flex-column pt-2 pb-2">
          <!-- <div class="container container-full-width d-flex align-items-center justify-content-lg-start position-relative bg-green-6 px-lg-5 px-0 py-1">
            <span> <i class="bi bi-telephone"></i> +91 8092856577</span>
            <span class="px-lg-5 px-0"> <i class="bi bi-envelope"></i> support@saleson.co.in</span>
          </div> -->
          <div class="container d-flex align-items-center justify-content-lg-between position-relative">
              <a href="/" class="navbar-brand d-flex align-items-center mb-md-0 text-decoration-none">
                  <img src="/assets/img/salesOn-logo.webp" alt="logo" class="img-fluid logo-white logo" height='45' width='135' />
                  <img src="/assets/img/salesOn-logo.webp" alt="logo" class="img-fluid logo-color logo" height='45' width='135' />
              </a>

              <a class="navbar-toggler position-absolute right-0 border-0" role="button">
                  <span aria-hidden="true" aria-controls="offcanvasWithBackdrop"><i class="bi bi-list">
                  </i></span>
              </a>
              <div class="clearfix"></div>
              <div class="collapse navbar-collapse justify-content-end header-main-menu">
                  <ul class="nav col-12 col-md-auto justify-content-center main-menu">
                      <li>
                          <a class="nav-link">Features  <i class="bi bi-chevron-down arrow-down"></i></a>
                          <ul class="sub-menu">
                              <li><a href="/field-sales"> Field Sales </a></li>
                              <li><a href="/invoicing"> Automatic Invoicing</a></li>
                              <li><a href="/distribution-management-system"> Distributor Mgmt </a></li>
                              <li><a href="/target-meter"> Target Meter </a></li>
                              <li><a href="/salesman-tracking"> Salesman Tracking </a></li>
                              <li><a href="/order-taking-app"> Salesman Order App </a></li>
                              <li><a href="/van-sales"> Van Sales</a></li>
                              <li><a href="/production"> Production</a></li>
                          </ul>
                      </li>
                      <li class="nav-item dropdown">
                          <a class="nav-link" href="/pricing" role="button">Pricing</a>
                      </li>
                      <li class="nav-item dropdown">
                          <a class="nav-link" href="/about" role="button">About</a>
                      </li>
                  </ul>
              </div>

              <div class="action-btns text-end me-5 me-lg-0 d-none d-md-block d-lg-block">
                  <a href=/request-demo target="_blank" class="btn btn-secondary me-2">Book Free Demo</a>
                  <a href="https://app.saleson.co.in" target="_blank" class="btn btn-primary text-decoration-none me-2" data-amp="Sign In Clicked">Sign In</a>
                  <a href="https://apps.apple.com/in/app/saleson/id6541757577" target="_blank" title="Download iOS app">
                          <img src="/assets/img/app-store-small.png" height="44px" width='44' class="mx-2" alt="app-store"/>
                  </a>
                   <a href="https://play.google.com/store/apps/details?id=com.saleson.app" target="_blank" title="Download android app">
                          <img src="/assets/img/play-store-small.png" height="40px" width='40' alt="google-play"/>
                  </a>
              </div>

              <!--offcanvas menu start-->
              <div class="offcanvas offcanvas-end" tabindex="-1">
                  <div class="offcanvas-header d-flex align-items-center mt-2">
                      <a href="/" class="d-flex align-items-center mb-md-0 text-decoration-none">
                          <img src="/assets/img/salesOn-logo.webp" alt="logo" class="img-fluid ps-2 logo" height='45' width='135' />
                      </a>
                      <button type="button" class="close-btn text-danger" aria-label="Close">
                          <span aria-hidden="true">&times;</span>
                      </button>
                  </div>
                  <div class="offcanvas-body">
                      <ul class="nav col-12 col-md-auto justify-content-center main-menu">
                          <li class="nav-item dropdown">
                              <a class="nav-link dropdown" href="/" role="button">
                                  Home
                              </a>
                          </li>
                          <li class="dropdown">
                              <span class="menu-expand"><i class="bi bi-caret-down-fill"></i></span>
                              <a class="nav-link dropdown" role="button" aria-expanded="false">Features </a>
                              <ul class="sub-menu">
                                  <li class="nav-item" ><a href="/field-sales"> Field Sales </a></li>
                                  <li class="nav-item" ><a href="/invoicing"> Automatic Invoicing</a></li>
                                  <li class="nav-item" ><a href="/distribution-management-system"> Distributor Mgmt</a></li>
                                  <li class="nav-item" ><a href="/target-meter"> Target Meter</a></li>
                                  <li class="nav-item" ><a href="/salesman-tracking"> Salesman Tracking </a></li>
                                  <li class="nav-item" ><a href="/order-taking-app"> Salesman Order App </a></li>
                                  <li class="nav-item" ><a href="/van-sales"> Van Sales</a></li>
                                  <li class="nav-item" ><a href="/production"> Production</a></li>
                              </ul>
                          </li>
                          <li class="nav-item"><a href="/pricing" class="nav-link">Pricing</a></li>
                          <li class="nav-item dropdown">
                              <a class="nav-link" href="/about" role="button">About</a>
                          </li>
                      </ul>
                      <div class="action-btns mt-4 ps-3">
                          <a href="https://app.saleson.co.in/" target="_blank" class="btn btn-outline-primary me-2">Sign In</a>
                          <a href=/request-demo target="_blank" class="btn btn-secondary me-2">Book Free Demo</a>
                          <a href="https://apps.apple.com/in/app/saleson/id6541757577" target="_blank">
                              <img src="/assets/img/app-store.png" height="40px" width="120px" class="mx-3" alt="app-store"/>
                          </a>
                          <a href="https://play.google.com/store/apps/details?id=com.saleson.app" target="_blank">
                              <img src="/assets/img/google-play.png" height="40px" width="135px" class="mx-0 my-3" alt="google-play"/>
                          </a>
                      </div>
                  </div>
              </div>
              <!--offcanvas menu end-->
          </div>
      </nav>
  </header>
      `;
  }
}

customElements.define("header-component", Header);
