import { ReactNode, createContext } from "react"
import { MapModel } from "./map"
import defaultMap from "./defaultMap"

export const MapContext = createContext({map: defaultMap, setMap: (newValue: MapModel) => {}})

export type PopinDescription = {
    id: number,
    x: number,
    y: number, 
    content: ReactNode,
    yOffset?: boolean,
} | null
export const PopinContext = createContext({
  popin: null as PopinDescription, 
  setPopin: (newValue: PopinDescription) => {}, 
  calculateMapCoords: (clientX: number, clientY: number) => ({x: 0, y: 0}),
})
