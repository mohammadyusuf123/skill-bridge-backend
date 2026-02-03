'use client'

import { Provider } from 'redux-js'
import { store } from './store'
import { ReactNode } from 'react'

export function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
