"use client";
import { Typography } from "antd";
import Image from "next/image";

const { Title } = Typography;

interface BannerProps {
    title: string;
    highlight: string;
    description: string;
    image?: string;
    background?: string;
}

export default function Banner({
    title,
    highlight,
    description,
    image,
    background = "#FAE3CF",
}: BannerProps) {
    return (
        <section
            className="w-full flex flex-col items-center justify-center text-center px-6 py-20 md:py-28"
            style={{ background }}
        >
            <div className="max-w-5xl">
                {/* Title */}
                <Title
                    level={2}
                    className="
            !text-green-800 
            text-3xl md:text-5xl lg:text-6xl xl:text-7xl 
            font-extrabold 
            tracking-tight leading-tight 
            text-center 
            relative
            drop-shadow-md
          "
                >
                    {title}
                </Title>

                {/* Highlight */}
                <div
                    className="
            relative mb-8 font-extrabold inline-block 
            md:text-xl lg:text-2xl mt-4 px-12 md:px-20 py-3 rounded-full 
            text-white text-sm tracking-widest uppercase
            shadow-lg
            bg-[linear-gradient(90deg,rgba(244,110,33,0)_0%,rgba(244,110,33,0)_10%,#FFA65C_20%,#F46E21_50%,#FFA65C_80%,rgba(244,110,33,0)_90%,rgba(244,110,33,0)_100%)]
          "
                    style={{
                        WebkitMaskImage:
                            "linear-gradient(90deg,transparent 0%,rgba(0,0,0,0.2) 10%,black 20%,black 80%,rgba(0,0,0,0.2) 90%,transparent 100%)",
                        maskImage:
                            "linear-gradient(90deg,transparent 0%,rgba(0,0,0,0.2) 10%,black 20%,black 80%,rgba(0,0,0,0.2) 90%,transparent 100%)",
                        textShadow: "0 3px 6px rgba(0,0,0,.25)",
                    }}
                >
                    {highlight}
                </div>

                {/* Description */}
                <p className="bg-white text-justify font-medium p-6 md:p-8 rounded-xl shadow-md text-green-900 text-lg md:text-xl leading-loose">
                    {description}
                </p>

                {/* Image */}
                {image && (
                    <div className="mt-10 flex justify-center">
                        <Image
                            src={image}
                            alt="Banner illustration"
                            width={1000}
                            height={500}
                            className="rounded-2xl shadow-lg object-contain w-full h-auto max-w-4xl"
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
