class Industry extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
       const source = this.getAttribute('source');
       const path = source === 'compare' || source === 'user' ? '../' : '';
      this.innerHTML = `
      <section class="built-industry bg-secondary-lp ptb-70 position-relative">
      <div class="container">
          <div class="row justify-content-center">
              <div class="col-lg-8 col-md-10">
                  <div class="subscribe-info-wrap text-center position-relative z-2">
                      <div class="section-heading mb-0 text-white">
                          <h2 class="mb-4 text-white">Businesses love using SalesOn</h2>
                          <p class="mb-4">SalesOn caters to <a href="/user/software-for-distributors" target="_blank" class="text-decoration-none text-primary">distributors </a>  <a href="/user/software-for-manufacturers" target="_blank" class="text-decoration-none text-primary">and manufacturers </a> in wide range of industries. It is versatile, adaptable, and capable of addressing the unique needs and requirements of diverse sectors.
                              It has multiple configuration options to allow users to customize settings, and interfaces to align with their industry requirements.
                              SalesOn has been designed to accommodate various types of data relevant to different industries.
                          </p>
                      </div>
                      <div class="integration-main d-none d-md-block d-lg-block">
                          <div class="integration-list">
                              <ul>
                                  <li>
                                      <div class="fmcg" onclick="window.open('/industries/fmcg', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>FMCG
                                          </div>
                                      </div>



                                      <div class="cosmetic" onclick="window.open('/industries/cosmetic','_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Cosmetic
                                          </div>
                                      </div>
                                  </li>
                                  <li>
                                      <div class="agri" onclick="window.open('/industries/agriculture', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Agriculture
                                          </div>
                                      </div>
                                      <div class="hardware" onclick="window.open('/industries/hardware', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Hardware
                                          </div>
                                      </div>
                                  </li>
                                  <li>
                                      <div class="transport" onclick="window.open('/industries/transport', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Transport
                                          </div>
                                      </div>
                                  </li>
                                  <li>
                                      <div class="electronics" onclick="window.open('/industries/electronics', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Electronics
                                          </div>
                                      </div>
                                      <div class="pharmacy" onclick="window.open('/industries/pharmacy', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Pharmacy
                                          </div>
                                      </div>
                                  </li>
                                  <li>
                                      <div class="automotive" onclick="window.open('/industries/automotive', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Automotive
                                          </div>
                                      </div>
                                  </li>
                                  <li>
                                      <div class="manufacturing" onclick="window.open('/industries/manufacturing', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Manufacturing
                                          </div>
                                      </div>
                                      <div class="publish" onclick="window.open('/industries/publishing', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Publishing
                                          </div>
                                      </div>
                                  </li>
                                  <li>
                                      <div class="sports" onclick="window.open('/industries/sport-and-fitness', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Sports & Fitness
                                          </div>
                                      </div>
                                      <div class="telecom" onclick="window.open('/industries/telecommunication', '_blank');" style="cursor: pointer;">
                                          <div>
                                              <span>&nbsp;</span>Telecommunication
                                          </div>
                                      </div>
                                  </li>
                              </ul>
                          </div>
                      </div>    

                  </div>
              </div>
          </div>
      </div>
  </section>
        `;
    }
  }
  
  customElements.define("industry-component", Industry);
  