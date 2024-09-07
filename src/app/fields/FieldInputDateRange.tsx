import './Field.scss';
import React from "react";

export interface FieldInputBooleanNullableProps {
    title: string,
    valueGte: string,
    valueLte: string,
    setGte: (e: any) => void,
    setLte: (e: any) => void,
}

const FieldInputBooleanNullable: React.FC<FieldInputBooleanNullableProps> = (props: FieldInputBooleanNullableProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <input
                    className='border-right'
                    type={'datetime-local'}
                    value={props.valueGte || ''}
                    onChange={props.setGte}
                />
                <input
                    type={'datetime-local'}
                    value={props.valueLte || ''}
                    onChange={props.setLte}
                />
            </div>
        </div>
    );
}

export default FieldInputBooleanNullable;
