import { FC, useState } from "react"
import { LayerModel } from "@/model/map"
import styles from './layerForm.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import Slider from 'rc-slider'

type PropType = {
    onSubmit: (newValue: LayerModel) => void,
    onCancel: () => void,
    onDelete?: () => void,
    initialValue?: LayerModel,
}

const defaultValue: LayerModel = {
    id: Date.now(),
    name: '',
    color: '#fff',
    iconUrl: '',
    markers: [],
    paths: [],
    areas: [],
}

const LayerForm: FC<PropType> = ({ onSubmit, onDelete, onCancel, initialValue}) => {
    const [layer, setLayer] = useState<LayerModel>(initialValue || {...defaultValue, id: Date.now()})

    function validate() {
        return layer.name && layer.iconUrl && layer.color
    }

    function submit() {
        if (!validate()) return

        onSubmit(layer)
    }

    function update(callback: (layerClone: LayerModel) => void) {
        const layerClone: LayerModel = JSON.parse(JSON.stringify(layer))
        callback(layerClone)
        setLayer(layerClone)
    }

    function onVisibilityRangeUpdated(newValue: [number, number]) {
        const [minZoom, maxZoom] = newValue
        setLayer({
            ...layer,
            minZoom,
            maxZoom,
        })
    }

    /*
        layer.name = newValue.name
        layer.fogOfWar = newValue.fogOfWar
        layer.imageUrl = newValue.imageUrl
        layer.color = newValue.color
        layer.iconUrl = newValue.iconUrl
        layer.minZoom = newValue.minZoom
        layer.maxZoom = newValue.maxZoom
        layer.visible = newValue.visible
        layer.playerPermissions = newValue.playerPermissions
    */

    return (
        <div className={styles.modalOverlay} onMouseDown={onCancel}>
            <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
                <input 
                    className={styles.layerName}
                    type='text' 
                    placeholder="Layer name" 
                    value={layer.name} 
                    onChange={(e) => update((p) => { p.name = e.target.value })} 
                    onSubmit={submit}
                />

                <div className={styles.visibilityRange}>
                    <label htmlFor="visibilityRange">Zoom: visible from {layer.minZoom || 20}% to {layer.maxZoom || 800}%</label>
                    <Slider 
                        range 
                        allowCross={false} 
                        step={20} 
                        min={20} 
                        max={800} 
                        defaultValue={[20, 800]}
                        value={(layer.minZoom && layer.maxZoom) ? [layer.minZoom, layer.maxZoom] : undefined}
                        draggableTrack 
                        onChange={onVisibilityRangeUpdated as any}
                        marks={{100: '100%', 200: '200%', 300: '300%', 400: '400%', 500: '500%', 600: '600%', 700: '700%', 800: '800%'}}
                        ariaLabelForHandle={(layer.minZoom && layer.maxZoom) ? [`${layer.minZoom}%`, `${layer.maxZoom}%`] : undefined}
                    />
                </div>

                <div className={styles.buttons}>
                    <button onClick={submit} disabled={!validate()}>
                        <FontAwesomeIcon icon={faCheck} />
                        OK
                    </button>
                    { onDelete ? <button onClick={onDelete}>
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                    </button> : null }
                </div>
            </div>
        </div>
    )
}

export default LayerForm