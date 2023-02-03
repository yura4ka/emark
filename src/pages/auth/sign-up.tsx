import { Card } from "flowbite-react";
import type { NextPage } from "next";
import React, { useState } from "react";
import MySelect from "../../components/MySelect";
import PasswordInput from "../../components/Inputs/PasswordInput";
import { api } from "../../utils/api";
import PopupModal from "../../components/Modals/PopupModal";
import { HiCheck, HiX } from "react-icons/hi";
import { useRouter } from "next/router";
import Head from "next/head";
import SubmitButton from "../../components/SubmitButton";

const SignUp: NextPage = () => {
  const { push } = useRouter();
  const initialValue = { id: -1, value: "" };
  const initialPassword = {
    value: "",
    confirm: "",
    isCorrect: true,
  };

  const [currentFaculty, setCurrentFaculty] = useState(initialValue);
  const [currentGroup, setCurrentGroup] = useState(initialValue);
  const [currentStudent, setCurrentStudent] = useState(initialValue);
  const [password, setPassword] = useState(initialPassword);

  const faculties = api.faculty.get.useQuery();
  const facultyGroups = api.faculty.getGroups.useQuery(
    { id: currentFaculty.id },
    { enabled: currentFaculty.id !== -1 }
  );
  const freeStudents = api.group.getFreeStudents.useQuery(
    { id: currentGroup.id },
    { enabled: currentGroup.id !== -1 }
  );

  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isErrorVisible, setIsErrorVisible] = useState(false);

  const requestStudent = api.student.makeRequest.useMutation({
    onSuccess: () => setIsSuccessVisible(true),
    onError: () => setIsErrorVisible(true),
    onSettled: () => {
      setCurrentFaculty(initialValue);
      setCurrentGroup(initialValue);
      setCurrentStudent(initialValue);
      setPassword(initialPassword);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestStudent.mutate({
      id: currentStudent.id,
      password: password.value.trim(),
    });
  };

  const modals = (
    <>
      {isSuccessVisible && (
        <PopupModal
          Icon={<HiCheck />}
          color="success"
          buttonText="Ок"
          isVisible={isSuccessVisible}
          onClose={() => {
            setIsSuccessVisible(false);
            void push("/");
          }}
          text="Запит на реєстрацію вашого акаунта успішно створено. Зверніться до старости або адміністратора для підтвердження."
        />
      )}
      {isErrorVisible && (
        <PopupModal
          Icon={<HiX />}
          color="failure"
          buttonText="Ок"
          isVisible={isErrorVisible}
          onClose={() => {
            setIsErrorVisible(false);
            void push("/");
          }}
          text="При обробці запиту сталася помилка."
        />
      )}
    </>
  );

  return (
    <>
      <Head>
        <title>Реєстрація</title>
      </Head>
      <div className="flex h-full items-center justify-center">
        {modals}
        <div className="w-full max-w-max">
          <Card>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <h5 className="text-xl font-medium text-gray-900 dark:text-white">
                Зареєструватися у системі
              </h5>

              <MySelect
                label="Виберіть факультет"
                options={faculties.data || []}
                value={currentFaculty}
                setValue={({ id, value }) => {
                  setCurrentFaculty({ id, value });
                  setCurrentGroup(initialValue);
                  setCurrentStudent(initialValue);
                  setPassword(initialPassword);
                }}
                isLoading={faculties.isLoading}
                showBlank={true}
              />

              <MySelect
                label="Виберіть групу"
                value={currentGroup}
                options={facultyGroups.data || []}
                setValue={({ id, value }) => {
                  setCurrentGroup({ id, value });
                  setCurrentStudent(initialValue);
                  setPassword(initialPassword);
                }}
                isLoading={facultyGroups.isLoading}
                showBlank={true}
                isVisible={currentFaculty.id !== -1}
              />

              <MySelect
                label="Виберіть ПІБ"
                value={currentStudent}
                options={freeStudents.data || []}
                setValue={({ id, value }) => setCurrentStudent({ id, value })}
                isLoading={freeStudents.isLoading}
                showBlank={true}
                isVisible={currentGroup.id !== -1}
                errorText={{
                  title: "Всі учні цієї групи вже зареєстровані.",
                  text: "",
                }}
              />

              <div
                className={`flex flex-col gap-4 transition-opacity duration-300 ${
                  currentStudent.id === -1 ? "opacity-0" : "opacity-1"
                }`}
              >
                <PasswordInput
                  label="Пароль"
                  input={password}
                  setValue={setPassword}
                  type="value"
                  disabled={currentStudent.id === -1}
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
                  disabled={currentStudent.id === -1}
                  additionalText={
                    password.isCorrect ? "" : "Паролі не співпадають."
                  }
                />

                <SubmitButton
                  text="Зареєструватися"
                  isLoading={requestStudent.isLoading}
                  disabled={
                    password.value.trim().length < 4 ||
                    password.value.trim() !== password.confirm.trim() ||
                    currentStudent.id === -1
                  }
                />
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignUp;
