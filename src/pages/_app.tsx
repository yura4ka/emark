/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { AppProps, AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "../utils/api";
import "../styles/globals.css";
import Navbar from "../components/Navbar/Navbar";
import PageFooter from "../components/Footer";
import { Flowbite } from "flowbite-react";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import Head from "next/head";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  const layout = getLayout(<Component {...pageProps} />);
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Flowbite>
        <SessionProvider session={session}>
          <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
            <Navbar session={session} />
            {Component.getLayout ? (
              layout
            ) : (
              <main className="mx-auto w-full max-w-7xl p-2.5">
                <Component {...pageProps} />
              </main>
            )}
            <PageFooter />
          </div>
        </SessionProvider>
      </Flowbite>
    </>
  );
};

export default api.withTRPC(MyApp);
