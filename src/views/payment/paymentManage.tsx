"use client";

import { useState } from "react";
import { Card, Form, InputNumber, Button, Typography, message } from "antd";
import { useCreateMomoPaymentMutation } from "@/api/app_payment/apiPayment";

const { Title } = Typography;

export default function PaymentManage() {
    const [form] = Form.useForm();
    const [createPayment, { isLoading }] = useCreateMomoPaymentMutation();
    const [url, setUrl] = useState<string | null>(null);

    const onFinish = async (values: any) => {
        try {
            const res = await createPayment({ invoice_id: Number(values.invoice_id) }).unwrap();
            const payLink = (res.payUrl || res.deeplink || res.qrCodeUrl) ?? null;
            setUrl(payLink);
            if (payLink) window.location.href = payLink;
        } catch (err: any) {
            message.error(err?.data?.message || "Tạo link thanh toán thất bại");
        }
    };

    return (
        <Card>
            <Title level={4}>Thanh toán MoMo</Title>
            <Form layout="vertical" form={form} onFinish={onFinish}>
                <Form.Item label="Mã hóa đơn" name="invoice_id" rules={[{ required: true, message: "Nhập ID hóa đơn" }]}>
                    <InputNumber min={1} style={{ width: "100%" }} placeholder="Nhập ID hóa đơn" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={isLoading}>Tạo link thanh toán</Button>
            </Form>
        </Card>
    );
}


