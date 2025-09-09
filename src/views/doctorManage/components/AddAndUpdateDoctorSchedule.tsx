"use client";
import React, { useEffect, useState } from "react";
import {
    Form,
    Select,
    DatePicker,
    TimePicker,
    Input,
    Row,
    Col,
    Button,
    InputNumber,
} from "antd";
import {
    useCreateBulkSchedulesMutation,
    useCreateScheduleMutation,
    useUpdateScheduleMutation,
} from "@/api/app_doctor/apiSchedulesDoctor";
import type { CreateScheduleRequest } from "@/api/app_doctor/apiSchedulesDoctor";
import dayjs from "dayjs";
import { useGetAllRoomsQuery } from "@/api/app_room/apiRoom";
import toast from "react-hot-toast";

const { Option } = Select;
const { TextArea } = Input;

interface AddAndUpdateDoctorScheduleProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    editData?: any;
    approvedDoctors: any[];
    isDoctorsLoading: boolean;
}

const AddAndUpdateDoctorSchedule: React.FC<AddAndUpdateDoctorScheduleProps> = ({
    visible,
    onCancel,
    onSuccess,
    editData,
    approvedDoctors,
    isDoctorsLoading,
}) => {
    const [form] = Form.useForm();
    const [createSchedule, { isLoading: isCreating }] = useCreateScheduleMutation();
    const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
    const [triggerCreateBulkSchedules, { isLoading: isBulkCreating }] = useCreateBulkSchedulesMutation();
    const [isBulkMode, setIsBulkMode] = useState(false);

    const { data: roomData, isLoading: isRoomLoading, refetch } = useGetAllRoomsQuery(undefined, {
        skip: !visible,
    });
    const rooms = roomData || [];
    const isEditing = !!editData;

    // when modal opens with editData, populate form
    useEffect(() => {
        if (visible && editData) {
            form.setFieldsValue({
                doctor_id: editData.doctor_id,
                date: editData.date ? dayjs(editData.date) : undefined,
                room_id: editData.room_id,
                start_time: editData.start_time ? dayjs(editData.start_time, "HH:mm:ss") : null,
                end_time: editData.end_time ? dayjs(editData.end_time, "HH:mm:ss") : null,
                max_patients: editData.max_patients ?? 10,
                notes: editData.notes ?? "",
            });
        } else if (visible && !editData) {
            form.resetFields();
        }
    }, [visible, editData, form]);

    // single submit (create/update)
    const handleSubmit = async (values: any) => {
        try {
            const scheduleData: CreateScheduleRequest = {
                doctor_id: Number(values.doctor_id),
                date: values.date.format("YYYY-MM-DD"),
                room_id: Number(values.room_id),
                start_time: values.start_time ? values.start_time.format("HH:mm:ss") : undefined,
                end_time: values.end_time ? values.end_time.format("HH:mm:ss") : undefined,
                max_patients: values.max_patients ?? undefined,
                notes: values.notes ?? undefined,
            };

            if (isEditing && editData) {
                await updateSchedule({ id: editData.id, data: scheduleData }).unwrap();
                toast.success("Cập nhật lịch làm việc thành công!");
                refetch();
            } else {
                await createSchedule(scheduleData).unwrap();
                toast.success("Thêm lịch làm việc thành công!");
                refetch();
            }

            form.resetFields();
            onSuccess();
        } catch (error: any) {
            toast.error(error?.data?.message || "Có lỗi xảy ra!");
        }
    };

    // bulk submit: expand date range into individual dates (one schedule per date)
    const handleBulkSubmit = async (values: any) => {
        try {
            const { doctor_id, dates, room_id, start_time, end_time, max_patients, notes } = values;
            if (!Array.isArray(dates) || dates.length !== 2) {
                toast.error("Vui lòng chọn khoảng ngày hợp lệ");
                return;
            }
            const [start, end] = dates as [dayjs.Dayjs, dayjs.Dayjs];
            // expand dates inclusive
            const expanded: dayjs.Dayjs[] = [];
            let cursor = start.startOf("day");
            const last = end.startOf("day");
            while (cursor.isBefore(last) || cursor.isSame(last)) {
                expanded.push(cursor.clone());
                cursor = cursor.add(1, "day");
            }

            const schedules: CreateScheduleRequest[] = expanded.map((d) => ({
                doctor_id: Number(doctor_id),
                date: d.format("YYYY-MM-DD"),
                room_id: Number(room_id),
                start_time: start_time ? start_time.format("HH:mm:ss") : undefined,
                end_time: end_time ? end_time.format("HH:mm:ss") : undefined,
                max_patients: max_patients ?? undefined,
                notes: notes ?? undefined,
            }));

            const res = await triggerCreateBulkSchedules({ schedules }).unwrap();
            toast.success(res?.message || "Tạo lịch hàng loạt thành công!");
            form.resetFields();
            onSuccess();
        } catch (err: any) {
            toast.error(err?.data?.message || "Có lỗi khi tạo lịch hàng loạt!");
        }
    };

    return (
        <>
            <div className="flex justify-between mb-4">
                <h2>{isEditing ? "Cập nhật lịch" : isBulkMode ? "Tạo lịch hàng loạt" : "Thêm lịch mới"}</h2>
                {!isEditing && (
                    <Button type="link" onClick={() => setIsBulkMode((s) => !s)}>
                        {isBulkMode ? "Chuyển sang thêm từng lịch" : "Chuyển sang tạo lịch hàng loạt"}
                    </Button>
                )}
            </div>

            {isBulkMode ? (
                <Form form={form} layout="vertical" onFinish={handleBulkSubmit}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Bác sĩ"
                                name="doctor_id"
                                rules={[{ required: true, message: "Vui lòng chọn bác sĩ!" }]}
                            >
                                <Select placeholder={isDoctorsLoading ? "Đang tải..." : "Chọn bác sĩ"} loading={isDoctorsLoading}>
                                    {approvedDoctors.map((doctor: any) => (
                                        <Option key={doctor.id} value={doctor.id}>
                                            {doctor.full_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                label="Khoảng ngày"
                                name="dates"
                                rules={[{ required: true, message: "Vui lòng chọn khoảng ngày!" }]}
                            >
                                <DatePicker.RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Phòng"
                                name="room_id"
                                rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
                            >
                                <Select placeholder={isRoomLoading ? "Đang tải..." : "Chọn phòng"} loading={isRoomLoading}>
                                    {rooms.map((room: any) => (
                                        <Option key={room.id} value={room.id}>
                                            {room.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <Form.Item label="Giờ bắt đầu" name="start_time">
                                        <TimePicker style={{ width: "100%" }} format="HH:mm" placeholder="HH:mm" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Giờ kết thúc" name="end_time">
                                        <TimePicker style={{ width: "100%" }} format="HH:mm" placeholder="HH:mm" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Số bệnh nhân tối đa" name="max_patients">
                                <InputNumber style={{ width: "100%" }} min={1} max={500} placeholder="Số bệnh nhân" />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item label="Ghi chú" name="notes">
                                <TextArea rows={2} placeholder="Ghi chú (tùy chọn)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="flex justify-end space-x-2 mt-4">
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isBulkCreating}>
                            Tạo hàng loạt
                        </Button>
                    </div>
                </Form>
            ) : (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{ notes: "", max_patients: 10 }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Bác sĩ"
                                name="doctor_id"
                                rules={[{ required: true, message: "Vui lòng chọn bác sĩ!" }]}
                            >
                                <Select placeholder={isDoctorsLoading ? "Đang tải..." : "Chọn bác sĩ"} loading={isDoctorsLoading} disabled={isDoctorsLoading}>
                                    {approvedDoctors.map((doctor: any) => (
                                        <Option key={doctor.id} value={doctor.id}>
                                            {doctor.full_name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item label="Ngày" name="date" rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}>
                                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Phòng"
                                name="room_id"
                                rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
                            >
                                <Select placeholder={isRoomLoading ? "Đang tải..." : "Chọn phòng"} loading={isRoomLoading} disabled={isRoomLoading}>
                                    {rooms.map((room: any) => (
                                        <Option key={room.id} value={room.id}>
                                            {room.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Row gutter={8}>
                                <Col span={12}>
                                    <Form.Item label="Giờ bắt đầu" name="start_time">
                                        <TimePicker style={{ width: "100%" }} format="HH:mm" placeholder="HH:mm" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Giờ kết thúc" name="end_time">
                                        <TimePicker style={{ width: "100%" }} format="HH:mm" placeholder="HH:mm" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item label="Số bệnh nhân tối đa" name="max_patients">
                                <InputNumber style={{ width: "100%" }} min={1} max={500} placeholder="Số bệnh nhân" />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item label="Ghi chú" name="notes">
                                <TextArea rows={2} placeholder="Ghi chú về lịch (tùy chọn)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="flex justify-end space-x-2 mt-4">
                        <Button onClick={onCancel}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                            {isEditing ? "Cập nhật" : "Thêm mới"}
                        </Button>
                    </div>
                </Form>
            )}
        </>
    );
};

export default AddAndUpdateDoctorSchedule;
