"use client"

import * as React from "react"

interface ModalContextType {
  isModalOpen: boolean
  setModalOpen: (open: boolean) => void
}

const ModalContext = React.createContext<ModalContextType>({
  isModalOpen: false,
  setModalOpen: () => {},
})

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setModalOpen] = React.useState(false)

  return (
    <ModalContext.Provider value={{ isModalOpen, setModalOpen }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModalContext() {
  return React.useContext(ModalContext)
}


