import './Field.scss';
import React from "react";

export interface FieldInputStringProps {
    title: string,
    placeholder: string,
    value: string,
    onChange: (e: any) => void,
    other?: any,
}

const FieldInputString: React.FC<FieldInputStringProps> = (props: FieldInputStringProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <input
                    type={'date'}
                    placeholder={props.placeholder}
                    value={props.value || ''}
                    onChange={props.onChange}
                    {...props.other}
                />
            </div>
        </div>
    )
}

export default FieldInputString
