const API_URL = 'https://date.nager.at/api/v3/NextPublicHolidaysWorldwide';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function fetchWithRetry(url, retries = MAX_RETRIES) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('API Response:', data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        if (retries > 0) {
            console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return fetchWithRetry(url, retries - 1);
        }
        throw error;
    }
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getCountryName(countryCode) {
    const countries = {
        'AT': 'Austria', 'US': 'United States', 'IN': 'India', 'GB': 'United Kingdom',
        'CA': 'Canada', 'AU': 'Australia', 'DE': 'Germany', 'FR': 'France',
        'IT': 'Italy', 'ES': 'Spain', 'JP': 'Japan', 'CN': 'China',
        'BR': 'Brazil', 'MX': 'Mexico', 'RU': 'Russia', 'ZA': 'South Africa',
        'KR': 'South Korea', 'NL': 'Netherlands', 'SE': 'Sweden', 'NO': 'Norway',
        'DK': 'Denmark', 'FI': 'Finland', 'PL': 'Poland', 'PT': 'Portugal',
        'GR': 'Greece', 'TR': 'Turkey', 'AE': 'United Arab Emirates', 'SA': 'Saudi Arabia',
        'EG': 'Egypt', 'TH': 'Thailand', 'MY': 'Malaysia', 'SG': 'Singapore',
        'ID': 'Indonesia', 'PH': 'Philippines', 'VN': 'Vietnam', 'NZ': 'New Zealand'
    };
    return countries[countryCode] || countryCode;
}

function createHolidayElement(holiday) {
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="holiday-name">${holiday.name}</div>
        <div class="holiday-local-name">${holiday.localName}</div>
        <div class="holiday-date">${formatDate(holiday.date)}</div>
        <div class="holiday-country">${getCountryName(holiday.countryCode)} (${holiday.countryCode})</div>
        <div class="holiday-type">${holiday.types.join(', ')}</div>
    `;
    return li;
}

async function displayHolidays() {
    const loadingElement = document.getElementById('loading');
    const errorElement = document.getElementById('error');
    const todayList = document.getElementById('today-list');
    const upcomingList = document.getElementById('upcoming-list');

    try {
        const holidays = await fetchWithRetry(API_URL);
        loadingElement.style.display = 'none';

        const today = new Date().toISOString().split('T')[0];
        const todayHolidays = holidays.filter(holiday => holiday.date === today);
        const upcomingHolidays = holidays.filter(holiday => holiday.date > today);

        if (todayHolidays.length === 0) {
            todayList.innerHTML = '<li>No holidays today</li>';
        } else {
            todayHolidays.forEach(holiday => {
                todayList.appendChild(createHolidayElement(holiday));
            });
        }

        if (upcomingHolidays.length === 0) {
            upcomingList.innerHTML = '<li>No upcoming holidays in the next 7 days</li>';
        } else {
            upcomingHolidays.forEach(holiday => {
                upcomingList.appendChild(createHolidayElement(holiday));
            });
        }
    } catch (error) {
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
        errorElement.textContent = 'Error loading holidays. Please try again later.';
        console.error('Error displaying holidays:', error);
    }
}

document.addEventListener('DOMContentLoaded', displayHolidays);
