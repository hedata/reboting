export const uploadState = (state: boolean = false, {type, payload}) => {
    switch (type) {
        case 'UPLOAD_SUCCESS':
            return true;
        case 'UPLOAD_ERROR':
            return false;
        default:
            return state;
    }
};