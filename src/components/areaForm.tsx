import { AreaModel, LayerModel } from "@/model/map"
import { FC } from "react"

type PropType = {
    layer: LayerModel,
    onSubmit: (value: AreaModel) => void,
    initialValue?: AreaModel,
}

const AreaForm: FC<PropType> = (({ layer, onSubmit, initialValue }) => {
    return <></>
})

export default AreaForm