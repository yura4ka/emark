import { Card } from "flowbite-react";
import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import MyInput from "../../components/Inputs/MyInput";
import PasswordInput from "../../components/Inputs/PasswordInput";
import SubmitButton from "../../components/SubmitButton";

const SignIn: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState({
    value: "",
    confirm: "",
    isCorrect: true,
  });
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = await signIn("credentials", {
      email: email.trim(),
      password: password.value.trim(),
      redirect: false,
    });
    if (data?.error === "AccessDenied") await router.push("/auth/error");
    if (!data?.ok) setIsError(true);
    else await router.push("/");
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Увійти</title>
      </Head>
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-sm">
          <Card>
            <form
              method="post"
              action="/api/auth/callback/credentials"
              onSubmit={(e) => {
                void onSubmit(e);
              }}
              className="flex flex-col gap-4"
            >
              <h5 className="text-xl font-medium text-gray-900 dark:text-white">
                Увійти в акаунт
              </h5>
              <MyInput
                label="Електронна адреса"
                value={email}
                setValue={(value) => {
                  setEmail(value);
                  setIsError(false);
                }}
                placeholder="boris.johnson@knu.ua"
                isValid={!isError}
                hideAdditional={!isError}
                additional="Пароль або пошта не вірні."
              />
              <PasswordInput
                label="Пароль"
                input={password}
                setValue={(value) => {
                  setPassword(value);
                  setIsError(false);
                }}
                type="value"
                additionalText={isError ? "Пароль або пошта не вірні." : ""}
                validationFunction={() => !isError}
              />
              <SubmitButton
                text="Увійти"
                disabled={
                  isError ||
                  email.trim().length === 0 ||
                  password.value.trim().length < 4
                }
                isLoading={isLoading}
              />
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignIn;
