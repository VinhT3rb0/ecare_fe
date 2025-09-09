"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Form, Input, DatePicker, Select, Button, Row, Col, message } from "antd";
import dayjs from "dayjs";
import { useGetDepartmentsQuery } from "@/api/app_doctor/apiDepartmentDoctor";
import { useGetDoctorsByDateAndDepartmentQuery } from "@/api/app_doctor/apiDoctor";
import { useGetAvailableTimeSlotsQuery, useCreateAppointmentMutation } from "@/api/app_apointment/apiAppointment";
import { useGetDoctorSchedulesQuery } from "@/api/app_doctor/apiSchedulesDoctor";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { getAccessTokenFromCookie } from "@/utils/token";

const { Option } = Select;

interface Props {
    onClose: () => void;
}

const BookingByDateForm: React.FC<Props> = ({ onClose }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
    const [scheduleId, setScheduleId] = useState<number | null>(null); // Lưu `schedule_id`

    // Fetch departments
    const { data: departments, isLoading: isLoadingDepartments } = useGetDepartmentsQuery();

    // Fetch doctors by department and date
    const { data: doctors, isLoading: isLoadingDoctors } = useGetDoctorsByDateAndDepartmentQuery(
        { date: selectedDate || "", department_id: selectedDepartment || 0 },
        { skip: !selectedDepartment || !selectedDate }
    );

    // Fetch schedules for the selected doctor and date
    const { data: schedules, isLoading: isLoadingSchedules } = useGetDoctorSchedulesQuery(
        { doctor_id: selectedDoctor?.toString() || "", start_date: selectedDate || "", end_date: selectedDate || "" },
        { skip: !selectedDoctor || !selectedDate }
    );

    // Fetch available time slots
    const { data: timeSlots, isLoading: isLoadingTimeSlots } = useGetAvailableTimeSlotsQuery(
        { doctor_id: selectedDoctor || 0, appointment_date: selectedDate || "" },
        { skip: !selectedDoctor || !selectedDate }
    );

    // Mutation to create appointment
    const [createAppointment] = useCreateAppointmentMutation();
    const router = useRouter();

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

    const disabledDate = (current: dayjs.Dayjs) => current && current < dayjs().startOf("day");

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (!currentUserId) {
                toast.error("Bạn cần đăng nhập để đặt lịch.");
                setLoading(false);
                router.push("/login");
                return;
            }
            if (!scheduleId) {
                toast.error("Không tìm thấy lịch làm việc cho bác sĩ vào ngày đã chọn.");
                setLoading(false);
                return;
            }

            const payload = {
                patient_id: currentUserId,
                patient_name: values.patient_name,
                patient_dob: values.patient_dob?.format("YYYY-MM-DD"),
                patient_phone: values.patient_phone,
                patient_email: values.patient_email,
                patient_gender: values.patient_gender,
                patient_address: values.patient_address,
                department_id: values.department_id,
                doctor_id: Number(values.doctor_id),
                appointment_date: values.appointment_date?.format("YYYY-MM-DD"),
                time_slot: values.time_slot,
                schedule_id: scheduleId, // Truyền `schedule_id` vào payload
                reason: values.reason,
            };

            // Gọi API tạo lịch hẹn
            await createAppointment(payload).unwrap();
            toast.success("Đặt lịch thành công!");
            form.resetFields();
            onClose();
        } catch (error) {
            console.error("Error creating appointment:", error);
            toast.error("Có lỗi xảy ra khi đặt lịch");
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật `schedule_id` khi `schedules` thay đổi
    useEffect(() => {
        if (schedules?.data?.length) {
            setScheduleId(schedules.data[0].id); // Lấy `schedule_id` đầu tiên
        } else {
            setScheduleId(null);
        }
    }, [schedules]);

    return (
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ patient_gender: "male" }}>
            <Row gutter={16}>
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
                    <Form.Item name="department_id" label="Khoa" rules={[{ required: true }]}>
                        <Select
                            placeholder="Chọn khoa"
                            loading={isLoadingDepartments}
                            onChange={(value) => {
                                setSelectedDepartment(value);
                                form.setFieldsValue({ doctor_id: null, time_slot: null });
                                setSelectedDoctor(null);
                            }}
                        >
                            {departments?.departments?.map((department: any) => (
                                <Option key={department.id} value={department.id}>
                                    {department.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="appointment_date" label="Ngày khám" rules={[{ required: true }]}>
                        <DatePicker
                            style={{ width: "100%" }}
                            disabledDate={disabledDate}
                            onChange={(date) => {
                                const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : null;
                                setSelectedDate(formattedDate);
                                form.setFieldsValue({ doctor_id: null, time_slot: null });
                                setSelectedDoctor(null);
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="doctor_id" label="Bác sĩ" rules={[{ required: true }]}>
                        <Select
                            placeholder="Chọn bác sĩ"
                            loading={isLoadingDoctors}
                            onChange={(value) => {
                                setSelectedDoctor(Number(value));
                                form.setFieldsValue({ time_slot: null });
                            }}
                        >
                            {doctors?.data?.map((doctor: any) => (
                                <Option key={doctor.id} value={doctor.id}>
                                    {doctor.full_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item name="time_slot" label="Khung giờ" rules={[{ required: true }]}>
                        <Select placeholder="Chọn khung giờ" loading={isLoadingTimeSlots}>
                            {timeSlots?.map((slot) => (
                                <Option key={slot} value={slot}>
                                    {slot}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name="reason" label="Triệu chứng bệnh" rules={[{ required: true }]}>
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Col>
                <Col span={24} style={{ textAlign: "right" }}>
                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                        Huỷ
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{
                            background: "#11A998",
                            borderColor: "#11A998",
                            borderRadius: "8px",
                            fontWeight: 600,
                            padding: "0 24px",
                        }}
                    >
                        Gửi yêu cầu
                    </Button>

                </Col>
            </Row>
        </Form>
    );
};

export default BookingByDateForm;