"use client";

import { useParams } from "next/navigation";
import {
    Spin,
    Card,
    Tag,
    Divider,
    Button,
    Space,
    Timeline,
    Rate,
    Input,
    Form,
    Avatar,
    List,
    Typography,
} from "antd";
import {
    PhoneOutlined,
    ArrowLeftOutlined,
    MailOutlined,
    BookOutlined,
    ClusterOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import Link from "next/link";
import { useGetDoctorByDepartmentQuery, useGetMyDoctorQuery } from "@/api/app_doctor/apiDoctor";
import Navbar from "@/components/Navbar/NavBar";
import Footer from "@/components/Footer/Footer";
import toast from "react-hot-toast";
import {
    useCreateReviewMutation,
    useGetReviewsByDoctorQuery,
} from "@/api/app_review/apiReview";
import RelatedDoctors from "@/components/RelatedDoctors/RelatedDoctors";

const { Paragraph, Text } = Typography;

export default function DoctorDetailPage() {
    const { id } = useParams();
    const { data: doctor, isLoading } = useGetMyDoctorQuery(id as string, {
        skip: !id,
    });

    const [form] = Form.useForm();
    const [createReview, { isLoading: creating }] = useCreateReviewMutation();
    const {
        data: reviewsData,
        refetch: refetchReviews,
        isFetching: reviewsFetching,
    } = useGetReviewsByDoctorQuery((doctor?.id as number) || 0, {
        skip: !doctor?.id,
    });

    const reviews = reviewsData?.data ?? [];

    const departmentId = doctor?.departments?.[0]?.id;
    const { data: relatedDoctors, isLoading: loadingRelated } =
        useGetDoctorByDepartmentQuery(departmentId!, {
            skip: !departmentId,
        });
    console.log(relatedDoctors);

    const handleSubmitReview = async () => {
        try {
            const values = await form.validateFields();
            await createReview({
                doctor_id: doctor.id,
                patient_id: 1,
                rating: values.rating,
                comment: values.comment,
            }).unwrap();

            toast.success("Đã gửi đánh giá!");
            form.resetFields();
            refetchReviews?.();
        } catch (err: any) {
            toast.error(err?.data?.message || "Không thể gửi đánh giá");
        }
    };

    if (!doctor) {
        return (
            <>
                <Navbar />
                <div className="h-20" />
                <p className="text-center py-20">Không tìm thấy bác sĩ</p>
                <Footer />
            </>
        );
    }

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="h-20" />
                <div className="flex justify-center items-center h-96">
                    <Spin size="large" />
                </div>
                <Footer />
            </>
        );
    }

    const genderLabel =
        doctor.gender === "male" ? "Nam" : doctor.gender === "female" ? "Nữ" : "Khác";

    return (
        <>
            <Navbar />
            <div className="h-28" />

            {/* Breadcrumb */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/doctors"
                            className="inline-flex items-center text-[#064E3B] hover:underline"
                        >
                            <ArrowLeftOutlined />
                            <span className="ml-2">Quay lại</span>
                        </Link>
                        <nav className="text-sm text-gray-500 ml-4">
                            <Link href="/" className="hover:text-[#11A998]">
                                Trang chủ
                            </Link>
                            <span className="mx-2 text-gray-300">{">"}</span>
                            <Link href="/doctors" className="hover:text-[#11A998]">
                                Danh sách bác sĩ
                            </Link>
                            <span className="mx-2 text-gray-300">{">"}</span>
                            <span className="text-[#064E3B] font-semibold">{doctor.full_name}</span>
                        </nav>
                    </div>
                </div>
            </div>

            {/* Main */}
            <section className="max-w-6xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-28">
                        <Card className="rounded-xl shadow-lg overflow-hidden">
                            <div className="w-full h-80 relative rounded-lg overflow-hidden border-4 border-[#11A998] shadow-lg">
                                <Image
                                    src={doctor.avatar_img || "/images/doctor-placeholder.jpg"}
                                    alt={doctor.full_name}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                            </div>

                            <div className="text-center mt-4">
                                <h1 className="text-2xl font-bold text-[#064E3B]">{doctor.full_name}</h1>
                                {doctor.education_level && (
                                    <p className="text-sm text-[#11A998] font-medium mt-1">{doctor.education_level}</p>
                                )}
                                <p className="text-gray-600 mt-2">
                                    {genderLabel} • {doctor.experience_years} năm kinh nghiệm
                                </p>
                                <p className="text-gray-600 text-sm mt-1">{doctor.email}</p>
                                <p className="text-gray-600 text-sm mt-1">{doctor.phone}</p>

                                <Divider />

                                <Space direction="vertical" size="small" className="w-full">
                                    <a href={`tel:${doctor.phone}`} className="w-full">
                                        <Button
                                            block
                                            icon={<PhoneOutlined />}
                                            size="large"
                                            style={{
                                                borderColor: "#11A998",
                                                color: "#064E3B",
                                                background: "#ffffff",
                                            }}
                                        >
                                            Gọi bác sĩ
                                        </Button>
                                    </a>
                                    <Button
                                        block
                                        size="large"
                                        className="bg-gradient-to-r from-[#11A998] to-[#0A8764] border-none text-white font-medium hover:opacity-90"
                                    >
                                        Đặt lịch khám
                                    </Button>
                                </Space>
                            </div>
                        </Card>

                        {/* Quick Info */}
                        <Card className="mt-4 rounded-xl shadow-md">
                            <h3 className="font-semibold text-[#064E3B] mb-3">Thông tin nhanh</h3>
                            <ul className="text-sm text-gray-700 space-y-2">
                                <li className="flex items-center gap-2">
                                    <ClusterOutlined className="text-[#11A998]" />
                                    <span>
                                        <strong>Chuyên khoa:</strong>{" "}
                                        {doctor.departments?.map((d: any) => d.name).join(", ") || "—"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MailOutlined className="text-[#11A998]" />
                                    <span>
                                        <strong>Email:</strong> {doctor.email || "—"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <PhoneOutlined className="text-[#11A998]" />
                                    <span>
                                        <strong>SĐT:</strong> {doctor.phone || "—"}
                                    </span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <BookOutlined className="text-[#11A998]" />
                                    <span>
                                        <strong>Trình độ:</strong> {doctor.education_level || "—"}
                                    </span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </aside>

                {/* RIGHT */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title card */}
                    <Card className="rounded-xl shadow-md">
                        <h2 className="text-2xl font-bold text-[#064E3B] mb-2">{doctor.full_name}</h2>
                        <p className="text-sm text-gray-600">
                            {doctor.education_level} • {doctor.Degrees?.[0]?.specialization || "Chuyên môn chưa cập nhật"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {doctor.departments?.map((d: any) => (
                                <Tag key={d.id} color="#11A998" className="text-[#064E3B] font-medium">
                                    {d.name}
                                </Tag>
                            ))}
                        </div>
                    </Card>

                    <Card
                        title={<span className="text-[#064E3B] font-semibold">Lịch sử học vấn</span>}
                        className="rounded-xl shadow-md"
                    >
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {doctor.education_history ||
                                "Bác sĩ chưa cập nhật lịch sử học vấn. Vui lòng liên hệ phòng khám để biết thêm chi tiết."}
                        </p>
                    </Card>

                    <Card
                        title={
                            <span className="text-[#064E3B] font-semibold">
                                Trình độ & Chuyên môn
                            </span>
                        }
                        className="rounded-xl shadow-md"
                    >
                        {doctor.Degrees?.length > 0 ? (
                            <Timeline
                                mode="left"
                                items={doctor.Degrees.map((deg: any) => ({
                                    key: deg.id,
                                    label: deg.issue_date,
                                    children: (
                                        <>
                                            <h4 className="text-lg font-semibold text-[#064E3B]">{deg.specialization}</h4>
                                            <p className="text-sm text-gray-700">{deg.practice_scope}</p>
                                            <p className="text-xs text-gray-500 mt-1">Cấp tại {deg.issue_place}</p>
                                        </>
                                    ),
                                }))}
                            />
                        ) : (
                            <p className="text-gray-500 italic">Chưa có thông tin văn bằng</p>
                        )}
                    </Card>

                    <Card
                        title={<span className="text-[#064E3B] font-semibold">Mô tả chuyên khoa</span>}
                        className="rounded-xl shadow-md"
                    >
                        {doctor.departments?.map((d: any) => (
                            <div key={d.id} className="mb-6">
                                <h4 className="text-base font-semibold text-green-800">{d.name}</h4>
                                <p className="text-gray-700 text-sm leading-relaxed">{d.description}</p>
                            </div>
                        ))}
                    </Card>
                </div>
            </section>

            {relatedDoctors && (
                <RelatedDoctors
                    relatedDoctors={relatedDoctors.doctors}
                    currentDoctorId={doctor.id}
                    departmentName={relatedDoctors.department}
                />
            )}

            <div className="max-w-6xl mx-auto px-4 pb-12">
                <Card title={<span className="text-[#064E3B] font-semibold">Đánh giá bác sĩ</span>} className="rounded-xl shadow-md">
                    {/* Form gửi đánh giá */}
                    <Form form={form} layout="vertical" onFinish={handleSubmitReview}>
                        <Form.Item name="rating" label="Đánh giá">
                            <Rate />
                        </Form.Item>
                        <Form.Item name="comment" label="Nhận xét">
                            <Input.TextArea rows={3} placeholder="Nhập nhận xét của bạn..." />
                        </Form.Item>
                        <div className="flex items-center gap-3">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={creating}
                                className="bg-gradient-to-r from-[#11A998] to-[#0A8764] border-none"
                            >
                                Gửi đánh giá
                            </Button>
                            <Text type="secondary">Cảm ơn phản hồi của bạn — nó giúp cải thiện chất lượng dịch vụ.</Text>
                        </div>
                    </Form>

                    <Divider />

                    {/* Danh sách đánh giá */}
                    <h4 className="font-semibold mb-3">Các đánh giá gần đây</h4>

                    {reviewsFetching ? (
                        <div className="flex justify-center py-6">
                            <Spin />
                        </div>
                    ) : reviews.length ? (
                        <List
                            itemLayout="vertical"
                            dataSource={reviews}
                            className="space-y-3"
                            renderItem={(rev: any) => {
                                const patientName = rev.Patient?.full_name || "Người dùng ẩn danh";
                                const initials = patientName
                                    .split(" ")
                                    .map((s: string) => s[0])
                                    .slice(-2)
                                    .join("")
                                    .toUpperCase();

                                return (
                                    <List.Item key={rev.id} className="p-3 bg-white rounded-md shadow-sm">
                                        <List.Item.Meta
                                            avatar={<Avatar>{initials}</Avatar>}
                                            title={
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <strong>{patientName}</strong>
                                                        <Rate disabled defaultValue={rev.rating} />
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(rev.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            }
                                            description={
                                                <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}>
                                                    {rev.comment || <Text type="secondary">Không có nội dung</Text>}
                                                </Paragraph>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    ) : (
                        <p className="italic text-gray-400">Chưa có đánh giá nào</p>
                    )}
                </Card>
            </div>

            <Footer />
        </>
    );
}
