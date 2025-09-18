import { useGetDoctorApprovedQuery } from "@/api/app_doctor/apiDoctor";
import DoctorCarousel from "@/components/DoctorCarousel/DoctorCarousel";

export default function DoctorCarouselComponent() {
    const { data: approvedDoctorsData, isLoading: isDoctorsLoading } =
        useGetDoctorApprovedQuery(undefined);

    if (isDoctorsLoading) return <p>Đang tải...</p>;

    return (
        <DoctorCarousel doctors={approvedDoctorsData?.data || []} />
    );
}

