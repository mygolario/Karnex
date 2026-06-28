"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

function getInitialConsentLocal(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem("cookieConsent");
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function PostHogAnalytics() {
  const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
  const [consented, setConsented] = useState<boolean | null>(null);

  useEffect(() => {
    setConsented(getInitialConsentLocal());
    const onStorage = () => setConsented(getInitialConsentLocal());
    window.addEventListener("storage", onStorage);
    window.addEventListener("cookie-consent-change", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cookie-consent-change", onStorage);
    };
  }, []);

  if (!POSTHOG_KEY || consented !== true) {
    return null;
  }

  return (
    <>
      <Script src={`${POSTHOG_HOST}/static/array.js`} strategy="lazyOnload" />
      <Script id="posthog-init" strategy="lazyOnload">
        {`
          !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
          posthog.init('${POSTHOG_KEY}', { api_host: '${POSTHOG_HOST}', person_profiles: 'identified_only' });
        `}
      </Script>
    </>
  );
}
