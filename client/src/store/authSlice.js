import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../api.js";

const STORAGE_KEY = "assignment4ProjectAuth";

function loadSavedAuth() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAuth(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export const login = createAsyncThunk("auth/login", (credentials) =>
  apiRequest("/users/login", {
    method: "POST",
    body: credentials,
  })
);

export const signup = createAsyncThunk("auth/signup", (payload) =>
  apiRequest("/users/signup", {
    method: "POST",
    body: payload,
  })
);

const savedAuth = loadSavedAuth();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedAuth.user || null,
    token: savedAuth.token || null,
    status: "idle",
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      clearAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        saveAuth(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(signup.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        saveAuth(action.payload);
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
