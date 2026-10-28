
// Anonymous tool use only. No lead collection or completed conversion is inferred.
window.salesonTrack = window.salesonTrack || function(eventName, data) {
  if (eventName !== 'tool_opened') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event: eventName, page: String(data?.page || '').replace(/[^a-z0-9_-]/gi, '').slice(0,80)});
};

