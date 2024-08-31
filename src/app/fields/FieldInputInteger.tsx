import './Field.scss';
import React from "react";

export interface FieldInputIntegerProps {
    title: string,
    value: number,
    onChange: (e: any) => void,
    max: number,
    min: number,
    step: number,
}

const FieldInputString: React.FC<FieldInputIntegerProps> = (props: FieldInputIntegerProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <input
                    type={'number'}
                    value={props.value}
                    onChange={props.onChange}
                    max={props.max}
                    min={props.min}
                    step={props.step}
                />
            </div>
        </div>
    )
}

export default FieldInputString
