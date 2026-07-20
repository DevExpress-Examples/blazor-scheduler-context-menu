// NOTE: This module relies on DevExpress internal CSS class names (dxbl-sc-*, dxbl-v-*).
// These selectors are not part of the public API and may change between library versions.
// Review and update them when upgrading DevExpress.Blazor.

function get_date_milliseconds(target) {
    return parseInt(target.getAttribute('data-start'), 10)
}
function getRegion(target, schedulerElement) {
    if (target.closest('.dxbl-sc-apt'))
        return null;
        //return { name: 'Appointment' };

    var start_date = get_date_milliseconds(target);

    if (target.closest('.custom-time-cell'))
        return { name: 'Time Cell', start_date: start_date };
    if (target.closest('.custom-date-header')) {
        target = target.parentElement;
        start_date = get_date_milliseconds(target);
        return { name: 'Date Header', start_date: start_date };
    }
    if (target.closest('.custom-all-date-time-cell'))
        return { name: 'All Day Area', start_date: start_date };
    if (target.closest('.custom-day-of-week-header'))
        return { name: 'Day of Week Header' };

    const resourceHeader = target.closest('[class*="custom-resource-header-"]');
    if (resourceHeader) {
        const cls = [...resourceHeader.classList].find(c => c.startsWith('custom-resource-header-'));
        const id = parseInt(cls.replace('custom-resource-header-', ''), 10);
        return { name: 'Resource Header', id };
    }

    let el = target;
    while (el && el !== schedulerElement) {
        for (const cls of (el.classList ?? [])) {
            if (!cls.startsWith('dxbl-sc-') && !cls.startsWith('dxbl-v-')) continue;
            if (cls.includes('time-ruler') || cls.includes('time-scale'))                             return { name: 'Time Ruler' };
            if (cls.includes('toolbar') || cls.includes('navigator') || cls.includes('header-panel')) return { name: 'Toolbar' };
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
        dotNetRef.invokeMethodAsync('ShowAppointmentContextMenu', e.clientX, e.clientY, e.pageX, e.pageY, region.name, region.id, region.start_date)
            .catch(err => console.error('[appointmentContextMenu] Failed to invoke .NET method:', err));
    });
}
