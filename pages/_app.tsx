import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserContextProvider } from "../src/contexts/UserContext";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>
      <Component {...pageProps} />
    </UserContextProvider>
  );
}

export default MyApp;
