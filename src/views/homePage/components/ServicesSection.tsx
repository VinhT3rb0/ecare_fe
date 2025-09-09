// components/ServicesSection.tsx
import React from 'react';
import ServiceCard from './ServiceCard';

const services = [
    {
        image: '/images/homePage/serviceCard1.jpg',
        title: 'Dịch vụ khám sức khỏe chuyên sâu',
        href: '/services/neck-care'
    },
    {
        image: '/images/homePage/serviceCard2.jpg',
        title: 'Dịch vụ Điều trị cơ xương khớp',
        href: '/services/weight-loss'
    },
    {
        image: '/images/homePage/serviceCard3.jpg',
        title: 'Chăm sóc và tư vấn sức khỏe phụ nữ',
        href: '/services/body-contour'
    },
    {
        image: '/images/homePage/serviceCard4.jpg',
        title: 'Thực hiện xét nghiệm, siêu âm, nội soi.',
        href: '/services/face-slim'
    },
];

const ServicesSection: React.FC = () => (
    <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center mb-12">
            <div style={{ backgroundColor: '#11A998' }}
                className="inline-block w-16 h-1 mb-2"></div>
            <h2
                style={{ color: '#11A998' }}
                className="text-3xl font-bold">Dịch vụ của chúng tôi</h2>
            <div
                style={{ backgroundColor: '#11A998' }}
                className="inline-block w-16 h-1 mt-2"></div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
            {services.map((sv) => (
                <ServiceCard
                    key={sv.href}
                    imageSrc={sv.image}
                    title={sv.title}
                    href={sv.href}
                />
            ))}
        </div>
    </section>
);

export default ServicesSection;
