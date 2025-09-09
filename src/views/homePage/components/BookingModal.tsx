"use client";
import React, { useState } from "react";
import { Modal, Radio } from "antd";

import BookingByDoctorForm from "./BookingByDoctorForm";
import dynamic from "next/dynamic";

interface BookingFormModalProps {
    open: boolean;
    onClose: () => void;
}
const BookingByDateForm = dynamic(() => import("./BookingByDateForm"), {
    ssr: false,
});
const BookingFormModal: React.FC<BookingFormModalProps> = ({ open, onClose }) => {
    const [mode, setMode] = useState<"byDate" | "byDoctor">("byDate");

    return (
        <Modal
            title={<span style={{ color: "#0b6e64", fontWeight: 700 }}>Đặt lịch khám</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={900}
            style={{
                backgroundColor: "#f9fdfc",
                borderRadius: "16px",
            }}
        >
            <Radio.Group
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={{ marginBottom: 24 }}
            >
                <Radio.Button
                    value="byDate"
                    style={{
                        backgroundColor: mode === "byDate" ? "#11A998" : "#ffffff",
                        color: mode === "byDate" ? "#ffffff" : "#11A998",
                        borderColor: "#11A998",
                        borderRadius: "6px 0 0 6px",
                        fontWeight: 600,
                    }}
                >
                    Đặt theo ngày
                </Radio.Button>
                <Radio.Button
                    value="byDoctor"
                    style={{
                        backgroundColor: mode === "byDoctor" ? "#11A998" : "#ffffff",
                        color: mode === "byDoctor" ? "#ffffff" : "#11A998",
                        borderColor: "#11A998",
                        borderRadius: "0 6px 6px 0",
                        fontWeight: 600,
                    }}
                >
                    Đặt theo bác sĩ
                </Radio.Button>
            </Radio.Group>

            {mode === "byDate" ? (
                <BookingByDateForm onClose={onClose} />
            ) : (
                <BookingByDoctorForm onClose={onClose} />
            )}
        </Modal>


    );
};

export default BookingFormModal;
