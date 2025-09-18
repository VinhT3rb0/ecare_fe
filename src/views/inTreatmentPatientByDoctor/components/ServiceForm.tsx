"use client";

import React, { useState } from "react";
import {
    Modal,
    Form,
    Select,
    InputNumber,
    Input,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

interface ServiceFormProps {
    open: boolean;
    onClose: () => void;
    onSave: (service: any) => void;
    packages: any[];
    initialData?: any;
    index?: number;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
    open,
    onClose,
    onSave,
    packages,
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
                    <ShoppingCartOutlined style={{ color: "#0b6e64" }} />
                    <span style={{ color: "#0b6e64", fontWeight: 600 }}>
                        {index !== undefined ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ"}
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
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={initialData}
            >
                <Form.Item
                    label="Dịch vụ y tế"
                    name="package_id"
                    rules={[{ required: true, message: "Vui lòng chọn dịch vụ" }]}
                >
                    <Select
                        placeholder="Chọn dịch vụ y tế hoặc nhập để tìm kiếm"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                        }
                        searchValue={undefined}
                        autoClearSearchValue
                        allowClear
                    >
                        {packages.map((pkg) => (
                            <Option key={pkg.id} value={pkg.id}>
                                {pkg.name} - {Number(pkg.price).toLocaleString()}đ
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
                    label="Kết quả"
                    name="notes"
                >
                    <TextArea
                        rows={3}
                        placeholder="Kết quả sau khám"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ServiceForm;
