import React from 'react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar included via App */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
