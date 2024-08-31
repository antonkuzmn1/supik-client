import './Field.scss';
import React from "react";

export interface FieldValueStringProps {
    title: string,
    value: string,
}

const FieldValueString: React.FC<FieldValueStringProps> = (props: FieldValueStringProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <p>{props.value}</p>
            </div>
        </div>
    )
}

export default FieldValueString
