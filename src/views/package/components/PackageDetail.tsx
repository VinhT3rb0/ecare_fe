"use client";
import React from "react";
import { Modal, Descriptions, Tag, Image } from "antd";
import { to_vietnamese } from "@/utils/numberInWritten";

interface PackageDetailProps {
    open: boolean;
    onClose: () => void;
    data?: any;
}

const PackageDetail: React.FC<PackageDetailProps> = ({ open, onClose, data }) => {
    if (!data) return null;

    const price = Math.round(Number(data.price || 0));
    const discount = Number(data.discount || 0);
    const discounted = Math.round(price - price * (discount / 100));

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            title={<span className="text-lg font-semibold text-teal-700">Chi tiết gói dịch vụ</span>}
            width={700}
        >
            <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="Tên gói">{data.name}</Descriptions.Item>
                <Descriptions.Item label="Mô tả">{data.description || "—"}</Descriptions.Item>
                <Descriptions.Item label="Giá gốc">
                    <div>
                        {price.toLocaleString("vi-VN")} đ
                        <div className="text-xs text-gray-500 italic">{to_vietnamese(price)}</div>
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Giá sau chiết khấu">
                    <div>
                        <span className="font-bold text-green-600">{discounted.toLocaleString("vi-VN")} đ</span>
                        <div className="text-xs text-gray-500 italic">{to_vietnamese(discounted)}</div>
                    </div>
                </Descriptions.Item>
                <Descriptions.Item label="Chiết khấu">{discount}%</Descriptions.Item>
                <Descriptions.Item label="Chuyên khoa">
                    {data.department?.name || <Tag color="default">Không có</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    {data.is_active ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Hình ảnh">
                    {data.image_url ? (
                        <Image src={data.image_url} width={150} className="rounded shadow" />
                    ) : (
                        "—"
                    )}
                </Descriptions.Item>
            </Descriptions>
        </Modal>
    );
};

export default PackageDetail;
