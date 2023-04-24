import { MapModel } from "@/model/map"
import { FC, useState } from "react"
import domtoimage from 'dom-to-image'
import { CircleLoader } from "react-spinners"
import styles from './saveMapMenu.module.scss'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFile, faImage } from "@fortawesome/free-solid-svg-icons"

type PropType = {
    map: MapModel,
}

const SaveMapMenu:FC<PropType> = ({ map }) => {
    const [spinner, setSpinner] = useState(false)

    async function exportImage() {
        const mapElem = document.getElementById('map')
        if (!mapElem) return
        
        setSpinner(true)
        const imgString = await domtoimage.toPng(mapElem)

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imgString
        img.onload = () => {
            // create Canvas
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')!
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            // create a tag
            const a = document.createElement('a')
            a.download = `${map.name}.png`
            a.href = canvas.toDataURL('image/png')
            a.click()
            setSpinner(false)
        }
    }

    function save() {
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

    return (
        <div className={styles.saveMapMenu}>
            <button onClick={exportImage}>
                <FontAwesomeIcon icon={faImage} />
                Export Map as Image
            </button>
            <button onClick={save}>
                <FontAwesomeIcon icon={faFile} />
                Save Map File
            </button>
            { !spinner ? null : (
                <div className={styles.spinner}>
                    <CircleLoader 
                            color='#fff'
                            loading={spinner}
                            size={100}
                    />
                </div>
            )}
        </div>
    )
}

export default SaveMapMenu