import './globals.css';

export const metadata = {
  title: 'Lucky Seat',
  description: 'Choose one lucky seat'
};

export default function RootLayout({ children }) {
  return <html lang="ru"><body>{children}</body></html>;
}
