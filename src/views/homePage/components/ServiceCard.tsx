// components/ServiceCard.tsx
import React from 'react';
import Link from 'next/link';

interface ServiceCardProps {
    imageSrc: string;
    title: string;
    href: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ imageSrc, title, href }) => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
        <Link
            href={href}
            style={{ color: '#11A998' }}

            className="mt-auto  font-medium hover:underline"
        >
            <div className="h-48 overflow-hidden">
                <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

                XEM THÊM...
            </div>
        </Link>
    </div>
);

export default ServiceCard;
