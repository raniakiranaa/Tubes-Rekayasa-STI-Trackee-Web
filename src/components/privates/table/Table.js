"use client";
import React, { useState } from "react";
import { Modal } from "../../shares/modal/index";
import Image from "next/image";
import edit from "@/public/icons/edit.svg";
import trash from "@/public/icons/trash.svg";
import { supabase } from "../../../../lib/supabaseClient";
import { toastError, toastSuccess } from "../../shares/Toast";

const Table = ({ columns, data, setData, message, onRowClick }) => {
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentRow, setCurrentRow] = useState(null);
  const [editedData, setEditedData] = useState({});

  const handleEdit = (row) => {
    setCurrentRow(row);
    setEditedData(row);
    setEditModal(true);
  };

  const handleDelete = (row) => {
    setCurrentRow(row);
    setDeleteModal(true);
  };  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData({
      ...editedData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    const { error } = await supabase
      .from('item')
      .update({
        exp_date: editedData.expiredDate
      })
      .eq('product_id', currentRow.productID)
      .eq('item_id', currentRow.itemID);

    if (error) {
      console.error('Error updating data:', error);
      toastError('Error edit item!');

      return;
    } else {
      toastSuccess("Edit Item Succesful");
    }

    const updatedData = data.map((row) =>
      row.productID === currentRow.productID && row.itemID === currentRow.itemID
        ? { ...row, expiredDate: editedData.expiredDate }
        : row
    );
    setData(updatedData);
    setEditModal(false);
  };

  const handleSaveDelete = async () => {
    try {
      await supabase
        .from('item')
        .delete()
        .eq('product_id', currentRow.productID)
        .eq('item_id', currentRow.itemID);

      const updatedData = data.filter(item => item !== currentRow);
      setData(updatedData);
      setDeleteModal(false);
      toastSuccess("Item deleted successfully");
    } catch (error) {
      console.error('Error deleting item:', error);
      toastError('Error deleting item!');
    }
  };

  if (!columns || !data || data.length === 0) {
    return (
      <div className="px-8">
        <i>{message}</i>
      </div>
    );
  }


  return (
    <>
      {editModal && (
        <Modal open={editModal} setOpen={setEditModal}>
          <div className="flex flex-col justify-between gap-5">
            <div>
              <h2 className="mb-4 text-xl font-bold">Edit Expired Date</h2>
              <label className="block mb-2">Product ID</label>
              <input
                type="text"
                name="productID"
                value={editedData.productID}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled
              />
              <label className="block mt-4 mb-2">Item ID</label>
              <input
                type="text"
                name="itemID"
                value={editedData.itemID}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled
              />
              <label className="block mt-4 mb-2">Rack ID</label>
              <input
                type="text"
                name="rackID"
                value={editedData.rackID}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                disabled
              />
              <label className="block mt-4 mb-2">Expired Date</label>
              <input
                type="date"
                name="expiredDate"
                value={editedData.expiredDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              className="w-full rounded bg-brown-2 px-4 py-2 text-white"
              onClick={handleSubmit}
            >
              Save Edit
            </button>
          </div>
        </Modal>
      )}
      {deleteModal && (
        <Modal open={deleteModal} setOpen={setDeleteModal}>
          <div className="flex flex-col justify-between gap-5">
            <div>
              <h2 className="mb-4 text-xl font-bold">
                Are you sure you want to delete?
              </h2>
            </div>
            <div className="flex flex-row gap-4">
              <button
                className="w-full rounded bg-red-500 px-4 py-2 text-white"
                onClick={() => handleSaveDelete()}
              >
                Yes
              </button>
              <button
                className="w-full rounded bg-brown-2 px-4 py-2 text-white"
                onClick={() => setDeleteModal(false)}
              >
                No
              </button>
            </div>
          </div>
        </Modal>
      )}
      <div className="flex justify-center relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bold-16 text-gray-700 uppercase bg-white text-center border-b">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-4 py-3 ${column.width}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-white"
                } cursor-pointer`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-2 ${
                      column.align === "center" ? "text-center" : "text-left"
                    } truncate`}
                  >
                    {column.dataKey === "aksi" && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-1 rounded-md bg-brown-3"
                          onClick={(e) => {e.stopPropagation(); handleEdit(row)}}
                        >
                          <Image src={edit} alt="edit" />
                        </button>
                        <button
                          className="p-1 rounded-md bg-danger"
                          onClick={(e) => {e.stopPropagation(); handleDelete(row)}}
                        >
                          <Image src={trash} alt="delete" />
                        </button>
                      </div>
                    )}
                    {column.dataKey !== "aksi" && row[column.dataKey]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Table;
