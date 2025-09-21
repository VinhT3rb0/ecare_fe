"use client";
import React, { useState } from "react";
import { Row, Col, Button, Typography, Card } from "antd";
import { motion } from "framer-motion";
import { CalendarOutlined, MessageOutlined } from "@ant-design/icons";
import BookingFormModal from "./BookingModal";

const { Title, Paragraph } = Typography;
const MotionImg = motion.img;

interface BookingQASectionProps {
    bookingImage: string;
    qaImage: string;
}

const BookingQASection: React.FC<BookingQASectionProps> = ({ bookingImage, qaImage }) => {
    const [open, setOpen] = useState(false);
    return (
        <div
            style={{
                background: "linear-gradient(135deg, #000 40%, #022d2a 100%)",
                padding: "80px 20px",
                textAlign: "center",
            }}
        >
            <div style={{ backgroundColor: '#11A998' }}
                className="inline-block w-16 h-1 mb-2"></div>
            <Title level={2} style={{ color: "#11A998", fontSize: "32px" }}>
                Đặt lịch ngay
            </Title>
            <div
                style={{ backgroundColor: '#11A998' }}
                className="inline-block w-16 h-1"></div>
            <div style={{ overflow: "hidden" }}>
                <Row gutter={[60, 60]} align="middle" style={{ marginBottom: 100 }}>
                    <Col xs={24} md={12}>
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Card
                                cover={
                                    <MotionImg
                                        whileHover={{ scale: 1.06 }}
                                        transition={{ duration: 0.4 }}
                                        alt="Booking"
                                        src={bookingImage}
                                        style={{
                                            borderRadius: "16px",
                                            objectFit: "cover",
                                            height: 350,
                                            maxWidth: "75%",
                                            margin: "0 auto",
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                                        }}
                                    />
                                }
                                variant="borderless"
                                style={{ background: "transparent", boxShadow: "none" }}
                            />
                        </motion.div>
                    </Col>
                    <Col xs={24} md={12}>
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Paragraph
                                style={{
                                    color: "#e0e0e0",
                                    fontSize: "20px",
                                    lineHeight: 1.7,
                                    marginBottom: "40px",
                                }}
                            >
                                Hãy để lại thông tin để được{" "}
                                <span style={{ color: "#FFD700", fontWeight: "bold" }}>
                                    trải nghiệm dịch vụ tốt nhất
                                </span>{" "}
                                tại phòng khám.
                            </Paragraph>
                            <Button
                                type="primary"
                                size="large"
                                shape="round"
                                icon={<CalendarOutlined />}
                                style={{
                                    background: "linear-gradient(90deg, #11A998, #0e8a7f)",
                                    border: "none",
                                    padding: "0 40px",
                                    height: "50px",
                                    fontWeight: "bold",
                                    boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                                }}
                                onClick={() => setOpen(true)}
                            >
                                ĐẶT LỊCH NGAY
                            </Button>
                        </motion.div>
                    </Col>
                </Row>
                <BookingFormModal open={open} onClose={() => setOpen(false)} />
            </div>

            <div
                style={{ backgroundColor: '#11A998' }}
                className="inline-block w-32 h-1 mt-2"></div>
            <Title level={2} style={{ color: "#11A998", fontSize: "32px" }}>
                Hỏi đáp cùng chuyên gia
            </Title>
            <div style={{ backgroundColor: '#11A998' }}
                className="inline-block w-32 h-1 mb-2"></div>
            <div style={{ overflow: "hidden" }}>
                <Row gutter={[60, 60]} align="middle">
                    <Col xs={24} md={12}>
                        <motion.div
                            initial={{ opacity: 0, x: -100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Paragraph
                                style={{
                                    color: "#e0e0e0",
                                    fontSize: "20px",
                                    lineHeight: 1.7,
                                    marginBottom: "40px",
                                }}
                            >
                                Giải đáp mọi thắc mắc sức khỏe cùng đội ngũ bác sĩ & chuyên gia tại{" "}
                                <span style={{ color: "#FFD700", fontWeight: "bold" }}>
                                    Phòng khám YHCT & Trị liệu dưỡng sinh Thanh Bình
                                </span>
                            </Paragraph>
                            <Button
                                type="primary"
                                size="large"
                                shape="round"
                                icon={<MessageOutlined />}
                                style={{
                                    background: "linear-gradient(90deg, #11A998, #0e8a7f)",
                                    border: "none",
                                    padding: "0 40px",
                                    height: "50px",
                                    fontWeight: "bold",
                                    boxShadow: "0 6px 15px rgba(0,0,0,0.3)",
                                }}
                                onClick={() => window.dispatchEvent(new Event("openChatBox"))}
                            >
                                HỎI ĐÁP NGAY
                            </Button>
                        </motion.div>
                    </Col>
                    <Col xs={24} md={12}>
                        <motion.div
                            initial={{ opacity: 0, x: 100 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Card
                                cover={
                                    <MotionImg
                                        whileHover={{ scale: 1.06 }}
                                        transition={{ duration: 0.4 }}
                                        alt="Q&A"
                                        src={qaImage}
                                        style={{
                                            borderRadius: "16px",
                                            objectFit: "cover",
                                            height: 350,
                                            maxWidth: "75%",
                                            margin: "0 auto",
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                                        }}
                                    />
                                }
                                variant="borderless"
                                style={{ background: "transparent", boxShadow: "none" }}
                            />
                        </motion.div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default BookingQASection;
