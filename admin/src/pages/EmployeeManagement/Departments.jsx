import React, { useState, useEffect } from "react";

import { API } from "../../config/urls";
import { showAxiosError, showSuccessMessage } from "../../config/Toast";
import Table, { Cell, Row } from "../../utils/Table/Table";
import AddDeptForm from "../../components/departments/AddDeptForm";
import CustomButton from "../../utils/CustomButton";
import IconButton from "../../utils/IconButton";
import { Pencil, Trash } from "lucide-react";

export default function Departments() {
  const [depts, setDepts] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [defaultValues, setDefaultValues] = useState(null);

  const getDepts = async () => {
    try {
      const resp = await API.get("/departments/");
      setDepts(resp.data);
    } catch (e) {
      showAxiosError(e);
    }
  };

  const deleteDept = async (id) => {
    try {
      const resp = await API.delete(`/departments/delete/${id}`);
      showSuccessMessage(resp.data.message);
      getDepts();
    } catch (e) {
      showAxiosError(e);
    }
  };

  const editOpen = (data) => {
    setDefaultValues(data);
    setFormOpen(true);
  };

  useEffect(() => {
    getDepts();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Departments</h2>
        <CustomButton
          onClick={() => setFormOpen(!formOpen)}
          title={"Add New"}
          type="button"
        />
      </div>

      <Table headings={["Department Name", "Short Code", "Actions"]}>
        {depts?.map((e, index) => {
          return (
            <Row key={index} index={index}>
              <Cell>{e.title}</Cell>
              <Cell>{e.shortCode}</Cell>
              <Cell className={"space-x-3"}>
                <IconButton
                  onClick={() => editOpen(e)}
                  Icon={Pencil}
                  iconColor={"green"}
                />
                <IconButton
                  onClick={() => deleteDept(e._id)}
                  Icon={Trash}
                  iconColor={"red"}
                />
              </Cell>
            </Row>
          );
        })}
      </Table>

      {formOpen && (
        <div className="absolute z-[9999] flex items-center justify-center top-0 left-0 h-[100vh] w-[100vw] bg-[rgba(0,0,0,0.5)]">
          <AddDeptForm
            defaultValues={defaultValues}
            getDepts={getDepts}
            setFormOpen={setFormOpen}
          />
        </div>
      )}
    </div>
  );
}
