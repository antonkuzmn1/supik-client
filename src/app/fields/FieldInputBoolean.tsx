import './Field.scss';
import React from "react";
import classNames from "classnames";

export interface FieldInputBooleanProps {
    title: string,
    value: boolean,
    setTrue: () => void,
    setFalse: () => void,
}

const FieldInputBoolean: React.FC<FieldInputBooleanProps> = (props: FieldInputBooleanProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <button
                    className={classNames({
                        'active': props.value,
                    })}
                    onClick={props.setTrue}
                    children={'True'}
                />
                <button
                    className={classNames({
                        'active': !props.value,
                    })}
                    onClick={props.setFalse}
                    children={'False'}
                />
            </div>
        </div>
    );
}

export default FieldInputBoolean;
