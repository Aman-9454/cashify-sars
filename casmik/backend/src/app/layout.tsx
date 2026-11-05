export const metadata = {
  title: 'Camsik Backend API',
  description: 'REST API & Multi-Tenant Database Engine for Camsik ReCommerce Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'monospace', backgroundColor: '#0b0f19', color: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}

