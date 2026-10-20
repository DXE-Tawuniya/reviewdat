/* @ds-bundle: {"format":4,"namespace":"Reviewdat","components":[{"name":"Button"},{"name":"TextField"},{"name":"Card"},{"name":"Badge"},{"name":"Rating"},{"name":"Tabs"},{"name":"Alert"}]} */
(function () {
  var React = window.React, h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  var PATHS = {
    check: "M20 6 9 17l-5-5",
    info: "M12 16v-4M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    warning: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z",
    danger: "M12 8v4M12 16h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z",
    success: "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3"
  };
  function Icon(name) {
    return h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, h("path", { d: PATHS[name] }));
  }

  function Button(p) {
    var variant = p.variant || "primary", size = p.size || "md";
    return h("button", Object.assign({ type: "button" }, omit(p, ["variant", "size", "block", "className", "children"]), {
      className: cx("rd-btn", "rd-btn-" + variant, size === "sm" && "rd-btn-sm", p.block && "rd-btn-block", p.className)
    }), p.children);
  }

  var fid = 0;
  function TextField(p) {
    var idRef = React.useRef(p.id || "rd-field-" + (++fid)), id = idRef.current;
    var help = p.error || p.helperText;
    var input = h(p.multiline ? "textarea" : "input", Object.assign({}, omit(p, ["label", "helperText", "error", "multiline", "className"]), {
      id: id, className: "rd-input", "aria-invalid": p.error ? "true" : undefined, "aria-describedby": help ? id + "-help" : undefined
    }));
    return h("div", { className: cx("rd-field", p.error && "rd-field-error", p.className) },
      p.label && h("label", { className: "rd-field-label", htmlFor: id }, p.label),
      input,
      help && h("span", { className: "rd-field-help", id: id + "-help" }, p.error ? [h("span", { key: "i", "aria-hidden": "true" }, "⚠ "), p.error] : help));
  }

  function Card(p) {
    return h("div", { className: cx("rd-card", p.className) },
      (p.title || p.badge) && h("div", { className: "rd-card-head" }, p.title && h("h3", { className: "rd-card-title" }, p.title), p.badge || null),
      p.meta && h("div", { className: "rd-card-meta" }, p.meta),
      p.children);
  }

  function Badge(p) {
    var tone = p.tone || "neutral";
    var icon = tone === "success" ? Icon("check") : tone === "warning" ? Icon("warning") : tone === "danger" ? Icon("danger") : null;
    return h("span", { className: cx("rd-badge", "rd-badge-" + tone, p.className) }, icon, p.children);
  }

  function Star() { return h("svg", { viewBox: "0 0 24 24", width: 20, height: 20, fill: "currentColor", "aria-hidden": "true" }, h("path", { d: "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5z" })); }
  function Rating(p) {
    var max = p.max || 5, value = p.value || 0, interactive = !!p.onChange;
    var stars = [];
    for (var i = 1; i <= max; i++) {
      (function (n) {
        var on = n <= Math.round(value);
        stars.push(interactive
          ? h("button", { key: n, type: "button", className: cx("rd-star", on && "is-on"), "aria-label": n + " of " + max + " stars", "aria-pressed": n === Math.round(value), onClick: function () { p.onChange(n); } }, Star())
          : h("span", { key: n, className: cx("rd-star", on && "is-on") }, Star()));
      })(i);
    }
    return h("div", { className: cx("rd-rating", interactive && "rd-rating-interactive", p.className), role: interactive ? "group" : "img", "aria-label": (interactive ? "Rate, current " : "Rated ") + value + " out of " + max },
      h("span", { className: "rd-stars" }, stars),
      p.showValue !== false && h("span", { className: "rd-rating-value", "aria-hidden": "true" }, value.toFixed ? value.toFixed(1) : value));
  }

  function Tabs(p) {
    var items = p.items || [], s = React.useState(p.value || (items[0] && items[0].value)), cur = p.value !== undefined ? p.value : s[0];
    return h("div", { className: cx("rd-tabs", p.className), role: "tablist" }, items.map(function (it) {
      return h("button", { key: it.value, type: "button", role: "tab", className: "rd-tab", "aria-selected": it.value === cur ? "true" : "false",
        onClick: function () { s[1](it.value); p.onChange && p.onChange(it.value); } }, it.label);
    }));
  }

  function Alert(p) {
    var tone = p.tone || "info";
    return h("div", { className: cx("rd-alert", "rd-alert-" + tone, p.className), role: tone === "danger" ? "alert" : "status" },
      Icon(tone),
      h("div", null, p.title && h("span", { className: "rd-alert-title" }, p.title), p.children));
  }

  window.Reviewdat = Object.assign(window.Reviewdat || {}, { Button: Button, TextField: TextField, Card: Card, Badge: Badge, Rating: Rating, Tabs: Tabs, Alert: Alert });
})();
