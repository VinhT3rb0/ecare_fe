import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export interface Review {
    id: number;
    patient_id: number;
    doctor_id: number;
    rating: number;
    comment?: string;
    created_at: string;

    Patient?: {
        id: number;
        full_name: string;
    };
    Doctor?: {
        id: number;
        full_name: string;
    };
}

export interface ReviewResponse {
    data: Review[];
}



export const apiReview = createApi({
    reducerPath: "reviewApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-review/v1`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getReviews: builder.query<ReviewResponse, { doctor_id?: number; patient_id?: number }>({
            query: (params) => ({
                url: "reviews",
                method: "GET",
                params,
            }),
        }),

        // ✅ thêm endpoint mới lấy review theo doctor_id
        getReviewsByDoctor: builder.query<ReviewResponse, number>({
            query: (doctor_id) => ({
                url: `reviews/doctor/${doctor_id}`, // đúng route bạn đã tạo bên backend
                method: "GET",
            }),
        }),

        // Tạo review mới
        createReview: builder.mutation<
            Review,
            { patient_id: number; doctor_id: number; rating: number; comment?: string }
        >({
            query: (body) => ({
                url: "/",
                method: "POST",
                body,
            }),
        }),

        // Lấy rating trung bình của 1 bác sĩ
        getDoctorAverageRating: builder.query<{ doctor_id: number; avgRating: number }, { doctor_id: number }>({
            query: ({ doctor_id }) => ({
                url: "/average",
                method: "GET",
                params: { doctor_id },
            }),
        }),

        // Xu hướng review (theo ngày/tháng)
        getReviewTrends: builder.query<
            { time: string; value: number }[],
            { from?: string; to?: string; granularity?: "day" | "month" }
        >({
            query: (params) => ({
                url: "/trends",
                method: "GET",
                params,
            }),
        }),

        // Top bác sĩ có rating cao
        getTopDoctorsByRating: builder.query<
            { data: { doctor_id: number; doctor_name: string; doctor_avatar: string; avg_rating: string; total_reviews: number }[] },
            { from?: string; to?: string; limit?: number }
        >({
            query: (params) => ({
                url: "/top-doctors",
                method: "GET",
                params,
            }),
        }),
    }),
});

// xuất hook mới luôn
export const {
    useGetReviewsQuery,
    useGetReviewsByDoctorQuery,
    useCreateReviewMutation,
    useGetDoctorAverageRatingQuery,
    useGetReviewTrendsQuery,
    useGetTopDoctorsByRatingQuery,
} = apiReview;

