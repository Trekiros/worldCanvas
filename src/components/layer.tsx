import { AreaModel, LayerModel, MapModel, MarkerModel, PathModel, getMarker } from "@/model/map"
import { FC, useContext, useEffect, useState } from "react"
import Marker from "./marker"
import styles from './layer.module.scss'
import { PopinContext } from "@/model/context"
import Path from "./path"
import Area from "./area"
import Hideable from "./hideable"

type PropType = {
    layer: LayerModel,
    currentZoom: number,
    onUpdate: (newValue: LayerModel) => void,
}

function isVisible(layer: LayerModel, currentZoom: number) {
    if (!layer.visible) return false
    if (!layer.minZoom || !layer.maxZoom) return true

    return (layer.minZoom <= currentZoom) && (layer.maxZoom >= currentZoom)
}

export const LayerImage: FC<Omit<PropType, 'onUpdate'>> = ({ layer, currentZoom }) => {
    return (
        <Hideable visible={isVisible(layer, currentZoom)}>
            { !layer.imageUrl ? null : (
                <img src={layer.imageUrl} className={styles.imageOverlay} />
            )}
        </Hideable>
    )
}

export const LayerMarkers: FC<PropType> = ({ layer, currentZoom, onUpdate }) => {
    const {setPopin, calculateMapCoords} = useContext(PopinContext)

    function onMarkerUpdated(newValue: MarkerModel) {
        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))
        
        const marker = layerClone.markers.find(m => (m.id === newValue.id))
        if (!marker) return

        marker.name = newValue.name
        marker.description = newValue.description
        marker.iconUrl = newValue.iconUrl
        marker.x = newValue.x
        marker.y = newValue.y

        onUpdate(layerClone)
        setPopin(null)
    }

    function onMarkerMoved(markerId: number, clientX: number, clientY: number) {        
        const {x, y} = calculateMapCoords(clientX, clientY)
        if (!x || !y) return

        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))
        const marker = layerClone.markers.find(m => (m.id === markerId))
        if (!marker) return

        marker.x = x
        marker.y = y

        onUpdate(layerClone)
    }

    function deleteMarker(markerId: number) {
        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))
        const markerIndex = layerClone.markers.findIndex(m => (m.id === markerId))
        if (markerIndex === -1) return
        
        layerClone.markers.splice(markerIndex, 1)

        onUpdate(layerClone)
        setPopin(null)
    }

    return (
        <Hideable visible={isVisible(layer, currentZoom)}>
            { layer.markers.map((marker) => (
                <Marker
                    key={marker.id}
                    layer={layer}
                    marker={marker}
                    onMarkerUpdated={(newValue) => onMarkerUpdated(newValue)}
                    onMarkerMoved={(x, y) => onMarkerMoved(marker.id, x, y)}
                    onMarkerDeleted={() => deleteMarker(marker.id)}
                />
            )) }
        </Hideable>
    )
}

export const LayerPaths: FC<PropType> = ({ layer, currentZoom, onUpdate }) => {
    function onPathUpdated(newValue: PathModel) {
        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))

        const path = layerClone.paths.find(p => (p.id === newValue.id))
        if (!path) return

        path.name = newValue.name
        path.color = newValue.color
        path.strokeType = newValue.strokeType
        path.strokeWidth = newValue.strokeWidth
        path.points = newValue.points

        onUpdate(layerClone)
    }

    function onPathDeleted(pathIndex: number) {
        if (pathIndex < 0) return
        if (pathIndex >= layer.paths.length) return

        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))
        layerClone.paths.splice(pathIndex, 1)
        onUpdate(layerClone)
    }

    return (
        <Hideable visible={isVisible(layer, currentZoom)}>
            { layer.paths.map((path, index) => (
                <Path
                    key={path.id}
                    layer={layer}
                    path={path}
                    onUpdate={onPathUpdated}
                    onDelete={() => onPathDeleted(index)}
                />
            )) }
        </Hideable>
    )
}

export const LayerAreas: FC<PropType> = ({ layer, currentZoom, onUpdate }) => {    
    function onAreaUpdated(newValue: AreaModel) {
        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))

        const area = layerClone.areas.find(a => (a.id === newValue.id))
        if (!area) return

        area.name = newValue.name
        area.description = newValue.description
        area.color = newValue.color
        area.points = newValue.points

        onUpdate(layerClone)
    }

    function onAreaDeleted(areaIndex: number) {
        if (areaIndex < 0) return
        if (areaIndex >= layer.areas.length) return

        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))
        layerClone.areas.splice(areaIndex, 1)
        onUpdate(layerClone)
    }

    return (
        <Hideable visible={isVisible(layer, currentZoom)}>
            { layer.areas.map((area, index) => (
                <Area
                    key={area.id}
                    layer={layer}
                    area={area}
                    onUpdate={onAreaUpdated}
                    onDelete={() => onAreaDeleted(index)}
                />
            )) }
        </Hideable>
    )
}
