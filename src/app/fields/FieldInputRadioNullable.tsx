import './Field.scss';
import React from "react";
import classNames from "classnames";

export interface FieldInputRadioNullableProps {
    title: string,
    value: string,
    variants: {
        value: string | undefined,
        text: string,
        set: () => void,
    }[]
}

const FieldInputRadioNullable: React.FC<FieldInputRadioNullableProps> = (props: FieldInputRadioNullableProps) => {
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
                        onClick={variant.set}
                        children={variant.text}
                    />
                ))}
            </div>
        </div>
    );
}

export default FieldInputRadioNullable;
