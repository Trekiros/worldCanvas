import { LayerModel, PathModel } from "@/model/map"
import { FC } from "react"

type PropType = {
    layer: LayerModel,
    onSubmit: (value: PathModel) => void,
    initialValue?: PathModel,
}

const PathForm: FC<PropType> = (({ layer, onSubmit, initialValue }) => {
    return <></>
})

export default PathForm