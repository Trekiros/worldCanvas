import { ReactNode, createContext } from "react"
import { MapModel } from "./map"

export const defaultMap: MapModel = {
    name: "Faerun",
    imageUrl: "http://media.wizards.com/2015/images/dnd/resources/Sword-Coast-Map_LowRes.jpg",
    layers: [
      {
        id: 0,
        name: "Towns",
        iconUrl: "https://cdn.pixabay.com/photo/2019/09/12/13/40/house-4471626_960_720.png",
        areas: [],
      },
    ],
    points: [
      {
        id: 0,
        name: 'Waterdeep',
        description: 'The city of splendor!',
        x: 50,
        y: 50,
        layerIds: [0],
      },
    ],
  }

export const MapContext = createContext({map: defaultMap, setMap: (newValue: MapModel) => {}})

export type PopinDescription = {
    id: number,
    x: number,
    y: number, 
    content: ReactNode,
} | null
export const PopinContext = createContext({popin: null as PopinDescription, setPopin: (newValue: PopinDescription) => {}})