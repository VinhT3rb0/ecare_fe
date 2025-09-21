// /components/RelatedDoctors/RelatedDoctors.tsx
import { Card, Row, Col } from "antd";
import Image from "next/image";
import Link from "next/link";

interface Doctor {
  id: number;
  user_id: number;
  full_name: string;
  avatar_img: string;
  experience_years: number;
  departments: { id: number; name: string }[];
}

interface RelatedDoctorsProps {
  relatedDoctors: Doctor[];
  currentDoctorId: number;
  departmentName: string;
}

const RelatedDoctors: React.FC<RelatedDoctorsProps> = ({
  relatedDoctors,
  currentDoctorId,
  departmentName,
}) => {
  const filtered = relatedDoctors
    .filter(
      (d) =>
        d.id !== currentDoctorId &&
        d.departments?.some((dep) => dep.name === departmentName)
    )
    .slice(0, 4);

  if (filtered.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-12">
      <h3 className="font-bold text-lg mb-3 text-[#064E3B]">
        Bác sĩ cùng khoa
      </h3>
      <Row gutter={[16, 16]}>
        {filtered.map((doc) => (
          <Col xs={24} sm={12} md={12} lg={6} key={doc.id}>
            <Link href={`/doctors/${doc.user_id}`} className="block">
              <Card
                hoverable
                cover={
                  <Image
                    src={doc.avatar_img}
                    alt={doc.full_name}
                    width={300}
                    height={300}
                    className="object-cover w-full"
                  />
                }
              >
                <Card.Meta
                  title={doc.full_name}
                  description={`Kinh nghiệm: ${doc.experience_years} năm`}
                />
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RelatedDoctors;
