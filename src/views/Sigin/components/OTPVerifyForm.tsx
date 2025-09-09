// src/views/Sigin/components/OTPVerifyForm.tsx
import React from "react";
import { Form, Input, Button, Card, Typography } from "antd";

interface OTPVerifyFormProps {
    onVerify: (otp: string) => void;
    loading?: boolean;
    onResendOtp?: () => void;
}
const { Title, Text } = Typography;

const OTPVerifyForm: React.FC<OTPVerifyFormProps> = ({ onVerify, loading, onResendOtp }) => (
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
                Xác thực tài khoản
            </Title>
            <Form
                name="otp-verify"
                layout="vertical"
                onFinish={(values) => onVerify(values.otp)}
            >
                <Form.Item
                    label="Nhập mã OTP (6 số)"
                    name="otp"
                    rules={[
                        { required: true, message: "Vui lòng nhập mã OTP!" },
                        { len: 6, message: "Mã OTP gồm 6 số!" },
                        { pattern: /^\d{6}$/, message: "Chỉ nhập số!" },
                    ]}
                >
                    <Input maxLength={6} placeholder="______" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}
                        style={{ backgroundColor: '#11A998' }}

                        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                    >
                        Xác thực OTP
                    </Button>
                    {onResendOtp && (
                        <Button type="link" onClick={onResendOtp} disabled={loading} className="w-full">
                            Gửi lại OTP
                        </Button>
                    )}
                </Form.Item>
            </Form>
        </Card>
    </div>
);

export default OTPVerifyForm;