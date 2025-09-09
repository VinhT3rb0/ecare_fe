"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Switch, Button, message, Upload, Select } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCreatePackageMutation, useUpdatePackageMutation } from "@/api/app_package/apiPackage";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile } from "antd/es/upload/interface";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useGetDepartmentsQuery } from "@/api/app_doctor/apiDepartmentDoctor";

interface AddAndUpdatePackageProps {
    open: boolean;
    onClose: () => void;
    initialData?: any;
    refetch?: () => void;
}

const AddAndUpdatePackage: React.FC<AddAndUpdatePackageProps> = ({
    open,
    onClose,
    initialData,
    refetch,
}) => {
    const [form] = Form.useForm();
    const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation();
    const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation();
    const { data: departments } = useGetDepartmentsQuery();
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                price: Number(initialData.price),
                discount: Number(initialData.discount),
                discount_expiry_date: initialData.discount_expiry_date
                    ? dayjs(initialData.discount_expiry_date)
                    : null,
                department_id: initialData.department_id,
            });
            setFileList(
                initialData.image_url
                    ? [
                        {
                            uid: "-1",
                            name: "image.png",
                            status: "done",
                            url: initialData.image_url,
                        },
                    ]
                    : []
            );
        } else {
            form.resetFields();
            setFileList([]);
        }
    }, [initialData, form, open]);

    const handleUploadChange = (info: UploadChangeParam) => {
        setFileList(info.fileList.slice(-1)); // chỉ giữ 1 file
    };

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    const handleFinish = async (values: any) => {
        try {
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description || "");
            formData.append("price", String(values.price));
            formData.append("discount", String(values.discount || 0));
            if (values.discount_expiry_date) {
                formData.append(
                    "discount_expiry_date",
                    values.discount_expiry_date.format("YYYY-MM-DD")
                );
            }
            formData.append("is_active", values.is_active ? "true" : "false");

            // department_id optional
            if (values.department_id) {
                formData.append("department_id", String(values.department_id));
            }
            if (fileList.length && fileList[0].originFileObj) {
                formData.append("image", fileList[0].originFileObj as RcFile);
            } else if (initialData?.image_url) {
                formData.append("image_url", initialData.image_url);
            }

            if (initialData) {
                await updatePackage({
                    id: initialData.id,
                    data: formData,
                }).unwrap();
                toast.success("Cập nhật gói dịch vụ thành công!");
            } else {
                await createPackage(formData).unwrap();
                toast.success("Thêm gói dịch vụ thành công!");
            }
            onClose();
            refetch && refetch();
        } catch (err) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
    };


    return (
        <Modal
            open={open}
            title={
                <span className="text-xl font-semibold text-teal-700">
                    {initialData ? "✏️ Cập nhật gói dịch vụ" : "➕ Thêm gói dịch vụ"}
                </span>
            }
            onCancel={onClose}
            footer={null}
            className="rounded-xl"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    is_active: true,
                }}
                className="space-y-3"
            >
                <Form.Item
                    label={<span className="font-medium text-gray-700">Tên gói</span>}
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập tên gói" }]}
                >
                    <Input placeholder="Nhập tên gói dịch vụ" />
                </Form.Item>

                <Form.Item
                    label={<span className="font-medium text-gray-700">Mô tả</span>}
                    name="description"
                >
                    <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        label={<span className="font-medium text-gray-700">Giá gốc</span>}
                        name="price"
                        rules={[{ required: true, message: "Vui lòng nhập giá" }]}
                    >
                        <InputNumber
                            min={0}
                            style={{ width: "100%" }}
                            placeholder="VD: 1500000"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="font-medium text-gray-700">Tỷ lệ chiết khấu (%)</span>}
                        name="discount"
                        rules={[{ required: true, message: "Vui lòng nhập tỷ lệ chiết khấu" }]}
                    >
                        <InputNumber min={0} max={100} style={{ width: "100%" }} />
                    </Form.Item>
                </div>

                <Form.Item
                    label={<span className="font-medium text-gray-700">Ngày hết hạn chiết khấu</span>}
                    name="discount_expiry_date"
                >
                    <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                </Form.Item>

                <Form.Item
                    label={<span className="font-medium text-gray-700">Hình ảnh</span>}
                    name="image"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: !initialData, message: "Vui lòng chọn hình ảnh" }]}
                >
                    <Upload
                        listType="picture-card"
                        beforeUpload={() => false}
                        fileList={fileList}
                        onChange={handleUploadChange}
                        accept="image/*"
                        maxCount={1}
                    >
                        {fileList.length === 0 && (
                            <div>
                                <UploadOutlined />
                                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                            </div>
                        )}
                    </Upload>
                </Form.Item>

                <Form.Item
                    label={<span className="font-medium text-gray-700">Thuộc chuyên khoa</span>}
                    name="department_id"
                >
                    <Select
                        placeholder="Chọn chuyên khoa"
                        options={departments?.departments?.map((department: any) => ({
                            label: department.name,
                            value: department.id,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label={<span className="font-medium text-gray-700">Trạng thái</span>}
                    name="is_active"
                    valuePropName="checked"
                >
                    <Switch style={{ backgroundColor: "#11A998" }} checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isCreating || isUpdating}
                        block
                        className="!bg-gradient-to-r !from-teal-500 !to-teal-700 !text-white font-semibold rounded-lg shadow-md hover:!from-teal-600 hover:!to-teal-800 transition-all"
                    >
                        {initialData ? "Cập nhật gói dịch vụ" : "Thêm gói dịch vụ"}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>

    );
};

export default AddAndUpdatePackage;