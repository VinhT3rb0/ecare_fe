"use client";
import React, { useEffect, useState } from "react";
import {
    Card,
    Button,
    message,
    Form,
    Input,
    Select,
    Upload,
    Avatar,
    Row,
    Col
} from "antd";
import {
    UserOutlined,
    PlusOutlined
} from "@ant-design/icons";
import type { UploadProps } from 'antd';
import { useGetMyDoctorQuery, useUpdateMyDoctorMutation } from "@/api/app_doctor/apiDoctor";
import toast from "react-hot-toast";
import type { RcFile } from "antd/es/upload/interface";
import { useGetDepartmentDoctorsQuery, useGetDepartmentsQuery } from "@/api/app_doctor/apiDepartmentDoctor";
const { Option } = Select;

interface ProfileDoctorProps {
    idDoctor?: string;
    idUser?: string;
}

const ProfileDoctor: React.FC<ProfileDoctorProps> = ({ idDoctor, idUser }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);
    const [avatarPreview, setAvatarPreview] = useState<string>('');

    const { data: userData } = useGetMyDoctorQuery(idUser!, { skip: !idUser });
    const [updateDoctor] = useUpdateMyDoctorMutation();
    const { data: departmentData, isLoading: loadingDepartment } = useGetDepartmentsQuery();
    useEffect(() => {
        if (userData) {
            form.setFieldsValue({
                fullName: userData.full_name,
                gender: userData.gender,
                phone: userData.phone,
                email: userData.email,
                experience: userData.experience_years,
                education_level: userData.education_level,
                education_history: userData.education_history,
                specialty: userData.departments?.map((d: any) => d.id) || [],
            });

            if (userData.avatar_img) {
                setAvatarPreview(userData.avatar_img);
                setFileList([
                    {
                        uid: "-1",
                        name: "avatar.png",
                        status: "done",
                        url: userData.avatar_img,
                    },
                ]);
            }
        }
    }, [userData]);

    const uploadProps: UploadProps = {
        name: "avatar",
        listType: "picture-card",
        fileList: fileList,
        showUploadList: false,
        beforeUpload: (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                toast.error('Bạn chỉ có thể upload file JPG/PNG!');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                toast.error('Ảnh phải nhỏ hơn 2MB!');
                return false;
            }

            // Tạo preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            setFileList([file]);
            return false;
        },
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            const formData = new FormData();
            formData.append("full_name", values.fullName);
            formData.append("gender", values.gender);
            formData.append("phone", values.phone);
            formData.append("email", values.email);
            formData.append("experience_years", values.experience);
            values.specialty.forEach((id: number) => {
                formData.append("specialty[]", id.toString());
            });
            formData.append("education_level", values.education_level);
            formData.append("education_history", values.education_history || "");
            if (fileList.length && fileList[0]) {
                const file = fileList[0] as RcFile;
                formData.append("avatar_img", file);
            } else if (userData?.avatar_url) {
                formData.append("avatar_url", userData.avatar_url);
            }

            await updateDoctor({ idUser: idUser!, data: formData }).unwrap();
            toast.success("Cập nhật thông tin thành công!");
        } catch (error) {
            toast.error("Cập nhật thất bại!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const uploadButton = (
        <div>
            {avatarPreview ? (
                <Avatar
                    src={avatarPreview}
                    size={80}
                    icon={<UserOutlined />}
                    style={{ border: '1px solid #d9d9d9' }}
                />
            ) : (
                <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                </div>
            )}
        </div>
    );

    return (
        <Card>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div className="mb-6 flex flex-col items-center justify-center">
                    <div className="mb-4">
                        <Upload {...uploadProps}>
                            <div className="cursor-pointer">
                                {uploadButton}
                            </div>
                        </Upload>
                    </div>
                    <p className="text-sm text-gray-500">
                        Hỗ trợ: JPG, PNG. Kích thước tối đa: 2MB
                    </p>
                </div>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Họ và tên" name="fullName">
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giới tính" name="gender">
                            <Select placeholder="Chọn giới tính">
                                <Option value="male">Nam</Option>
                                <Option value="female">Nữ</Option>
                                <Option value="other">Khác</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Số điện thoại" name="phone">
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Email" name="email">
                            <Input placeholder="Nhập email" disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Số năm kinh nghiệm" name="experience">
                            <Input placeholder="Ví dụ: 5" type="number" min="0" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Trình độ học vấn" name="education_level">
                            <Select placeholder="Chọn trình độ học vấn">
                                <Option value="Cử nhân">Cử nhân</Option>
                                <Option value="Thạc sĩ">Thạc sĩ</Option>
                                <Option value="Tiến sĩ">Tiến sĩ</Option>
                                <Option value="Giáo sư">Giáo sư</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Chuyên khoa" name="specialty">
                            <Select
                                mode="multiple"
                                placeholder="Chọn chuyên khoa"
                                loading={loadingDepartment}
                                options={departmentData?.departments?.map((item: any) => ({
                                    label: item.name,
                                    value: item.id,
                                })) || []}
                            />
                        </Form.Item>

                    </Col>
                    <Col span={12}>
                        <Form.Item label="Lịch sử học vấn" name="education_history">
                            <Input.TextArea placeholder="Nhập quá trình học vấn, đào tạo..." rows={4} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item className="flex justify-center">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{ background: "#11A998", minWidth: "200px" }}
                        block
                    >
                        Cập nhật thông tin
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default ProfileDoctor;
