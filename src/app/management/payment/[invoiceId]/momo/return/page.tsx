"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Spin, Result, Button } from "antd";
import { useMomoReturnQuery } from "@/api/app_payment/apiPayment";
import { useUpdateMedicineStockMutation } from "@/api/app_medicine/apiMedicine";
import { useGetInvoiceMedicinesQuery } from "@/api/app_invoice/apiInvoice";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MomoReturnPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => (queryObj[key] = value));

    const { data, error, isFetching } = useMomoReturnQuery(queryObj, {
        skip: Object.keys(queryObj).length === 0,
    });

    const invoiceId = data?.data?.invoice_id;

    // lấy danh sách thuốc từ invoice
    const { data: invoiceMedicines, isFetching: loadingMedicines } =
        useGetInvoiceMedicinesQuery(invoiceId, { skip: !invoiceId });
    console.log(invoiceMedicines);

    const [updateMedicineStock] = useUpdateMedicineStockMutation();
    const [stockUpdated, setStockUpdated] = useState(false);

    useEffect(() => {
        const updateStock = async () => {
            if (invoiceId && invoiceMedicines?.data && !stockUpdated) {
                try {
                    // map về đúng format mà updateMedicineStock cần
                    const medications = invoiceMedicines.data.map((m: any) => ({
                        medicine_id: m.medicine_id,
                        quantity: m.quantity,
                        action: "export", // vì bán thuốc => trừ kho
                    }));

                    await updateMedicineStock({ medications }).unwrap();
                    setStockUpdated(true);
                    toast.success("Đã cập nhật số lượng tồn kho thuốc");
                } catch (err) {
                    console.error("Lỗi khi cập nhật số lượng tồn kho:", err);
                    toast.error("Không thể cập nhật số lượng tồn kho thuốc");
                }
            }
        };

        updateStock();
    }, [data, invoiceId, invoiceMedicines, updateMedicineStock, stockUpdated]);

    if (isFetching || loadingMedicines)
        return <Spin tip="Đang xác minh thanh toán..." />;

    if (error) {
        return (
            <Result
                status="error"
                title="Thanh toán thất bại"
                subTitle={
                    (error as any)?.data?.message ||
                    "Có lỗi xảy ra trong quá trình thanh toán"
                }
                extra={
                    <Button onClick={() => router.push("/management/payment")}>
                        Quay lại
                    </Button>
                }
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
