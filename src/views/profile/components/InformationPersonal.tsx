"use client";
import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, message, Spin, notification } from "antd";
import dayjs from "dayjs";
import { useEditAccountMutation } from '@/api/app_home/apiAccount';

const { Option } = Select;

const InformationPersonal = ({ user, refetch }: { user?: any; refetch?: () => void }) => {
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editAccount] = useEditAccountMutation();

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                full_name: user.full_name || "",
                dob: user.dob ? dayjs(user.dob) : null,
                cccd: user.cccd || "",
                gender: user.gender || undefined,
                phone: user.phone || "",
                address: user.address || "",
                insurance_number: user.insurance_number || "",
            });
        }
    }, [user, form]);

    if (!user) return <Spin tip="Đang tải dữ liệu..." />;

    const handleFinish = async (values: any) => {
        setLoading(true);
        try {
            const submitValues = {
                ...values,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : undefined,
            };
            await editAccount(submitValues).unwrap();
            notification.success({ message: "Cập nhật thông tin thành công!" });
            setEditing(false);
            if (typeof refetch === "function") {
                await refetch();
            }
        } catch (e) {
            notification.error({ message: "Cập nhật thất bại!" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
        >
            <Form.Item label="Họ và tên" name="full_name">
                <Input disabled={!editing} />
            </Form.Item>
            <Form.Item label="Ngày sinh" name="dob">
                <DatePicker format="DD/MM/YYYY" className="w-full" disabled={!editing} />
            </Form.Item>
            <Form.Item label="CCCD" name="cccd">
                <Input disabled={!editing} />
            </Form.Item>
            <Form.Item label="Giới tính" name="gender">
                <Select placeholder="Chọn giới tính" disabled={!editing}>
                    <Option value="male">Nam</Option>
                    <Option value="female">Nữ</Option>
                    <Option value="other">Khác</Option>
                </Select>
            </Form.Item>
            <Form.Item label="Số điện thoại" name="phone">
                <Input disabled={!editing} />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address">
                <Input disabled={!editing} />
            </Form.Item>
            <Form.Item label="Số BHYT" name="insurance_number">
                <Input disabled={!editing} />
            </Form.Item>
            <Form.Item>
                {editing ? (
                    <>
                        <Button type="primary" htmlType="submit" loading={loading} className="mr-2">
                            Cập nhật
                        </Button>
                        <Button htmlType="button" onClick={() => { setEditing(false); }} className="ml-2">
                            Hủy
                        </Button>
                    </>
                ) : (
                    <Button htmlType="button" onClick={() => setEditing(true)}

                    >
                        Chỉnh sửa
                    </Button>
                )}
            </Form.Item>
        </Form>
    );
};

export default InformationPersonal;