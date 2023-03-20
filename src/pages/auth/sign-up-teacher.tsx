import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PopupModal from "../../components/Modals/PopupModal";
import { HiCheck, HiX } from "react-icons/hi";
import { Card } from "flowbite-react";
import Head from "next/head";
import { initialPassword } from "../../utils/utils";
import PasswordInput from "../../components/Inputs/PasswordInput";
import SubmitButton from "../../components/Buttons/SubmitButton";
import MyInput from "../../components/Inputs/MyInput";
import { api } from "../../utils/api";
import Link from "next/link";

const SignUpTeacher: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState({ ...initialPassword });

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const { push } = useRouter();

  const requestTeacher = api.teacher.makeRequest.useMutation({
    onSuccess: () => setIsSuccessVisible(true),
    onError: () => setIsErrorVisible(true),
    onSettled: () => {
      setPassword({ ...initialPassword });
      setEmail("");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestTeacher.mutate({
      email: email.trim(),
      password: password.value.trim(),
    });
  };

  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    return () => setIsBrowser(false);
  }, []);

  return (
    <>
      <Head>
        <title>Реєстрація Викладача</title>
      </Head>
      <div className="flex h-full items-center justify-center">
        <PopupModal
          Icon={<HiCheck />}
          color="success"
          buttonText="Ок"
          isVisible={isSuccessVisible}
          onClose={() => {
            setIsSuccessVisible(false);
            void push("/");
          }}
          text="Запит на реєстрацію вашого акаунта успішно створено. Зверніться до адміністратора для підтвердження."
        />

        <PopupModal
          Icon={<HiX />}
          color="failure"
          buttonText="Ок"
          isVisible={isErrorVisible}
          onClose={() => {
            setIsErrorVisible(false);
            void push("/");
          }}
          text="Ваш запит на реєстрацію викладача скасовано. При помилці зверніться до адміністратора!"
        />

        <div className="w-full max-w-md">
          <Card>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <h5 className="text-xl font-medium text-gray-900 dark:text-white">
                Зареєструватися у системі як викладач
              </h5>
              <Link
                href="/auth/sign-up"
                className="-mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Я студент
              </Link>
              <MyInput
                label="Електронна адреса"
                value={email}
                setValue={setEmail}
                placeholder="boris.johnson@knu.ua"
              />
              <PasswordInput
                label="Пароль"
                input={password}
                setValue={setPassword}
                type="value"
                validationFunction={(value) =>
                  value.length === 0 || value.trim().length >= 4
                }
                additionalText="Пароль має містити мінімум 4 символи."
              />
              <PasswordInput
                label="Підтвердьте пароль"
                input={password}
                setValue={setPassword}
                type="confirm"
                additionalText={password.isCorrect ? "" : "Паролі не співпадають."}
              />

              <SubmitButton
                text="Зареєструватися"
                isLoading={requestTeacher.isLoading}
                disabled={
                  password.value.trim().length < 4 ||
                  password.value.trim() !== password.confirm.trim() ||
                  email.trim().length === 0
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
