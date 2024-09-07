import './Field.scss';
import React from "react";
import classNames from "classnames";

export interface FieldInputBooleanNullableProps {
    title: string,
    value: string,
    setNull: () => void,
    setTrue: () => void,
    setFalse: () => void,
}

const FieldInputBooleanNullable: React.FC<FieldInputBooleanNullableProps> = (props: FieldInputBooleanNullableProps) => {
    return (
        <div className='Field'>
            <div className='title'>
                <p>{props.title}</p>
            </div>
            <div className='field'>
                <button
                    className={classNames({
                        'active': !props.value,
                    })}
                    onClick={props.setNull}
                    children={'All'}
                />
                <button
                    className={classNames({
                        'active': props.value === 'true',
                    })}
                    onClick={props.setTrue}
                    children={'True'}
                />
                <button
                    className={classNames({
                        'active': props.value === 'false',
                    })}
                    onClick={props.setFalse}
                    children={'False'}
                />
            </div>
        </div>
    );
}

export default FieldInputBooleanNullable;
