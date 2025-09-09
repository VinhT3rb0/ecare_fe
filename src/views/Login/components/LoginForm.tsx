"use client";

import React from "react";
import { Button, Form, Input, Typography, Alert, Card, Checkbox } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

interface LoginFormProps {
    onFinish: (values: { email: string; password: string }) => void;
    error?: string | null;
    onChangeInput?: () => void;
    loading?: boolean;
}

const { Title, Text } = Typography;

const LoginForm: React.FC<LoginFormProps> = ({
    onFinish,
    error,
    onChangeInput,
    loading,
}) => {
    return (
        <div
            className="flex min-h-screen items-center justify-center bg-gray-100"
            style={{
                backgroundImage: "url('/images/backroundlogin.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            {/* Màn hình tối mờ */}
            <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>

            {/* Card đăng nhập */}
            <Card
                className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl bg-white/90"
            >
                {/* Logo hoặc avatar */}
                <div className="flex justify-center mb-6">
                    <img src="\images\logoEcare.png" alt="Logo" className="h-20" />
                </div>

                <Title level={2} className="text-center text-blue-600 mb-4">
                    Đăng nhập
                </Title>

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        className="mb-6"
                        closeText="Đóng"
                    />
                )}

                <Form
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    onChange={onChangeInput}
                    autoComplete="off"
                >
                    <Form.Item
                        name="email"
                        label={<Text strong>Email</Text>}
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input
                            size="large"
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="email@example.com"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={<Text strong>Mật khẩu</Text>}
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••••"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item className="flex items-center justify-between mb-6">
                        <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                            Quên mật khẩu?
                        </a>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            style={{ backgroundColor: '#11A998' }}
                            type="primary"
                            htmlType="submit"

                            size="large"
                            loading={loading}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                        >
                            Đăng nhập
                        </Button><br />
                        Hoặc <a href="/signin">Đăng ký ngay!</a>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginForm;
