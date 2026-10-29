class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // The shared shell must not depend on a page loading its font.
    if (document.head && !document.getElementById('saleson-shell-font')) {
      const font = document.createElement('link');
      font.id = 'saleson-shell-font';
      font.rel = 'stylesheet';
      font.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(font);
    }

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
          font-family: "DM Sans", sans-serif;
          font-size: 16px;
          font-weight: 400;
          font-style: normal;
          line-height: 1.4;
          letter-spacing: normal;
          word-spacing: normal;
          text-align: left;
          text-transform: none;

          display: block;
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        :host {
          --brand: #1143b6;
          --brand-dark: #0c3083;
          --brand-light: #edf4ff;
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
          font-family: "DM Sans", sans-serif;
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
          white-space: nowrap; font-family: "DM Sans", sans-serif;
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
          font-family: "DM Sans", sans-serif; white-space: nowrap;
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
        .badge-text { display: flex; flex-direction: column; line-height: 1.15; font-family: "DM Sans", sans-serif; }
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
          transition: background 0.12s, color 0.12s; font-family: "DM Sans", sans-serif;
        }
        .drawer-nav a:hover,
        .drawer-nav a.active { background: var(--so-bg2); color: var(--brand); }

        .section-label {
          font-size: 11px; font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.7px; color: var(--so-muted); padding: 6px 16px;
          font-family: "DM Sans", sans-serif;
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
                  <a href="/invoicing"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="13" y2="14"/></svg></div><div class="dm-text">Automatic Invoicing<small>GST invoices, estimates, challan</small></div></a>
                  <a href="/salesman-tracking"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg></div><div class="dm-text">Live Location Tracking<small>Real-time sales team map</small></div></a>
                  <a href="/payment-collection"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 12l2 2 4-4"/></svg></div><div class="dm-text">Payment Collection<small>Invoice-wise collection records</small></div></a>
                  <a href="/target-meter"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg></div><div class="dm-text">Target Meter<small>KPIs, leaderboard, gamification</small></div></a>
                  <a href="/order-taking-app"><div class="dm-icon"><svg viewBox="0 0 24 24"><path d="M6 2h12l4 6-10 14L2 8z"/></svg></div><div class="dm-text">Sales<small>Mobile catalog + order taking</small></div></a>
                  <a href="/expense-management"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M9 8h6M9 11h6M9 8v3c0 2 2 3 4 3M9 11l4 5"/></svg></div><div class="dm-text">Expense Management<small>Photo Receipt Claims</small></div></a>
                  <a href="/attendance"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/><path d="M9 21l3-3 3 3"/></svg></div><div class="dm-text">Attendance<small>GPS check-in/out</small></div></a>
                </div>
              </div>
            </div>

            <div class="dropdown">
              <button class="dropdown-toggle" type="button" aria-expanded="false">Solutions <span class="chevron"><svg viewBox="0 0 16 16"><polyline points="4,6 8,10 12,6"/></svg></span></button>
              <div class="dropdown-menu">
                <div class="dropdown-menu-inner">
                <!-- <a href="/user/software-for-distributors"><div class="dm-icon"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg></div><div class="dm-text">For Distributors<small>Streamline distribution ops</small></div></a>
                  <a href="/user/software-for-manufacturers"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4"/></svg></div><div class="dm-text">For Manufacturers<small>Production & BOM management</small></div></a>
                  <a href="/user/software-for-retailers"><div class="dm-icon"><svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/></svg></div><div class="dm-text">For Retailers<small>GST invoices & inventory</small></div></a> -->
                  <a href="/field-sales"><div class="dm-icon"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div><div class="dm-text">Field Sales<small>Visits, orders and team activity</small></div></a>
                  <a href="/distribution-management-system"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div><div class="dm-text">Distribution Mgmt (DMS)<small>Secondary sales visibility</small></div></a>
                  <a href="/production"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div><div class="dm-text">Production<small>BOM, work orders, costs</small></div></a>
                  <a href="/delivery-management"><div class="dm-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="14" height="11" rx="2"/><path d="M16 10h3.5L22 13.5V18h-6V10z"/><circle cx="7" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/><line x1="5" y1="11" x2="11" y2="11"/><line x1="5" y1="14" x2="9" y2="14"/></svg></div><div class="dm-text">Delivery Management<small>Track orders, dispatch, routes</small></div></a>
                  <a href="/van-sales"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="2" y="12" width="20" height="8" rx="2"/><path d="M6 12V8a6 6 0 0112 0v4"/></svg></div><div class="dm-text">Van Sales<small>Real-time van inventory mgmt</small></div></a>
                  <a href="/tally-integration"><div class="dm-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4"/></svg></div><div class="dm-text">Tally Integration<small>Two-way data sync</small></div></a>
                  <a href="/mobile-app"><div class="dm-icon"><svg viewBox="0 0 24 24"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 19h2"/></svg></div><div class="dm-text">Salesman Order App<small>Workflow and control</small></div></a>
<a href="/help"><div class="dm-icon">?</div><div class="dm-text">Help &amp; Onboarding<small>Setup and practical video guides</small></div></a>
                  </div>
              </div>
            </div>

            <a href="/pricing" ${
      activePage === "pricing" ? 'class="active"' : ""
    }>Pricing</a>
            <a href="/tools">Tools</a>
            <a href="/blogs" target='_blank'>Blog</a>
            <a href="/request-demo" ${
      activePage === "contact" ? 'class="active"' : ""
    } target='_blank'>Contact</a>
          </nav>

          <div class="right">
            <div class="actions">
              <a href="https://app.saleson.co.in/login" class="btn btn-outline">Login</a>
              <a href="/request-demo" class="btn btn-solid">Book Free Demo</a>
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
            <a href="/invoicing">Automatic Invoicing</a>
            <a href="/salesman-tracking">Live Location Tracking</a>
           <a href="/payment-collection">Payment Collection</a>
            <a href="/target-meter">Target Meter</a>
            <a href="/order-taking-app">Sales</a>
            <a href="/expense-management">Expense Management</a>
            <a href="/attendance">Attendance</a>

          </div>
          <div class="mobile-section">
            <div class="section-label">Solutions</div>
            <!--<a href="/user/software-for-distributors">For Distributors</a>
            <a href="/user/software-for-manufacturers">For Manufacturers</a>
             <a href="/user/software-for-retailers">For Retailers</a> -->
            <a href="/field-sales">Field Sales</a>
            <a href="/distribution-management-system">Distribution Mgmt (DMS)</a>
            <a href="/production">Production</a>
            <a href="/delivery-management">Delivery Management</a>
            <a href="/van-sales">Van Sales</a>
            <a href="/tally-integration">Tally Integration</a>
            <a href="/mobile-app">Salesman Order App</a>
          </div>
          <div class="mobile-section">
            <div class="section-label">Company</div>
            <a href="/help">Help &amp; Onboarding</a>
            <a href="/pricing" ${
      activePage === "pricing" ? 'class="active"' : ""
    }>Pricing</a>
            <a href="/tools">Tools</a>
            <a href="/blogs" ${
      activePage === "blog" ? 'class="active"' : ""
    }>Blog</a>
            <a href="/request-demo" ${
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

