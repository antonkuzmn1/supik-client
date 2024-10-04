import './Page.scss';
import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {setAppTitle} from "../../slices/appSlice.ts";
import {useLocation} from "react-router-dom";
import {ChangelogCardInterface, changelogCards} from "../../utils/changelogCards.ts";

const PageDepartments: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    const [timeTotal, setTimeTotal] = useState<string>('');

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('changelogTitle'));
    }, [location.search]);

    useEffect(() => {
        const timeArray: string[] = changelogCards.map((card: ChangelogCardInterface) => {
            return card.time
        })
        const hoursArray: number[] = timeArray.map((time: string) => {
            return Number(time.split(':')[0])
        })
        const minutesArray: number[] = timeArray.map((time: string) => {
            return Number(time.split(':')[1])
        })
        const hoursTotal: number = hoursArray.reduce((acc: number, curr: number) => acc + curr, 0);
        const minutesTotal: number = minutesArray.reduce((acc: number, curr: number) => acc + curr, 0);
        const hoursResult = hoursTotal + Math.floor(minutesTotal / 60);
        const minutesResult = minutesTotal % 60;
        setTimeTotal(`${hoursResult}:${minutesResult}`);
    }, []);

    return (
        <>
            <p>Времени затрачено итого: {timeTotal}</p>
            <div className={'changelog'}>
                {changelogCards.map((card: ChangelogCardInterface, index: number) => {
                    return (
                        <div className={'card'} key={index}>
                            <h3>{card.version}</h3>
                            <p>Времени затрачено: {card.time}</p>
                            <ul>
                                {card.changes.map((change: string, index: number) => {
                                    return (
                                        <li key={index}>{change}</li>
                                    )
                                })}
                            </ul>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default PageDepartments
