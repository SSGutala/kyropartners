import { create } from 'zustand'

const useScrollStore = create((set) => ({
  scrollProgress: 0,
  setScrollProgress: (v) => set({ scrollProgress: v }),
}))

export default useScrollStore
