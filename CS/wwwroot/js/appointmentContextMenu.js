// NOTE: This module relies on DevExpress internal CSS class names (dxbl-sc-*, dxbl-v-*).
// These selectors are not part of the public API and may change between library versions.
// Review and update them when upgrading DevExpress.Blazor.

function getRegion(target, schedulerElement) {
    console.log('Context menu target:', target);

    if (target.closest('.dxbl-sc-apt'))
        return { name: 'Appointment', id: 42 };

    if (target.closest('.custom-time-cell'))
        return { name: 'Time Cell', id: 42 };
    if (target.closest('.custom-date-header'))
        return { name: 'Date Header', id: 42 };
    if (target.closest('.custom-all-date-time-cell'))
        return { name: 'All Day Area', id: 42 };
    if (target.closest('.custom-day-of-week-header'))
        return { name: 'Day of Week Header', id: 42 };

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
            if (cls.includes('time-ruler') || cls.includes('time-scale'))                             return { name: 'Time Ruler', id: 42 };
            if (cls.includes('toolbar') || cls.includes('navigator') || cls.includes('header-panel')) return { name: 'Toolbar', id: 42 };
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
        dotNetRef.invokeMethodAsync('ShowAppointmentContextMenu', e.clientX, e.clientY, e.pageX, e.pageY, region.name, region.id)
            .catch(err => console.error('[appointmentContextMenu] Failed to invoke .NET method:', err));
    });
}
