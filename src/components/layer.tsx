import { AreaModel, LayerModel, MapModel, MarkerModel, PathModel, getMarker } from "@/model/map"
import { FC, useContext, useEffect, useState } from "react"
import Marker from "./marker"
import styles from './layer.module.scss'
import { PopinContext } from "@/model/context"
import Path from "./path"
import Area from "./area"

type PropType = {
    layer: LayerModel,
    currentZoom: number,
    onUpdate: (newValue: LayerModel) => void,
}

const Layer: FC<PropType> = ({ layer, currentZoom, onUpdate }) => {
    const {setPopin, calculateMapCoords} = useContext(PopinContext)
    const [hidden, setHidden] = useState(!layer.visible)

    function isVisible() {
        if (!layer.visible) return false
        if (!layer.minZoom || !layer.maxZoom) return true

        return (layer.minZoom <= currentZoom) && (layer.maxZoom >= currentZoom)
    }

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

    // Unmount if hidden, to save memory
    useEffect(() => {
        if (layer.visible) {
            setHidden(false)
        }

        if (!layer.visible) {
            setTimeout(() => {
                setHidden(true)
            }, 200)
        }
    }, [layer.visible])

    if (hidden) return <></>

    return (
        <div key={layer.id} className={`${styles.layer} ${isVisible() ? styles.visible : styles.hidden}`}>
            { /* MARKERS */}
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

            { /* PATHS */}
            { layer.paths.map((path) => (
                <Path
                    key={path.id}
                    layer={layer}
                    path={path}
                    onUpdate={onPathUpdated}
                />
            )) }
                        
            { /* AREAS */}
            { layer.areas.map((area, index) => (
                <Area
                    key={area.id}
                    layer={layer}
                    area={area}
                    onUpdate={onAreaUpdated}
                    onDelete={() => onAreaDeleted(index)}
                />
            )) }
        </div>
    )
}

export default Layer