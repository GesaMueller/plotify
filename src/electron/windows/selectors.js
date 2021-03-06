import { createSelector } from 'reselect'

export const getWindowEntities = createSelector(
  (state) => state.windows,
  (windows) => Object.values(windows)
)

export const getWindows = (state) =>
  Object.values(state.windows)
    .map((window) => window.instance)

export const getNumberOfWindows = (state) =>
  Object.keys(state.windows).length

export const getWindowStoryPath = (state, id) =>
  state.windows[id].storyPath

export const isWindowReady = (state, id) =>
  state.windows[id].ready === true

export const isAnyWindowReady = (state) =>
  Object.values(state.windows)
    .find((window) => window.ready === true) !== undefined

export const isWindowFocused = (state, id) =>
  state.windows[id].focused === true

export const isAnyWindowFocused = (state) =>
  getFocusedWindow(state) !== undefined

export const getFocusedWindow = (state) => {
  const window = Object.values(state.windows)
    .find((window) => window.focused === true)
  return window ? window.instance : undefined
}

export const getWindowByStoryPath = (state, storyPath) => {
  const id = Object.keys(state.windows).find((id) => state.windows[id].storyPath === storyPath)
  return id ? state.windows[id].instance : undefined
}
