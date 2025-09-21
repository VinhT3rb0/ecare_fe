"use client";

import React, { useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Space,
    Popconfirm,
} from "antd";
import { useCreateMedicineMutation, useDeleteMedicineMutation, useGetMedicinesQuery, useUpdateMedicineMutation } from "@/api/app_medicine/apiMedicine";
import StockAdjustModal from "./components/StockAdjustModal";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";


export default function MedicineManagement() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const { data, isLoading } = useGetMedicinesQuery({
        page,
        limit,
        search,
    });
    const [createMedicine] = useCreateMedicineMutation();
    const [updateMedicine] = useUpdateMedicineMutation();
    const [deleteMedicine] = useDeleteMedicineMutation();
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
    const onFinish = async (values: any) => {
        try {
            if (editing) {
                await updateMedicine({ id: editing.id, ...values }).unwrap();
            } else {
                await createMedicine(values).unwrap();
            }
            setOpen(false);
            form.resetFields();
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [
        { title: "Tên thuốc", dataIndex: "name" },
        { title: "Công dụng", dataIndex: "description" },
        { title: "Đơn vị", dataIndex: "unit" },
        {
            title: "Giá",
            dataIndex: "price",
            render: (v: number) => `${Number(v).toLocaleString()} đ`,
        },
        { title: "Tồn kho", dataIndex: "stock_quantity" },
        { title: "Hãng SX", dataIndex: "manufacturer" },
        {
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        onClick={() => {
                            setEditing(record);
                            form.setFieldsValue(record);
                            setOpen(true);
                        }}
                    >
                        <EditOutlined />
                    </Button>
                    <Button
                        onClick={() => {
                            setSelectedMedicine(record);
                            setStockModalOpen(true);
                        }}
                    >
                        +
                    </Button>
                    <Popconfirm
                        title="Xoá thuốc?"
                        onConfirm={() => deleteMedicine(record.id)}
                    >
                        <Button danger><DeleteOutlined /></Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm thuốc"
                    onSearch={(v) => setSearch(v)}
                    allowClear
                />
                <Button
                    type="primary"
                    onClick={() => {
                        setEditing(null);
                        form.resetFields();
                        setOpen(true);
                    }}
                >
                    Thêm thuốc
                </Button>
            </Space>

            <Table
                loading={isLoading}
                columns={columns}
                dataSource={data?.data || []}
                rowKey="id"
                pagination={{
                    current: page,
                    total: data?.total,
                    pageSize: limit,
                    onChange: (p) => setPage(p),
                }}
            />

            <Modal
                title={editing ? "Cập nhật thuốc" : "Thêm thuốc"}
                open={open}
                onCancel={() => setOpen(false)}
                onOk={() => form.submit()}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Tên thuốc"
                        name="name"
                        rules={[{ required: true, message: "Nhập tên thuốc" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Mô tả" name="description">
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item label="Đơn vị" name="unit">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[{ required: true, message: "Nhập giá" }]}
                    >
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        label="Tồn kho"
                        name="stock_quantity"
                        rules={[{ required: true, message: "Nhập số lượng tồn kho" }]}
                    >
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item label="Hãng sản xuất" name="manufacturer">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
            <StockAdjustModal
                open={stockModalOpen}
                onClose={() => setStockModalOpen(false)}
                medicine={selectedMedicine}
            />
        </div>
    );
}
