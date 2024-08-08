import { Haptics } from '@capacitor/haptics';

window.TriggerVibration = async function () {
    await Haptics.vibrate();
}

window.TriggerImpact = async function () {
    await Haptics.impact({ style: 'heavy' });
}

window.TriggerNotification = async function () {
    await Haptics.notification({ style: 'success' });
}
