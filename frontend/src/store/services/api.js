import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '', // Proxy configuration routes this to backend server
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, apiInstance, extraOptions) => {
  let result = await baseQuery(args, apiInstance, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Dispatch logout action from authSlice (type: 'auth/logout')
    apiInstance.dispatch({ type: 'auth/logout' });
    // Reset all RTK Query cache state
    apiInstance.dispatch(api.util.resetApiState());
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Board', 'Task'],
  endpoints: () => ({}),
});
