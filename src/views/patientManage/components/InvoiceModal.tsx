"use client";

import { Modal, Button, Descriptions, Table, Tag, Empty, Spin, Typography, Checkbox } from "antd";
import { useGetInvoiceByAppointmentQuery, useUpdateInvoiceMutation, useRemovePackageFromInvoiceMutation } from "@/api/app_invoice/apiInvoice";
import { useEffect, useMemo, useState } from "react";
import { useAddMedicinesFromMedicalRecordMutation, useGetInvoiceMedicinesQuery, useRemoveMedicineFromInvoiceMutation, useUpdateInvoiceMedicineQuantityMutation } from "@/api/app_invoice/apiInvoice";

import toast from "react-hot-toast";
import AddTreatmentServiceModal from "./AddTreatmentServiceModal";
type MedicineRow = {
    key: string;
    name: string;
    unit: string;
    price: number;
    quantity: number;
    dosage?: string;
    note?: string;
    medicine_id: number;
    invoice_id: number;
};

type Props = {
    open: boolean;
    onClose: () => void;
    appointment: any | null;
};
type ServiceRow = {
    key: string;
    name: string;
    price: number;
    quantity: number;
    insurance: number;
    total: number;
};
export default function InvoiceModal({ open, onClose, appointment }: Props) {
    const [updateInvoice] = useUpdateInvoiceMutation();
    const { data, isFetching } = useGetInvoiceByAppointmentQuery(appointment?.id!, { skip: !appointment?.id });
    const invoice = data?.data;
    const invoiceId = invoice?.id;
    const statusColor = invoice?.status === "paid" ? "green" : "orange";
    const [openAdd, setOpenAdd] = useState(false);
    const [useInsurance, setUseInsurance] = useState<boolean>(invoice?.has_insurance ?? false);
    const [removePackage] = useRemovePackageFromInvoiceMutation();
    const [addMedsFromRecord] = useAddMedicinesFromMedicalRecordMutation();
    const { data: medsData, refetch: refetchMeds, isFetching: fetchingMeds } = useGetInvoiceMedicinesQuery(invoiceId!, { skip: !invoiceId });
    const [removeMedicine] = useRemoveMedicineFromInvoiceMutation();
    const [updateMedicineQty] = useUpdateInvoiceMedicineQuantityMutation();
    const medsRows = useMemo(() => (
        (medsData?.data || []).map((row: any) => ({
            key: `${row.invoice_id}-${row.medicine_id}`,
            name: row.Medicine?.name,
            unit: row.Medicine?.unit,
            price: Number(row.price),
            quantity: row.quantity,
            dosage: row.dosage,
            note: row.note,
            medicine_id: row.medicine_id,
            invoice_id: row.invoice_id,
        }))
    ), [medsData]);
    useEffect(() => {
        if (invoice) {
            setUseInsurance(invoice.has_insurance ?? false);
        }
    }, [invoice]);

    return (
        <Modal
            title={`Hóa đơn #${invoice?.id ?? ""}`}
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="add" onClick={() => setOpenAdd(true)}>Thêm DV điều trị</Button>,
                <Button key="addMeds" onClick={async () => {
                    if (!invoiceId) return;
                    await addMedsFromRecord(invoiceId).unwrap();
                    await refetchMeds();
                }}>Thêm thuốc từ hồ sơ bệnh án</Button>,
                <Button key="pay" type="primary" onClick={() => {
                    if (invoiceId) {
                        window.location.href = `/management/payment/${invoiceId}`;
                    }
                }}>Thanh toán</Button>,
            ]}
            width={1000}
        >
            {isFetching ? (
                <Spin />
            ) : !invoice ? (
                <Empty description="Chưa có hóa đơn cho lịch hẹn này" />
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Tag color={statusColor}>{invoice.status}</Tag>
                        <Checkbox
                            checked={useInsurance}
                            onChange={async (e) => {
                                const checked = e.target.checked;
                                setUseInsurance(checked);
                                if (invoiceId) {
                                    try {
                                        await updateInvoice({ id: invoiceId, has_insurance: checked }).unwrap();
                                        toast.success("Cập nhật bảo hiểm thành công");
                                    } catch (err) {
                                        console.log(err);

                                        toast.error("Cập nhật bảo hiểm thất bại");
                                    }
                                }
                            }}
                        >
                            Bệnh nhân có BHYT
                        </Checkbox>
                    </div>

                    <Descriptions title="👤 Bệnh nhân" bordered column={2} size="middle">
                        <Descriptions.Item label="Họ tên">{invoice.Appointment?.patient_name}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">{new Date(invoice.Appointment?.patient_dob).toLocaleDateString()}</Descriptions.Item>
                        <Descriptions.Item label="SĐT">{invoice.Appointment?.patient_phone}</Descriptions.Item>
                        <Descriptions.Item label="Email">{invoice.Appointment?.patient_email}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ" span={2}>{invoice.Appointment?.patient_address}</Descriptions.Item>
                    </Descriptions>

                    <Descriptions title="🩺 Bác sĩ" bordered column={2} size="middle" style={{ marginTop: 16 }}>
                        <Descriptions.Item label="Họ tên">{invoice.Appointment?.Doctor?.full_name}</Descriptions.Item>
                        <Descriptions.Item label="Khoa">{invoice.Appointment?.Department?.name}</Descriptions.Item>
                        <Descriptions.Item label="Email">{invoice.Appointment?.Doctor?.email}</Descriptions.Item>
                        <Descriptions.Item label="SĐT">{invoice.Appointment?.Doctor?.phone}</Descriptions.Item>
                    </Descriptions>

                    <Descriptions title="📅 Cuộc hẹn" bordered column={2} size="middle" style={{ marginTop: 16 }}>
                        <Descriptions.Item label="Ngày hẹn">{new Date(invoice.Appointment?.appointment_date).toLocaleDateString()}</Descriptions.Item>
                        <Descriptions.Item label="Khung giờ">{invoice.Appointment?.time_slot}</Descriptions.Item>
                        <Descriptions.Item label="Lý do khám" span={2}>{invoice.Appointment?.reason}</Descriptions.Item>

                    </Descriptions>

                    <h3 style={{ marginTop: 24 }}>🧾 Dịch vụ</h3>
                    <Table<ServiceRow>
                        dataSource={(invoice.invoicePackages || []).map((ip: any) => {
                            const price = Number(ip.price);
                            const discount = Number(ip.package?.discount || 0);
                            const insurancePay = useInsurance ? (price * discount / 100) * ip.quantity : 0;
                            const gross = price * ip.quantity;
                            const net = gross - insurancePay;

                            return {
                                key: `${ip.invoice_id}-${ip.package_id}`,
                                name: ip.package?.name,
                                price,
                                quantity: ip.quantity,
                                insurance: insurancePay,
                                total: net,
                                invoice_id: ip.invoice_id,
                                package_id: ip.package_id,
                            };
                        })}
                        columns={[
                            { title: 'Dịch vụ', dataIndex: 'name' },
                            { title: 'Đơn giá', dataIndex: 'price', render: (v) => `${Number(v).toLocaleString()} đ` },
                            { title: 'Số lượng', dataIndex: 'quantity' },
                            { title: 'BHYT chi trả', dataIndex: 'insurance', render: (v) => `${Number(v).toLocaleString()} đ` },
                            { title: 'Thành tiền (BN trả)', dataIndex: 'total', render: (v) => `${Number(v).toLocaleString()} đ` },
                            {
                                title: '',
                                dataIndex: 'action',
                                render: (_, record: any) => (
                                    <Button
                                        danger
                                        size="small"
                                        onClick={async () => {
                                            try {
                                                await removePackage({ invoice_id: record.invoice_id, package_id: record.package_id }).unwrap();
                                                toast.success("Đã xoá dịch vụ khỏi hoá đơn");
                                            } catch (err) {
                                                toast.error("Xoá dịch vụ thất bại");
                                            }
                                        }}
                                    >
                                        −
                                    </Button>
                                ),
                            },
                        ]}
                        pagination={false}
                        bordered
                        summary={(pageData) => {
                            const totalAll = pageData.reduce((sum, row) => sum + row.total, 0);
                            const insuranceAll = pageData.reduce((sum, row) => sum + row.insurance, 0);

                            return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3}>
                                            <Typography.Text strong>Tổng BHYT chi trả</Typography.Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={3}>
                                            <Typography.Text strong>{insuranceAll.toLocaleString()} đ</Typography.Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}></Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={4}>
                                            <Typography.Text strong>Bệnh nhân cần trả</Typography.Text>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}>
                                            <Typography.Text strong>{totalAll.toLocaleString()} đ</Typography.Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            );
                        }}
                    />
                    <h3 style={{ marginTop: 24 }}>💊 Thuốc</h3>
                    <Table<MedicineRow>
                        dataSource={medsRows}
                        columns={[
                            { title: 'Thuốc', dataIndex: 'name' },
                            { title: 'Đơn vị', dataIndex: 'unit' },
                            { title: 'Đơn giá', dataIndex: 'price', render: (v) => `${Number(v).toLocaleString()} đ` },
                            { title: 'SL', dataIndex: 'quantity' },
                            { title: 'Liều', dataIndex: 'dosage' },
                            { title: 'Ghi chú', dataIndex: 'note' },
                            {
                                title: 'Tổng tiền',
                                dataIndex: 'price',
                                render: (v, record) => {
                                    const price = Number(v);
                                    const total = price * record.quantity;
                                    return `${total.toLocaleString()} đ`;
                                }
                            },
                            {
                                title: '',
                                dataIndex: 'action',
                                render: (_, record: any) => (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <Button
                                            size="small"
                                            onClick={async () => {
                                                await updateMedicineQty({ invoice_id: record.invoice_id, medicine_id: record.medicine_id, quantity: record.quantity + 1 }).unwrap();
                                                await refetchMeds();
                                            }}
                                        >+
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={async () => {
                                                const newQty = record.quantity - 1;
                                                if (newQty <= 0) {
                                                    await removeMedicine({ invoice_id: record.invoice_id, medicine_id: record.medicine_id }).unwrap();
                                                } else {
                                                    await updateMedicineQty({ invoice_id: record.invoice_id, medicine_id: record.medicine_id, quantity: newQty }).unwrap();
                                                }
                                                await refetchMeds();
                                            }}
                                        >-
                                        </Button>
                                    </div>
                                ),
                            },
                        ]}
                        pagination={false}
                        bordered
                        loading={fetchingMeds}
                    />
                    <AddTreatmentServiceModal
                        open={openAdd}
                        onClose={() => setOpenAdd(false)}
                        appointment={appointment}
                        invoice={invoice}
                    />
                </>
            )}
        </Modal>
    );
}
