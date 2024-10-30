export const getInitialsFromFullname = (fullname: string) => {
    try {
        const trim = fullname.trim();
        const split = trim.split(' ');

        if (split.length > 3) {
            const surname = split[0];
            const name = split[2];
            const patronymic = split[3];
            const nameChar = name.charAt(0);
            const patronymicChar = patronymic.charAt(0);

            return `${surname} ${nameChar}. ${patronymicChar}.`
        } else {
            const surname = split[0];
            const name = split[1];
            const patronymic = split[2];
            const nameChar = name.charAt(0);
            const patronymicChar = patronymic.charAt(0);

            return `${surname} ${nameChar}. ${patronymicChar}.`
        }
    } catch (error) {
        return '';
    }
}
