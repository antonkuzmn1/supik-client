import './Field.scss';
import React from "react";
import classNames from "classnames";

export interface FieldInputRadioProps {
    title: string,
    value: number,
    setValue: (value: number) => void,
    variants: {value: number, text: string}[]
}

const FieldInputRadio: React.FC<FieldInputRadioProps> = (props: FieldInputRadioProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                {props.variants.map((variant, i) => (
                    <button
                        key={i}
                        className={classNames({
                            'active': props.value === variant.value,
                        })}
                        onClick={() => props.setValue(variant.value)}
                        children={variant.text}
                    />
                ))}
            </div>
        </div>
    );
}

export default FieldInputRadio;
