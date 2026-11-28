"use client";

import { socialLoginAction } from "@/actions/auth";
import { useEffect, useRef, useState, useTransition } from "react";

const round =
  "flex h-10 w-10 items-center justify-center rounded-full border border-subtle bg-white disabled:cursor-not-allowed disabled:opacity-50";

// Google wants initialize() called once per page, however often the buttons appear (changing pages in the
// app, development reloads). So the client id it was started with and who receives the token are kept here.
let googleReadyFor = null;
let googleReceiver = null;

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function FacebookF() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="#1877F2" />
      <path
        fill="#fff"
        d="M22.3 31v-9.6h3.2l.5-3.8h-3.7v-2.4c0-1.1.3-1.8 1.9-1.8h2V10c-.3 0-1.5-.1-2.9-.1-2.9 0-4.8 1.7-4.8 4.9v2.8H15V21.4h3.5V31h3.8z"
      />
    </svg>
  );
}

// "Sign in / sign up with social media". Google: Google's own round button (an ID token goes to Bagisto).
// Facebook: the Facebook login window (an access token goes to Bagisto). Bagisto checks the token with the
// provider, finds or creates the customer and answers with the customer token (see actions/auth.js).
export default function SocialLoginButtons({ lang, providers, labels }) {
  const { google, facebook, previewGoogle, previewFacebook } = providers;
  const googleRef = useRef(null);
  const submitRef = useRef(null);
  const [error, setError] = useState(null);
  const [pending, startTransition] = useTransition();

  submitRef.current = (provider, token) => {
    setError(null);
    startTransition(async () => {
      const result = await socialLoginAction(lang, provider, token);
      if (result?.error) setError(result.error);
    });
  };

  // Google
  useEffect(() => {
    if (!google?.id) return;

    let cancelled = false;
    let script = document.querySelector("script[data-gsi]");

    const start = () => {
      if (cancelled || !window.google?.accounts?.id || !googleRef.current) return;

      googleReceiver = (token) => submitRef.current("google", token);

      if (googleReadyFor !== google.id) {
        window.google.accounts.id.initialize({
          client_id: google.id,
          callback: (response) => response?.credential && googleReceiver?.(response.credential),
        });
        googleReadyFor = google.id;
      }
      googleRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleRef.current, {
        type: "icon",
        shape: "circle",
        theme: "outline",
        size: "large",
      });
    };

    if (window.google?.accounts?.id) {
      start();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.dataset.gsi = "1";
        document.head.appendChild(script);
      }
      script.addEventListener("load", start);
    }

    return () => {
      cancelled = true;
      script?.removeEventListener("load", start);
    };
  }, [google]);

  // Facebook
  useEffect(() => {
    if (!facebook?.id || document.getElementById("facebook-jssdk")) return;

    window.fbAsyncInit = () => {
      window.FB.init({ appId: facebook.id, cookie: false, xfbml: false, version: "v23.0" });
    };

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [facebook]);

  function loginWithFacebook() {
    if (!window.FB) {
      setError(labels.notReady);
      return;
    }

    window.FB.login(
      (response) => {
        const token = response?.authResponse?.accessToken;
        if (token) submitRef.current("facebook", token);
      },
      { scope: "public_profile,email" }
    );
  }

  if (!google && !facebook && !previewGoogle && !previewFacebook) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs text-body">
        <span className="h-px flex-1 bg-subtle" />
        <span>{labels.or}</span>
        <span className="h-px flex-1 bg-subtle" />
      </div>

      <p className="mt-3 text-center text-sm text-body">{labels.line}</p>

      <div className="mt-3 flex items-center justify-center gap-3">
        {google ? (
          <span ref={googleRef} className="inline-flex h-10 min-w-10 items-center justify-center" aria-label={labels.google} />
        ) : previewGoogle ? (
          <button type="button" disabled title={labels.preview} aria-label={labels.google} className={round}>
            <GoogleG />
          </button>
        ) : null}

        {facebook ? (
          <button type="button" onClick={loginWithFacebook} disabled={pending} aria-label={labels.facebook} className="h-10 w-10 rounded-full disabled:opacity-60">
            <FacebookF />
          </button>
        ) : previewFacebook ? (
          <button type="button" disabled title={labels.preview} aria-label={labels.facebook} className="h-10 w-10 rounded-full opacity-50">
            <FacebookF />
          </button>
        ) : null}
      </div>

      {pending && <p className="mt-3 text-center text-xs text-body">{labels.wait}</p>}

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
