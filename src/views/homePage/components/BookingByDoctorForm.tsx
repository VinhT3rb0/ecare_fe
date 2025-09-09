"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Button, Card, DatePicker, Form, Input, Select, Spin, Tag, message, Row, Col } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useGetSchedulesForDoctorQuery } from "@/api/app_doctor/apiSchedulesDoctor";
import { useGetDoctorApprovedQuery, useGetDoctorByDepartmentQuery } from "@/api/app_doctor/apiDoctor";
import { useGetDepartmentsQuery } from "@/api/app_doctor/apiDepartmentDoctor";
import { useCreateAppointmentMutation, useGetAvailableTimeSlotsQuery } from "@/api/app_apointment/apiAppointment";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getAccessTokenFromCookie } from "@/utils/token";

const { Option } = Select;

interface BookingByDoctorFormProps {
    onClose: () => void;
}
interface DoctorItem {
    id: number;
    full_name: string;
    departments: any[];
}
const TIME_FMT = "HH:mm";

const BookingByDoctorForm: React.FC<BookingByDoctorFormProps> = ({ onClose }) => {
    const [form] = Form.useForm();
    const router = useRouter();
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
    const [doctorId, setDoctorId] = useState<number | null>(null);
    const [date, setDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [scheduleId, setScheduleId] = useState<number | null>(null);

    // lấy user_id từ access token
    const currentUserId = useMemo(() => {
        try {
            const token = getAccessTokenFromCookie();
            if (!token) return null;
            const payload = JSON.parse(atob(token.split(".")[1]));
            return payload?.user_id ?? payload?.id ?? payload?.sub ?? null;
        } catch {
            return null;
        }
    }, []);

    // danh sách khoa
    const { data: departmentsResp, isLoading: loadingDepartments } = useGetDepartmentsQuery();

    // danh sách bác sĩ theo khoa đã chọn
    const { data: doctorByDeptResp, isLoading: loadingDoctors } = useGetDoctorByDepartmentQuery(
        selectedDepartment as any,
        { skip: !selectedDepartment }
    );

    const doctors = useMemo<DoctorItem[]>(() => {
        const list: any[] = doctorByDeptResp?.doctors || [];
        return list.map((d: any) => ({
            id: d.id,
            full_name: d.full_name,
            departments: d.departments || [],
        }));
    }, [doctorByDeptResp]);

    // lấy lịch theo bác sĩ
    const { data: scheduleResp, isFetching: fetchingSchedules } = useGetSchedulesForDoctorQuery(
        doctorId ? { doctor_id: String(doctorId) } : (undefined as any),
        { skip: !doctorId }
    );

    // danh sách ngày hợp lệ theo lịch của bác sĩ
    const availableDates = useMemo(() => {
        const set = new Set<string>();
        if (scheduleResp?.data?.length) {
            for (const s of scheduleResp.data) {
                if (s?.date) set.add(s.date);
            }
        }
        return set;
    }, [scheduleResp]);

    const disabledDate = (current: Dayjs) => {
        if (!current) return true;
        const isPast = current < dayjs().startOf("day");
        const key = current.format("YYYY-MM-DD");
        // chỉ cho chọn những ngày có lịch của bác sĩ và không phải ngày quá khứ
        return isPast || !availableDates.has(key);
    };

    // xác định schedule_id theo ngày đã chọn
    useEffect(() => {
        if (date && scheduleResp?.data?.length) {
            const target = date.format("YYYY-MM-DD");
            const found = scheduleResp.data.find((s: any) => s.date === target);
            setScheduleId(found?.id ?? null);
        } else {
            setScheduleId(null);
        }
    }, [date, scheduleResp]);

    // lấy danh sách khung giờ trống từ API theo bác sĩ và ngày
    const { data: timeSlotsResp, isLoading: loadingTimeSlots } = useGetAvailableTimeSlotsQuery(
        doctorId && date ? { doctor_id: doctorId, appointment_date: date.format("YYYY-MM-DD") } as any : (undefined as any),
        { skip: !doctorId || !date }
    );

    const timeOptions = useMemo(() => {
        const slots: string[] = timeSlotsResp || [];
        return slots.map((t: string) => ({ label: t, value: t, disabled: false }));
    }, [timeSlotsResp]);

    // tạo lịch hẹn
    const [createAppointment, { isLoading: creating }] = useCreateAppointmentMutation();

    const onSubmit = async (values: any) => {
        if (!doctorId) {
            toast.error("Vui lòng chọn bác sĩ.");
            return;
        }
        if (!date) {
            toast.error("Vui lòng chọn ngày khám.");
            return;
        }
        if (!selectedTime) {
            toast.error("Vui lòng chọn giờ khám.");
            return;
        }
        if (!scheduleId) {
            toast.error("Không tìm thấy lịch làm việc cho ngày đã chọn.");
            return;
        }
        if (!currentUserId) {
            toast.error("Bạn cần đăng nhập để đặt lịch.");
            router.push("/login");
            return;
        }

        try {
            const payload = {
                patient_id: currentUserId,
                patient_name: values.patient_name,
                patient_dob: values.patient_dob?.format("YYYY-MM-DD"),
                patient_phone: values.patient_phone,
                patient_email: values.patient_email,
                patient_gender: values.patient_gender,
                patient_address: values.patient_address,
                department_id: values.department_id, // optional if you want to include
                doctor_id: Number(doctorId),
                appointment_date: date.format("YYYY-MM-DD"),
                time_slot: selectedTime,
                schedule_id: scheduleId,
                reason: values.reason,
            };

            await createAppointment(payload as any).unwrap();
            toast.success("Đặt lịch thành công!");
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || "Đặt lịch thất bại. Vui lòng thử lại!");
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onSubmit}
            initialValues={{ patient_gender: "male" }}
        >
            <Card className="rounded-xl shadow-md">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="department_id"
                            label="Khoa"
                            rules={[{ required: true, message: "Vui lòng chọn khoa" }]}
                        >
                            <Select
                                placeholder="Chọn khoa"
                                loading={loadingDepartments}
                                onChange={(value: number) => {
                                    setSelectedDepartment(value);
                                    // reset các field phụ thuộc
                                    setDoctorId(null);
                                    setDate(null);
                                    setSelectedTime(null);
                                    setScheduleId(null);
                                    form.setFieldsValue({ doctor_id: null, date: null, time_slot: null });
                                }}
                                options={(departmentsResp?.departments || departmentsResp?.data || []).map((dept: any) => ({
                                    value: dept.id,
                                    label: dept.name,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Chọn bác sĩ"
                            name="doctor_id"
                            rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
                        >
                            <Select
                                showSearch
                                placeholder="Tìm theo tên bác sĩ..."
                                optionFilterProp="label"
                                loading={loadingDoctors}
                                onChange={(val: number) => {
                                    setDoctorId(val);
                                    setSelectedTime(null);
                                    setDate(null);
                                    setScheduleId(null);
                                    form.setFieldsValue({ date: null, time_slot: null });
                                }}
                                options={doctors.map((d) => ({ value: d.id, label: d.full_name }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Ngày khám"
                            name="date"
                            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
                        >
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                disabledDate={disabledDate}
                                onChange={(d) => {
                                    setDate(d);
                                    setSelectedTime(null);
                                    form.setFieldsValue({ time_slot: null });
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="patient_name" label="Họ và tên" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="patient_dob" label="Ngày sinh" rules={[{ required: true }]}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="patient_phone" label="Số điện thoại" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="patient_email" label="Email">
                            <Input type="email" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="patient_gender" label="Giới tính">
                            <Select>
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="patient_address" label="Địa chỉ">
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item name="time_slot" label="Khung giờ" rules={[{ required: true }]}>
                            <div className="min-h-[56px] rounded-lg border border-dashed p-3">
                                {!doctorId || !date ? (
                                    <div className="text-gray-500">Hãy chọn bác sĩ và ngày để xem các khung giờ.</div>
                                ) : fetchingSchedules || loadingTimeSlots ? (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Spin size="small" /> Đang tải khung giờ...
                                    </div>
                                ) : timeOptions.length === 0 ? (
                                    <div className="text-gray-500">Không có khung giờ trống cho ngày này.</div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {timeOptions.map((t) => (
                                            <Tag.CheckableTag
                                                key={t.value}
                                                checked={selectedTime === t.value}
                                                onChange={() => !t.disabled && (setSelectedTime(t.value), form.setFieldsValue({ time_slot: t.value }))}
                                                className={`px-3 py-2 rounded-md border ${selectedTime === t.value ? "!bg-teal-600 !text-white" : "bg-white text-gray-700"}
                                                    ${t.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                                style={{ borderColor: "#e5e7eb" }}
                                            >
                                                {t.label}
                                            </Tag.CheckableTag>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Triệu chứng bệnh" name="reason" rules={[{ required: true }]}>
                            <Input.TextArea rows={3} placeholder="Lý do khám..." />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <div className="flex justify-end gap-2">
                            <Button onClick={onClose}>Hủy</Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creating}
                                style={{ background: "#11A998", borderColor: "#11A998" }}
                                disabled={!doctorId || !date || !selectedTime}
                            >
                                Xác nhận đặt lịch
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        </Form>
    );
};

export default BookingByDoctorForm;
