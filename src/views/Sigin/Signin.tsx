// src/views/Sigin/Signin.tsx
"use client";
import React, { useState } from "react";
import { notification } from "antd";
import OTPVerifyForm from "./components/OTPVerifyForm";
import SigninForm from "./components/SigninForm";
import {
    useCreateAccountMutation,
    useVerifyAccountMutation,
    useResetOtpMutation,
} from "@/api/app_home/apiAccount";

const Sigin: React.FC = () => {
    const [step, setStep] = useState<"register" | "verify">("register");
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [createAccount] = useCreateAccountMutation();
    const [verifyAccount] = useVerifyAccountMutation();
    const [resetOtp] = useResetOtpMutation();
    const handleRegister = async (values: { email: string; password: string; confirmPassword: string }) => {
        setLoading(true);
        try {
            const res: any = await createAccount({
                email: values.email,
                password: values.password,
                role: "patient",
            });
            if (res && !res.error) {
                setEmail(values.email);
                setStep("verify");
                notification.success({ message: "Đã gửi mã OTP về email của bạn!" });
            } else {
                notification.error({ message: res?.error?.data?.detail || "Đăng ký thất bại!" });
            }
        } catch (err) {
            notification.error({ message: "Đăng ký thất bại!" });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (otp: string) => {
        setLoading(true);
        try {
            const res: any = await verifyAccount({ email, otp });
            if (res && !res.error) {
                notification.success({ message: "Đăng ký thành công!" });
            } else {
                notification.error({ message: res?.error?.data?.detail || "Xác thực OTP thất bại!" });
            }
        } catch (err) {
            notification.error({ message: "Xác thực OTP thất bại!" });
        } finally {
            setLoading(false);
        }
    };

    // Gửi lại OTP
    const handleResendOtp = async () => {
        setLoading(true);
        try {
            const res: any = await resetOtp({ email });
            if (res && !res.error) {
                notification.success({ message: "Đã gửi lại mã OTP!" });
            } else {
                notification.error({ message: res?.error?.data?.detail || "Gửi lại OTP thất bại!" });
            }
        } catch (err) {
            notification.error({ message: "Gửi lại OTP thất bại!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {step === "register" ? (
                <SigninForm onFinish={handleRegister} loading={loading} />
            ) : (
                <OTPVerifyForm onVerify={handleVerify} loading={loading} onResendOtp={handleResendOtp} />
            )}
        </div>
    );
};

export default Sigin;