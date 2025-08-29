// src/app/layout.js
import "./globals.scss";

export const metadata = {
  title: "UnlockTheWishes - Aladdin Buzzer",
} as const;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
} as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js').catch(()=>{});
            }
          `
        }} />
      </body>
    </html>
  );
}
