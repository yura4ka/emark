import type { NextPage } from "next";
import Head from "next/head";
import { useUserSession } from "../../hooks/useUserSession";
import { Spinner } from "flowbite-react";
import { initialPassword } from "../../utils/utils";
import { useState } from "react";
import PasswordInput from "../../components/Inputs/PasswordInput";
import SubmitButton from "../../components/Buttons/SubmitButton";
import { api } from "../../utils/api";

const Settings: NextPage = () => {
  const user = useUserSession();
  const changePassword = api.admin.updatePassword.useMutation();

  const [currentPassword, setCurrentPassword] = useState(() => initialPassword);
  const [newPassword, setNewPassword] = useState(() => initialPassword);

  if (!user)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const submitPasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    changePassword.mutate(
      {
        currentPassword: currentPassword.value.trim(),
        newPassword: newPassword.value.trim(),
      },
      {
        onSuccess: () => {
          setCurrentPassword({ ...initialPassword });
          setNewPassword({ ...initialPassword });
        },
      }
    );
  };

  return (
    <div className="max-w-xl">
      <Head>
        <title>Налаштування</title>
      </Head>

      <h1 className="mb-6 text-3xl font-bold">Налаштування</h1>
      <div className="mb-6">
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          ПІБ
        </label>
        <input
          placeholder={user.name}
          disabled={true}
          type="text"
          id="name"
          className="mb-6 block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
        >
          Електронна адреса
        </label>
        <input
          placeholder={user.email}
          disabled={true}
          type="text"
          id="email"
          className="mb-6 block w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
      </div>

      <h3 className="mb-6 text-2xl font-bold">Змінити пароль</h3>
      <form onSubmit={submitPasswordChange} className="grid gap-4">
        <PasswordInput
          input={currentPassword}
          setValue={setCurrentPassword}
          type="value"
          label="Пароль"
          validationFunction={() => !changePassword.isError}
        />
        {changePassword.isError && (
          <p className="-mt-2 text-sm font-medium text-red-600 dark:text-red-500">
            Невірний пароль
          </p>
        )}
        <PasswordInput
          input={newPassword}
          setValue={setNewPassword}
          type="value"
          label="Новий пароль"
          additionalText="Пароль має містити мінімум 4 символи."
          validationFunction={(value) =>
            value.trim().length === 0 || value.trim().length >= 4
          }
        />
        <PasswordInput
          input={newPassword}
          setValue={setNewPassword}
          type="confirm"
          label="Підтвердьте пароль"
        />
        {changePassword.isSuccess && (
          <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-500">
            Пароль змінено
          </p>
        )}
        <SubmitButton
          text="Змінити"
          isLoading={false}
          disabled={
            !newPassword.isCorrect ||
            newPassword.confirm.trim().length < 4 ||
            newPassword.value.trim().length < 4 ||
            currentPassword.value.trim().length < 4
          }
        />
      </form>
    </div>
  );
};

export default Settings;
