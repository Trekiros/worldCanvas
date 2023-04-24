import { MapModel, validateMap } from "@/model/map"
import { ChangeEvent, DragEvent, FC, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFile } from "@fortawesome/free-solid-svg-icons"
import styles from './uploadMenu.module.scss'

type PropType = {
    onUpload: (map: MapModel) => void,
}
  
const UploadBtn:FC<PropType> = ({ onUpload }) => {
    const [error, setError] = useState<string | null>(null)

    function handleClick(e: ChangeEvent<HTMLInputElement>) {
        validate(e.target.files)
    }

    function handleDragNDrop(e: DragEvent<HTMLLabelElement>) {
        e.preventDefault()
        e.stopPropagation()
        validate(e.dataTransfer.files)
    }

    async function validate(files: FileList | null) {
        try {
            if (!files || !files.length) {
                setError('No files uploaded')
                return
            }

            const file = files[0]
            if (!file) {
                setError('No file uploaded')
                return
            }

            const json = await file.text()
            if (!json) return

            const obj = JSON.parse(json)
            
            if (!validateMap(obj)) { 
                setError('Invalid schema')
                return
            }
            
            onUpload(obj)
        } catch (err) {
            setError(String(err))
            return
        }
    }

    return (
        <div className={styles.uploadMenu}>
            <label htmlFor="upload" onDrop={handleDragNDrop}>
                <FontAwesomeIcon icon={faFile} />
                <p>Upload a map file...</p>
                <p>(or drag and drop a file here)</p>
                <input id="upload" type='file' accept="application/json" onChange={handleClick} />
            </label>
            { !error ? null : (
                <div className={styles.error}>
                    {error}
                </div>
            )}
        </div>
    )
}

export default UploadBtn