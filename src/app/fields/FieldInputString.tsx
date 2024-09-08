import './Field.scss';
import React from "react";

export interface FieldInputStringProps {
    title: string,
    placeholder: string,
    password?: boolean,
    value: string,
    onChange: (e: any) => void,
}

const FieldInputString: React.FC<FieldInputStringProps> = (props: FieldInputStringProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <input
                    type={props.password ? 'password' : 'text'}
                    placeholder={props.placeholder}
                    value={props.value || ''}
                    onChange={props.onChange}
                />
            </div>
        </div>
    )
}

export default FieldInputString
