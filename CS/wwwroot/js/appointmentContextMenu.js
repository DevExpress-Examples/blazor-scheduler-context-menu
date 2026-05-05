// NOTE: This module relies on DevExpress internal CSS class names (dxbl-sc-*, dxbl-v-*).
// These selectors are not part of the public API and may change between library versions.
// Review and update them when upgrading DevExpress.Blazor.

function getRegion(target, schedulerElement) {
    if (target.closest('.dxbl-sc-apt')) return 'Appointment';
    if (target.closest('.dxbl-sc-time-cell')) return 'Time Cell';

    let el = target;
    while (el && el !== schedulerElement) {
        for (const cls of (el.classList ?? [])) {
            if (!cls.startsWith('dxbl-sc-') && !cls.startsWith('dxbl-v-')) continue;
            if (cls.includes('date-hr') || cls.includes('date-header') || cls.includes('date-cell'))
                                                                                                      return 'Date Header';
            if (cls.includes('resource-hr') || cls.includes('v-resource-header'))                     return 'Resource Header';
            if (cls.includes('time-ruler') || cls.includes('time-scale'))                             return 'Time Ruler';
            if (cls.includes('toolbar') || cls.includes('navigator') || cls.includes('header-panel')) return 'Toolbar';
            if (cls.includes('all-day-area'))                                                         return 'All Day Area';
        }
        el = el.parentElement;
    }
    return null;
}

export function setup(schedulerElement, dotNetRef) {
    schedulerElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const region = getRegion(e.target, schedulerElement);
        if (!region) return;
        dotNetRef.invokeMethodAsync('ShowAppointmentContextMenu', e.clientX, e.clientY, e.pageX, e.pageY, region)
            .catch(err => console.error('[appointmentContextMenu] Failed to invoke .NET method:', err));
    });
}
