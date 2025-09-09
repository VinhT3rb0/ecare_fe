"use client";

import React from "react";
import { Button, Form, Input, Typography, Card } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

interface SiginFormProps {
    onFinish: (values: { email: string; password: string; confirmPassword: string }) => void;
    loading?: boolean;
}

const { Title, Text } = Typography;

const SigninForm: React.FC<SiginFormProps> = ({ onFinish, loading }) => {
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

            {/* Card đăng ký */}
            <Card
                className="relative z-10 w-full max-w-md mx-4 p-8 rounded-2xl shadow-2xl bg-white/90"
            >
                {/* Logo hoặc avatar */}
                <div className="flex justify-center mb-6">
                    <img src="/images/logoEcare.png" alt="Logo" className="h-20" />
                </div>

                <Title level={2} className="text-center text-blue-600 mb-4">
                    Đăng ký tài khoản
                </Title>

                <Form
                    name="register"
                    layout="vertical"
                    onFinish={onFinish}
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
                        rules={[
                            { required: true, message: "Vui lòng nhập mật khẩu!" },
                            { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                        ]}
                        hasFeedback
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••••"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label={<Text strong>Nhập lại mật khẩu</Text>}
                        dependencies={["password"]}
                        hasFeedback
                        rules={[
                            { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue("password") === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error("Mật khẩu không khớp!"));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="••••••••"
                            className="rounded-lg"
                        />
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
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SigninForm; 