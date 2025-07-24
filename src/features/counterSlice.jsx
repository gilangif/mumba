import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  value: 0,
  test: "bvbv",
}

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    rename: (state, action) => {
      state.test = action.payload
    },
    increment: (state) => {
      state.value += 1
    },
    decrement: (state) => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    },
  },
})

export const { rename, increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
