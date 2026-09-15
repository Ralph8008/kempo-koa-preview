(() => {
  const SUPABASE_URL = "https://tnkiwyrybxlxilacdoly.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRua2l3eXJ5YnhseGlsYWNkb2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NjY4MjEsImV4cCI6MjEwNTA0MjgyMX0.wIkm6eWjNmiMax80a5NkfkVGP3I1hbiHZZM837BMb2E";
  const BUCKET = "feedback-screenshots";
  const MAX_FILES = 3;
  const MAX_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/heic", "image/heif"];

  const css = `
    .fb-btn{position:fixed;right:16px;bottom:60px;z-index:70;display:inline-flex;align-items:center;gap:8px;
      background:#F5C518;color:#12100E;border:none;border-radius:999px;padding:10px 16px;min-height:44px;
      font:700 12px/1 'Chivo',system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;
      box-shadow:0 6px 20px rgba(0,0,0,.45);}
    .fb-btn:hover{background:#EFE9DD;}
    .fb-btn:focus-visible,.fb-dialog :focus-visible{outline:2px solid #F5C518;outline-offset:3px;}
    .fb-backdrop{position:fixed;inset:0;z-index:80;background:rgba(10,9,8,.72);display:flex;align-items:flex-end;justify-content:center;padding:16px;}
    .fb-backdrop[hidden]{display:none;}
    @media (min-width:640px){.fb-backdrop{align-items:center;}}
    .fb-dialog{width:100%;max-width:480px;max-height:calc(100dvh - 32px);overflow-y:auto;background:#191613;color:#EFE9DD;
      border:1px solid rgba(239,233,221,.14);border-radius:4px;padding:24px;box-sizing:border-box;font:400 15px/1.5 'Chivo',system-ui,sans-serif;}
    .fb-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:6px;}
    .fb-title{margin:0;font:900 28px/1 'Big Shoulders Display',system-ui,sans-serif;text-transform:uppercase;}
    .fb-close{background:none;border:1px solid rgba(239,233,221,.3);color:#EFE9DD;border-radius:2px;min-width:44px;min-height:44px;
      font:700 11px/1 'Chivo',system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;padding:0 12px;}
    .fb-intro{margin:0 0 18px;color:rgba(239,233,221,.7);font-size:14px;}
    .fb-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
    .fb-label{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(239,233,221,.6);}
    .fb-input,.fb-textarea{background:#12100E;color:#EFE9DD;border:1px solid rgba(239,233,221,.25);border-radius:2px;
      padding:10px 12px;font:400 16px/1.4 'Chivo',system-ui,sans-serif;width:100%;box-sizing:border-box;}
    .fb-textarea{min-height:120px;resize:vertical;}
    .fb-hint{font-size:12px;color:rgba(239,233,221,.5);}
    .fb-files{font-size:13px;color:rgba(239,233,221,.8);margin:0;padding-left:18px;}
    .fb-status{min-height:1.5em;margin:4px 0 14px;font-size:14px;}
    .fb-status.fb-error{color:#ff8a8d;}
    .fb-status.fb-ok{color:#F5C518;}
    .fb-submit{width:100%;background:#D8161C;color:#EFE9DD;border:none;border-radius:2px;min-height:48px;cursor:pointer;
      font:700 13px/1 'Chivo',system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;}
    .fb-submit:hover{background:#F5C518;color:#12100E;}
    .fb-submit[disabled]{opacity:.6;cursor:progress;}
  `;

  const el = (tag, attrs = {}, text) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (text) node.textContent = text;
    return node;
  };

  function build() {
    const style = el("style");
    style.textContent = css;
    document.head.appendChild(style);

    const button = el("button", { type: "button", class: "fb-btn", "aria-haspopup": "dialog" }, "Feedback");

    const backdrop = el("div", { class: "fb-backdrop", hidden: "" });
    const dialog = el("div", { class: "fb-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "fb-title" });
    const head = el("div", { class: "fb-head" });
    head.append(el("h2", { class: "fb-title", id: "fb-title" }, "Feedback geven"), el("button", { type: "button", class: "fb-close" }, "Sluiten"));
    const intro = el("p", { class: "fb-intro" }, "Mis je iets, is iets onduidelijk, of heb je een tip? Laat het weten. Een screenshot helpt ons te zien wat je bedoelt.");

    const form = el("form", { novalidate: "" });

    const msgField = el("div", { class: "fb-field" });
    msgField.append(el("label", { class: "fb-label", for: "fb-message" }, "Je feedback"),
      el("textarea", { class: "fb-textarea", id: "fb-message", name: "message", maxlength: "5000", required: "" }));

    const nameField = el("div", { class: "fb-field" });
    nameField.append(el("label", { class: "fb-label", for: "fb-name" }, "Naam (mag leeg)"),
      el("input", { class: "fb-input", id: "fb-name", name: "name", type: "text", maxlength: "100", autocomplete: "name" }));

    const fileField = el("div", { class: "fb-field" });
    const fileInput = el("input", { class: "fb-input", id: "fb-files", name: "screenshots", type: "file", accept: ALLOWED_TYPES.join(","), multiple: "" });
    const fileList = el("ul", { class: "fb-files" });
    fileField.append(el("label", { class: "fb-label", for: "fb-files" }, "Screenshots (mag leeg)"), fileInput,
      el("span", { class: "fb-hint" }, `Maximaal ${MAX_FILES} afbeeldingen, elk tot 5 MB.`), fileList);

    const status = el("p", { class: "fb-status", role: "status", "aria-live": "polite" });
    const submit = el("button", { type: "submit", class: "fb-submit" }, "Versturen");

    form.append(msgField, nameField, fileField, status, submit);
    dialog.append(head, intro, form);
    backdrop.append(dialog);
    document.body.append(button, backdrop);

    const message = form.querySelector("#fb-message");
    const closeBtn = head.querySelector(".fb-close");

    const setStatus = (text, kind) => {
      status.textContent = text;
      status.className = "fb-status" + (kind ? " fb-" + kind : "");
    };

    const open = () => {
      backdrop.hidden = false;
      document.body.style.overflow = "hidden";
      message.focus();
    };
    const close = () => {
      backdrop.hidden = true;
      document.body.style.overflow = "";
      button.focus();
    };

    const validFiles = () => {
      const files = Array.from(fileInput.files || []);
      if (files.length > MAX_FILES) return { error: `Kies maximaal ${MAX_FILES} screenshots.` };
      const tooBig = files.find((f) => f.size > MAX_BYTES);
      if (tooBig) return { error: `"${tooBig.name}" is groter dan 5 MB. Kies een kleinere afbeelding.` };
      const wrongType = files.find((f) => f.type && !ALLOWED_TYPES.includes(f.type));
      if (wrongType) return { error: `"${wrongType.name}" is geen afbeelding. Kies een PNG, JPG, WEBP, GIF of HEIC.` };
      return { files };
    };

    fileInput.addEventListener("change", () => {
      fileList.replaceChildren(...Array.from(fileInput.files || []).map((f) => el("li", {}, f.name)));
      const check = validFiles();
      setStatus(check.error || "", check.error ? "error" : "");
    });

    button.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !backdrop.hidden) close(); });

    const headers = (extra) => ({ apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, ...extra });

    const safeName = (name) => name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-60) || "screenshot";

    async function uploadFile(file) {
      const day = new Date().toISOString().slice(0, 10);
      const path = `${day}/${crypto.randomUUID()}-${safeName(file.name)}`;
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
        method: "POST",
        headers: headers({ "Content-Type": file.type || "application/octet-stream", "x-upsert": "false" }),
        body: file,
      });
      if (!res.ok) throw new Error(`upload ${res.status}`);
      return path;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = message.value.trim();
      if (!text) {
        setStatus("Vul eerst je feedback in.", "error");
        message.focus();
        return;
      }
      const check = validFiles();
      if (check.error) {
        setStatus(check.error, "error");
        return;
      }

      submit.disabled = true;
      setStatus(check.files.length ? "Screenshots uploaden…" : "Versturen…");
      try {
        const paths = [];
        for (const file of check.files) paths.push(await uploadFile(file));
        setStatus("Versturen…");
        const res = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
          method: "POST",
          headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
          body: JSON.stringify({
            message: text,
            name: form.querySelector("#fb-name").value.trim() || null,
            page_url: location.href.slice(0, 500),
            page_title: document.title.slice(0, 300),
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            user_agent: navigator.userAgent.slice(0, 500),
            screenshot_paths: paths,
          }),
        });
        if (!res.ok) throw new Error(`insert ${res.status}`);
        form.reset();
        fileList.replaceChildren();
        setStatus("Bedankt! Je feedback is verstuurd.", "ok");
      } catch (err) {
        console.error("[feedback]", err);
        setStatus("Versturen is niet gelukt. Controleer je internetverbinding en probeer het opnieuw.", "error");
      } finally {
        submit.disabled = false;
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
