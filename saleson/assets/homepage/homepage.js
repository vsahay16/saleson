class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    let path=""
    const source = this.getAttribute("source");
    if(source === "tools-index" || source === "pricing"){
      path = "../";
    }else if(source === "tools"){
      path = "../../";
    }else{
      path = "";
    }
    const activePage = this.getAttribute("active") || "";
    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :host {
          display: block;
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        :host {
          --so-bg: #fff;
          --so-bg2: #f8f9fa;
          --so-text: #222;
          --so-muted: #555;
          --so-border: #e5e5e5;
          --so-nav-link: #333;
          --so-shadow: 0 2px 12px rgba(0,0,0,0.10);
          --so-h: 68px;
        }

        header {
          background: var(--so-bg);
          box-shadow: var(--so-shadow);
          height: var(--so-h);
          transition: box-shadow 0.2s;
          font-family: "DM Sans", sans-serif;
        }

        header.scrolled { box-shadow: 0 4px 20px rgba(0,0,0,0.13); }

        .inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        /* Logo */
        .logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0;
        }
        .logo-icon {
          width: 36px; height: 36px;
          background: var(--brand);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .logo-icon svg { width: 22px; height: 22px; }
        .logo-text {
          font-size: 22px; font-weight: 700;
          color: var(--so-text); letter-spacing: -0.5px; line-height: 1;
          font-family: "DM Sans", sans-serif;;
        }
        .logo-text span { color: var(--brand); }

        /* Nav */
        nav { display: flex; align-items: center; gap: 2px; }

        nav a, nav button {
          text-decoration: none; background: none; border: none; cursor: pointer;
          font-size: 14px; color: var(--so-nav-link);
          padding: 8px 11px; border-radius: 6px;
          display: flex; align-items: center; gap: 4px;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap; font-family: "DM Sans", sans-serif;;
        }
        nav a:hover, nav button:hover,
        nav a.active { background: var(--so-bg2); color: var(--brand); }

        /* Dropdown */
        .dropdown { position: relative; }
        .dropdown-toggle { font-weight: 500; }
        .chevron {
          width: 14px; height: 14px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .chevron svg { width: 14px; height: 14px; stroke: currentColor; fill: none; stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }

        .dropdown-menu {
          display: none;
          position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
          padding-top: 10px; /* hover bridge — keeps menu open while moving mouse down */
          z-index: 999;
        }
        .dropdown-menu-inner {
          background: var(--so-bg); border: 1px solid var(--so-border);
          border-radius: 10px;
          box-shadow: 0 8px 28px rgba(0,0,0,0.13);
          min-width: 220px; padding: 6px;
        }
        .dropdown:hover .dropdown-menu, .dropdown:focus-within .dropdown-menu { display: block; }
        .dropdown:hover .chevron { transform: rotate(180deg); }

        .dropdown-menu a {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 9px 12px; font-size: 13.5px; color: var(--so-nav-link);
          text-decoration: none; border-radius: 6px;
          transition: background 0.12s, color 0.12s; line-height: 1.3;
        }
        .dropdown-menu a:hover { background: var(--so-bg2); color: var(--brand); }
        .dm-icon {
          width: 28px; height: 28px; border-radius: 6px;
          background: var(--so-bg2);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
        }
        .dm-icon svg { width: 14px; height: 14px; stroke: var(--brand); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
        .dm-text small { display: block; font-size: 11.5px; color: var(--so-muted); margin-top: 1px; }

        /* Right section */
        .right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .actions { display: flex; align-items: center; gap: 6px; }

        .btn {
          text-decoration: none; font-size: 13px; font-weight: 500;
          padding: 7px 14px; border-radius: 7px;
          border: 1.5px solid var(--brand); cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
          transition: background 0.15s, color 0.15s, transform 0.1s;
          font-family: "DM Sans", sans-serif;; white-space: nowrap;
        }
        .btn-outline { background: transparent; color: var(--brand); }
        .btn-outline:hover { background: var(--brand-light); }
        .btn-solid { background: var(--brand); color: #fff; border-color: var(--brand); }
        .btn-solid:hover { background: var(--brand-dark); }
        .btn:active { transform: scale(0.97); }

        /* App badges */
        .app-badges { display: flex; align-items: center; gap: 6px; }
        .badge {
          display: flex; align-items: center; gap: 5px;
          background: var(--so-text); color: var(--so-bg);
          padding: 5px 9px; border-radius: 7px; text-decoration: none;
          transition: opacity 0.15s, transform 0.1s;
          border: 1px solid var(--so-border);
        }
        .badge:hover { opacity: 0.82; }
        .badge:active { transform: scale(0.97); }
        .badge svg { width: 16px; height: 16px; fill: var(--so-bg); flex-shrink: 0; }
        .badge-text { display: flex; flex-direction: column; line-height: 1.15; font-family: "DM Sans", sans-serif;; }
        .badge-text .t1 { font-size: 9px; opacity: 0.7; letter-spacing: 0.2px; }
        .badge-text .t2 { font-size: 12px; font-weight: 600; letter-spacing: -0.2px; }

        .divider { width: 1px; height: 24px; background: var(--so-border); }

        /* Hamburger */
        .hamburger {
          display: none; background: none; border: none; cursor: pointer;
          padding: 8px; border-radius: 6px; color: var(--so-text);
          transition: background 0.15s;
        }
        .hamburger:hover { background: var(--so-bg2); }
        .hamburger svg { width: 24px; height: 24px; display: block; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; }

        /* Mobile overlay */
        .overlay {
          display: none; position: fixed; inset: 0;
          background: rgba(0,0,0,0.4); z-index: 998;
          opacity: 0; transition: opacity 0.25s;
        }
        .overlay.active { display: block; opacity: 1; }

        /* Mobile drawer */
        .drawer {
          position: fixed; top: 0; right: -320px;
          width: 300px; max-width: 90vw; height: 100vh;
          background: var(--so-bg); z-index: 999;
          transition: right 0.28s cubic-bezier(0.4,0,0.2,1);
          overflow-y: auto; display: flex; flex-direction: column;
        }
        .drawer.open { right: 0; }

        .drawer-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--so-border);
          position: sticky; top: 0; background: var(--so-bg); z-index: 1;
        }
        .close-btn {
          background: none; border: none; cursor: pointer; color: var(--so-text);
          padding: 6px; border-radius: 6px; transition: background 0.12s;
        }
        .close-btn:hover { background: var(--so-bg2); }
        .close-btn svg { width: 20px; height: 20px; stroke: currentColor; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

        .drawer-nav { padding: 12px 8px; flex: 1; }
        .drawer-nav a {
          display: block; padding: 11px 16px; font-size: 14.5px;
          color: var(--so-nav-link); text-decoration: none; border-radius: 8px;
          transition: background 0.12s, color 0.12s; font-family: "DM Sans", sans-serif;;
        }
        .drawer-nav a:hover,
        .drawer-nav a.active { background: var(--so-bg2); color: var(--brand); }

        .section-label {
          font-size: 11px; font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.7px; color: var(--so-muted); padding: 6px 16px;
          font-family: "DM Sans", sans-serif;;
        }
        .mobile-section { margin-bottom: 8px; }

        .drawer-actions {
          padding: 16px 20px; border-top: 1px solid var(--so-border);
          display: flex; flex-direction: column; gap: 8px;
        }
        .drawer-actions .btn { justify-content: center; font-size: 14px; padding: 10px 20px; }

        .drawer-badges {
          display: flex; gap: 8px; padding: 0 20px 16px;
        }
        .drawer-badges .badge { flex: 1; justify-content: center; }

        /* Responsive */
        @media (max-width: 960px) {
          nav, .actions, .app-badges, .divider { display: none; }
          .hamburger { display: flex; align-items: center; justify-content: center; }
        }
      </style>
      <!-- Google Tag Manager (noscript) -->
      <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WQNBHFQS" height="0" width="0"
          style="display:none;visibility:hidden"></iframe></noscript>
      <!-- End Google Tag Manager (noscript) -->
      <div class="header-container" style="min-height: 70px; position: sticky; top: 0; z-index: 99;">
      <header id="hdr">
        <div class="inner">
          <a href="https://saleson.co.in" class="navbar-brand d-flex align-items-center mb-md-0 text-decoration-none">
              <img src="/assets/img/salesOn-logo.webp" alt="logo" class="img-fluid logo" height='45' width='135' />
          </a>

          <nav>
            <div class="dropdown">
              <button class="dropdown-toggle" type="button" aria-expanded="false">Features <span class="chevron"><svg viewBox="0 0 16 16"><polyline points="4,6 8,10 12,6"/></svg></span></button>
              <div class="dropdown-menu">
                <div class="dropdown-menu-inner">
                  <a href="https://saleson-eta.vercel.app/invoicing"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg></div><div class="dm-text">Automatic Invoicing<small>GST invoices, estimates, challan</small></div></a>
                  <a href="https://saleson-eta.vercel.app/salesman-tracking"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg></div><div class="dm-text">Live Location Tracking<small>Real-time sales team map</small></div></a>
                  <a href="https://saleson-eta.vercel.app/payment-collection"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12l2 2 4-4"/></svg></div><div class="dm-text">Payment Collection<small>Invoice-wise collection records</small></div></a>
                  <a href="https://saleson-eta.vercel.app/target-meter"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg></div><div class="dm-text">Target Meter<small>KPIs, leaderboard, gamification</small></div></a>
                  <a href="https://saleson-eta.vercel.app/order-taking-app"><div class="dm-icon"><svg viewBox="0 0 24 24"><path d="M6 2h12l4 6-10 14L2 8z"/></svg></div><div class="dm-text">Sales<small>Mobile catalog + order taking</small></div></a>
                  <a href="https://saleson-eta.vercel.app/expense-management"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 8h6M9 11h6M9 8v3c0 2 2 3 4 3M9 11l4 5"/></svg></div><div class="dm-text">Expense Management<small>Photo Receipt Claims</small></div></a>
                  <a href="https://saleson-eta.vercel.app/attendance"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/><path d="M9 21l3-3 3 3"/></svg></div><div class="dm-text">Attendance<small>GPS check-in/out</small></div></a>
                </div>
              </div>
            </div>

            <div class="dropdown">
              <button class="dropdown-toggle" type="button" aria-expanded="false">Solutions <span class="chevron"><svg viewBox="0 0 16 16"><polyline points="4,6 8,10 12,6"/></svg></span></button>
              <div class="dropdown-menu">
                <div class="dropdown-menu-inner">
                <!-- <a href="https://saleson-eta.vercel.app/user/software-for-distributors"><div class="dm-icon"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div><div class="dm-text">For Distributors<small>Streamline distribution ops</small></div></a>
                  <a href="https://saleson-eta.vercel.app/user/software-for-manufacturers"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4"/></svg></div><div class="dm-text">For Manufacturers<small>Production & BOM management</small></div></a>
                  <a href="https://saleson-eta.vercel.app/user/software-for-retailers"><div class="dm-icon"><svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg></div><div class="dm-text">For Retailers<small>GST invoices & inventory</small></div></a> -->
                  <a href="https://saleson-eta.vercel.app/field-sales"><div class="dm-icon"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div><div class="dm-text">Field Sales<small>Visits, orders and team activity</small></div></a>
                  <a href="https://saleson-eta.vercel.app/distribution-management-system"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div><div class="dm-text">Distribution Mgmt (DMS)<small>Secondary sales visibility</small></div></a>
                  <a href="https://saleson-eta.vercel.app/production"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div><div class="dm-text">Production<small>BOM, work orders, costs</small></div></a>
                  <a href="https://saleson-eta.vercel.app/delivery-management"><div class="dm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="14" height="11" rx="2"/><path d="M16 10h3.5L22 13.5V18h-6V10z"/><circle cx="7" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/><line x1="5" y1="11" x2="11" y2="11"/><line x1="5" y1="14" x2="9" y2="14"/></svg></div><div class="dm-text">Delivery Management<small>Track orders, dispatch, routes</small></div></a>
                  <a href="https://saleson-eta.vercel.app/van-sales"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="2" y="12" width="20" height="8" rx="2"/><path d="M6 12V8a6 6 0 0112 0v4"/></svg></div><div class="dm-text">Van Sales<small>Real-time van inventory mgmt</small></div></a>
                  <a href="https://saleson-eta.vercel.app/tally-integration"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4"/></svg></div><div class="dm-text">Tally Integration<small>Two-way data sync</small></div></a>
                  <a href="https://saleson-eta.vercel.app/mobile-app"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 19h2"/></svg></div><div class="dm-text">Salesman Order App<small>Workflow and control</small></div></a>
                  </div>
              </div>
            </div>

            <a href="https://saleson-eta.vercel.app/pricing" ${
      activePage === "pricing" ? 'class="active"' : ""
    }>Pricing</a>
            <a href="https://saleson-eta.vercel.app/tools">Tools</a>
            <a href="https://saleson-eta.vercel.app/blogs" target='_blank'>Blog</a>
            <a href="https://saleson-eta.vercel.app/request-demo" ${
      activePage === "contact" ? 'class="active"' : ""
    } target='_blank'>Contact</a>
          </nav>

          <div class="right">
            <div class="actions">
              <a href="https://app.saleson.co.in/login" class="btn btn-outline">Login</a>
              <a href="https://saleson-eta.vercel.app/request-demo" class="btn btn-solid">Book Free Demo</a>
            </div>

            <div class="divider"></div>

            <div class="app-badges">
              <a href="https://apps.apple.com/in/app/saleson/id6541757577" class="badge" aria-label="Download on App Store" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
                <div class="badge-text"><span class="t1">Download on the</span><span class="t2">App Store</span></div>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.saleson.app" class="badge" aria-label="Get it on Google Play" target="_blank" rel="noopener">
                <svg viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c17.4-9.8 17.4-34.1-.2-44l-.9-20.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                <div class="badge-text"><span class="t1">Get it on</span><span class="t2">Google Play</span></div>
              </a>
            </div>

            <button class="hamburger" id="ham" aria-label="Open menu" aria-expanded="false">
              <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>
        </div>
      </header>

      <div class="overlay" id="ov"></div>

      <div class="drawer" id="drw" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div class="drawer-head">
          <a href="https://saleson.co.in" class="logo">
              <img src="/assets/img/salesOn-logo.webp" alt="logo" class="img-fluid logo" height='30' width='90' />
          </a>
          <button class="close-btn" id="cls" aria-label="Close menu">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="drawer-nav">
          <div class="mobile-section">
            <div class="section-label">Features</div>
            <a href="https://saleson-eta.vercel.app/invoicing">Automatic Invoicing</a>
            <a href="https://saleson-eta.vercel.app/salesman-tracking">Live Location Tracking</a>
           <a href="https://saleson-eta.vercel.app/payment-collection">Payment Collection</a>
            <a href="https://saleson-eta.vercel.app/target-meter">Target Meter</a>
            <a href="https://saleson-eta.vercel.app/order-taking-app">Sales</a>
            <a href="https://saleson-eta.vercel.app/expense-management">Expense Management</a>
            <a href="https://saleson-eta.vercel.app/attendance">Attendance</a>
            
          </div>
          <div class="mobile-section">
            <div class="section-label">Solutions</div>
            <!--<a href="https://saleson-eta.vercel.app/user/software-for-distributors">For Distributors</a>
            <a href="https://saleson-eta.vercel.app/user/software-for-manufacturers">For Manufacturers</a>
             <a href="https://saleson-eta.vercel.app/user/software-for-retailers">For Retailers</a> -->
            <a href="https://saleson-eta.vercel.app/field-sales">Field Sales</a>
            <a href="https://saleson-eta.vercel.app/distribution-management-system">Distribution Mgmt (DMS)</a>
            <a href="https://saleson-eta.vercel.app/production">Production</a>
            <a href="https://saleson-eta.vercel.app/delivery-management">Delivery Management</a>
            <a href="https://saleson-eta.vercel.app/van-sales">Van Sales</a>
            <a href="https://saleson-eta.vercel.app/tally-integration">Tally Integration</a>
            <a href="https://saleson-eta.vercel.app/mobile-app">Salesman Order App</a>
          </div>
          <div class="mobile-section">
            <div class="section-label">Company</div>
            <a href="https://saleson-eta.vercel.app/pricing" ${
      activePage === "pricing" ? 'class="active"' : ""
    }>Pricing</a>
            <a href="https://saleson-eta.vercel.app/tools">Tools</a>
            <a href="https://saleson-eta.vercel.app/blogs" ${
      activePage === "blog" ? 'class="active"' : ""
    }>Blog</a>
            <a href="https://saleson-eta.vercel.app/request-demo" ${
      activePage === "contact" ? 'class="active"' : ""
    }>Contact</a>
          </div>
        </div>

        <div class="drawer-actions">
          <a href="https://app.saleson.co.in/login" class="btn btn-outline">Login</a>
          <a href="https://app.saleson.co.in/" class="btn btn-solid">Start Free Trial</a>
        </div>
        <div class="drawer-badges">
          <a href="https://apps.apple.com/in/app/saleson/id6541757577" class="badge" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          <div class="badge-text"><span class="t1">App Store</span><span class="t2">iOS</span></div>
          </a>
          <a href="https://play.google.com/store/apps/details?id=com.saleson.app" class="badge" target="_blank" rel="noopener">
            <svg viewBox="0 0 512 512" width="14" height="14"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c17.4-9.8 17.4-34.1-.2-44l-.9-20.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
            <div class="badge-text"><span class="t1">Google Play</span><span class="t2">Android</span></div>
          </a>
        </div>
      </div>
    </div>
    `;


      // One canonical pricing page for every visitor.

    this._bindEvents();
    this._highlightActive(activePage);
  }

  _bindEvents() {
    const root = this.shadowRoot;
    const hdr = root.getElementById("hdr");
    const ham = root.getElementById("ham");
    const drw = root.getElementById("drw");
    const ov = root.getElementById("ov");
    const cls = root.getElementById("cls");

    drw.inert = true;
    root.querySelectorAll(".dropdown").forEach(dropdown => {
      const button = dropdown.querySelector(".dropdown-toggle");
      if (!button) return;
      const update = () => button.setAttribute("aria-expanded", String(dropdown.matches(":hover, :focus-within")));
      dropdown.addEventListener("mouseenter", update);
      dropdown.addEventListener("mouseleave", update);
      dropdown.addEventListener("focusin", update);
      dropdown.addEventListener("focusout", () => setTimeout(update, 0));
    });
    const open = () => {
      drw.inert = false;
      drw.classList.add("open");
      ov.classList.add("active");
      ham.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      cls.focus();
    };
    const close = () => {
      drw.classList.remove("open");
      ov.classList.remove("active");
      ham.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      drw.inert = true;
      ham.focus();
    };

    ham.addEventListener("click", open);
    cls.addEventListener("click", close);
    ov.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drw.classList.contains("open")) close();
    });

    // Focus trap inside drawer
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Tab" || !drw.classList.contains("open")) return;
      const sel = "a[href], button:not([disabled])";
      const els = [...root.querySelectorAll(sel)].filter((el) =>
        drw.contains(el)
      );
      if (!els.length) return;
      const first = els[0],
        last = els[els.length - 1];
      if (e.shiftKey) {
        if (root.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (root.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    // Sticky scroll shadow
    window.addEventListener(
      "scroll",
      () => {
        hdr.classList.toggle("scrolled", window.scrollY > 10);
      },
      { passive: true }
    );
  }

  // Auto-highlight nav link based on current URL or active attribute
  _highlightActive(activePage) {
    const root = this.shadowRoot;
    const current =
      activePage ||
      window.location.pathname.replace(/^\//, "").replace(".html", "");
    if (!current) return;
    root.querySelectorAll("nav a, .drawer-nav a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href === "/" + current) { a.classList.add("active"); a.setAttribute("aria-current", "page"); }
    });
  }
}

customElements.define("site-header", SiteHeader);

class SiteFooter extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      const year = new Date().getFullYear();
      let path=""
      const source = this.getAttribute("source");
      if(source === "tools-index" || source === "pricing"){
        path = "../";
      }else if(source === "tools"){
        path = "../../";
      }else{
        path = "";
      }
      this.shadowRoot.innerHTML = `
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
          :host {
            display: block;
            --f-bg:        #ffffff;
            --f-bg2:       #f8f9fa;
            --f-border:    #e8e8e8;
            --f-text:      #222222;
            --f-muted:     #666666;
            --f-link:      #444444;
            --f-link-h:    #e8501a;
            --f-tag-bg:    #fff4f0;
            --f-tag-text:  #c93f10;
            font-family:  "DM Sans", sans-serif;;
          }

          /* App badges row inside CTA */
          .cta-badges {
            display: flex; gap: 10px; justify-content: center; margin-top: 20px; flex-wrap: wrap;
          }
          .app-badge {
            display: inline-flex; align-items: center; gap: 7px;
            background: rgba(0,0,0,0.25);
            border: 1px solid rgba(255,255,255,0.3);
            color: #fff; text-decoration: none;
            padding: 7px 14px; border-radius: 8px;
            transition: background 0.15s;
          }
          .app-badge:hover { background: rgba(0,0,0,0.4); }
          .app-badge svg { width: 17px; height: 17px; fill: #fff; flex-shrink: 0; }
          .app-badge-text { display: flex; flex-direction: column; line-height: 1.2; }
          .app-badge-text .ab1 { font-size: 9px; opacity: 0.75; letter-spacing: 0.2px; }
          .app-badge-text .ab2 { font-size: 13px; font-weight: 600; }
  
          /* Main footer body */
          footer {
            background: var(--f-bg);
            border-top: 1px solid var(--f-border);
          }
  
          .footer-main {
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 24px 40px;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
            gap: 40px 32px;
          }
  
          /* Brand column */
          .brand-col {}
          .footer-logo {
            display: inline-flex; align-items: center; gap: 10px;
            text-decoration: none; margin-bottom: 16px;
          }
          .logo-icon {
            width: 38px; height: 38px; background: var(--brand);
            border-radius: 9px;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .logo-icon svg { width: 22px; height: 22px; }
          .logo-text { font-size: 22px; font-weight: 700; color: var(--f-text); letter-spacing: -0.4px; line-height: 1; }
          .logo-text span { color: var(--brand); }
  
          .brand-desc {
            font-size: 13.5px; color: var(--f-muted); line-height: 1.7;
            margin-bottom: 20px; max-width: 300px;
          }
  
          /* Contact info */
          .contact-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
          .contact-list li {
            display: flex; align-items: flex-start; gap: 9px;
            font-size: 13.5px; color: var(--f-muted); line-height: 1.5;
          }
          .contact-list li .ci {
            width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px;
            stroke: var(--brand); fill: none; stroke-width: 1.8;
            stroke-linecap: round; stroke-linejoin: round;
          }
          .contact-list a { color: var(--f-link); text-decoration: none; transition: color 0.12s; }
          .contact-list a:hover { color: var(--brand); }
  
          /* Social icons */
          .socials { display: flex; gap: 8px; margin-bottom: 24px; }
          .social-btn {
            width: 34px; height: 34px; border-radius: 8px;
            background: var(--f-bg2); border: 1px solid var(--f-border);
            display: flex; align-items: center; justify-content: center;
            text-decoration: none; color: var(--f-muted);
            transition: background 0.15s, color 0.15s, border-color 0.15s;
            flex-shrink: 0;
          }
          .social-btn:hover { background: var(--brand); color: #fff; border-color: var(--brand); }
          .social-btn svg { width: 15px; height: 15px; fill: currentColor; }
  
          /* Link columns */
          .link-col {}
          .col-title {
            font-size: 12px; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.9px; color: var(--f-text);
            margin-bottom: 16px; padding-bottom: 10px;
            border-bottom: 2px solid var(--brand);
            display: inline-block;
          }
          .link-list { list-style: none; display: flex; flex-direction: column; gap: 9px; }
          .link-list a {
            font-size: 13.5px; color: var(--f-link); text-decoration: none;
            transition: color 0.12s, padding-left 0.12s;
            display: inline-flex; align-items: center; gap: 5px;
            line-height: 1.4;
          }
          .link-list a:hover { color: var(--brand); padding-left: 4px; }
          .link-list a .arr {
            width: 10px; height: 10px; opacity: 0;
            transition: opacity 0.12s;
            stroke: currentColor; fill: none;
            stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
            flex-shrink: 0;
          }
          .link-list a:hover .arr { opacity: 1; }
  
          /* Badge pill */
          .badge-new {
            font-size: 9px; font-weight: 700; text-transform: uppercase;
            background: var(--f-tag-bg); color: var(--f-tag-text);
            padding: 2px 6px; border-radius: 4px; letter-spacing: 0.3px;
            vertical-align: middle; margin-left: 4px;
          }
  
          /* Divider */
          .footer-divider {
            max-width: 1200px; margin: 0 auto;
            border: none; border-top: 1px solid var(--f-border);
          }
  
          /* Bottom bar */
          .footer-bottom {
            max-width: 1200px; margin: 0 auto;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
          }
          .footer-bottom p { font-size: 13px; color: var(--f-muted); line-height: 1.5; }
          .footer-bottom a { color: var(--f-link); text-decoration: none; transition: color 0.12s; }
          .footer-bottom a:hover { color: var(--brand); }
          .bottom-links { display: flex; gap: 20px; flex-wrap: wrap; }
          .bottom-links a { font-size: 13px; color: var(--f-muted); text-decoration: none; transition: color 0.12s; }
          .bottom-links a:hover { color: var(--brand); }
  
          /* Made in India badge */
          .made-in {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 12px; color: var(--f-muted);
          }
          .flag { font-size: 16px; line-height: 1; }
  
          /* ── Responsive ── */
          @media (max-width: 1024px) {
            .footer-main {
              grid-template-columns: 1.5fr 1fr 1fr 1fr;
            }
            .brand-col { grid-column: 1 / -1; }
            .brand-desc { max-width: 100%; }
          }
  
          @media (max-width: 768px) {
            .footer-main {
              grid-template-columns: 1fr 1fr;
              gap: 32px 24px;
              padding: 40px 20px 32px;
            }
            .brand-col { grid-column: 1 / -1; }
            .cta-band { padding: 40px 20px; }
          }
  
          @media (max-width: 480px) {
            .footer-main { grid-template-columns: 1fr; gap: 28px; }
            .footer-bottom { flex-direction: column; align-items: flex-start; gap: 10px; }
            .cta-btns { flex-direction: column; align-items: center; }
            .cta-badges { flex-direction: column; align-items: center; }
          }
        </style>
  
        <!-- ── Main Footer Grid ── -->
        <footer>
          <div class="footer-main">
  
            <!-- Brand column -->
            <div class="brand-col">
            <a href="https://saleson.co.in" class="footer-logo">
                <img src="/assets/img/salesOn-logo.webp" alt="logo" class="img-fluid logo" height='45' width='135' />
            </a>
  
              <p class="brand-desc">
                India's leading sales &amp; distribution management platform. Empowering SMEs with digital tools for orders, invoicing, tracking, and business growth.
              </p>
  
              <ul class="contact-list">
                <li>
                  <svg class="ci" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <span><a href="tel:+918092856577">+91 80928 56577</a></span>
                </li>
                <li>
                  <svg class="ci" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span><a href="mailto:support@saleson.co.in">support@saleson.co.in</a></span>
                </li>
                <li>
                  <svg class="ci" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Bangalore, India</span>
                </li>
              </ul>
  
              <div class="socials">
                <!-- LinkedIn -->
                <a href="https://www.linkedin.com/company/saleson-technologies/" class="social-btn" aria-label="LinkedIn" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <!-- Instagram -->
                <a href="https://www.instagram.com/salesonsoftware/" class="social-btn" aria-label="Instagram" target="_blank" rel="noopener">
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                </a>
                <!-- Facebook -->
                <a href="https://www.facebook.com/profile.php?id=100075697946636" class="social-btn" aria-label="Facebook" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <!-- YouTube -->
                <a href="https://www.youtube.com/@sales-order-app" class="social-btn" aria-label="YouTube" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#ccc"/></svg>
                </a>
                <!-- WhatsApp -->
                <a href="https://wa.me/918092856577" class="social-btn" aria-label="WhatsApp" target="_blank" rel="noopener">
                  <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </a>
              </div>
            </div>
  
            <!-- Features -->
            <div class="link-col">
              <span class="col-title">Features</span>
              <ul class="link-list">
                <li><a href="https://saleson-eta.vercel.app/invoicing"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Automatic Invoicing</a></li>
                <li><a href="https://saleson-eta.vercel.app/salesman-tracking"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Live Location Tracking</a></li>
                <li><a href="https://saleson-eta.vercel.app/payment-collection"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Payment Collection</a></li>
                <li><a href="https://saleson-eta.vercel.app/target-meter"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Target Meter</a></li>
                <li><a href="https://saleson-eta.vercel.app/order-taking-app"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Sales Orders</a></li>
                <li><a href="https://saleson-eta.vercel.app/expense-management"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Expense Management</a></li>
                <li><a href="https://saleson-eta.vercel.app/attendance"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Attendance</a></li>
              </ul>
            </div>
  
            <!-- Solutions -->
            <div class="link-col">
              <span class="col-title">Solutions</span>
              <ul class="link-list">
                <li><a href="https://saleson-eta.vercel.app/field-sales"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Field Sales</a></li>
                <li><a href="https://saleson-eta.vercel.app/distribution-management-system"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Distributor DMS</a></li>
                <li><a href="https://saleson-eta.vercel.app/production"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Production</a></li>
                <li><a href="https://saleson-eta.vercel.app/delivery-management"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Delivery Management</a></li>
                <li><a href="https://saleson-eta.vercel.app/van-sales"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Van Sales</a></li>
                <li><a href="https://saleson-eta.vercel.app/tally-integration"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Tally Integration</a></li>
                <li><a href="https://saleson-eta.vercel.app/mobile-app"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Salesman Order App</a></li>
                </ul>
  
              <span class="col-title" style="margin-top:28px;display:inline-block">Resources</span>
              <ul class="link-list">
                <li><a href="https://saleson-eta.vercel.app/blogs"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Blog</a></li>
                <li><a href="https://saleson-eta.vercel.app/request-demo"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Request Demo</a></li>
                <li><a href="https://app.saleson.co.in/" target="_blank" rel="noopener"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Sign Up Free</a></li>
                <li><a href="https://app.saleson.co.in/login" target="_blank" rel="noopener"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Login</a></li>
              </ul>
            </div>
  
            <!-- Company -->
            <div class="link-col">
              <span class="col-title">Company</span>
              <ul class="link-list">
                <li><a href="https://saleson-eta.vercel.app/about"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>About Us</a></li>
                <li><a href="https://saleson-eta.vercel.app/request-demo"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Contact Us</a></li>
                <li><a href="https://saleson-eta.vercel.app/pricing"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Pricing</a></li>
                <!-- <li><a href="https://saleson-eta.vercel.app/careers"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Careers</a></li> -->
                <!-- <li><a href="https://saleson-eta.vercel.app/partners"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Partners</a></li> -->
              </ul>
  
              <span class="col-title" style="margin-top:28px;display:inline-block">Legal</span>
              <ul class="link-list">
                <li><a href="https://saleson-eta.vercel.app/privacy-policy"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Privacy Policy</a></li>
                <li><a href="https://saleson-eta.vercel.app/terms"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Terms of Service</a></li>
                <li><a href="https://saleson-eta.vercel.app/refund"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Refund Policy</a></li>
              </ul>
            </div>

            <div class="link-col">
              <span class="col-title">Tools</span>
              <ul class="link-list">
                <li><a href="https://saleson-eta.vercel.app/tools"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>All Free Tools</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/delivery-challan-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Delivery Challan Generator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/e-way-bill-checker"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>E-Way Bill Checker</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/gst-calculator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>GST Calculator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/gst-invoice-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>GST Invoice Generator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/hsn-sac-gst-rate-finder"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>HSN SAC GST Rate Finder</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/outstanding-payment-tracker"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Outstanding Payment Tracker</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/payment-receipt-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Payment Receipt Generator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/purchase-order-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Purchase Order Generator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/quotation-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Quotation Generator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/stock-reorder-level-calculator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Stock Reorder Level Calculator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/van-loading-sheet-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Van Loading Sheet Generator</a></li>
                <li><a href="https://saleson-eta.vercel.app/tools/whatsapp-payment-reminder-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Whatsapp Payment Reminder Generator</a></li>
              </ul>
            </div>
  
          </div>
  
          <hr class="footer-divider">
  
          <!-- Bottom bar -->
          <div class="footer-bottom">
            <p>© ${year} SalesOn. All rights reserved.</p>
  
            <div class="bottom-links">
              <a href="https://saleson-eta.vercel.app/privacy-policy">Privacy Policy</a>
              <a href="https://saleson-eta.vercel.app/terms">Terms of Service</a>
              <!-- <a href="https://saleson-eta.vercel.app/sitemap">Sitemap</a> -->
            </div>
  
            <span class="made-in">
              <span class="flag">🇮🇳</span> Made in India
            </span>
          </div>
  
        </footer>
      `;

      // One canonical pricing page for every visitor.

    }
  }
  
  customElements.define('site-footer', SiteFooter);
/* Homepage interactions: no autoplay, no background video download, no simulated live data. */
(() => {
 const root=document.querySelector('.saleson-home');if(!root)return;
 function bindTabs(selector,keyAttribute){
  const tabs=[...root.querySelectorAll(selector)];
  function select(tab,focus=false){
   tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));if(panel)panel.hidden=!active;});
   if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
   tab.addEventListener('click',()=>select(tab));
   tab.addEventListener('keydown',e=>{let i=index;if(e.key==='ArrowRight')i=(index+1)%tabs.length;else if(e.key==='ArrowLeft')i=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=tabs.length-1;else return;e.preventDefault();select(tabs[i],true);});
  });
 }
 bindTabs('[data-dash-tab]');bindTabs('[data-explore-tab]');
 const shells=[...root.querySelectorAll('[data-home-video]')];
 shells.forEach(shell=>{
  const video=shell.querySelector('video'),button=shell.querySelector('.video-play'),source=video.querySelector('source');
  button.addEventListener('click',()=>{
   shells.forEach(other=>{if(other!==shell)other.querySelector('video').pause();});
   if(!source.src){source.src=source.dataset.src;video.load();}
   shell.classList.add('is-playing');
   const playing=video.play();if(playing?.catch)playing.catch(()=>{shell.classList.remove('is-playing');});
  });
  video.addEventListener('ended',()=>shell.classList.remove('is-playing'));
  video.addEventListener('error',()=>shell.classList.remove('is-playing'));
 });
})();

/* Accessible enlargement for the supplied product screenshots. */
(() => {
  const triggers = [...document.querySelectorAll('[data-media-src]')];
  if (!triggers.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'feature-media-dialog';
  dialog.setAttribute('aria-labelledby', 'feature-media-title');
  dialog.innerHTML = '<div class="feature-media-dialog-header"><h2 id="feature-media-title" class="feature-media-dialog-title"></h2><div class="feature-media-dialog-actions"><button type="button" class="feature-media-zoom" aria-pressed="false">Zoom in</button><button type="button" class="feature-media-close" autofocus>Close image</button></div></div><div class="feature-media-dialog-viewport" tabindex="0" role="region" aria-label="Product image; scroll to explore"><img class="feature-media-dialog-image" alt=""></div>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const title = dialog.querySelector('h2');
  const zoom = dialog.querySelector('.feature-media-zoom');
  const close = dialog.querySelector('.feature-media-close');
  const viewport = dialog.querySelector('.feature-media-dialog-viewport');
  let opener = null;
  triggers.forEach(trigger => trigger.addEventListener('click', () => {
    opener = trigger;
    image.src = trigger.dataset.mediaSrc;
    image.alt = trigger.dataset.mediaTitle;
    title.textContent = trigger.dataset.mediaTitle;
    dialog.classList.remove('is-zoomed');
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Zoom in';
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { window.open(trigger.dataset.mediaSrc, '_blank', 'noopener'); return; }
    viewport.scrollTo(0, 0);
  }));
  close.addEventListener('click', () => dialog.close());
  zoom.addEventListener('click', () => {
    const enlarged = dialog.classList.toggle('is-zoomed');
    zoom.setAttribute('aria-pressed', String(enlarged));
    zoom.textContent = enlarged ? 'Fit image' : 'Zoom in';
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener?.focus());
})();
