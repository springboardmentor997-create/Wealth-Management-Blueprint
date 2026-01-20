import React from 'react'

export default function Card({ children, className = '', title, action }) {
    return (
        <div className={`glass-card p-6 ${className} transition-all hover:shadow-md`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-4">
                    {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
                    {action && <div>{action}</div>}
                </div>
            )}
            {children}
        </div>
    )
}
