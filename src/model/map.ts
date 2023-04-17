import { Color } from "./utils"

export type MapModel = {
    name: string,
    imageUrl: string,
    layers: Layer[]
    points: MarkerModel[],
}

export type Layer = {
    id: number,
    name: string,
    iconUrl: string,
    areas: Area[],
}

export type Area = {
    name: string,
    color: Color,
    points: MarkerModel[],
}

export type MarkerModel = {
    id: number,
    name: string,
    description: string,
    x: number, 
    y: number,
    layerIds: number[],
}
