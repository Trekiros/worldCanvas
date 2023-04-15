import { DependencyList, useEffect, useState } from "react"

export function usePersistentState<T>(key: string, defaultState: T) {
    const [state, setState] = useState<T>(defaultState)

    useEffect(() => {
        const savedState = localStorage.getItem(key)
        if (savedState) {
            setState(JSON.parse(savedState))
        }
    }, [])
    
    return [state, (newValue: T) => {
        setState(newValue)
        
        if (localStorage.getItem('useLocalStorage')) {
            localStorage.setItem(key, JSON.stringify(newValue))
        }
    }] as const
}

export function useCalculatedProp<T>(dependencies: DependencyList, calculateProp: () => T|undefined) {
    const [state, setState] = useState(calculateProp())
    useEffect(() => {
        setState(calculateProp())
    }, dependencies)
    return state
}
