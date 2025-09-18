"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Spin, Result, Button } from "antd";
import { useMomoReturnQuery } from "@/api/app_payment/apiPayment";
import { useUpdateMedicineStockMutation } from "@/api/app_medicine/apiMedicine";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MomoReturnPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => (queryObj[key] = value));
    const [updateMedicineStock] = useUpdateMedicineStockMutation();
    const [stockUpdated, setStockUpdated] = useState(false);

    const { data, error, isFetching } = useMomoReturnQuery(queryObj, {
        skip: Object.keys(queryObj).length === 0,
    });

    // Cập nhật số lượng tồn kho khi thanh toán thành công
    useEffect(() => {
        const updateStock = async () => {
            if (data?.success && data?.data?.invoice_id && !stockUpdated) {
                try {
                    await updateMedicineStock({ invoiceId: data.data.invoice_id }).unwrap();
                    setStockUpdated(true);
                    toast.success("Đã cập nhật số lượng tồn kho thuốc");
                } catch (err) {
                    console.error("Lỗi khi cập nhật số lượng tồn kho:", err);
                    toast.error("Không thể cập nhật số lượng tồn kho thuốc");
                }
            }
        };

        updateStock();
    }, [data, updateMedicineStock, stockUpdated]);

    if (isFetching) return <Spin tip="Đang xác minh thanh toán..." />;

    if (error) {
        return (
            <Result
                status="error"
                title="Thanh toán thất bại"
                subTitle={(error as any)?.data?.message || "Có lỗi xảy ra trong quá trình thanh toán"}
                extra={<Button onClick={() => router.push("/management/payment")}>Quay lại</Button>}
            />
        );
    }

    return (
        <Result
            status="success"
            title="Thanh toán thành công"
            subTitle={`Giao dịch đã được ghi nhận qua MoMo`}
            extra={<Button onClick={() => router.push("/")}>Về trang chủ</Button>}
        />
    );
}


