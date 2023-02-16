import { Badge, Button, Spinner } from "flowbite-react";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "../server/auth";
import { api } from "../utils/api";
import { HiCheck } from "react-icons/hi";
import ConfirmModal from "../components/Modals/ConfirmModal";
import { useState } from "react";
import DataTable, { createTableProps } from "../components/DataTable/DataTable";
import Head from "next/head";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.role.isSenior)
    return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
};

const MyClass: NextPage = () => {
  const apiUtils = api.useContext();
  const { data: myGroup, isLoading } = api.student.getClassList.useQuery();
  const confirmStudent = api.student.confirmStudent.useMutation();

  const [modalData, setModalData] = useState({
    onAccept: () => console.error("accept error"),
    text: "",
    isVisible: false,
  });

  if (isLoading || !myGroup)
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
      customActions: (row) =>
        row.isRequested && (
          <Button
            disabled={confirmStudent.isLoading}
            size="xs"
            onClick={() => {
              setModalData({
                isVisible: true,
                text: `підтвердити акаунт учня ${row.name}`,
                onAccept: () => handleConfirm(row.id),
              });
            }}
          >
            <HiCheck className="mr-1 h-4 w-4" />
            Підтвердити
          </Button>
        ),
    },
    columnDefinitions: [
      {
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
        customElement: (row) => (
          <>
            {row.isRequested && (
              <Badge color="failure" theme={{ root: { base: "font-semibold" } }}>
                Запит
              </Badge>
            )}
            {row.isConfirmed && (
              <Badge color="success" theme={{ root: { base: "font-semibold" } }}>
                Підтверджений
              </Badge>
            )}
          </>
        ),
      },
    ],
  });

  const handleConfirm = (id: number) => {
    setModalData((data) => ({ ...data, isVisible: false }));
    confirmStudent.mutate(id, {
      onSuccess: () => {
        apiUtils.student.getClassList.setData(undefined, (oldData) => {
          if (!oldData) return;
          return {
            ...oldData,
            students: oldData.students.map((s) =>
              s.id === id ? { ...s, isRequested: false, isConfirmed: true } : s
            ),
          };
        });
      },
    });
  };

  return (
    <>
      <Head>
        <title>Факультети</title>
      </Head>
      <ConfirmModal
        text={modalData.text}
        isVisible={modalData.isVisible}
        onAccept={() => modalData.onAccept()}
        onCancel={() => setModalData((data) => ({ ...data, isVisible: false }))}
        buttonText="Підтвердити"
      />
      <DataTable {...tableProps} />
    </>
  );
};

export default MyClass;
