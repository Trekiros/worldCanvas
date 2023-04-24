import { FC, MouseEvent, useContext, useState } from "react"
import styles from './sidebar.module.scss'
import { MapContext } from "@/model/context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight, faCog, faEye, faEyeSlash, faGripVertical } from "@fortawesome/free-solid-svg-icons"
import { LayerModel, MapModel, getLayer } from "@/model/map"
import LayerForm from "./layerForm"
import DragDropList from "./dragDropList"
import { userAgent } from "next/server"

type PropType = {
    activeLayer: number,
    setActiveLayer: (newValue: number) => void,
}

const Sidebar: FC<PropType> = ({ activeLayer, setActiveLayer }) => {
    const {map, setMap} = useContext(MapContext)
    const [visible, setVisible] = useState(true)
    const [editing, setEditing] = useState<null | LayerModel>()
    const [creating, setCreating] = useState(false)

    function editLayer(e: MouseEvent, layer: LayerModel) {
        e.stopPropagation()
        setEditing(layer)
    }

    function toggleVisibility(layerId: number) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(mapClone, layerId)
        if (!layer) return

        layer.visible = !layer.visible
        setMap(mapClone)
    }

    function onLayerUpdated(newValue: LayerModel) {
        if (!editing) return

        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(mapClone, editing.id)

        if (!layer) return

        layer.name = newValue.name
        layer.imageUrl = newValue.imageUrl
        layer.color = newValue.color
        layer.iconUrl = newValue.iconUrl
        layer.minZoom = newValue.minZoom
        layer.maxZoom = newValue.maxZoom
        layer.visible = newValue.visible
        layer.playerPermissions = newValue.playerPermissions

        setMap(mapClone)
        setEditing(null)
    }

    function onLayerdeleted() {
        if (!editing) return
        const layerId = editing.id

        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        
        const layerIndex = mapClone.layers.findIndex(layer => (layer.id === layerId))
        if (layerIndex === -1) return

        mapClone.layers.splice(layerIndex, 1)

        setMap(mapClone)
        setEditing(null)
    }

    function onReorder(layers: LayerModel[]) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        mapClone.layers = layers
        setMap(mapClone)
    }

    function toggleSidebar() {
        const vis = visible
        setVisible(!vis)
        
        // On mobile, toggle full screen when sidebar is hidden
        if (!navigator || !document) return
        if (!/Android|iPhone/i.test(navigator.userAgent)) return

        if(vis) {
            const docEl = document.documentElement
            docEl.requestFullscreen({ navigationUI: 'hide' })
        } else {
            document.exitFullscreen()
        }
    }

    return (
        <div className={`${styles.sidebar} ${visible ? styles.visible : styles.hidden}`}>
            <button className={styles.collapse} onClick={() => setVisible(!visible)}>
                <FontAwesomeIcon icon={visible ? faChevronLeft : faChevronRight} />
            </button>

            <div className={styles.title}>World Canvas</div>

            <div className={styles.layersContainer}>
                <div className={styles.layers}>
                    <DragDropList
                        items={map.layers}
                        onReorder={onReorder}
                        idGetter={layer => String(layer.id)}
                        itemRender={layer => (
                            <div className={styles.layerContainer} key={layer.id} style={{backgroundColor: layer.color}} draggable={true}>
                                <div className={styles.layer}>
                                    <div className={styles.dragHandle}>
                                        <FontAwesomeIcon icon={faGripVertical} />
                                    </div>
                                    <button onClick={() => setActiveLayer(layer.id)} className={styles.layerLabel}>
                                        {layer.name}
                                    </button>
                                    <button onClick={() => toggleVisibility(layer.id)} className={styles.toggleVisibility}>
                                        <FontAwesomeIcon icon={layer.visible ? faEye : faEyeSlash} />
                                    </button>
                                    <button className={styles.layerSettings} onClick={(e) => editLayer(e, layer)}>
                                        <FontAwesomeIcon icon={faCog} />
                                    </button>
                                </div>
                            </div>
                        ) }
                    />
                </div>
                <button className={styles.addLayer}>+</button>
            </div>

            { !editing ? null : (
                <LayerForm onCancel={() => setEditing(null)} onSubmit={onLayerUpdated} onDelete={onLayerdeleted} initialValue={editing} />
            )}
        </div>
    )
}

export default Sidebar