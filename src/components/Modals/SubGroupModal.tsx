import { Button, Checkbox, Modal, Table } from "flowbite-react";
import { useCallback, useEffect, useState } from "react";
import { api } from "../../utils/api";
import MyInput from "../Inputs/MyInput";

export interface Student {
  id: number;
  name: string;
}

interface Props {
  group: Student[];
  subGroupStudents: Student[];
  isVisible: boolean;
  setVisible: (isVisible: boolean) => void;
  groupId: number;
  subGroup: { id: number; name: string; isFull: boolean };
  isCreating: boolean;
  onUpdate?: () => void;
}

function SubGroupModal({
  group,
  subGroupStudents,
  isVisible,
  setVisible,
  groupId,
  subGroup,
  isCreating,
  onUpdate,
}: Props) {
  if (subGroup.isFull && !isCreating) throw new Error("Can't edit full group!");

  const createSubGroup = api.subGroup.create.useMutation();
  const updateSubGroup = api.subGroup.update.useMutation();
  const apiUtils = api.useContext();
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => {
    setIsBrowser(true);
    return () => setIsBrowser(false);
  }, []);

  const [selected, setSelected] = useState(subGroupStudents.length);
  const initView = useCallback(() => {
    let subIndex = 0;
    const arr = group.map((g) => {
      const isUsed =
        subGroupStudents.length !== 0 && g.id === subGroupStudents[subIndex]?.id;
      if (isUsed) subIndex++;

      return { ...g, isUsed };
    });
    return arr;
  }, [group, subGroupStudents]);

  const [groupView, setGroupView] = useState(() => initView());
  const [name, setName] = useState(isCreating ? "" : subGroup.name);

  useEffect(() => {
    setGroupView(initView());
    setName(isCreating ? "" : subGroup.name);
  }, [initView, subGroup, isCreating, subGroupStudents]);

  function handleSelect(isChecked: boolean, index: number) {
    const arr = [...groupView];
    if (arr[index] === undefined) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    arr[index]!.isUsed = isChecked;
    setGroupView(arr);
    setSelected((prev) => (isChecked ? prev + 1 : prev - 1));
  }

  function discard() {
    setGroupView(initView());
    setVisible(false);
  }

  function saveChanges() {
    const studentIds = groupView.filter((v) => v.isUsed).map((v) => v.id);
    if (isCreating)
      createSubGroup.mutate(
        { name: name.trim(), groupId, studentIds },
        {
          onSuccess: (data) =>
            apiUtils.subGroup.get.setData(groupId, (old) =>
              old ? [{ id: data.id, name, isFull: false }, ...old] : old
            ),
          onSettled: () => discard(),
        }
      );
    else
      updateSubGroup.mutate(
        { id: subGroup.id, name: name.trim(), studentIds },
        {
          onSuccess: () => {
            apiUtils.subGroup.get.setData(groupId, (old) =>
              old ? old.map((sg) => (sg.id === subGroup.id ? { ...sg, name } : sg)) : old
            );
            onUpdate?.();
            void apiUtils.subGroup.getById.invalidate(subGroup.id);
          },
          onSettled: () => discard(),
        }
      );
  }

  function selectAll(selected: boolean) {
    setGroupView((prev) => prev.map((g) => ({ ...g, isUsed: selected })));
    setSelected(selected ? group.length : 0);
  }

  return isBrowser ? (
    <Modal
      show={isVisible}
      size="2xl"
      popup={true}
      onClose={() => setVisible(false)}
      className="[&>div:first-child]:md:h-full"
    >
      <Modal.Header />
      <Modal.Body>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
          {isCreating ? "Створити " : "Редагувати "} підгрупу
        </h3>
        <div className="mt-6 space-y-6">
          <MyInput label="Назва" value={name} setValue={setName} />
          <Table hoverable={true}>
            <Table.Head>
              <Table.HeadCell className="!p-4">
                <Checkbox
                  checked={selected === group.length}
                  onChange={(e) => selectAll(e.target.checked)}
                />
              </Table.HeadCell>
              <Table.HeadCell>ПІБ</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {groupView.map((d, i) => (
                <Table.Row
                  key={d.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell className="!p-4">
                    <Checkbox
                      checked={d.isUsed}
                      onChange={(e) => handleSelect(e.target.checked, i)}
                    />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {d.name}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() => saveChanges()}
          disabled={
            name.trim().length === 0 ||
            selected === 0 ||
            selected === group.length ||
            createSubGroup.isLoading
          }
        >
          {isCreating ? "Створити" : "Зберегти"}
        </Button>
        <Button
          color="gray"
          onClick={() => discard()}
          disabled={createSubGroup.isLoading}
        >
          Скасувати
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <></>
  );
}

export default SubGroupModal;
