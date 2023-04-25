import { ReactNode, createContext } from "react"
import { MapModel } from "./map"

export const defaultMap: MapModel = {
    id: 135479, 
    name: "Faerun",
    imageUrl: "/faerun.jpg",
    layers: [
      {
        id: 4524535,
        name: "Towns",
        visible: true,
        iconUrl: "/icons/house.svg",
        color: '#fff',
        markers: [
            {
                id: 0,
                name: 'Everlund',
                description: 'A nice little town.',
                x: 50, y: 40,
            },
        ],
        paths: [
          {
            id: 665481,
            name: 'The Sword Coast',
            description: 'It is the remembered realms part of the forgotten realms.',
            points: [
              {x: 20, y: 20},
              {x: 40, y: 40},
              {x: 20, y: 60},
            ],
            strokeWidth: 2,
            strokeType: 'dotted',
          }
        ],
        areas: [
          {
            id: 984626,
            name: 'Amn',
            description: 'That one country that people live in I guess?',
            points: [
              {x: 60, y: 20},
              {x: 80, y: 40},
              {x: 60, y: 60},
              {x: 40, y: 40},
            ],
            color: '#f00',
          }
        ],
      },
      {
        id: 45885,
        name: "Cities",
        visible: true,
        iconUrl: "/icons/house.svg",
        color: '#fff',
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
