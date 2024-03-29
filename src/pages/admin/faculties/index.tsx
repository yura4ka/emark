import { Spinner } from "flowbite-react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "../../../utils/api";
import { useAdminSession, useModal } from "../../../hooks";
import { ConfirmModal, DataTable, createTableProps } from "../../../components";

const Faculties: NextPage = () => {
  useAdminSession();
  const { isLoading, data: faculties } = api.faculty.get.useQuery();
  const renameFaculty = api.faculty.rename.useMutation();
  const createFaculty = api.faculty.create.useMutation();
  const deleteFaculty = api.faculty.delete.useMutation();
  const apiUtils = api.useContext();

  const tableProps = createTableProps({
    data: faculties || [],
    options: {
      header: "Факультети",
      showActions: true,
      canEdit: true,
      defaultRow: { id: -1, title: "" },
      enableSearch: true,
      canRemove: true,
    },
    columnDefinitions: [
      {
        isMain: true,
        header: "Назва",
        key: "title",
        editType: "text",
        isUnique: true,
        errorMessages: { CONFLICT: "Факультет з таким іменем вже існує!" },
        customElement: (row) => (
          <Link href={`faculties/${row.id}`} className="hover:underline">
            {row.title}
          </Link>
        ),
      },
    ],
    onRowChange: ({ newRow, setResult }) => {
      const title = newRow.title.trim();
      const { id } = newRow;
      renameFaculty.mutate(
        { id, newName: title },
        {
          onError(error) {
            if (error.data?.code === "CONFLICT") {
              setResult({ title: "CONFLICT" });
            } else {
              setResult(false);
              void apiUtils.faculty.get.invalidate();
            }
          },
          onSuccess() {
            apiUtils.faculty.get.setData(undefined, (old) =>
              old ? old.map((f) => (f.id === id ? { ...f, title } : f)) : old
            );
            setResult();
          },
        }
      );
    },
    onNewRowCreate: ({ newRow: row, setResult }) => {
      createFaculty.mutate(row.title, {
        onError(error) {
          if (error.data?.code === "CONFLICT") {
            setResult({ title: "CONFLICT" });
          } else {
            setResult(false);
            void apiUtils.faculty.get.invalidate();
          }
        },
        onSuccess() {
          setResult();
          void apiUtils.faculty.get.invalidate();
        },
      });
    },
    onRowRemove: (row) =>
      setModalData({
        isVisible: true,
        text: `видалити факультет ${row.title}`,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const { modalProps, setModalData, setModalVisibility } = useModal();

  const handleRemove = (id: number) => {
    setModalVisibility(false);
    deleteFaculty.mutate(id, {
      onSuccess: () =>
        apiUtils.faculty.get.setData(undefined, (old) =>
          old ? old.filter((f) => f.id !== id) : old
        ),
    });
  };

  if (isLoading || !faculties)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  return (
    <>
      <Head>
        <title>Факультети</title>
      </Head>
      <DataTable {...tableProps} />
      <ConfirmModal {...modalProps} />
    </>
  );
};
export default Faculties;
