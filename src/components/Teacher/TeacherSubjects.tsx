import { Table } from "flowbite-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import MySelect from "../MySelect";

interface Props {
  data: {
    id: number;
    name: string;
    subject: { id: number; title: string };
    subGroup: {
      group: { faculty: { id: number; title: string } };
    };
  }[];
}

function TeacherSubjects({ data }: Props) {
  const [faculties, subjects] = useMemo(() => {
    const faculties = new Map<number, string>();
    const subjects = new Map<number, string>();

    for (const c of data) {
      faculties.set(c.subGroup.group.faculty.id, c.subGroup.group.faculty.title);
      subjects.set(c.subject.id, c.subject.title);
    }

    const returnFaculties = [];
    const returnSubjects = [];

    for (const [id, title] of faculties) returnFaculties.push({ id, title });
    for (const [id, title] of subjects) returnSubjects.push({ id, title });

    return [returnFaculties, returnSubjects];
  }, [data]);

  const [faculty, setFaculty] = useState({ id: -1, title: "" });
  const [subject, setSubject] = useState({ id: -1, title: "" });

  const filtered = useMemo(
    () =>
      data.filter(
        (c) =>
          (faculty.id === -1 || c.subGroup.group.faculty.id === faculty.id) &&
          (subject.id === -1 || c.subject.id === subject.id)
      ),
    [data, faculty.id, subject.id]
  );

  return (
    <>
      <div className="flex max-w-lg gap-5 pb-4">
        <div className="w-1/2">
          <MySelect
            options={faculties}
            field="title"
            label="Факультет"
            value={faculty}
            setValue={setFaculty}
            showBlank={true}
          />
        </div>
        <div className="w-1/2">
          <MySelect
            options={subjects}
            field="title"
            label="Предмет"
            value={subject}
            setValue={setSubject}
            showBlank={true}
          />
        </div>
      </div>
      <Table>
        <Table.Head>
          <Table.HeadCell>Назва</Table.HeadCell>
          <Table.HeadCell>Факультет</Table.HeadCell>
          <Table.HeadCell>Предмет</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {filtered.map((c) => (
            <Table.Row
              key={c.id}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                <Link href={`/subjects/${c.id}`}>{c.name}</Link>
              </Table.Cell>
              <Table.Cell>{c.subGroup.group.faculty.title}</Table.Cell>
              <Table.Cell>{c.subject.title}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}

export default TeacherSubjects;
