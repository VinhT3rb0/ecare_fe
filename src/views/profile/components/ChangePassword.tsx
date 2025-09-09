"use client";
import React from "react";
import { Form, Input, Button, notification } from "antd";
import { useChangePasswordMutation } from '@/api/app_home/apiAccount';

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [changePassword, { isLoading }] = useChangePasswordMutation();
    notification.info({ message: "Test notification" });
    const handleFinish = async (values: any) => {
        try {
            // Loại bỏ confirmPassword trước khi gửi đi
            const { confirmPassword, ...dataToSend } = values;
            await changePassword(dataToSend).unwrap();
            notification.success({ message: "Đổi mật khẩu thành công!" });
            form.resetFields();
        } catch (e: any) {
            notification.error({ message: e?.data?.detail || "Đổi mật khẩu thất bại!" });
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="max-w-md mx-auto"
        >
            <Form.Item
                label="Mật khẩu hiện tại"
                name="oldPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }]}
            >
                <Input.Password placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                    { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading} className="w-full">
                    Đổi mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};

export default ChangePassword;
