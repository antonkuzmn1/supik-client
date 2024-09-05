export const getInitialsFromFullname = (fullname: string) => {
    try {
        const trim = fullname.trim();
        const split = trim.split(' ');
        const surname = split[0];
        const name = split[1];
        const patronymic = split[2];
        const nameChar = name.charAt(0);
        const patronymicChar = patronymic.charAt(0);

        return `${surname} ${nameChar}. ${patronymicChar}.`
    } catch (error) {
        return '';
    }
}
