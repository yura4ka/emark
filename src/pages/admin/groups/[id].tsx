import { Badge, Button, Spinner } from "flowbite-react";
import type { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "../../../server/auth";
import { api } from "../../../utils/api";
import Head from "next/head";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import { HiCheck } from "react-icons/hi";
import { useState } from "react";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import MySelect from "../../../components/MySelect";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.role.isAdmin)
    return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
};

const Group: NextPage = () => {
  const router = useRouter();
  const id = +(router.query.id || -1);
  const { isLoading, data } = api.group.get.useQuery(id);
  const confirmStudent = api.admin.confirmStudent.useMutation();
  const createStudent = api.student.create.useMutation();
  const changeStudent = api.student.edit.useMutation();
  const assignSenior = api.admin.assignSenior.useMutation();
  const apiUtils = api.useContext();

  const [senior, setSenior] = useState(() => data?.senior || { id: -1, name: "" });
  const isSeniorChanged =
    data?.students.length !== 0 && (senior.id !== data?.senior?.id || senior.id === -1);

  const [modalData, setModalData] = useState({
    onAccept: () => console.error("accept error"),
    text: "",
    isVisible: false,
  });

  const tableProps = createTableProps({
    data: data?.students || [],
    options: {
      header: `${data?.faculty.title || ""}. Група ${data?.name || ""}`,
      showActions: true,
      canEdit: true,
      defaultRow: { id: -1, name: "", email: "", isRequested: false, isConfirmed: false },
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
        editType: "text",
      },
      {
        header: "Електронна адреса",
        key: "email",
        editType: "text",
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
    onRowChange: ({ newRow, setLoading }) => {
      const name = newRow.name.trim();
      const email = newRow.email.trim();
      const { id } = newRow;
      setLoading(true);
      changeStudent.mutate(
        { id, name, email },
        {
          onError() {
            setLoading(false);
          },
          onSuccess() {
            apiUtils.group.get.setData(data?.id || -1, (old) =>
              old
                ? {
                    ...old,
                    students: old.students.map((s) =>
                      s.id !== id ? s : { ...s, name, email }
                    ),
                  }
                : old
            );
            setLoading(false);
          },
        }
      );
    },
    onNewRowCreate: ({ newRow: row, setLoading }) => {
      setLoading(true);
      createStudent.mutate(
        { name: row.name.trim(), email: row.email.trim(), groupId: data?.id || -1 },
        {
          onError() {
            setLoading(false);
          },
          onSuccess() {
            setLoading(false);
            void apiUtils.group.get.invalidate(data?.id);
          },
        }
      );
    },
  });

  const handleConfirm = (id: number) => {
    setModalData((data) => ({ ...data, isVisible: false }));
    confirmStudent.mutate(id, {
      onSuccess: () => {
        apiUtils.group.get.setData(data?.id || -1, (old) =>
          old
            ? {
                ...old,
                students: old.students.map((s) =>
                  s.id !== id ? s : { ...s, isConfirmed: true, isRequested: false }
                ),
              }
            : old
        );
      },
    });
  };

  if (isLoading || !data)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>{data.faculty.title + ". " + data.name}</title>
      </Head>

      <ConfirmModal
        text={modalData.text}
        isVisible={modalData.isVisible}
        onAccept={() => modalData.onAccept()}
        onCancel={() => setModalData((data) => ({ ...data, isVisible: false }))}
        buttonText="Підтвердити"
      />
      <DataTable {...tableProps} />

      <div className="mt-6 max-w-xl">
        <MySelect
          label="Староста:"
          options={data.students}
          field={"name"}
          value={senior}
          setValue={setSenior}
        />
        {isSeniorChanged && (
          <Button
            className="mt-2"
            color={"success"}
            disabled={assignSenior.isLoading}
            onClick={() => {
              assignSenior.mutate(
                { groupId: data.id, studentId: senior.id },
                {
                  onSuccess() {
                    void apiUtils.group.get.invalidate(data?.id || -1);
                  },
                }
              );
            }}
          >
            Зберегти
          </Button>
        )}
      </div>
    </>
  );
};

export default Group;
