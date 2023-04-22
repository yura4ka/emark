import type { NextPage } from "next";
import Head from "next/head";
import { api } from "../../../utils/api";
import { Spinner } from "flowbite-react";
import { ConfirmModal, DataTable, createTableProps } from "../../../components";
import Link from "next/link";
import { useAdminSession, useModal } from "../../../hooks";

const Subjects: NextPage = () => {
  useAdminSession();
  const { isLoading, data: subjects } = api.subject.get.useQuery();
  const createSubject = api.subject.create.useMutation();
  const updateSubject = api.subject.update.useMutation();
  const deleteSubject = api.subject.delete.useMutation();
  const apiUtils = api.useContext();

  const { modalProps, setModalData, setModalVisibility } = useModal();

  if (isLoading || !subjects)
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={"xl"} />
      </div>
    );

  const tableProps = createTableProps({
    data: subjects,
    options: {
      header: "Предмети",
      canEdit: true,
      showActions: true,
      defaultRow: { id: -1, title: "" },
      enableSearch: true,
      canRemove: true,
    },
    columnDefinitions: [
      {
        isMain: true,
        header: "Назва",
        key: "title",
        isUnique: true,
        editType: "text",
        errorMessages: { CONFLICT: "Предмет з такою назвою вже існує!" },
        customElement: (row) => (
          <Link href={`subjects/${row.id}`} className="hover:underline">
            {row.title}
          </Link>
        ),
      },
    ],
    onRowChange: ({ newRow, setResult }) => {
      updateSubject.mutate(newRow, {
        onError(error) {
          if (error.data?.code === "CONFLICT") setResult({ title: "CONFLICT" });
          else {
            setResult(false);
            void apiUtils.subject.get.invalidate();
          }
        },
        onSuccess() {
          apiUtils.subject.get.setData(undefined, (old) =>
            old ? old.map((s) => (s.id === newRow.id ? newRow : s)) : old
          );
          setResult();
        },
      });
    },
    onNewRowCreate: ({ newRow, setResult }) => {
      createSubject.mutate(newRow.title, {
        onError(error) {
          if (error.data?.code === "CONFLICT") setResult({ title: "CONFLICT" });
          else {
            setResult(false);
            void apiUtils.subject.get.invalidate();
          }
        },
        onSuccess() {
          void apiUtils.subject.get.invalidate(undefined);
          setResult();
        },
      });
    },
    onRowRemove: (row) =>
      setModalData({
        isVisible: true,
        text: `видалити предмет ${row.title}`,
        onAccept: () => handleRemove(row.id),
      }),
  });

  const handleRemove = (id: number) => {
    setModalVisibility(false);
    deleteSubject.mutate(id, {
      onSuccess: () =>
        apiUtils.subject.get.setData(undefined, (old) =>
          old ? old.filter((s) => s.id !== id) : old
        ),
    });
  };

  return (
    <>
      <Head>
        <title>Предмети</title>
      </Head>
      <DataTable {...tableProps} />
      <ConfirmModal {...modalProps} />
    </>
  );
};

export default Subjects;
