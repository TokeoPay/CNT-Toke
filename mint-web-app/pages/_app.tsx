import "@/styles/globals.css";
import "@meshsdk/react/styles.css";
import { MeshProvider } from "@meshsdk/react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
    return (<MeshProvider><Component {...pageProps} /></MeshProvider>);
}
