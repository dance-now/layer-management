import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserContextProvider } from "../src/contexts/UserContext";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <Component {...pageProps} />
    </UserContextProvider>
  );
}

export default MyApp;
