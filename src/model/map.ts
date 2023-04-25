import { z } from "zod";

const Color = z.string().min(4).max(9).startsWith('#')
const URL = z.string().max(256).endsWith('.png')
    .or(z.string().max(256).endsWith('.jpg'))
    .or(z.string().max(256).endsWith('svg'))
    .or(z.string().max(256).endsWith('.webp'))
const Point = z.object({
    x: z.number(),
    y: z.number(),
})

const Marker = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    x: z.number(), 
    y: z.number(),
    iconUrl: z.string().url().optional(), // Default: layer.iconUrl
})

const Path = z.object({
    id: z.number(),
    name: z.string().max(128),
    description: z.string(),
    strokeWidth: z.number().min(1).max(10),
    strokeType: z.enum(['solid', 'dashed', 'dotted']),
    points: z.array(Point),
    color: Color.optional(), // Default: layer.color
})

const Area = z.object({
    id: z.number(),
    name: z.string(),
    points: z.array(Point),
    color: Color.optional(), // Default: layer.color
})

const Layer = z.object({
    id: z.number(),
    name: z.string().max(128),

    // Properties
    imageUrl: URL.optional(), // Does the layer include a map variant?

    // Permissions
    visible: z.boolean().optional(),
    playerPermissions: z.enum(['see', 'edit']).optional(),

    // Min/Max zoom after which elements on this layer become visible.
    minZoom: z.number().optional(),
    maxZoom: z.number().optional(),

    // Defaults for all markers/areas of this layer
    iconUrl: URL,
    color: Color,
    
    markers: z.array(Marker),
    paths: z.array(Path),
    areas: z.array(Area),    
})

const Map = z.object({
    id: z.number(),
    name: z.string().max(128),
    imageUrl: URL,
    layers: z.array(Layer),
})


export type MapModel = z.infer<typeof Map>
export type LayerModel = z.infer<typeof Layer>
export type MarkerModel = z.infer<typeof Marker>
export type PathModel = z.infer<typeof Path>
export type AreaModel = z.infer<typeof Area>

export function getLayer(map: MapModel, layerId: number) {
    return map.layers.find(layer => (layer.id === layerId))
}

export function getMarker(map: MapModel, layerId: number, markerId: number) {
    return (getLayer(map, layerId)?.markers || []).find(marker => (marker.id === markerId))
}

export function getPath(map: MapModel, layerId: number, pathId: number) {
    return (getLayer(map, layerId)?.paths || []).find(path => (path.id === pathId))
}

export function getArea(map: MapModel, layerId: number, areaId: number) {
    return (getLayer(map, layerId)?.areas || []).find(area => (area.id === areaId))
}

export function validateMap(obj: any): obj is MapModel {
    try {
        Map.parse(obj)
        return true
    } catch (e) {
        console.error(e)
        return false
    }
}