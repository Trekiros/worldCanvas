export type MapModel = {
    name: string,
    imageUrl: string,
    layers: LayerModel[],
}

export type LayerModel = {
    id: number,
    name: string,

    // Properties
    imageUrl?: string, // Does the layer include a map variant?

    // Permissions
    visible?: boolean,
    playerPermissions?: 'see' | 'edit',

    // Min/Max zoom after which elements on this layer become visible.
    minZoom?: number,
    maxZoom?: number,

    // Defaults for all markers/areas of this layer
    iconUrl: string,
    color: string,
    
    markers: MarkerModel[],
    paths: PathModel[],
    areas: AreaModel[],
}

export type MarkerModel = {
    id: number,
    name: string,
    description: string,
    x: number, y: number,
    iconUrl?: string, // Default: layer.iconUrl
}

export type PathModel = {
    id: number,
    layerId: number,
    name: string,
    points: {x: number, y: number}[],
    color?: string, // Default: layer.color
}

export type AreaModel = {
    id: number,
    layerId: number,
    name: string,
    points: {x: number, y: number}[],
    color?: string, // Default: layer.color
}

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