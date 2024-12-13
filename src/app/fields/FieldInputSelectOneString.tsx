import './Field.scss';
import React from "react";

export interface FieldInputSelectOneProps {
    title: string,
    value: string,
    setValue: (value: string) => void,
    variants: { value: string, text: string }[],
    nullable?: boolean,
}

const FieldInputSelectOneString: React.FC<FieldInputSelectOneProps> = (props: FieldInputSelectOneProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <select
                    value={props.value}
                    onChange={(e) => props.setValue(e.target.value)}
                >
                    {props.nullable && <option
                        value={0}
                        children={'NULL'}
                    />}
                    {props.variants.map((variant, i) => (
                        <option
                            key={i}
                            value={variant.value}
                        >
                            [ID:{variant.value}] {variant.text}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default FieldInputSelectOneString;
