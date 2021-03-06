import {
  CLOSE_FULL_SCREEN_HINT,
  DISABLE_DARK_THEME,
  ENABLE_DARK_THEME,
  SHOW_FULL_SCREEN_HINT
} from './action-types'

import { createReducer } from '../../shared/redux'

const initialState = {
  darkTheme: false,
  fullScreenHintOpen: false
}

export default createReducer(initialState, {
  [ENABLE_DARK_THEME]: (state) => ({
    ...state,
    darkTheme: true
  }),
  [DISABLE_DARK_THEME]: (state) => ({
    ...state,
    darkTheme: false
  }),

  [SHOW_FULL_SCREEN_HINT]: (state) => ({
    ...state,
    fullScreenHintOpen: true
  }),
  [CLOSE_FULL_SCREEN_HINT]: (state) => ({
    ...state,
    fullScreenHintOpen: false
  })
})
