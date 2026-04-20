import './globals.css';
import AppChrome from '../components/layout/AppChrome';

export const metadata = {
  title: 'AI Employee Scheduler',
  description: 'Next.js frontend for an AI-assisted employee work schedule system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
