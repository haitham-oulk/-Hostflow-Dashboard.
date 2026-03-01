import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    resolved: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'system',
    setTheme: () => { },
    resolved: 'light',
})

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem('hostflow-theme') as Theme | null
        return stored || 'system'
    })

    const [resolved, setResolved] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        const root = document.documentElement

        const apply = (t: 'light' | 'dark') => {
            root.classList.remove('light', 'dark')
            root.classList.add(t)
            setResolved(t)
        }

        if (theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            apply(mq.matches ? 'dark' : 'light')
            const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
            mq.addEventListener('change', handler)
            return () => mq.removeEventListener('change', handler)
        } else {
            apply(theme)
        }
    }, [theme])

    useEffect(() => {
        localStorage.setItem('hostflow-theme', theme)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme, resolved }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
