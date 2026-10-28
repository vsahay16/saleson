/* SALESON_LEGACY_QUARANTINE: retained for migration/account audit; never executed. */
if (false) {


/* ---- Meta Pixel ---- */
!(function (f, b, e, v, n, t, s) {
  if (f.fbq) return;
  n = f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = !0;
  n.version = "2.0";
  n.queue = [];
  t = b.createElement(e);
  t.async = !0;
  t.src = v;
  s = b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t, s);
})(
  window,
  document,
  "script",
  "https://connect.facebook.net/en_US/fbevents.js"
);
fbq("init", "24368712786163410");
fbq("track", "PageView");

/* ---- Microsoft Clarity ---- */
(function (c, l, a, r, i, t, y) {
  c[a] =
    c[a] ||
    function () {
      (c[a].q = c[a].q || []).push(arguments);
    };
  t = l.createElement(r);
  t.async = 1;
  t.src = "https://www.clarity.ms/tag/" + i;
  y = l.getElementsByTagName(r)[0];
  y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "xg2o1hk1wt");

/* ---- LinkedIn Insight Tag ---- */
_linkedin_partner_id = "10538113";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
(function (l) {
  if (!l) {
    window.lintrk = function (a, b) {
      window.lintrk.q.push([a, b]);
    };
    window.lintrk.q = [];
  }
  var s = document.getElementsByTagName("script")[0];
  var b = document.createElement("script");
  b.type = "text/javascript";
  b.async = true;
  b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
  s.parentNode.insertBefore(b, s);
})(window.lintrk);


}
/* ---- FAQ accordion (shared markup: .faq-item / .faq-list / .faq-q / .faq-a) ---- */
function toggleFaq(btn) {
  const isOpen = btn.classList.contains("open");
  document.querySelectorAll(".faq-q").forEach((b) => {
    b.classList.remove("open");
    b.setAttribute("aria-expanded", "false");
  });
  document
    .querySelectorAll(".faq-a")
    .forEach((a) => a.classList.remove("open"));
  if (!isOpen) {
    btn.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    btn.nextElementSibling.classList.add("open");
  }
}

/* ---- In-page smooth-scroll + scroll-reveal ---- */
document.addEventListener("DOMContentLoaded", function () {
  var offset =
    typeof window.SALESON_SCROLL_OFFSET === "number"
      ? window.SALESON_SCROLL_OFFSET
      : 90;
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var t = document.querySelector(a.getAttribute("href"));
      if (t) {
        e.preventDefault();
        window.scrollTo({
          top: t.getBoundingClientRect().top + window.pageYOffset - offset,
          behavior: "smooth",
        });
      }
    });
  });

  var threshold =
    typeof window.SALESON_REVEAL_THRESHOLD === "number"
      ? window.SALESON_REVEAL_THRESHOLD
      : 0.07;
  var ro = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("vis");
      });
    },
    { threshold: threshold }
  );
  document.querySelectorAll(".reveal").forEach(function (el) {
    ro.observe(el);
  });
});
