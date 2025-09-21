"use client";

import React from "react";
import { Modal, Form, InputNumber, Select } from "antd";
import { useUpdateMedicineStockMutation } from "@/api/app_medicine/apiMedicine";
import toast from "react-hot-toast";

interface StockAdjustModalProps {
    open: boolean;
    onClose: () => void;
    medicine: any; // hoặc interface thuốc
}

const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
    open,
    onClose,
    medicine,
}) => {
    const [form] = Form.useForm();
    const [updateStock, { isLoading }] = useUpdateMedicineStockMutation();

    const handleFinish = async (values: any) => {
        try {
            await updateStock({
                medications: [
                    {
                        medicine_id: medicine.id,
                        quantity: values.quantity,
                        action: values.action,
                    },
                ],
            }).unwrap();
            toast.success(
                `${values.action === "import" ? "Nhập" : "Xuất"} thuốc ${medicine.name
                } thành công`
            );
            onClose();
            form.resetFields();
        } catch (err: any) {
            toast.error(
                err?.data?.message || "Có lỗi xảy ra khi cập nhật số lượng tồn kho"
            );
        }
    };

    return (
        <Modal
            title={`Nhập/Xuất thuốc: ${medicine?.name || ""}`}
            open={open}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={isLoading}
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Form.Item
                    name="action"
                    label="Hành động"
                    rules={[{ required: true, message: "Chọn hành động" }]}
                >
                    <Select placeholder="Chọn hành động">
                        <Select.Option value="import">Nhập (+)</Select.Option>
                        <Select.Option value="export">Xuất (-)</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[{ required: true, message: "Nhập số lượng" }]}
                >
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StockAdjustModal;
