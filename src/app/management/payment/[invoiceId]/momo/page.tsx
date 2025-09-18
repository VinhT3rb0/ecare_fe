"use client";

import { useParams } from "next/navigation";
import { Button, Spin, Typography, message } from "antd";
import { useCreateMomoPaymentMutation } from "@/api/app_payment/apiPayment";
import toast from "react-hot-toast";

export default function MomoPaymentPage() {
    const { invoiceId } = useParams<{ invoiceId: string }>();
    const [createMomoPayment, { isLoading }] = useCreateMomoPaymentMutation();

    const handlePay = async () => {
        try {
            const res = await createMomoPayment({ invoice_id: Number(invoiceId) }).unwrap();
            if (res.payUrl || res.deeplink) {
                window.location.href = (res.payUrl || res.deeplink)!;
            } else {
                toast.error("Không tạo được link thanh toán MoMo");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Thanh toán thất bại");
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: 80 }}>
            <Typography.Title level={3}>Thanh toán MoMo cho hóa đơn #{invoiceId}</Typography.Title>
            <Spin spinning={isLoading}>
                <Button type="primary" size="large" onClick={handlePay}>
                    Thanh toán ngay
                </Button>
            </Spin>
        </div>
    );
}
