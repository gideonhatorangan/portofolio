const { useEffect, useRef, useState } = React;

const EMAILJS_SERVICE_ID = "service_36m1zqs";
const EMAILJS_TEMPLATE_ID = "template_ncdl74r";
const EMAILJS_PUBLIC_KEY = "DC3DBwEBOnuLt4S_w";
const STATUS_INITIAL = { type: "idle", key: null };
const FALLBACK_TRANSLATIONS = {
  id: {
    "contact.form.nameLabel": "Nama",
    "contact.form.namePlaceholder": "Masukkan nama Anda",
    "contact.form.emailLabel": "Email",
    "contact.form.emailPlaceholder": "nama@email.com",
    "contact.form.subjectLabel": "Subjek",
    "contact.form.subjectPlaceholder": "Topik pesan",
    "contact.form.messageLabel": "Pesan",
    "contact.form.messagePlaceholder": "Tuliskan pesan Anda",
    "contact.form.submit": "Kirim",
    "contact.form.sending": "Mengirim...",
    "contact.form.status.initError":
      "EmailJS gagal diinisialisasi. Muat ulang halaman.",
    "contact.form.status.notReady":
      "EmailJS belum siap. Silakan muat ulang halaman.",
    "contact.form.status.validation":
      "Lengkapi semua kolom dengan benar sebelum mengirim.",
    "contact.form.status.sending": "Mengirim pesan...",
    "contact.form.status.success": "Terima kasih! Pesan berhasil dikirim.",
    "contact.form.status.error":
      "Pengiriman gagal. Coba lagi beberapa saat lagi.",
    "contact.form.toast.close": "Tutup",
    "contact.form.toast.closeLabel": "Tutup notifikasi",
  },
};

function ContactForm() {
  const initialLang =
    window.currentLang || document.documentElement.lang || "id";
  const [lang, setLang] = useState(initialLang);
  const [status, setStatus] = useState(STATUS_INITIAL);
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef(null);
  const timerRef = useRef(null);

  const translate = (key) => {
    const dictionaries = window.TRANSLATIONS || {};
    const baseCurrent = {
      ...(lang === "id" ? FALLBACK_TRANSLATIONS.id : {}),
      ...(dictionaries[lang] || {}),
    };
    const baseFallback = {
      ...(FALLBACK_TRANSLATIONS.id || {}),
      ...(dictionaries.id || {}),
    };
    if (baseCurrent[key]) return baseCurrent[key];
    return baseFallback[key] || "";
  };

  useEffect(() => {
    if (window.emailjs && typeof window.emailjs.init === "function") {
      try {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
      } catch (error) {
        console.error("EmailJS init error:", error);
        setStatus({ type: "error", key: "contact.form.status.initError" });
      }
    } else {
      setStatus({ type: "error", key: "contact.form.status.notReady" });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (event) => {
      const nextLang =
        event?.detail?.lang || document.documentElement.lang || "id";
      setLang(nextLang);
    };
    window.addEventListener("app:languagechange", handler);
    return () => {
      window.removeEventListener("app:languagechange", handler);
    };
  }, []);

  const showStatus = (type, key, autoHide) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStatus({ type, key });

    const shouldAutoHide =
      autoHide === true || (typeof autoHide === "number" && autoHide > 0);

    if (shouldAutoHide) {
      const delay = typeof autoHide === "number" ? autoHide : 5000;
      timerRef.current = setTimeout(() => {
        setStatus(STATUS_INITIAL);
      }, delay);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const honeypot = form.querySelector('[name="hp_field"]');
    if (honeypot && honeypot.value) {
      form.reset();
      return;
    }

    if (!window.emailjs || typeof window.emailjs.sendForm !== "function") {
      showStatus("error", "contact.form.status.notReady");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      showStatus("error", "contact.form.status.validation");
      return;
    }

    const submittedAtField = form.querySelector('[name="submitted_at"]');
    if (submittedAtField) {
      submittedAtField.value = new Date().toISOString();
    }

    const pageUrlField = form.querySelector('[name="page_url"]');
    if (pageUrlField) {
      pageUrlField.value = window.location.href;
    }

    setIsSending(true);
    showStatus("info", "contact.form.status.sending");

    window.emailjs
      .sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(() => {
        form.reset();
        setIsSending(false);
        showStatus("success", "contact.form.status.success", true);
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        setIsSending(false);
        showStatus("error", "contact.form.status.error");
      });
  };

  const dismissToast = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setStatus(STATUS_INITIAL);
  };

  const statusClass =
    status.type === "error"
      ? "form-status is-error"
      : status.type === "info"
      ? "form-status is-info"
      : "form-status";

  const inlineMessage =
    status.type === "error" || status.type === "info"
      ? translate(status.key || "")
      : "\u00A0";

  const buttonLabel = isSending
    ? translate("contact.form.sending")
    : translate("contact.form.submit");

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="contact-form"
        id="contactFormReact"
        noValidate
      >
        <input
          type="text"
          name="hp_field"
          tabIndex="-1"
          autoComplete="off"
          className="contact-honeypot"
          aria-hidden="true"
        />
        <label>
          <span>{translate("contact.form.nameLabel")}</span>
          <input
            type="text"
            name="name"
            placeholder={translate("contact.form.namePlaceholder")}
            required
            autoComplete="name"
            minLength="2"
          />
        </label>
        <label>
          <span>{translate("contact.form.emailLabel")}</span>
          <input
            type="email"
            name="email"
            placeholder={translate("contact.form.emailPlaceholder")}
            required
            autoComplete="email"
          />
        </label>
        <label>
          <span>{translate("contact.form.subjectLabel")}</span>
          <input
            type="text"
            name="subject"
            placeholder={translate("contact.form.subjectPlaceholder")}
            required
            autoComplete="off"
            minLength="3"
          />
        </label>
        <label>
          <span>{translate("contact.form.messageLabel")}</span>
          <textarea
            name="message"
            rows="4"
            placeholder={translate("contact.form.messagePlaceholder")}
            required
            minLength="10"
          />
        </label>
        <input type="hidden" name="page_url" />
        <input type="hidden" name="submitted_at" />
        <button
          type="submit"
          className="btn primary btn-contact"
          disabled={isSending}
        >
          {buttonLabel}
        </button>
        <p className={statusClass} role="status" aria-live="polite">
          {inlineMessage}
        </p>
      </form>

      {status.type === "success" && (
        <div
          className="contact-toast contact-toast--success"
          role="status"
          aria-live="polite"
        >
          <span>{translate(status.key || "")}</span>
          <button
            type="button"
            className="contact-toast__close"
            onClick={dismissToast}
            aria-label={translate("contact.form.toast.closeLabel")}
          >
            {translate("contact.form.toast.close")}
          </button>
        </div>
      )}
    </>
  );
}

const mountNode = document.getElementById("contact-root");
if (mountNode) {
  ReactDOM.createRoot(mountNode).render(<ContactForm />);
}
