/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { AppProps, AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "../utils/api";
import "../styles/globals.css";
import { NavBar, PageFooter } from "../components";
import { Flowbite } from "flowbite-react";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import Head from "next/head";
import React from "react";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

if (typeof window === "undefined") React.useLayoutEffect = () => undefined;

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
            <NavBar />
            {Component.getLayout ? (
              layout
            ) : (
              <main className="mx-auto w-full max-w-7xl px-2.5 sm:px-0">
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
