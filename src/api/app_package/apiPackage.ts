import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";
interface GetPackagesParams {
    page?: number;
    limit?: number;
    name?: string;
}
export const apiPackage = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-package/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        }
    }),
    reducerPath: "packageApi",
    tagTypes: ["Package"],
    endpoints: (builder) => ({
        getPackages: builder.query<any, GetPackagesParams | void>({
            query: (params) => {
                let queryString = "";
                if (params) {
                    const searchParams = new URLSearchParams();
                    if (params.page) searchParams.append("page", params.page.toString());
                    if (params.limit) searchParams.append("limit", params.limit.toString());
                    if (params.name) searchParams.append("name", params.name);
                    queryString = `?${searchParams.toString()}`;
                }
                return `/${queryString}`;
            },
            providesTags: [{ type: "Package" }],
        }),
        getPackageById: builder.query<any, string>({
            query: (id) => `package/${id}/`,
            providesTags: (result, error, id) => [{ type: "Package", id }],
        }),
        getPackagesByDepartment: builder.query<any, string>({
            query: (departmentId) => `department/${departmentId}`,
            providesTags: (result, error, departmentId) => [{ type: "Package", id: `department-${departmentId}` }],
        }),
        createPackage: builder.mutation<any, any>({
            query: (data) => ({
                url: "/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Package" }],
        }),
        updatePackage: builder.mutation<any, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `/${id}/`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: "Package", id }],
        }),
        deletePackage: builder.mutation<any, string>({
            query: (id) => ({
                url: `/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [{ type: "Package", id }],
        }),
    }),
});

export const {
    useGetPackagesQuery,
    useGetPackageByIdQuery,
    useGetPackagesByDepartmentQuery,
    useCreatePackageMutation,
    useUpdatePackageMutation,
    useDeletePackageMutation,
} = apiPackage;
export default apiPackage;