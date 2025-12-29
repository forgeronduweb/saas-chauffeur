import React from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Composant Breadcrumb pour la navigation
 * @param {Array} items - Tableau d'items [{label, path}]
 * Le dernier item est considéré comme la page actuelle (orange)
 */
const Breadcrumb = ({ items = [] }) => {
  const navigate = useNavigate()

  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 font-medium">
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span className="text-orange-500">{item.label}</span>
            ) : (
              <>
                <button 
                  onClick={() => item.path && navigate(item.path)}
                  className="hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </button>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.784 15.68 11.46 4.13h1.75L8.534 15.68z" fill="#CBD5E1"/>
                </svg>
              </>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Breadcrumb
