import { type Student } from "@prisma/client";
import { Badge, Button, Spinner, Table } from "flowbite-react";
import { type GetServerSidePropsContext, type NextPage } from "next";
import { getServerAuthSession } from "../server/auth";
import { api } from "../utils/api";
import { HiCheck } from "react-icons/hi";
import ConfirmModal from "../components/Modals/ConfirmModal";
import { useState } from "react";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getServerAuthSession(ctx);
  if (!session?.user.role.isSenior)
    return { redirect: { destination: "/", permanent: false } };
  return { props: { user: session.user } };
};

const MyClass: NextPage = () => {
  const utils = api.useContext();
  const myGroup = api.student.getClassList.useQuery();
  const confirmStudent = api.student.confirmStudent.useMutation();

  const [modalData, setModalData] = useState({
    onAccept: () => console.error("accept error"),
    text: "",
    isVisible: false,
  });

  const handleConfirm = (id: number) => {
    setModalData((data) => ({ ...data, isVisible: false }));
    confirmStudent.mutate(id, {
      onSuccess: () => {
        const updateStudents = (students: Student[]) =>
          students.map((s) => {
            if (s.id === id)
              return { ...s, isRequested: false, isConfirmed: true };
            return s;
          });

        utils.student.getClassList.setData(undefined, (oldData) =>
          oldData
            ? { ...oldData, students: updateStudents(oldData.students) }
            : oldData
        );
      },
    });
  };

  function StudentRows({ students }: { students: Student[] }) {
    return (
      <>
        {students.map((s) => (
          <Table.Row
            key={s.id}
            className="bg-white dark:border-gray-700 dark:bg-gray-800"
          >
            <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {s.name}
            </Table.Cell>
            <Table.Cell>{s.email}</Table.Cell>
            <Table.Cell>
              {s.isRequested && (
                <Badge
                  color="failure"
                  theme={{ root: { base: "font-semibold" } }}
                >
                  Запит
                </Badge>
              )}
              {s.isConfirmed && (
                <Badge
                  color="success"
                  theme={{ root: { base: "font-semibold" } }}
                >
                  Підтверджений
                </Badge>
              )}
            </Table.Cell>
            <Table.Cell>
              {s.isRequested && (
                <Button
                  size="xs"
                  onClick={() => {
                    setModalData({
                      isVisible: true,
                      text: `підтвердити акаунт учня ${s.name}`,
                      onAccept: () => handleConfirm(s.id),
                    });
                  }}
                >
                  <HiCheck className="mr-1 h-4 w-4" />
                  Підтвердити
                </Button>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </>
    );
  }

  return (
    <div className="container my-3">
      <ConfirmModal
        text={modalData.text}
        isVisible={modalData.isVisible}
        onAccept={() => modalData.onAccept()}
        onCancel={() => setModalData((data) => ({ ...data, isVisible: false }))}
        buttonText="Підтвердити"
      />
      <h2 className="mb-6 text-2xl font-bold">
        Мій клас{!myGroup.isLoading && ": " + (myGroup.data?.name || "")}
      </h2>
      <Table hoverable={!myGroup.isLoading}>
        <Table.Head>
          <Table.HeadCell>ПІБ</Table.HeadCell>
          <Table.HeadCell>Електронна адреса</Table.HeadCell>
          <Table.HeadCell>Статус</Table.HeadCell>
          <Table.HeadCell>Дії</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {myGroup.isLoading ? (
            <Table.Row className="text-center">
              <Table.Cell colSpan={4}>
                <Spinner size="xl" />
              </Table.Cell>
            </Table.Row>
          ) : (
            <StudentRows students={myGroup.data?.students || []} />
          )}
        </Table.Body>
      </Table>
    </div>
  );
};

export default MyClass;
