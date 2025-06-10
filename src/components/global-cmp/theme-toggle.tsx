'use client'
import { useTheme } from 'next-themes'
import React  from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'


const ThemeToggle = () => {
    const { theme, setTheme } = useTheme()
    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
        } else {
            setTheme('light')
        }
    }
    
  return (
    <>
    <button onClick={toggleTheme}>
    {theme === 'light' ? <FiSun/> : <FiMoon className='theme-btn-moon' />}
    </button>
    </>
  )
}

export default ThemeToggle