import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";
interface GetPackagesParams {
    page?: number;
    limit?: number;
    name?: string;
}
export const apiDepartmentDoctor = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-department/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        }
    }),
    reducerPath: "departmentDoctorApi",
    tagTypes: ["DepartmentDoctor"],
    endpoints: (builder) => ({
        getDepartments: builder.query<any, GetPackagesParams | void>({
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
            providesTags: [{ type: "DepartmentDoctor" }],
        }),
        createDepartment: builder.mutation<any, any>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                body: data,
            }),
        }),
        updateDepartment: builder.mutation<any, any>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
        }),
        deleteDepartment: builder.mutation<any, any>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
        }),
        getDepartmentDoctors: builder.query<any, any>({
            query: (id) => ({
                url: `/doctor/${id}`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGetDepartmentsQuery,
    useCreateDepartmentMutation,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
    useGetDepartmentDoctorsQuery,
} = apiDepartmentDoctor;
export default apiDepartmentDoctor;