import { useRouter } from "next/router";
import Head from "next/head";
import { type NextPage } from "next";
import { api } from "../utils/api";
import { Spinner } from "flowbite-react";
import { HiCheck, HiBan } from "react-icons/hi";
import { HiOutlineHashtag } from "react-icons/hi2";
import {
  createTableProps,
  DataTable,
  ConfirmModal,
  RequestedBadge,
  ConfirmedBadge,
} from "../components";
import { useModal, useUserSession } from "../hooks";

const MyClass: NextPage = () => {
  const session = useUserSession();
  const apiUtils = api.useContext();
  const router = useRouter();
  const { data: myGroup, isLoading } = api.senior.getClassList.useQuery();
  const confirmStudent = api.senior.confirmStudent.useMutation();
  const resetPassword = api.senior.resetStudentPassword.useMutation();

  const { setModalData, setModalVisibility, modalProps } = useModal();

  if (session && !(session.role.isSenior || session.role.isHandler))
    void router.push("/");

  if (isLoading || !myGroup || !session)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const tableProps = createTableProps({
    data: myGroup.students,
    options: {
      header: `Моя група: ${myGroup.name}`,
      showActions: true,
      enableSearch: true,
      customActions: (row) => [
        {
          isVisible: row.isRequested,
          isLoading: confirmStudent.isLoading,
          text: "Підтвердити",
          icon: HiCheck,
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `підтвердити акаунт студента ${row.name}`,
              onAccept: () => handleConfirm(row.id),
            });
          },
        },
        {
          isVisible:
            row.isConfirmed && (session.id !== row.id || session.role.isHandler === true),
          isLoading: resetPassword.isLoading,
          text: "Скинути пароль",
          icon: HiOutlineHashtag,
          color: "failure",
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `скинути пароль студента ${row.name}`,
              onAccept: () => handleResetPassword(row.id),
            });
          },
        },
        {
          isVisible: row.isRequested,
          isLoading: resetPassword.isLoading,
          text: "Відхилити",
          icon: HiBan,
          color: "failure",
          onClick: () => {
            setModalData({
              isVisible: true,
              text: `відхилити запит студента ${row.name}`,
              onAccept: () => handleResetPassword(row.id),
            });
          },
        },
      ],
    },
    columnDefinitions: [
      {
        isMain: true,
        header: "ПІБ",
        key: "name",
      },
      {
        header: "Електронна адреса",
        key: "email",
      },
      {
        header: "Статус",
        key: "isRequested",
        searchBy: false,
        customElement: (row) => (
          <>
            <RequestedBadge isVisible={row.isRequested} />
            <ConfirmedBadge isVisible={row.isConfirmed} />
          </>
        ),
      },
    ],
  });

  const updateStudents = (
    id: number,
    data: { isConfirmed: boolean; isRequested: boolean }
  ) => {
    apiUtils.senior.getClassList.setData(undefined, (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        students: oldData.students.map((s) => (s.id === id ? { ...s, ...data } : s)),
      };
    });
  };

  const handleConfirm = (id: number) => {
    setModalVisibility(false);
    confirmStudent.mutate(id, {
      onSuccess: () => updateStudents(id, { isConfirmed: true, isRequested: false }),
    });
  };

  const handleResetPassword = (id: number) => {
    setModalVisibility(false);
    resetPassword.mutate(id, {
      onSuccess: () => updateStudents(id, { isConfirmed: false, isRequested: false }),
    });
  };

  return (
    <>
      <Head>
        <title>Мій клас</title>
      </Head>
      <ConfirmModal {...modalProps} />
      <DataTable {...tableProps} />
    </>
  );
};

export default MyClass;
