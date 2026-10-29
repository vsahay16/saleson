/* An iframe load is not a booking confirmation or a completed conversion. */
(()=>{const frame=document.querySelector('.demo-calendar iframe'),status=document.getElementById('booking-loading');if(!frame||!status)return;frame.addEventListener('load',()=>{status.textContent='If the calendar is blank or slow, use “Open booking calendar” beside the calendar.';});})();
