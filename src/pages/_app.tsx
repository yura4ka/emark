import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { api } from "../utils/api";
import "../styles/globals.css";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer";
import { Flowbite } from "flowbite-react";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Flowbite>
      <SessionProvider session={session}>
        <div className="grid min-h-screen grid-rows-[auto_1fr_auto]">
          <Navbar session={session} />
          <main>
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
      </SessionProvider>
    </Flowbite>
  );
};

export default api.withTRPC(MyApp);
