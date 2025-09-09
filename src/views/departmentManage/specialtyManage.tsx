"use client";
import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import SpecialtyDetail from "./components/specialtyDetail";

import {
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation
} from "@/api/app_doctor/apiDepartmentDoctor";

const DepartmentDoctorManagement: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [form] = Form.useForm();

  // Gọi API lấy danh sách chuyên khoa
  const { data, isLoading, refetch } = useGetDepartmentsQuery();
  const [createDepartment] = useCreateDepartmentMutation();
  const [updateDepartment] = useUpdateDepartmentMutation();
  const [deleteDepartment] = useDeleteDepartmentMutation();
  const handleOpenModal = (record?: any) => {
    if (record) {
      setEditingData(record);
      form.setFieldsValue(record);
    } else {
      setEditingData(null);
      form.resetFields();
    }
    setOpenModal(true);
  };

  const handleRowClick = (record: any) => {
    setSelectedDepartment(record);
    setOpenDetailModal(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingData) {
        // Gọi API update
        await updateDepartment({
          id: editingData.id,
          data: values
        }).unwrap();
        toast.success("Cập nhật chuyên khoa thành công!");
      } else {
        // Gọi API create
        await createDepartment(values).unwrap();
        toast.success("Thêm chuyên khoa thành công!");
      }
      setOpenModal(false);
      form.resetFields();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDepartment(id).unwrap();
      toast.success("Xóa chuyên khoa thành công!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const columns = [
    { title: "Tên chuyên khoa", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    { title: "Số bác sĩ", dataIndex: "doctor_count", key: "doctor_count" }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleOpenModal()}
        >
          Thêm chuyên khoa
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={data?.departments || []}
        rowKey="id"
        loading={isLoading}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
        pagination={{
          pageSize: data?.pageSize || 10,
          total: data?.total || 0,
          current: data?.page || 1
        }}
      />

      <Modal
        title={editingData ? "Chỉnh sửa chuyên khoa" : "Thêm chuyên khoa"}
        open={openModal}
        onOk={handleSubmit}
        onCancel={() => setOpenModal(false)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên chuyên khoa"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên chuyên khoa!" }]}
          >
            <Input placeholder="Nhập tên chuyên khoa" />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea placeholder="Nhập mô tả" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <SpecialtyDetail
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        department={selectedDepartment}
        onEdit={(record) => {
          setOpenDetailModal(false);
          handleOpenModal(record);
        }}
        onDelete={handleDelete}
        onRefetch={refetch}
      />
    </div>
  );
};

export default DepartmentDoctorManagement;
