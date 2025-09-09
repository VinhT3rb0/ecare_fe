import { getAccessTokenFromCookie } from "@/utils/token";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiDegree = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-degree/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        }
    }),
    reducerPath: "degreeApi",
    tagTypes: ["Degree"],
    endpoints: (builder) => ({
        getDegree: builder.query<any, string | void>({
            query: (doctor_id) => doctor_id ? `/${doctor_id}` : "/",
        }),
        createDegree: builder.mutation<any, any>({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data
            })
        }),
        getDegreePending: builder.query<any, string | void>({
            query: (doctorId) => doctorId ? `/pending/${doctorId}` : "/pending",
        }),
        createDegreePending: builder.mutation<any, any>({
            query: (data) => ({
                url: "/pending",
                method: "POST",
                body: data
            })
        }),
        updateDegree: builder.mutation<any, any>({
            query: (data) => ({
                url: "/degrees",
                method: "PUT",
                body: data
            })
        })
    })
})

export const {
    useGetDegreeQuery,
    useCreateDegreeMutation,
    useGetDegreePendingQuery,
    useCreateDegreePendingMutation,
    useUpdateDegreeMutation
} = apiDegree;