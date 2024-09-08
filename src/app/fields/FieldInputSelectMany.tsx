import './Field.scss';
import React, {useEffect, useState} from "react";
import classNames from "classnames";

export interface FieldInputSelectOneProps {
    title: string,
    value: number[],
    setValue: (value: number[]) => void,
    variants: { value: number, text: string }[],
}

const FieldInputSelectOne: React.FC<FieldInputSelectOneProps> = (props: FieldInputSelectOneProps) => {
    const [dropdownActive, setDropdownActive] = useState<boolean>(false);

    const handle = (value: number) => {
        let values = props.value;
        const exists = values.includes(value);
        if (exists) {
            values = values.filter((item) => item !== value);
        } else {
            values.push(value);
        }
        props.setValue(values);
    };

    useEffect(() => {
        // noinspection SuspiciousTypeOfGuard
        if (typeof props.value === 'string') {
            // @ts-ignore
            props.setValue(props.value.split(',').map(Number));
        }
    })

    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <button
                    onClick={() => {
                        setDropdownActive(!dropdownActive)
                    }}
                    children={`Select (${props.value ? props.value.length : 0} values)`}
                />
                {dropdownActive && (
                    <div className={'dropdown'}>
                        {props.variants.map((variant, index) => (
                            <button
                                key={index}
                                className={classNames({
                                    'active': props.value.includes(variant.value),
                                })}
                                onClick={() => handle(variant.value)}
                            >
                                {variant.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FieldInputSelectOne;
