const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

export const saveAuthData = (data) => {
    if(data.jwtToken){
        localStorage.setItem(ACCESS_TOKEN_KEY, data.jwtToken);
    }
    else if(data.accessToken){
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    }
    else if(data.token){
        localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
    }
    if(data.refreshToken){
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    if(data.user){
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    }
}
export const isAuthenticated = () => {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
};
export const getUserData = () => {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData): null;
};
export const clearAuthData = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};