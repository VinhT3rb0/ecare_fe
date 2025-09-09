"use client";
import React, { useEffect, useState } from "react";
import {
    Card,
    Button,
    Form,
    Input,
    DatePicker,
    Upload,
    Row,
    Col
} from "antd";
import {
    PlusOutlined,
    FileImageOutlined
} from "@ant-design/icons";
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useGetDegreeQuery, useCreateDegreePendingMutation, useGetDegreePendingQuery } from '@/api/app_degree/apiDegree';
import toast from "react-hot-toast";

interface DegreeDoctorProps {
    idDoctor?: string;
    idUser?: string;
    is_approved?: boolean;
}

const DegreeDoctor: React.FC<DegreeDoctorProps> = ({ idDoctor, idUser, is_approved }) => {
    const [form] = Form.useForm();
    console.log(is_approved);

    const [proofImageUrl, setProofImageUrl] = useState<string>('');
    const [fileList, setFileList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { data: degree, refetch } = is_approved
        ? useGetDegreeQuery(idDoctor)
        : useGetDegreePendingQuery(idDoctor);

    const [createDegreePending] = useCreateDegreePendingMutation();
    useEffect(() => {
        // Nếu degree là mảng, lấy phần tử đầu tiên
        const degreeObj = Array.isArray(degree) ? degree[0] : degree;
        if (degreeObj) {
            form.setFieldsValue({
                full_name: degreeObj.full_name,
                date_of_birth: degreeObj.date_of_birth ? dayjs(degreeObj.date_of_birth) : undefined,
                cccd: degreeObj.cccd,
                issue_date: degreeObj.issue_date ? dayjs(degreeObj.issue_date) : undefined,
                issue_place: degreeObj.issue_place,
                specialization: degreeObj.specialization,
                practice_scope: degreeObj.practice_scope,
                proof_image_url: degreeObj.proof_image_url,
            });
            if (degreeObj.proof_image_url) {
                setProofImageUrl(degreeObj.proof_image_url);
                setFileList([
                    {
                        uid: "-1",
                        name: "proof.png",
                        status: "done",
                        url: degreeObj.proof_image_url,
                    },
                ]);
            } else {
                setFileList([])
            }
        }
    }, [degree]);

    const uploadProps: UploadProps = {
        name: 'proof_image',
        listType: 'picture-card',
        className: 'proof-image-uploader',
        showUploadList: false,
        beforeUpload: (file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
                toast.error('Bạn chỉ có thể upload file JPG/PNG!');
                return false;
            }
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                toast.error('Ảnh phải nhỏ hơn 5MB!');
                return false;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setProofImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setFileList([file]);
            return false;
        },
        disabled: is_approved,
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            const formData = new FormData();
            formData.append('full_name', values.full_name);
            formData.append('date_of_birth', values.date_of_birth ? dayjs(values.date_of_birth).format('YYYY-MM-DD') : '');
            formData.append('cccd', values.cccd);
            formData.append('issue_date', values.issue_date ? dayjs(values.issue_date).format('YYYY-MM-DD') : '');
            formData.append('issue_place', values.issue_place);
            formData.append('specialization', values.specialization);
            formData.append('practice_scope', values.practice_scope);
            if (fileList.length && fileList[0]) {
                formData.append('proof_image_url', fileList[0]);
            }
            if (idDoctor) formData.append('doctor_id', idDoctor);
            await createDegreePending(formData).unwrap();
            toast.success('Gửi thông tin bằng cấp thành công!');
            refetch();
        } catch (error) {
            toast.error('Gửi thông tin bằng cấp thất bại!');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const uploadButton = (
        <div>
            {proofImageUrl ? (
                <img
                    src={proofImageUrl}
                    alt="Proof"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <div>
                    <FileImageOutlined />
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
                disabled={is_approved}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Họ và tên trên bằng cấp"
                            name="full_name"
                            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                        >
                            <Input placeholder="Nhập họ và tên trên bằng cấp" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Ngày sinh"
                            name="date_of_birth"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                placeholder="Chọn ngày sinh"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="CCCD"
                            name="cccd"
                            rules={[
                                { required: true, message: 'Vui lòng nhập CCCD!' },
                                { pattern: /^[0-9]{12}$/, message: 'CCCD phải có 12 số!' }
                            ]}
                        >
                            <Input placeholder="Nhập số CCCD" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Ngày cấp bằng"
                            name="issue_date"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày cấp bằng!' }]}
                        >
                            <DatePicker
                                format="DD/MM/YYYY"
                                style={{ width: '100%' }}
                                placeholder="Chọn ngày cấp bằng"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Nơi cấp bằng"
                            name="issue_place"
                            rules={[{ required: true, message: 'Vui lòng nhập nơi cấp bằng!' }]}
                        >
                            <Input placeholder="Nhập nơi cấp bằng" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Chuyên khoa"
                            name="specialization"
                            rules={[{ required: true, message: 'Vui lòng nhập chuyên khoa!' }]}
                        >
                            <Input placeholder="Nhập chuyên khoa" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Phạm vi hành nghề"
                            name="practice_scope"
                            rules={[{ required: true, message: 'Vui lòng nhập phạm vi hành nghề!' }]}
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder="Mô tả phạm vi hành nghề của bạn"
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <div className="mb-6">
                    <Form.Item
                        label="Ảnh bằng cấp/chứng chỉ"
                        name="proof_image_url"
                    >
                        <div className="flex flex-col items-center justify-center">
                            <Upload {...uploadProps}>
                                <div className="cursor-pointer">
                                    {uploadButton}
                                </div>
                            </Upload>
                            <p className="text-sm text-gray-500">
                                Hỗ trợ: JPG, PNG. Kích thước tối đa: 5MB
                            </p>
                        </div>
                    </Form.Item>
                </div>
                <Form.Item className="flex justify-center">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                        style={{ background: "#11A998" }}

                        disabled={is_approved}
                    >
                        {is_approved ? "Đã được phê duyệt" : "Gửi thông tin bằng cấp"}
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default DegreeDoctor;

