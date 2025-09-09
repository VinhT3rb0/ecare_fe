"use client"
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setIsAuth } from "@/lib/features/authSlice";
import { useLoginMutation } from "@/api/app_home/apiAccount";
import LoginForm from "./components/LoginForm";
import { notification } from "antd";
function Login() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [userLogin, { isLoading }] = useLoginMutation();
    const [errorLogin, setErrorLogin] = useState<string | null>(null);
    const onChangeInput = () => {
        setErrorLogin(null);
    };
    const onFinish = async (values: { email: string; password: string }) => {
        try {
            const result = await userLogin({
                email: values.email,
                password: values.password,
            });

            if ("data" in result && result.data) {
                setCookie("access_token", result.data.token, {
                    maxAge: 3 * 60 * 60,
                    path: "/",
                });
                setCookie("role", result.data.role, {
                    maxAge: 3 * 60 * 60,
                    path: "/",
                });
                setCookie("idUser", result.data.id, {
                    maxAge: 3 * 60 * 60,
                    path: "/",
                });
                dispatch(setIsAuth(true));
                router.push("/");
            } else if ("error" in result) {
                const errorDetail = result as unknown as {
                    error: { data: { detail: string } };
                };
                setErrorLogin(errorDetail.error.data?.detail || "Có lỗi xảy ra");
            }
        } catch (err) {
            console.error("Failed to login", err);
        }
    };
    return (
        <LoginForm
            onFinish={onFinish}
            error={errorLogin}
            onChangeInput={onChangeInput}
            loading={isLoading}
        />
    );
}
export default Login;
