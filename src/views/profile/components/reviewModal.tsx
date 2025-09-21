"use client";

import React, { useState } from "react";
import { Modal, Rate, Input, Form, Button, message } from "antd";
import { useCreateReviewMutation } from "@/api/app_review/apiReview";
import toast from "react-hot-toast";

interface ReviewModalProps {
    open: boolean;
    onClose: () => void;
    doctorId: number;
    patientId: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose, doctorId, patientId }) => {
    const [form] = Form.useForm();
    const [createReview, { isLoading }] = useCreateReviewMutation();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await createReview({
                doctor_id: doctorId,
                patient_id: patientId,
                rating: values.rating,
                comment: values.comment,
            }).unwrap();

            toast.success("Đánh giá thành công!");
            form.resetFields();
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Không thể gửi đánh giá");
        }
    };

    return (
        <Modal
            open={open}
            title="Đánh giá bác sĩ"
            onCancel={onClose}
            footer={null}
        >
            <Form layout="vertical" form={form}>
                <Form.Item
                    label="Đánh giá"
                    name="rating"
                    rules={[{ required: true, message: "Vui lòng chọn số sao" }]}
                >
                    <Rate />
                </Form.Item>
                <Form.Item label="Nhận xét" name="comment">
                    <Input.TextArea rows={4} placeholder="Nhập nhận xét của bạn..." />
                </Form.Item>
                <Form.Item>
                    <Button
                        type="primary"
                        block
                        onClick={handleSubmit}
                        loading={isLoading}
                        style={{ background: "#11A998", borderColor: "#11A998" }}
                    >
                        Gửi đánh giá
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ReviewModal;
