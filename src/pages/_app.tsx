import "@/styles/globals.css";
import '@tiptap/core/dist/style.css';
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
