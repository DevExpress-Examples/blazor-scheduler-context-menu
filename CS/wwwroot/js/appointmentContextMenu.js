// NOTE: This module relies on DevExpress internal CSS class names (dxbl-sc-*, dxbl-v-*).
// These selectors are not part of the public API and may change between library versions.
// Review and update them when upgrading DevExpress.Blazor.

function getRegion(target, schedulerElement) {
    console.log('Context menu target:', target);
    if (target.closest('.dxbl-sc-apt')) return 'Appointment';
    if (target.closest('.custom-time-cell'))
        return 'Time Cell';
    if (target.closest('.custom-date-header'))
        return 'Date Header';
    if (target.closest('.custom-resource-header'))
        return 'Resource Header';
    if (target.closest('.custom-all-date-time-cell'))
        return 'All Day Area';
    if (target.closest('.custom-day-of-week-header'))
        return 'Day of Week Header';

    let el = target;
    while (el && el !== schedulerElement) {
        for (const cls of (el.classList ?? [])) {
            if (!cls.startsWith('dxbl-sc-') && !cls.startsWith('dxbl-v-')) continue;
            if (cls.includes('time-ruler') || cls.includes('time-scale'))                             return 'Time Ruler';
            if (cls.includes('toolbar') || cls.includes('navigator') || cls.includes('header-panel')) return 'Toolbar';
        }
        el = el.parentElement;
    }
    return null;
}

export function setup(schedulerElement, dotNetRef) {
    schedulerElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const region = getRegion(e.target, schedulerElement);
        console.log('Context menu region:', region);
        if (!region) return;
        dotNetRef.invokeMethodAsync('ShowAppointmentContextMenu', e.clientX, e.clientY, e.pageX, e.pageY, region)
            .catch(err => console.error('[appointmentContextMenu] Failed to invoke .NET method:', err));
    });
}
