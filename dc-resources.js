// support.js laadt React/ReactDOM/Babel via unpkg.com. Op hosts met een
// script-CDN-allowlist (zoals Claude Artifacts) is unpkg.com geblokkeerd,
// waardoor de pagina alleen de donkere achtergrond toont. support.js checkt
// eerst window.__resources voordat het naar de vaste unpkg-URL valt — dit
// wijst dezelfde gepinde versies aan op jsdelivr, wel toegestaan.
window.__resources = {
  "https://unpkg.com/react@18.3.1/umd/react.production.min.js":
    "https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js",
  "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js":
    "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js",
  "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js":
    "https://cdn.jsdelivr.net/npm/@babel/standalone@7.29.0/babel.min.js"
};
