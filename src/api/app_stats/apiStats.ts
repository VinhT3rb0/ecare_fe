import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export const apiStats = createApi({
    reducerPath: "statsApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-stats/v1`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
            return headers;
        },
    }),
    tagTypes: ["Stats"],
    endpoints: (builder) => ({
        getOverview: builder.query<any, { from?: string; to?: string } | undefined>({
            query: (params = {}) => ({ url: `/overview`, params }),
            providesTags: ["Stats"],
        }),
        getRevenueSeries: builder.query<any, { from?: string; to?: string; granularity?: string } | undefined>({
            query: (params = {}) => ({ url: `/revenue-series`, params }),
            providesTags: ["Stats"],
        }),
        getInvoicesSeries: builder.query<any, { from?: string; to?: string; granularity?: string } | undefined>({
            query: (params = {}) => ({ url: `/invoices-series`, params }),
            providesTags: ["Stats"],
        }),
        getRevenueByDepartment: builder.query<any, { from?: string; to?: string } | undefined>({
            query: (params = {}) => ({ url: `/revenue-by-department`, params }),
            providesTags: ["Stats"],
        }),
        getTopServices: builder.query<any, { from?: string; to?: string; limit?: number } | undefined>({
            query: (params = {}) => ({ url: `/top-services`, params }),
            providesTags: ["Stats"],
        }),
    }),
});

export const {
    useGetOverviewQuery,
    useGetRevenueSeriesQuery,
    useGetInvoicesSeriesQuery,
    useGetRevenueByDepartmentQuery,
    useGetTopServicesQuery,
} = apiStats;


