import { useState, useEffect } from 'react';
import { useRegion } from '../context/AppContext';
import '../styles/CurrentTime.css';

function CurrentTime() {
    const { getCurrentTime, getCurrentDate, timezone } = useRegion();
    const [currentTime, setCurrentTime] = useState(getCurrentTime());
    const [currentDate, setCurrentDate] = useState(getCurrentDate());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(getCurrentTime());
            setCurrentDate(getCurrentDate());
        }, 1000);

        return () => clearInterval(interval);
    }, [getCurrentTime, getCurrentDate]);

    return (
        <div className="current-time-widget">
            <div className="current-time-date">{currentDate}</div>
            <div className="current-time-clock">{currentTime}</div>
            <div className="current-time-timezone">{timezone.split('/')[1]}</div>
        </div>
    );
}

export default CurrentTime;