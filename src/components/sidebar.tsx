import { FC, MouseEvent, ReactNode, useContext, useEffect, useState } from "react"
import styles from './sidebar.module.scss'
import { MapContext } from "@/model/context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronLeft, faChevronRight, faCog, faEye, faEyeSlash, faFolder, faGripVertical, faPlus, faSave } from "@fortawesome/free-solid-svg-icons"
import { LayerModel, MapModel, getLayer } from "@/model/map"
import LayerForm from "./layerForm"
import DragDropList from "./dragDropList"
import MapForm from './mapForm'
import SaveMapMenu from "./saveMapMenu"
import UploadMenu from "./uploadMenu"

type PropType = {
    activeLayer: number,
    setActiveLayer: (newValue: number) => void,
}

function transparency(hex: string) {
    if (hex.length === 4) return `${hex}2`
    if (hex.length === 7) return `${hex}33`
    return hex
}

const Sidebar: FC<PropType> = ({ activeLayer, setActiveLayer }) => {
    const {map, setMap} = useContext(MapContext)
    const [visible, setVisible] = useState(true)
    const [modal, setModal] = useState<ReactNode | null>(null)

    useEffect(() => {
        if (!map.layers.length) return
        setActiveLayer(map.layers[map.layers.length - 1].id)
    }, [map.id, map.layers.length])

    function editLayer(e: MouseEvent, layer: LayerModel) {
        e.stopPropagation()
        setModal(
            <LayerForm onSubmit={(newValue) => onLayerUpdated(layer, newValue)} onDelete={() => onLayerdeleted(layer)} initialValue={layer} />
        )
    }

    function toggleVisibility(layerId: number) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(mapClone, layerId)
        if (!layer) return

        layer.visible = !layer.visible
        setMap(mapClone)
    }

    function onLayerUpdated(oldValue: LayerModel, newValue: LayerModel) {

        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        const layer = getLayer(mapClone, oldValue.id)

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
        setModal(null)
    }

    function onLayerdeleted(layer: LayerModel) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        
        const layerIndex = mapClone.layers.findIndex(l => (l.id === layer.id))
        if (layerIndex === -1) return

        mapClone.layers.splice(layerIndex, 1)

        setMap(mapClone)
        setModal(null)
    }

    function onReorder(layers: LayerModel[]) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        mapClone.layers = layers
        setMap(mapClone)
    }

    function createLayer() {
        setModal(
            <LayerForm onSubmit={onLayerCreated} />
        )
    }

    function onLayerCreated(layer: LayerModel) {
        const mapClone: MapModel = JSON.parse(JSON.stringify(map))
        mapClone.layers.push(layer)
        setMap(mapClone)
        setModal(false)
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

    function saveMap() {
        // TODO Fixme.
        /*setModal(
            <SaveMapMenu map={map} />
        )*/

        const file = new Blob([JSON.stringify(map)], {type: 'json'})
        const a = document.createElement("a")
        const url = URL.createObjectURL(file)
        a.href = url
        a.download = `${map.name}.json`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)  
        }, 0)
    }

    function openMap() {
        setModal(
            <UploadMenu onUpload={(m) => {
                setMap(m)
                setModal(null)
            }} />
        )
    }

    function editMap() {
        setModal(
            <MapForm onSubmit={updateMap} initialValue={map} />
        )
    }

    function createMap() {
        setModal(
            <MapForm onSubmit={updateMap} />
        )
    }

    function updateMap(newValue: MapModel) {
        setMap(newValue)
        setModal(null)
    }

    return (
        <div className={`${styles.sidebar} ${visible ? styles.visible : styles.hidden}`}>
            <button className={styles.collapse} onClick={toggleSidebar}>
                <FontAwesomeIcon icon={visible ? faChevronLeft : faChevronRight} />
            </button>

            <div className={styles.title}>World Canvas</div>

            <label>Map: {map.name}</label>
            <div className={styles.mapSettings}>
                <button onClick={editMap}>
                    <FontAwesomeIcon icon={faCog} />
                    <label>Settings</label>
                </button>
                <button onClick={saveMap}>
                    <FontAwesomeIcon icon={faSave} />
                    <label>Save</label>
                </button>
                <button onClick={openMap}>
                    <FontAwesomeIcon icon={faFolder} />
                    <label>Open</label>
                </button>
                <button onClick={createMap}>
                    <FontAwesomeIcon icon={faPlus} />
                    <label>New</label>
                </button>
            </div>

            <label>Layers</label>
            <div className={styles.layersContainer}>
                <div className={styles.layers}>
                    <DragDropList
                        items={map.layers}
                        onReorder={onReorder}
                        idGetter={layer => String(layer.id)}
                        itemRender={layer => (
                            <div 
                                className={`${styles.layerContainer} ${(activeLayer === layer.id) ? styles.active : ''}`} 
                                key={layer.id} 
                                style={{backgroundColor: transparency(layer.color)}} 
                             >
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
                <button className={styles.addLayer} onClick={createLayer}>
                    <FontAwesomeIcon icon={faPlus} />
                    Add Layer
                </button>
            </div>

            { !modal ? null : (
                <div className={styles.modalOverlay} onMouseDown={() => setModal(null)}>
                    <div className={styles.modal} onMouseDown={e => e.stopPropagation()}>
                        {modal}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Sidebar