import './globals.css';

export const metadata = {
  title: 'TRAMO Technologies | Technology built for Zambia',
  description:
    'TRAMO Technologies delivers software, network engineering, and digital infrastructure for businesses in Zambia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}