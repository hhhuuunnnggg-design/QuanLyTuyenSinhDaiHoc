import { fetchAccountAPI } from "@/services/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. Định nghĩa state cho auth
interface AuthState {
  isAuthenticated: boolean; // đã đăng nhập hay chưa
  user: IUser | null; // thông tin user (nếu có)
  loading: boolean; // đang loading API
  error: string | null; // lỗi (nếu có)
}

// 2. State khởi tạo
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
};

// 3. Thunk: để gọi API async
export const fetchAccountThunk = createAsyncThunk(
  "auth/fetchAccount", // tên action -> Redux tự sinh ra 3 action: pending, fulfilled, rejected
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await fetchAccountAPI(); // gọi API
      if (res && res.data) {
        // gọi reducer setAuth để lưu state
        dispatch(setAuth({ isAuthenticated: true, user: res.data.user }));
        return res.data; // ✅ thành công -> action.fulfilled
      }
      // nếu không có dữ liệu thì ném lỗi
      return rejectWithValue("Không nhận được dữ liệu!"); // ❌ action.rejected
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Lấy thông tin tài khoản thất bại!" // ❌ action.rejected
      );
    }
  }
);

// 4. Slice: gom state + reducers
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Reducer thường (sync)
    setAuth: (
      state,
      action: PayloadAction<{ isAuthenticated: boolean; user: IUser | null }>
    ) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
    },
  },

  // Reducer xử lý async thunk
  extraReducers: (builder) => {
    builder
      // Khi thunk pending: bật loading
      .addCase(fetchAccountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // Khi thunk fulfilled: tắt loading
      .addCase(fetchAccountThunk.fulfilled, (state) => {
        state.loading = false;
      })
      // Khi thunk rejected: tắt loading + lưu error
      .addCase(fetchAccountThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 5. Xuất reducer + action để dùng ngoài component
export const { setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
