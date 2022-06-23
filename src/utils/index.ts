export const getLocation = () => {
    return window.location.pathname.substring(1);
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};
