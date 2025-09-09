import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAccessTokenFromCookie } from "@/utils/token";

export interface Room {
    id: number;
    name: string;
    location?: string;
    [key: string]: any;
}

export interface GetRoomsParams {
    page?: number;
    limit?: number;
    name?: string;
}

export const apiRoom = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/app-room/v1/`,
        prepareHeaders: (headers) => {
            const accessToken = getAccessTokenFromCookie();
            if (accessToken) {
                headers.set('Authorization', `Bearer ${accessToken}`);
            }
            return headers;
        }
    }),
    reducerPath: "roomApi",
    tagTypes: ["Room"],
    endpoints: (builder) => ({
        getAllRooms: builder.query<any, GetRoomsParams | void>({
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
            providesTags: [{ type: "Room" }],
        }),
        createRoom: builder.mutation<any, Partial<Room>>({
            query: (data) => ({
                url: `/`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: [{ type: "Room" }],
        }),
        updateRoom: builder.mutation<any, { id: number; data: Partial<Room> }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: [{ type: "Room" }],
        }),
        deleteRoom: builder.mutation<any, number>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Room" }],
        }),
    }),
});

export const {
    useGetAllRoomsQuery,
    useCreateRoomMutation,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
} = apiRoom;

export default apiRoom;
