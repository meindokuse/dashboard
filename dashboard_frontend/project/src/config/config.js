export const API_CONFIG = {
  BASE_URL: 'http://90.156.155.73/api',
  ENDPOINTS: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    PROFILE: '/user/profile',
    CURRENCY_RATES: (currency) => `/rate/currencies/${currency}/rates/`
  }
};
