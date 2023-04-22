import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Spinner } from "flowbite-react";
import Head from "next/head";
import { initialPassword } from "../../../utils";
import { PasswordInput, SubmitButton, MyInput } from "../../../components";
import { api } from "../../../utils/api";
import { signIn, useSession } from "next-auth/react";

const SignUpTeacher: NextPage = () => {
  const session = useSession();
  const { push, query } = useRouter();
  const confirmString = query.confirmString?.toString();

  const {
    isLoading,
    data: teacher,
    isError,
  } = api.teacher.getTeacherEmailByConfirmString.useQuery(confirmString || "");
  const confirmTeacher = api.teacher.confirm.useMutation();

  const [password, setPassword] = useState({ ...initialPassword });

  useEffect(() => {
    if (isError) void push("/");
  }, [isError, push]);

  if (session.status === "authenticated") void push("/");
  if (isLoading || !teacher || !confirmString)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confirmTeacher.mutate(
      {
        id: teacher.id,
        confirmString,
        password: password.value.trim(),
      },
      {
        onSuccess: () => {
          void signIn("credentials", {
            email: teacher.email,
            password: password.value.trim(),
            redirect: false,
          });
        },
        onSettled: () => {
          setPassword({ ...initialPassword });
        },
      }
    );
  };

  return (
    <>
      <Head>
        <title>Підтвердити Викладача</title>
      </Head>
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <h5 className="text-xl font-medium text-gray-900 dark:text-white">
                Підтвердити акаунт
              </h5>
              <MyInput
                label="Електронна адреса"
                value={teacher.email}
                setValue={() => false}
                readonly={true}
                placeholder="boris.johnson@knu.ua"
                isValid={!confirmTeacher.isError}
              />
              <PasswordInput
                label="Пароль"
                input={password}
                setValue={setPassword}
                type="value"
                validationFunction={(value) =>
                  (value.length === 0 || value.trim().length >= 4) &&
                  !confirmTeacher.isError
                }
                additionalText="Пароль має містити мінімум 4 символи."
                disabled={confirmTeacher.isLoading || confirmTeacher.isError}
              />
              <PasswordInput
                label="Підтвердьте пароль"
                input={password}
                setValue={setPassword}
                type="confirm"
                additionalText={password.isCorrect ? "" : "Паролі не співпадають."}
                disabled={confirmTeacher.isLoading || confirmTeacher.isError}
              />

              <SubmitButton
                text="Зареєструватися"
                isLoading={confirmTeacher.isLoading}
                disabled={
                  password.value.trim().length < 4 ||
                  password.value.trim() !== password.confirm.trim() ||
                  confirmTeacher.isLoading ||
                  confirmTeacher.isError
                }
              />
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignUpTeacher;
