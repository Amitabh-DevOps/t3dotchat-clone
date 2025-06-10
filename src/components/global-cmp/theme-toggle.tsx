'use client'
import React, { useState } from 'react'

const ThemeToggle = () => {
    const [theme, setTheme] = useState('light')

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
        } else {
            setTheme('light')
        }
    }
    
  return (
    <>
    <button onClick={() => setTheme('light')}>Light Mode</button>
    <button onClick={() => setTheme('dark')}>Dark Mode</button>
    </>
  )
}

export default ThemeToggle