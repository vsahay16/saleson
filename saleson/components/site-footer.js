class SiteFooter extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
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
            --f-bg:        #ffffff;
            --f-bg2:       #f8f9fa;
            --f-border:    #e8e8e8;
            --f-text:      #222222;
            --f-muted:     #666666;
            --f-link:      #444444;
            --f-link-h:    #e8501a;
            --f-tag-bg:    #fff4f0;
            --f-tag-text:  #c93f10;
            font-family:  "DM Sans", sans-serif;
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
                <li><a href="/invoicing"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Automatic Invoicing</a></li>
                <li><a href="/salesman-tracking"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Live Location Tracking</a></li>
                <li><a href="/payment-collection"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Payment Collection</a></li>
                <li><a href="/target-meter"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Target Meter</a></li>
                <li><a href="/order-taking-app"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Sales Orders</a></li>
                <li><a href="/expense-management"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Expense Management</a></li>
                <li><a href="/attendance"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Attendance</a></li>
              </ul>
            </div>
  
            <!-- Solutions -->
            <div class="link-col">
              <span class="col-title">Solutions</span>
              <ul class="link-list">
                <li><a href="/field-sales"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Field Sales</a></li>
                <li><a href="/distribution-management-system"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Distributor DMS</a></li>
                <li><a href="/production"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Production</a></li>
                <li><a href="/delivery-management"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Delivery Management</a></li>
                <li><a href="/van-sales"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Van Sales</a></li>
                <li><a href="/tally-integration"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Tally Integration</a></li>
                <li><a href="/mobile-app"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Salesman Order App</a></li>
                </ul>
  
              <span class="col-title" style="margin-top:28px;display:inline-block">Resources</span>
              <ul class="link-list">
                <li><a href="/blogs"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Blog</a></li>
                <li><a href="/request-demo"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Request Demo</a></li>
                <li><a href="https://app.saleson.co.in/" target="_blank" rel="noopener"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Sign Up Free</a></li>
                <li><a href="https://app.saleson.co.in/login" target="_blank" rel="noopener"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Login</a></li>
              </ul>
            </div>
  
            <!-- Company -->
            <div class="link-col">
              <span class="col-title">Company</span>
              <ul class="link-list">
                <li><a href="/about"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>About Us</a></li>
                <li><a href="/request-demo"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Contact Us</a></li>
                <li><a href="/pricing"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Pricing</a></li>
                <!-- <li><a href="/careers"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Careers</a></li> -->
                <!-- <li><a href="/partners"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Partners</a></li> -->
              </ul>
  
              <span class="col-title" style="margin-top:28px;display:inline-block">Legal</span>
              <ul class="link-list">
                <li><a href="/privacy-policy"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Privacy Policy</a></li>
                <li><a href="/terms"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Terms of Service</a></li>
                <li><a href="/refund"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Refund Policy</a></li>
              </ul>
            </div>

            <div class="link-col">
              <span class="col-title">Tools</span>
              <ul class="link-list">
                <li><a href="/tools"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>All Free Tools</a></li>
                <li><a href="/tools/delivery-challan-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Delivery Challan Generator</a></li>
                <li><a href="/tools/e-way-bill-checker"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>E-Way Bill Checker</a></li>
                <li><a href="/tools/gst-calculator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>GST Calculator</a></li>
                <li><a href="/tools/gst-invoice-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>GST Invoice Generator</a></li>
                <li><a href="/tools/hsn-sac-gst-rate-finder"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>HSN SAC GST Rate Finder</a></li>
                <li><a href="/tools/outstanding-payment-tracker"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Outstanding Payment Tracker</a></li>
                <li><a href="/tools/payment-receipt-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Payment Receipt Generator</a></li>
                <li><a href="/tools/purchase-order-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Purchase Order Generator</a></li>
                <li><a href="/tools/quotation-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Quotation Generator</a></li>
                <li><a href="/tools/stock-reorder-level-calculator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Stock Reorder Level Calculator</a></li>
                <li><a href="/tools/van-loading-sheet-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Van Loading Sheet Generator</a></li>
                <li><a href="/tools/whatsapp-payment-reminder-generator"><svg class="arr" viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>Whatsapp Payment Reminder Generator</a></li>
              </ul>
            </div>
  
          </div>
  
          <hr class="footer-divider">
  
          <!-- Bottom bar -->
          <div class="footer-bottom">
            <p>© ${year} SalesOn. All rights reserved.</p>
  
            <div class="bottom-links">
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <!-- <a href="/sitemap">Sitemap</a> -->
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
