"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Row, Col } from "antd";
import toast from "react-hot-toast";
import {
    useCreateDoctorAccountMutation,
    useUpdateDoctorAndDegreeMutation,
} from "@/api/app_doctor/apiDoctor";

interface AddAndUpdateDoctorAccountProps {
    open: boolean;
    onClose: () => void;
    initialData?: any;
    onSuccess?: () => void;
}

const AddAndUpdateDoctorAccount: React.FC<
    AddAndUpdateDoctorAccountProps
> = ({ open, onClose, initialData, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Hooks gọi API
    const [createDoctorAccount] = useCreateDoctorAccountMutation();
    const [updateDoctorAndDegree] = useUpdateDoctorAndDegreeMutation();

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.setFieldsValue({
                    full_name: initialData.full_name,
                    email: initialData.email,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, initialData, form]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            if (initialData?.id) {
                // UPDATE bác sĩ
                const payload = {
                    doctor_id: initialData.id,
                    formData: new FormData(),
                };

                payload.formData.append("full_name", values.full_name);
                payload.formData.append("email", values.email);

                if (values.password) {
                    payload.formData.append("password", values.password);
                }

                await updateDoctorAndDegree(payload).unwrap();
                toast.success("Cập nhật bác sĩ thành công!");
            } else {
                // CREATE bác sĩ
                await createDoctorAccount({
                    email: values.email,
                    password: values.password,
                    full_name: values.full_name,
                }).unwrap();
                toast.success("Thêm bác sĩ thành công!");
            }

            onSuccess?.();
            onClose();
            form.resetFields();
        } catch (error: any) {
            toast.error(error?.data?.message || "Có lỗi xảy ra!");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title={initialData ? "Chỉnh sửa thông tin bác sĩ" : "Thêm bác sĩ mới"}
            open={open}
            onOk={handleSubmit}
            onCancel={handleCancel}
            width={600}
            okText="Lưu"
            cancelText="Hủy"
            confirmLoading={loading}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" preserve={false}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Họ và tên"
                            name="full_name"
                            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                        >
                            <Input placeholder="Nhập họ và tên bác sĩ" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email!" },
                                { type: "email", message: "Email không hợp lệ!" },
                            ]}
                        >
                            <Input placeholder="Nhập email" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[
                                { required: !initialData, message: "Vui lòng nhập mật khẩu!" },
                                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                            ]}
                        >
                            <Input.Password
                                placeholder={
                                    initialData
                                        ? "Để trống nếu không đổi"
                                        : "Nhập mật khẩu mới"
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            dependencies={["password"]}
                            rules={[
                                {
                                    required: !initialData,
                                    message: "Vui lòng xác nhận mật khẩu!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("Mật khẩu không khớp!")
                                        );
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                placeholder={
                                    initialData
                                        ? "Để trống nếu không đổi"
                                        : "Xác nhận mật khẩu"
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default AddAndUpdateDoctorAccount;
