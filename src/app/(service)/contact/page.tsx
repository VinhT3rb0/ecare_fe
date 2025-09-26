"use client";

import React from "react";
import { Card, Form, Input, Button, Row, Col, Typography } from "antd";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined, SendOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar/NavBar";
import Footer from "@/components/Footer/Footer";
import ContactBanner from "@/components/contact/contactBanner";

const { Title } = Typography;

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
};

const ContactPage = () => {
    return (
        <>
            <Navbar />
            <div className="h-20" />

            <ContactBanner />
            <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white px-4 py-16 flex items-center">
                <div className="max-w-7xl mx-auto w-full">
                    <Row gutter={[32, 32]}>
                        {/* Thông tin & bản đồ */}
                        <Col xs={24} md={16}>
                            <motion.div
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <Card
                                    className="shadow-xl rounded-2xl border border-gray-100 mb-6"
                                    style={{ padding: "32px 36px" }}
                                >
                                    <Title
                                        level={3}
                                        style={{ marginBottom: 28, color: "#0b6e64", fontWeight: 800 }}
                                    >
                                        CÔNG TY TNHH BỆNH VIỆN THANH BÌNH
                                    </Title>
                                    <div className="space-y-5 text-gray-700 text-lg leading-relaxed">
                                        <div className="flex items-center gap-4 hover:text-teal-700 transition">
                                            <PhoneOutlined style={{ color: "#0b6e64", fontSize: 20 }} />
                                            <span>Hotline: 0123 456 789</span>
                                        </div>
                                        <div className="flex items-center gap-4 hover:text-teal-700 transition">
                                            <MailOutlined style={{ color: "#0b6e64", fontSize: 20 }} />
                                            <span>Email: support@ecare.com</span>
                                        </div>
                                        <div className="flex items-center gap-4 hover:text-teal-700 transition">
                                            <EnvironmentOutlined style={{ color: "#0b6e64", fontSize: 20 }} />
                                            <span>
                                                Địa chỉ: 52 Phố Cầu Cốc, Tây Mỗ, Nam Từ Liêm, Hà Nội
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <Card className="shadow-xl rounded-2xl overflow-hidden border border-gray-100">
                                    <iframe
                                        title="Google Map"
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.725412837983!2d105.74456477529473!3d21.003641288640846!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3134536fd99f3aeb%3A0xb1270c35396aa33f!2zNDMvNTIgUC4gQ-G6p3UgQ-G7kWMsIFRkcCBExrDhu5tpLCBOYW0gVOG7qyBMacOqbSwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1758894145024!5m2!1svi!2s"
                                        width="100%"
                                        height="600"
                                        style={{ border: 0, borderRadius: "16px" }}
                                        allowFullScreen
                                        loading="lazy"
                                    ></iframe>
                                </Card>
                            </motion.div>
                        </Col>

                        {/* Form đăng ký */}
                        <Col xs={24} md={8}>
                            <motion.div
                                variants={fadeInUp}
                                initial="hidden"
                                animate="visible"
                                transition={{ duration: 0.6, delay: 0.5 }}
                            >
                                <Card
                                    className="shadow-xl rounded-2xl border border-gray-100"
                                    style={{ padding: "28px 32px" }}
                                >
                                    <Title
                                        level={4}
                                        style={{ marginBottom: 24, color: "#0b6e64", fontWeight: 700 }}
                                    >
                                        Đăng ký nhận ưu đãi
                                    </Title>
                                    <Form layout="vertical">
                                        <Form.Item
                                            label="Họ và tên"
                                            name="name"
                                            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                                        >
                                            <Input size="large" placeholder="Nguyễn Văn A" />
                                        </Form.Item>
                                        <Form.Item
                                            label="Email"
                                            name="email"
                                            rules={[
                                                { required: true, message: "Vui lòng nhập email!" },
                                                { type: "email", message: "Email không hợp lệ!" },
                                            ]}
                                        >
                                            <Input size="large" placeholder="example@gmail.com" />
                                        </Form.Item>
                                        <Form.Item
                                            label="Số điện thoại"
                                            name="number"
                                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
                                        >
                                            <Input size="large" placeholder="Nhập số điện thoại" />
                                        </Form.Item>
                                        <Button
                                            type="primary"
                                            size="large"
                                            htmlType="submit"
                                            icon={<SendOutlined />}
                                            className="w-full bg-teal-600 hover:bg-teal-700 rounded-full flex items-center justify-center"
                                        >
                                            Gửi ngay
                                        </Button>
                                    </Form>
                                </Card>
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ContactPage;
