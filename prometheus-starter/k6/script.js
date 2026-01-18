import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    vus: 5,
    duration: '1h', // Run for a long time to provide continuous metrics
};

export default function () {
    http.get('http://app:8080/');
    sleep(1);
}
