import type { NextPage } from "next";
import Head from "next/head";
import { api } from "../../../utils/api";
import { Spinner } from "flowbite-react";
import DataTable, { createTableProps } from "../../../components/DataTable/DataTable";
import Link from "next/link";
import useAdminSession from "../../../hooks/useAdminSession";

const Subjects: NextPage = () => {
  useAdminSession();
  const { isLoading, data: subjects } = api.subject.get.useQuery();
  const createSubject = api.subject.create.useMutation();
  const updateSubject = api.subject.update.useMutation();
  const apiUtils = api.useContext();

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
    },
    columnDefinitions: [
      {
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
    onRowChange: ({ newRow, setLoading, setValidation }) => {
      setLoading(true);
      updateSubject.mutate(newRow, {
        onError(error) {
          if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
          else void apiUtils.subject.get.invalidate();
          setLoading(false);
        },
        onSuccess() {
          apiUtils.subject.get.setData(undefined, (old) =>
            old ? old.map((s) => (s.id === newRow.id ? newRow : s)) : old
          );
          setLoading(false);
        },
      });
    },
    onNewRowCreate: ({ newRow, setLoading, setValidation }) => {
      setLoading(true);
      createSubject.mutate(newRow.title, {
        onError(error) {
          if (error.data?.code === "CONFLICT") setValidation({ title: "CONFLICT" });
          else void apiUtils.subject.get.invalidate();
          setLoading(false);
        },
        onSuccess() {
          void apiUtils.subject.get.invalidate(undefined);
          setLoading(false);
        },
      });
    },
  });

  return (
    <>
      <Head>
        <title>Предмети</title>
      </Head>
      <DataTable {...tableProps} />
    </>
  );
};

export default Subjects;
