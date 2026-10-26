window.SalesOnHandoff = (() => {
    const MAX_AGE_MS = 6 * 60 * 60 * 1000;
  
    const routes = Object.freeze({
      invoice: "/tools/gst-invoice-generator",
      quotation: "/tools/quotation-generator",
      receipt: "/tools/payment-receipt-generator",
      purchaseOrder: "/tools/purchase-order-generator",
      challan: "/tools/delivery-challan-generator",
      reorder: "/tools/stock-reorder-level-calculator",
      outstanding: "/tools/outstanding-payment-tracker"
    });
  
    function payloadTime(data) {
      const d = Array.isArray(data) ? data[0] : data;
  
      const raw = Number(d?.__salesonHandoffAt) ||
        Date.parse(
          d?.selectedAt ||
          d?.convertedAt ||
          d?.checkedAt ||
          ""
        ) || 0;
      return Number.isFinite(raw) ? raw : 0;
    }
  
    function put(key, payload) {
      if (!payload || typeof payload !== 'object' || (Array.isArray(payload) && payload.length === 0)) return false;
      try {
        const stamp = Date.now();
  
        const value = Array.isArray(payload)
          ? payload.map(item => ({
              ...item,
              __salesonHandoffAt: stamp
            }))
          : {
              ...payload,
              __salesonHandoffAt: stamp
            };
  
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (error) {
        console.error("[SalesOn handoff write failed]", key, error);
        return false;
      }
    }
  
    function takeLatest(definitions) {
      const found = [];
  
      definitions.forEach(definition => {
        try {
          const raw = localStorage.getItem(definition.key);
          if (!raw) return;
          const data = JSON.parse(raw);
          if (!data || typeof data !== 'object' || (Array.isArray(data) && data.length === 0)) return;
          const records = Array.isArray(data) ? data : [data];
          if (records.some(item => !item || typeof item !== 'object' || Array.isArray(item) || Object.keys(item).length === 0)) return;
          const at = payloadTime(data);
          const age = Date.now() - at;
          // Retain legacy undated payloads; reject stale or implausibly future data.
          if (!at || (age >= -5 * 60 * 1000 && age <= MAX_AGE_MS)) {
            found.push({
              ...definition,
              data,
              at
            });
          }
        } catch (error) {
          console.error(
            "[SalesOn handoff parse failed]",
            definition.key,
            error
          );
        }
      });
  
      found.sort((a, b) => (b.at || 0) - (a.at || 0));
      const selected = found[0] || null;
      if (selected) {
        try {
          // Consume only the selected payload. Other drafts remain available.
          localStorage.removeItem(selected.key);
        } catch (_) {
          // An import must not repeat indefinitely when storage cannot be updated.
          return null;
        }
      }
      return selected;
    }
  
    function take(key) {
      return takeLatest([{ key, kind: key }])?.data || null;
    }
  
    function set(id, value) {
      const element = document.getElementById(id);
  
      if (!element || value === undefined || value === null) {
        return;
      }
  
      if (
        typeof value === "boolean" &&
        (element.type === "checkbox" || element.type === "radio")
      ) {
        element.checked = value;
      } else {
        element.value = String(value);
      }
    }
  
    function select(id, value) {
      const selectElement = document.getElementById(id);
      if (!selectElement || value === undefined || value === null) {
        return "";
      }
  
      const needle = String(value).trim().toLowerCase();
  
      const option = [...selectElement.options].find(item => {
        const optionValue = String(item.value).trim().toLowerCase();
        const optionText = item.textContent.trim().toLowerCase();
  
        return (
          optionValue === needle ||
          optionText === needle ||
          optionText.endsWith("— " + needle) ||
          optionText.endsWith("- " + needle)
        );
      });
  
      if (!option) return "";
  
      selectElement.value = option.value;
      return option.value;
    }
  
    return {
      routes,
      put,
      take,
      takeLatest,
      set,
      select
    };
  })();
