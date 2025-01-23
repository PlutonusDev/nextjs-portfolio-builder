import { type AppProps } from 'next/app';
import '../styles/globals.css';

import { Plus_Jakarta_Sans } from "next/font/google";
const PlusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

export default ({ Component, pageProps }: AppProps) => {
  return (
    <main className={PlusJakartaSans.className}>
      <Component {...pageProps} />;
    </main>
  );
}