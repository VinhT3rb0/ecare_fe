"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, Select, Form, message } from "antd";
import {
    useGetAvailableTimeSlotsQuery,
    useUpdateAppointmentMutation,
} from "@/api/app_apointment/apiAppointment";

type Props = {
    open: boolean;
    onClose: () => void;
    appointment: any | null;
};

export default function RescheduleAppointmentModal({ open, onClose, appointment }: Props) {
    const [form] = Form.useForm();
    const doctorId = appointment?.doctor_id;
    const appointmentDate = appointment?.appointment_date;
    const { data: availableSlotsResp, refetch, isFetching } = useGetAvailableTimeSlotsQuery(
        { doctor_id: doctorId, appointment_date: appointmentDate },
        { skip: !doctorId || !appointmentDate }
    );
    const [updateAppointment, { isLoading }] = useUpdateAppointmentMutation();

    const availableSlots: string[] = useMemo(() => availableSlotsResp ?? [], [availableSlotsResp]);

    useEffect(() => {
        if (open) {
            form.setFieldsValue({ time_slot: appointment?.time_slot });
            if (doctorId && appointmentDate) refetch();
        }
    }, [open, appointment, form, doctorId, appointmentDate, refetch]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await updateAppointment({ id: appointment.id, data: { time_slot: values.time_slot } }).unwrap();
            message.success("Đã cập nhật khung giờ hẹn");
            onClose();
        } catch (err: any) {
            message.error(err?.data?.message || "Cập nhật thất bại");
        }
    };

    return (
        <Modal
            title={`Sửa giờ hẹn #${appointment?.id ?? ""}`}
            open={open}
            onOk={handleOk}
            onCancel={onClose}
            confirmLoading={isLoading}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Khung giờ" name="time_slot" rules={[{ required: true, message: "Chọn khung giờ" }]}>
                    <Select
                        loading={isFetching}
                        placeholder="Chọn khung giờ"
                        options={availableSlots.map((s) => ({ value: s, label: s }))}
                    />
                </Form.Item>
            </Form>
        </Modal >
    );
}


