"use client";
import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    DatePicker,
    Select,
    Spin,
    notification,
    Card,
    Row,
    Col,
    Avatar,
    Upload,
    Popconfirm,
    Space,
    Typography,
} from "antd";
import { UploadOutlined, EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEditAccountMutation } from "@/api/app_home/apiAccount";
import { toast } from "react-hot-toast";

const { Option } = Select;
const { Text } = Typography;

type Props = {
    user?: any;
    refetch?: () => void;
};

const InformationPersonal: React.FC<Props> = ({ user, refetch }) => {
    const [form] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editAccount] = useEditAccountMutation();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
            setAvatarPreview(user.avatar || null);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="w-full">
                <Spin tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    const handleFinish = async (values: any) => {
        setLoading(true);
        try {
            const submitValues = {
                ...values,
                dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : undefined,
            };

            await editAccount(submitValues).unwrap();
            toast.success("Cập nhật thành công!");
            setEditing(false);
            if (typeof refetch === "function") await refetch();
        } catch (e) {
            toast.error("Cập nhật thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleBeforeUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(String(e.target?.result || ""));
        };
        reader.readAsDataURL(file);
        setAvatarFile(file);
        return false;
    };

    const handleCancelEdit = async () => {
        form.resetFields();
        form.setFieldsValue({
            full_name: user.full_name || "",
            dob: user.dob ? dayjs(user.dob) : null,
            cccd: user.cccd || "",
            gender: user.gender || undefined,
            phone: user.phone || "",
            address: user.address || "",
            insurance_number: user.insurance_number || "",
        });
        setAvatarPreview(user.avatar || null);
        setAvatarFile(null);
        setEditing(false);
    };

    // validation rules
    const rules = {
        full_name: [{ required: true, message: "Vui lòng nhập họ và tên" }],
        phone: [
            { required: true, message: "Vui lòng nhập số điện thoại" },
            {
                pattern: /^0\d{8,10}$/,
                message: "SĐT không hợp lệ (bắt đầu bằng 0, 9-11 chữ số)",
            },
        ],
        cccd: [
            {
                pattern: /^\d{9,12}$/,
                message: "CCCD không hợp lệ (9-12 chữ số)",
            },
        ],
    };
    const initials = (user.full_name || "")
        .split(" ")
        .map((s: string) => s[0])
        .slice(-2)
        .join("")
        .toUpperCase();

    return (
        <Card
            title={<span className="text-lg font-semibold">Thông tin cá nhân</span>}
            extra={
                editing ? (
                    <Space>
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            loading={loading}
                            onClick={() => form.submit()}
                        >
                            Lưu
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc muốn hủy thay đổi?"
                            onConfirm={handleCancelEdit}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button icon={<CloseOutlined />}>Hủy</Button>
                        </Popconfirm>
                    </Space>
                ) : (
                    <Button icon={<EditOutlined />} onClick={() => setEditing(true)}>
                        Chỉnh sửa
                    </Button>
                )
            }
            className="rounded-md"
        >
            <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <div className="flex flex-col items-center gap-4">
                            <Avatar size={120} src={avatarPreview || undefined}>
                                {!avatarPreview && initials}
                            </Avatar>

                            <Upload
                                beforeUpload={handleBeforeUpload}
                                showUploadList={false}
                                disabled={!editing}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />} disabled={!editing}>
                                    {avatarPreview ? "Thay ảnh" : "Tải ảnh lên"}
                                </Button>
                            </Upload>
                        </div>
                    </Col>

                    <Col xs={24} md={16}>
                        <Row gutter={12}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="full_name" label="Họ và tên" rules={rules.full_name}>
                                    <Input placeholder="Họ và tên" disabled={!editing} />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item name="dob" label="Ngày sinh">
                                    <DatePicker
                                        format="DD/MM/YYYY"
                                        className="w-full"
                                        disabled={!editing}
                                        disabledDate={(current) => current && current > dayjs().endOf("day")}
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item name="cccd" label="CCCD" rules={rules.cccd}>
                                    <Input placeholder="Số CCCD/CMND" disabled={!editing} />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item name="gender" label="Giới tính">
                                    <Select placeholder="Chọn giới tính" disabled={!editing}>
                                        <Option value="male">Nam</Option>
                                        <Option value="female">Nữ</Option>
                                        <Option value="other">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item name="phone" label="Số điện thoại" rules={rules.phone}>
                                    <Input placeholder="0xxxxxxxxx" disabled={!editing} />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={12}>
                                <Form.Item name="insurance_number" label="Số BHYT">
                                    <Input placeholder="Số BHYT (nếu có)" disabled={!editing} />
                                </Form.Item>
                            </Col>

                            <Col xs={24}>
                                <Form.Item name="address" label="Địa chỉ">
                                    <Input placeholder="Địa chỉ hiện tại" disabled={!editing} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                {editing && (
                    <div className="mt-4 flex justify-end gap-2 sm:hidden">
                        <Button type="primary" loading={loading} onClick={() => form.submit()}>
                            Lưu
                        </Button>
                        <Popconfirm
                            title="Bạn có chắc muốn hủy thay đổi?"
                            onConfirm={handleCancelEdit}
                            okText="Có"
                            cancelText="Không"
                        >
                            <Button>Hủy</Button>
                        </Popconfirm>
                    </div>
                )}
            </Form>
        </Card>
    );
};

export default InformationPersonal;
