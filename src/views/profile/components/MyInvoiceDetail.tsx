"use client";

import { useUpdateInvoiceMutation } from "@/api/app_invoice/apiInvoice";
import { useCreateMomoPaymentMutation } from "@/api/app_payment/apiPayment";
import { Modal, Button, Descriptions, Table, Tag, Typography, Avatar, Spin } from "antd";
import React, { useState } from "react";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    onClose: () => void;
    invoice: any | null;
};

interface ServiceRow {
    key: string;
    name: string;
    price: number;
    quantity: number;
    insurance: number;
    total: number;
}

interface MedicineRow {
    key: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    dosage: string;
    note: string | null;
    total: number;
}

export default function MyInvoiceDetail({ open, onClose, invoice }: Props) {
    if (!invoice) return null;

    const [useInsurance] = useState<boolean>(invoice?.has_insurance ?? false);
    const [createMomoPayment, { isLoading: isCreating }] = useCreateMomoPaymentMutation();
    const [updateInvoice] = useUpdateInvoiceMutation();

    const statusColor = invoice.status === "paid" ? "green" : "orange";

    // Dữ liệu dịch vụ
    const serviceData: ServiceRow[] = (invoice.invoicePackages || []).map((ip: any) => {
        const price = Number(ip.price);
        const discount = Number(ip.package?.discount || 0);
        const insurancePay = useInsurance ? (price * discount / 100) * ip.quantity : 0;
        const net = price * ip.quantity - insurancePay;

        return {
            key: `${ip.invoice_id}-${ip.package_id}`,
            name: ip.package?.name,
            price,
            quantity: ip.quantity,
            insurance: insurancePay,
            total: net,
        };
    });

    // Dữ liệu thuốc
    const medicineData: MedicineRow[] = (invoice.invoiceMedicines || []).map((m: any) => {
        const price = Number(m.price);
        const total = price * m.quantity;
        return {
            key: `${m.invoice_id}-${m.medicine_id}`,
            name: m.Medicine?.name,
            unit: m.Medicine?.unit,
            price,
            quantity: m.quantity,
            dosage: m.dosage,
            note: m.note,
            total,
        };
    });

    const totalService = serviceData.reduce((sum, row) => sum + row.total, 0);
    const totalInsurance = serviceData.reduce((sum, row) => sum + row.insurance, 0);
    const totalMedicine = medicineData.reduce((sum, row) => sum + row.total, 0);

    const handlePay = async () => {
        try {
            await updateInvoice({ id: invoice.id, payment_method: "Momo" }).unwrap();
            const totalAmount = totalService + totalMedicine;
            const res = await createMomoPayment({ invoice_id: invoice.id, amount: totalAmount }).unwrap();
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
        <Modal
            title={`Hóa đơn #${invoice.id}`}
            open={open}
            onCancel={onClose}
            footer={[
                <Spin spinning={isCreating} key="pay-spin">
                    <Button
                        key="pay"
                        type="primary"
                        disabled={invoice.status === "paid"}
                        onClick={handlePay}
                    >
                        {invoice.status === "paid" ? "Đã thanh toán" : "Thanh toán MoMo"}
                    </Button>
                </Spin>,
            ]}
            width={1000}
        >
            {/* Trạng thái & BHYT */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Tag color={statusColor}>{invoice.status}</Tag>
                <Tag color={useInsurance ? "blue" : "default"}>
                    {useInsurance ? "Có BHYT" : "Không BHYT"}
                </Tag>
            </div>

            {/* Bệnh nhân */}
            <Descriptions title="👤 Bệnh nhân" bordered column={2} size="middle">
                <Descriptions.Item label="Họ tên">{invoice.Appointment?.patient_name}</Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                    {new Date(invoice.Appointment?.patient_dob).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="SĐT">{invoice.Appointment?.patient_phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{invoice.Appointment?.patient_email}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>{invoice.Appointment?.patient_address}</Descriptions.Item>
            </Descriptions>

            {/* Bác sĩ */}
            <Descriptions title="🩺 Bác sĩ" bordered column={2} size="middle" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Họ tên">{invoice.Appointment?.Doctor?.full_name}</Descriptions.Item>
                <Descriptions.Item label="Khoa">{invoice.Appointment?.Department?.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{invoice.Appointment?.Doctor?.email}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{invoice.Appointment?.Doctor?.phone}</Descriptions.Item>
            </Descriptions>

            {/* Cuộc hẹn */}
            <Descriptions title="📅 Cuộc hẹn" bordered column={2} size="middle" style={{ marginTop: 16 }}>
                <Descriptions.Item label="Ngày hẹn">
                    {new Date(invoice.Appointment?.appointment_date).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Khung giờ">{invoice.Appointment?.time_slot}</Descriptions.Item>
                <Descriptions.Item label="Lý do khám" span={2}>{invoice.Appointment?.reason}</Descriptions.Item>
            </Descriptions>

            {/* Dịch vụ */}
            <h3 style={{ marginTop: 24 }}>🧾 Dịch vụ</h3>
            <Table
                dataSource={serviceData}
                columns={[
                    { title: "Dịch vụ", dataIndex: "name" },
                    { title: "Đơn giá", dataIndex: "price", render: (v) => `${Number(v).toLocaleString()} đ` },
                    { title: "Số lượng", dataIndex: "quantity" },
                    { title: "BHYT chi trả", dataIndex: "insurance", render: (v) => `${Number(v).toLocaleString()} đ` },
                    { title: "Thành tiền (BN trả)", dataIndex: "total", render: (v) => `${Number(v).toLocaleString()} đ` },
                ]}
                pagination={false}
                bordered
                summary={() => (
                    <>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}><b>Tổng BHYT chi trả</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={3}><b>{totalInsurance.toLocaleString()} đ</b></Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3}><b>Tổng dịch vụ BN trả</b></Table.Summary.Cell>
                            <Table.Summary.Cell index={3}><b>{totalService.toLocaleString()} đ</b></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </>
                )}
            />

            {/* Thuốc */}
            <h3 style={{ marginTop: 24 }}>💊 Thuốc</h3>
            <Table
                dataSource={medicineData}
                columns={[
                    { title: "Thuốc", dataIndex: "name" },
                    { title: "Đơn vị", dataIndex: "unit" },
                    { title: "Đơn giá", dataIndex: "price", render: (v) => `${Number(v).toLocaleString()} đ` },
                    { title: "SL", dataIndex: "quantity" },
                    { title: "Liều", dataIndex: "dosage" },
                    { title: "Ghi chú", dataIndex: "note" },
                    { title: "Thành tiền", dataIndex: "total", render: (v) => `${Number(v).toLocaleString()} đ` },
                ]}
                pagination={false}
                bordered
                summary={() => (
                    <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={6}><b>Tổng thuốc</b></Table.Summary.Cell>
                        <Table.Summary.Cell index={6}><b>{totalMedicine.toLocaleString()} đ</b></Table.Summary.Cell>
                    </Table.Summary.Row>
                )}
            />

            {/* Tổng hóa đơn */}
            <div style={{ marginTop: 16, textAlign: "right" }}>
                <Typography.Title level={5}>
                    Tổng hóa đơn: {(totalService + totalMedicine).toLocaleString()} đ
                </Typography.Title>
            </div>
        </Modal>
    );
}
