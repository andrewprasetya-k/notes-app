import "@/styles/globals.css";
import "tiptap/dist/tiptap.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
