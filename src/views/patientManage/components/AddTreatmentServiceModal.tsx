"use client";

import { useMemo } from "react";
import { Modal, Form, Select, InputNumber } from "antd";
import { useGetPackagesByDepartmentQuery } from "@/api/app_package/apiPackage";
import { useAddPackageToInvoiceMutation, useCreateInvoiceMutation, useGetInvoiceByAppointmentQuery } from "@/api/app_invoice/apiInvoice";
import toast from "react-hot-toast";

type Props = {
    open: boolean;
    onClose: () => void;
    appointment: any | null;
    invoice: any | null;
};

export default function AddTreatmentServiceModal({ open, onClose, appointment, invoice }: Props) {
    const [form] = Form.useForm();
    const departmentId = appointment?.Department?.id || appointment?.department_id;
    const { data: packagesResp, isFetching: isFetchingPkgs } = useGetPackagesByDepartmentQuery(departmentId?.toString() ?? "", { skip: !departmentId });
    const [addPackageToInvoice, { isLoading: isAdding }] = useAddPackageToInvoiceMutation();
    const [createInvoice] = useCreateInvoiceMutation();

    const packageOptions = useMemo(() => {
        const items = packagesResp?.data || packagesResp || [];
        return items.map((p: any) => ({ value: p.id, label: `${p.name} - ${Number(p.price).toLocaleString()}đ` }));
    }, [packagesResp]);

    const ensureInvoiceId = async () => {
        if (invoice?.id) return invoice.id;
        const result = await createInvoice({
            appointment_id: appointment.id,
            patient_id: appointment.patient_id,
        }).unwrap();
        return result.data?.id;
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const invoiceId = await ensureInvoiceId();
            await addPackageToInvoice({ invoice_id: invoiceId, package_id: values.package_id, quantity: values.quantity || 1 }).unwrap();
            toast.success("Đã thêm dịch vụ vào hóa đơn");
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Thêm dịch vụ thất bại");
        }
    };

    return (
        <Modal
            title={`Thêm DV điều trị`}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            okText="Thêm"
            cancelText="Hủy"
            confirmLoading={isAdding}
        >
            <Form layout="vertical" form={form} initialValues={{ quantity: 1 }}>
                <Form.Item label="Gói dịch vụ" name="package_id" rules={[{ required: true, message: "Chọn gói" }]}>
                    <Select options={packageOptions} loading={isFetchingPkgs} placeholder="Chọn gói" showSearch optionFilterProp="label" />
                </Form.Item>
                <Form.Item label="Số lượng" name="quantity" rules={[{ required: true, message: "Nhập số lượng" }]}>
                    <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}


