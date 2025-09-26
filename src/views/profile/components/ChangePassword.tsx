"use client";
import React, { useMemo } from "react";
import { Form, Input, Button, notification, Progress, Space, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useChangePasswordMutation } from "@/api/app_home/apiAccount";

const { Text } = Typography;

const passwordStrength = (pwd = "") => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const labels = ["Quá yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];
    return { score, label: labels[score] || "Quá yếu" };
};

const ChangePassword: React.FC = () => {
    const [form] = Form.useForm();
    const [changePassword, { isLoading }] = useChangePasswordMutation();

    // Lấy newPassword để tính strength
    const newPassword = Form.useWatch("newPassword", form) as string | undefined;
    const strength = useMemo(() => passwordStrength(newPassword || ""), [newPassword]);

    const handleFinish = async (values: any) => {
        try {
            const { confirmPassword, ...dataToSend } = values;
            await changePassword(dataToSend).unwrap();
            notification.success({ message: "Đổi mật khẩu thành công!" });
            form.resetFields();
        } catch (e: any) {
            const errMsg = e?.data?.detail || e?.data?.message || "Đổi mật khẩu thất bại!";
            notification.error({ message: errMsg });
        }
    };

    return (
        // Wrapper phù hợp với layout ngoài (không tạo card nhỏ)
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Nếu tab bên ngoài đã có tiêu đề, bỏ heading; nếu chưa, bật dòng dưới */}
            {/* <h2 className="text-2xl font-semibold mb-4">Bảo mật / Đổi mật khẩu</h2> */}

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                requiredMark={false}
                className="w-full"
            >
                <Form.Item
                    label="Mật khẩu hiện tại"
                    name="oldPassword"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                >
                    <Input.Password
                        placeholder="Nhập mật khẩu hiện tại"
                        prefix={<LockOutlined />}
                        autoComplete="current-password"
                        className="rounded-md"
                    />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu mới"
                    name="newPassword"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới" },
                        { min: 8, message: "Mật khẩu phải ít nhất 8 ký tự" },
                        { pattern: /[0-9]/, message: "Mật khẩu phải chứa ít nhất một chữ số" },
                        { pattern: /[A-Za-z]/, message: "Mật khẩu phải chứa ít nhất một chữ cái" },
                    ]}
                    hasFeedback
                >
                    <Input.Password
                        placeholder="Ít nhất 8 ký tự, gồm chữ và số"
                        prefix={<LockOutlined />}
                        autoComplete="new-password"
                        className="rounded-md"
                    />
                </Form.Item>

                {/* Độ mạnh hiển thị full-width, nằm ngay sau input, không tạo box */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 mr-4">
                        <Progress percent={Math.round((strength.score / 4) * 100)} showInfo={false} strokeLinecap="round" />
                    </div>
                    <div style={{ minWidth: 100, textAlign: "right" }}>
                        <Text strong>{strength.label}</Text>
                    </div>
                </div>

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
                    hasFeedback
                >
                    <Input.Password
                        placeholder="Xác nhận mật khẩu mới"
                        prefix={<LockOutlined />}
                        autoComplete="new-password"
                        className="rounded-md"
                    />
                </Form.Item>

                {/* Các note / message ở dưới cùng (full-width) */}
                <div className="mb-4">
                    {strength.score < 2 ? (
                        <Text type="warning">
                            Mật khẩu quá yếu — vui lòng chọn mật khẩu dài hơn và bao gồm chữ và số.
                        </Text>
                    ) : (
                        <Text type="secondary">Mật khẩu nên bao gồm chữ hoa và ký tự đặc biệt để an toàn hơn.</Text>
                    )}
                </div>

                {/* Nút nằm ở bên phải, không nổi giữa */}
                <div className="flex justify-end">
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            disabled={strength.score < 2}
                        >
                            Đổi mật khẩu
                        </Button>
                    </Space>
                </div>
            </Form>
        </div>
    );
};

export default ChangePassword;
