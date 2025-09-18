"use client";

import React, { useState } from "react";
import {
    Modal,
    Form,
    Select,
    InputNumber,
    Input,
    Button,
    Space,
    message,
} from "antd";
import { MedicineBoxOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

interface MedicationFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (medication: any) => void;
    medicines: any[];
    initialData?: any;
    index?: number;
}

const MedicationForm: React.FC<MedicationFormProps> = ({
    open,
    onClose,
    onSave,
    medicines,
    initialData,
    index,
}) => {
    const [form] = Form.useForm();

    const handleSubmit = (values: any) => {
        onSave({ ...values, index });
        form.resetFields();
        onClose();
    };

    React.useEffect(() => {
        if (initialData) {
            form.setFieldsValue(initialData);
        } else {
            form.resetFields();
        }
    }, [initialData, form]);

    return (
        <Modal
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MedicineBoxOutlined style={{ color: "#0b6e64" }} />
                    <span style={{ color: "#0b6e64", fontWeight: 600 }}>
                        {index !== undefined ? "Chỉnh sửa thuốc" : "Thêm thuốc"}
                    </span>
                </div>
            }
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={() => form.submit()}
            destroyOnHidden
            width={700}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialData}
            >
                <Form.Item
                    label="Thuốc"
                    name="medicine_id"
                    rules={[{ required: true, message: "Vui lòng chọn thuốc" }]}
                >
                    <Select
                        placeholder="Chọn thuốc hoặc nhập để tìm kiếm"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                        }
                        searchValue={undefined}
                        autoClearSearchValue
                        allowClear
                    >
                        {medicines.map((medicine) => (
                            <Option key={medicine.id} value={medicine.id}>
                                {medicine.name} - {medicine.unit} - {Number(medicine.price).toLocaleString()}đ
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Số lượng"
                    name="quantity"
                    rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                >
                    <InputNumber
                        min={1}
                        style={{ width: "100%" }}
                        placeholder="Nhập số lượng"
                    />
                </Form.Item>

                <Form.Item
                    label="Liều lượng"
                    name="dosage"
                    rules={[{ required: true, message: "Vui lòng nhập liều lượng" }]}
                >
                    <Input
                        placeholder="Ví dụ: 1 viên/lần, 2 lần/ngày"
                    />
                </Form.Item>

                <Form.Item
                    label="Hướng dẫn sử dụng"
                    name="instructions"
                >
                    <TextArea
                        rows={3}
                        placeholder="Hướng dẫn chi tiết cách sử dụng thuốc..."
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default MedicationForm;
