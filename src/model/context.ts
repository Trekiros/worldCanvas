import { ReactNode, createContext } from "react"
import { MapModel } from "./map"

export const defaultMap: MapModel = {
    name: "Faerun",
    imageUrl: "http://media.wizards.com/2015/images/dnd/resources/Sword-Coast-Map_LowRes.jpg",
    layers: [
      {
        id: 0,
        name: "Towns",
        visible: true,
        iconUrl: "https://cdn.pixabay.com/photo/2019/09/12/13/40/house-4471626_960_720.png",
        color: '#fff1',
        markers: [
            {
                id: 0,
                name: 'Everlund',
                description: 'A nice little town.',
                x: 50, y: 40,
            },
        ],
        paths: [],
        areas: [],
      },
      {
        id: 1,
        name: "Cities",
        visible: true,
        iconUrl: "https://cdn.pixabay.com/photo/2019/09/12/13/40/house-4471626_960_720.png",
        color: '#fff1',
        markers: [
            {
                id: 0,
                name: 'Waterdeep',
                description: 'The city of splendor!',
                x: 50, y: 50,
            },
        ],
        paths: [],
        areas: [],
      },
    ],
  }

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
