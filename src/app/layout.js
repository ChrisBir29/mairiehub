export const metadata = {
  title: 'MairieHub — Morvillars',
  description: 'Cockpit du Maire de Morvillars',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1B3A5C" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%231B3A5C'/><text x='50%25' y='55%25' dominant-baseline='middle' text-anchor='middle' font-size='40'>🏛</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Inter', -apple-system, sans-serif", background: '#F3F5F8' }}>
        {children}
      </body>
    </html>
  );
}
