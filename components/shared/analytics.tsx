"use client";

import Script from "next/script";

export function GoogleAnalytics() {
  // Use environment variable or constant
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX'; 

  if (!process.env.NEXT_PUBLIC_GA_ID) {
      // Don't render script if ID is not set to avoid errors or tracking dev
      // console.warn("Google Analytics ID not set.");
      // return null; 
      // User requested implementation, so rendering placeholder with comment.
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
