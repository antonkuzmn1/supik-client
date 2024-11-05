export const convertToFile = (certificate: any, fileName: string) => {
    const buffer = new Uint8Array(certificate.data);
    const blob = new Blob([buffer], {type: 'application/x-x509-ca-cert'});
    return new File([blob], fileName, {type: blob.type});
};
