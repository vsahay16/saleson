class Testimonial extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
    const source = this.getAttribute('source');
    const path = source === 'compare' ? '../' : '';
      this.innerHTML = `
      <section class="feature-section ptb-120 testimonial bg-sec-light" id="testimonials">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-10 col-lg-8">
                        <div class="section-heading text-center">
                            <h2>Loved by 4000+ customers</h2>
                             <p>Here's what some of them have to say about SalesOn!</p>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-lg-12">
                        <div class="appie-testimonial-slider testimonial-cont">
                            <div class="appie-testimonial-item">
                                <div class="testi-wrap">
                                    <div class="ht-150">
                                    <img src="/assets/img/brands/fujitec-express.jpg" loading="lazy" alt="testimonial" title="testimonial"
                                        width="150px">
                                    </div>
                                    <div class="text">
                                        <p class="testi-para"> From inventory management to scheduling and reporting, it's a one-stop solution that has significantly increased our efficiency and productivity.
                                        </p>
                                    </div>
                                    <div class="author-info">
                                        <img src="/assets/img/fujitec.jpeg" loading="lazy" alt="testimonial" title="testimonial" height="115px"
                                            width="115px">
                                        <div class="title">Amit Mahto
                                            <p>CFO, Fujitec Express Lifts</p>
                                        </div>
                                        <!-- <span>Narayan Enterprises</span> -->
                                    </div>
                                </div>
                                <div class="quote-wrap"><i class="bi bi-chat-square-quote"></i></div>
                            </div>
                            <div class="appie-testimonial-item">
                                <div class="testi-wrap">
                                    <div class="ht-150">
                                    <img src="/assets/img/brands/guin-agr-logo.png" loading="lazy" alt="testimonial" title="testimonial"
                                        width="150px">
                                        </div>
                                    <div class="text">
                                        <p class="testi-para"> Very nice app. Using for last 1 year. Each and every tools are useful.
                                             New addition of van sales, location tracking, and others are very useful for my distribution business. Also, support systems are highly commendable.
                                        </p>
                                    </div>
                                    <div class="author-info">
                                        <!-- <img src="/assets/img/narayan.jpeg" loading="lazy" alt="testimonial" title="testimonial" height="115px"
                                            width="115px"> -->
                                        <div class="title">Surojit Guin
                                            <p>Founder, Guin Agri Solutions Pvt. Ltd.</p>
                                        </div>
                                        <!-- <span>Narayan Enterprises</span> -->
                                    </div>
                                </div>
                                <div class="quote-wrap"><i class="bi bi-chat-square-quote"></i></div>
                            </div>
                            <div class="appie-testimonial-item">
                                <div class="testi-wrap">
                                <div class="ht-150">
                                    <img src="/assets/img/brands/stigor.jpg" loading="lazy" alt="testimonial" title="testimonial"
                                        width="150px">
                                </div>
                                    <div class="text">
                                        <p class="testi-para">  SalesOn seamlessly integrates with our existing systems, making the transition smooth and hassle-free. The user-friendly interface ensures that our team embraced the new tool with minimal training.</p>
                                    </div>
                                    <div class="author-info">
                                        <img src="/assets/img/stigor.jpeg" loading="lazy" alt="testimonial" title="testimonial" height="115px"
                                            width="115px">
                                        <div class="title">Rituakanksha Kumar
                                            <p>Founder, Stigor</p>
                                        </div>
                                        <!-- <span>Narayan Enterprises</span> -->
                                    </div>
                                </div>
                                <div class="quote-wrap"><i class="bi bi-chat-square-quote"></i></div>
                            </div>
                            <div class="appie-testimonial-item">
                                <div class="testi-wrap">
                                    <div class="ht-150">
                                    <img src="/assets/img/brands/sharma.png" loading="lazy" alt="testimonial" title="testimonial"
                                        width="150px">
                                    </div>
                                    <div class="text">
                                        <p class="testi-para">  Excellent, this is one of the best software I used, user friendly, easy to understand, I moved all my work with this app. The real-time visibility into on-field activities has provided our management with a comprehensive overview of our sales operations.  Thank you</p>
                                    </div>
                                    <div class="author-info">
                                        <img src="/assets/img/sharma.png" loading="lazy" alt="testimonial" title="testimonial" height="115px"
                                            width="115px">
                                        <div class="title">Ashutosh Sharma
                                            <p>Sales Head, Sharma Industries</p>
                                        </div>
                                        <!-- <span>Narayan Enterprises</span> -->
                                    </div>
                                </div>
                                <div class="quote-wrap"><i class="bi bi-chat-square-quote"></i></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;
    }
  }
  
  customElements.define("testimonial-component", Testimonial);
  