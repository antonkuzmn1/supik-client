import './Page.scss';
import React, {useEffect} from "react";
import {useDispatch} from "react-redux";
import {setAppTitle} from "../../slices/appSlice.ts";
import {useLocation} from "react-router-dom";

interface CardInterface {
    version: string,
    time: string,
    changes: string[],
}

const cards: CardInterface[] = [
    {
        version: '24.11',
        time: '00:30',
        changes: [
            'Добавлена страница Changelog',
        ],
    },
    {
        version: '24.10.10',
        time: '00:15',
        changes: [
            'Добавлена возможность указать префикс в Routers для создания VPN аккаунтов',
        ],
    },
    {
        version: '24.10.9',
        time: '00:30',
        changes: [
            'Для Users добавлены поля Local Workplace и Cellular',
        ],
    },
    {
        version: '24.10.8',
        time: '00:20',
        changes: [
            'Добавлено автозаполнение полей для VPN',
        ],
    },
    {
        version: '24.10.7',
        time: '00:30',
        changes: [
            'Добавлено поле Default Profile для Routers и убрано поле Profile для VPNs',
        ],
    },
    {
        version: '24.10.6',
        time: '00:05',
        changes: [
            'Исправлена ошибка генерации PDF файла с пустым полями EMails',
        ],
    },
    {
        version: '24.10.5',
        time: '00:05',
        changes: [
            'Убран VID из таблицы VPNs',
        ],
    },
    {
        version: '24.10.4',
        time: '00:05',
        changes: [
            'Убран service из карточки и таблицы VPNs',
        ],
    },
    {
        version: '24.10.3',
        time: '00:05',
        changes: [
            'Экспортируемый файл теперь будет называться ФИО',
        ],
    },
    {
        version: '24.10.2',
        time: '00:05',
        changes: [
            'В Users поле Title переименовано в Post',
        ],
    },
    {
        version: '24.10.1',
        time: '00:10',
        changes: [
            'В выпадающих списках с пользователями добавил сортировку по ФИО',
        ],
    },
    {
        version: '24.10',
        time: '02:00',
        changes: [
            'Добавлено формирование PDF файла для Users',
        ],
    },
    {
        version: '24.9.10',
        time: '00:10',
        changes: [
            'Добавлены поля "workplace" и "phone" для Users',
        ],
    },
    {
        version: '24.9.9',
        time: '00:30',
        changes: [
            'Добавлена запись паролей от почтовых ящиков',
        ],
    },
    {
        version: '24.9.8',
        time: '00:05',
        changes: [
            'Добавлен форматтер для дат',
        ],
    },
    {
        version: '24.9.7',
        time: '00:05',
        changes: [
            'Добавлен скролл в диалог',
        ],
    },
    {
        version: '24.9.6',
        time: '00:10',
        changes: [
            'Добавлены поля External addr и L2TP Key в диалог VPNs',
        ],
    },
    {
        version: '24.9.5',
        time: '00:05',
        changes: [
            'Добавлен генератор паролей в диалог VPNs',
        ],
    },
    {
        version: '24.9.4',
        time: '00:05',
        changes: [
            'Исправлена очистка пароля при создании нового почтового ящика',
        ],
    },
    {
        version: '24.9.3',
        time: '00:15',
        changes: [
            'Добавлено автоподстановление данных User в Mails',
        ],
    },
    {
        version: '24.9.2',
        time: '00:05',
        changes: [
            'Убрано поле Gender для Mails',
        ],
    },
    {
        version: '24.9.1',
        time: '00:05',
        changes: [
            'Скрыт пароль для Users',
        ],
    },
    {
        version: '24.9',
        time: '07:00',
        changes: [
            'Добавлена страница Mails',
        ],
    },
    {
        version: '24.8',
        time: '01:00',
        changes: [
            'Добавлен генератор паролей',
        ],
    },
    {
        version: '24.7.1',
        time: '00:30',
        changes: [
            'Исправлены ошибки логики Departments',
        ],
    },
    {
        version: '24.7',
        time: '02:00',
        changes: [
            'Добавлен новый раздел Departments',
        ],
    },
    {
        version: '24.6.1',
        time: '00:30',
        changes: [
            'Исправлена ошибка отображения диалоговых окно на странице Routers',
        ],
    },
    {
        version: '24.6',
        time: '01:00',
        changes: [
            'Добавлено автоматическое отключение всех VPN аккаунтов пользователя при отключении пользователя',
        ],
    },
    {
        version: '24.5.1',
        time: '00:30',
        changes: [
            'Исправлена ошибка логики проверки на дубликаты IP для VPN',
        ],
    },
    {
        version: '24.5',
        time: '00:20',
        changes: [
            'Добавлена возможность менять положение диалоговых окон',
        ],
    },
    {
        version: '24.4.1',
        time: '00:30',
        changes: [
            'Исправлена ошибка с отображением доступных адресов',
        ],
    },
    {
        version: '24.4',
        time: '02:00',
        changes: [
            'Добавлена проверка на дубликаты IP для VPN',
        ],
    },
    {
        version: '24.3',
        time: '01:00',
        changes: [
            'Добавлен выпадающий список с доступными IP-адресами для VPN',
        ],
    },
    {
        version: '24.2.1',
        time: '00:20',
        changes: [
            'Исправлена ошибка при нажатии на кнопку "Показать пароль" в авторизации',
        ],
    },
    {
        version: '24.2',
        time: '00:30',
        changes: [
            'Добавлена возможность показать пароль',
        ],
    },
    {
        version: '24.1.2',
        time: '01:00',
        changes: [
            'Добавлена выгрузка профилей с подстановкой выпадающим списком',
        ],
    },
    {
        version: '24.1.1',
        time: '00:10',
        changes: [
            'Исправлен фильтр по дате создания',
        ],
    },
    {
        version: '24.1',
        time: '52:00',
        changes: [
            'Релиз',
        ],
    },
]

const PageDepartments: React.FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    /// HOOKS

    useEffect(() => {
        dispatch(setAppTitle('Changelog'));
    }, [location.search]);

    return (
        <>
            <div className={'changelog'}>
                {cards.map((card: CardInterface, index: number) => {
                    return (
                        <div className={'card'} key={index}>
                            <h1>{card.version}</h1>
                            <h3>Времени затрачено: {card.time}</h3>
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