import './Field.scss';
import React from "react";
import classNames from "classnames";

export interface FieldInputBooleanProps {
    title: string,
    value: boolean,
    setTrue: () => void,
    setFalse: () => void,
    invert?: boolean,
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
                    children={props.invert ? 'False' : 'True'}
                />
                <button
                    className={classNames({
                        'active': !props.value,
                    })}
                    onClick={props.setFalse}
                    children={props.invert ? 'True' : 'False'}
                />
            </div>
        </div>
    );
}

export default FieldInputBoolean;
