using DevExpress.Blazor;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.JSInterop;
using scheduler_menu.Data;

namespace scheduler_menu.Components.Pages;

public partial class Index {
    private DxSchedulerAppointmentItem? ContextMenuAppointment;
    private ElementReference SchedulerContainer;
    private DotNetObjectReference<Index>? DotNetRef;
    private IJSObjectReference? JsModule;
    private DxScheduler? Scheduler;
    private DateTime StartDate = DateTime.Today;
    private bool ShowWorkTimeOnly = true;
    private SchedulerViewType ActiveViewType = SchedulerViewType.Month;
    private const string OpenDayInDayViewText = "Open this day in Day View";

    private string GoToTodayText => ActiveViewType switch {
        SchedulerViewType.Week or SchedulerViewType.WorkWeek => "Go to the current Week",
        SchedulerViewType.Month => "Go to the current Month",
        SchedulerViewType.Day or SchedulerViewType.Timeline => "Go to Today",
        _ => "Error: Unknown view type"
    };

    private DxContextMenu? ContextMenu;
    private System.Collections.IEnumerable VisibleResources = ResourceCollection.GetResources().Take(2).ToList();
    private IEnumerable<Resource> VisibleResourcesTyped => VisibleResources.Cast<Resource>();

    private string ClickedRegion = string.Empty;
    private int? ClickedId; // stores Id of an element to which we called context menu
    private DateTime? DayToGo; // Stores day where we should switch to

    private DxSchedulerDataStorage DataStorage = new() {
        AppointmentsSource = RecurringAppointmentCollection.GetAppointments(),
        AppointmentMappings = new DxSchedulerAppointmentMappings() {
            Id = "AppointmentID",
            Type = "AppointmentType",
            Start = "StartDate",
            End = "EndDate",
            Subject = "Caption",
            AllDay = "AllDay",
            Location = "Location",
            Description = "Description",
            LabelId = "Label",
            StatusId = "Status",
            RecurrenceInfo = "Recurrence",
            ResourceId = "ResourceId"
        },
        ResourcesSource = ResourceCollection.GetResourcesForGrouping(),
        ResourceMappings = new DxSchedulerResourceMappings() {
            Id = "Id",
            Caption = "Name",
            BackgroundCssClass = "BackgroundCss",
            TextCssClass = "TextCss"
        }
    };

    protected override async Task OnAfterRenderAsync(bool firstRender) {
        if(firstRender) {
            DotNetRef = DotNetObjectReference.Create(this);
            JsModule = await JS.InvokeAsync<IJSObjectReference>("import", "./js/appointmentContextMenu.js");
            await JsModule.InvokeVoidAsync("setup", SchedulerContainer, DotNetRef);
        }
    }

    [JSInvokable]
    public async Task ShowAppointmentContextMenu(double clientX, double clientY, double pageX, double pageY, string region, int? id, long? startDate) {
        ClickedRegion = region;
        ClickedId = id;
        DayToGo = startDate.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds(startDate.Value).DateTime : null;

        StateHasChanged();

        await (ContextMenu?.ShowAsync(new MouseEventArgs {
            ClientX = clientX,
            ClientY = clientY,
            PageX = pageX,
            PageY = pageY
        }) ?? Task.FromResult(false));
    }

    private async Task ShowAppointmentContextMenu(MouseEventArgs e, DxSchedulerAppointmentItem appointment) {
        if(ContextMenu is null || appointment is null)
            return;

        ClickedRegion = "Appointment";
        ContextMenuAppointment = appointment;
        await ContextMenu.ShowAsync(e);
    }

    public async ValueTask DisposeAsync() {
        if(JsModule is not null)
            await JsModule.DisposeAsync();

        DotNetRef?.Dispose();
    }

    private async Task OnItemClick(ContextMenuItemClickEventArgs args) {
        switch(args.ItemInfo.Name) {
            case "Edit":
                if(Scheduler is null || ContextMenuAppointment is null)
                    break;

                await Scheduler.ShowAppointmentEditFormAsync(false, ContextMenuAppointment);
                break;
            case "GoToToday":
                StartDate = DateTime.Today;
                break;
            case "SwitchToDayView":
                ActiveViewType = SchedulerViewType.Day;
                if(DayToGo is not null)
                    StartDate = DayToGo.Value;
                break;
            case "SwitchToWeekView":
                ActiveViewType = SchedulerViewType.Week;
                break;
            case "SwitchToWorkWeekView":
                ActiveViewType = SchedulerViewType.WorkWeek;
                break;
            case "SwitchToMonthView":
                ActiveViewType = SchedulerViewType.Month;
                break;
            case "HideResource":
                var resourceId = ClickedId;
                var resourceToHide = VisibleResourcesTyped.FirstOrDefault(r => r.Id.Equals(resourceId));
                if(resourceToHide is not null)
                    VisibleResources = VisibleResourcesTyped.Where(r => !r.Equals(resourceToHide)).ToList();
                break;
            case "ShowAllResources":
                VisibleResources = ResourceCollection.GetResourcesForGrouping();
                break;
            case "ToggleWorkTime":
                ShowWorkTimeOnly = !ShowWorkTimeOnly;
                break;
        }

        StateHasChanged();
    }

    private void OnHtmlCellDecoration(SchedulerHtmlCellDecorationEventArgs e) {
        switch(e.CellType) {
            case SchedulerCellType.DateHeader:
                e.CssClass = "custom-date-header";
                break;
            case SchedulerCellType.TimeCell:
                e.CssClass = "custom-time-cell";
                break;
            case SchedulerCellType.ResourceHeader:
                e.CssClass = "custom-resource-header-" + e.Resources.FirstOrDefault()?.Id;
                break;
            case SchedulerCellType.AllDayTimeCell:
                e.CssClass = "custom-all-date-time-cell";
                break;
            case SchedulerCellType.DayOfWeekHeader:
                e.CssClass = "custom-day-of-week-header";
                break;
            case SchedulerCellType.None:
                e.CssClass = "custom-none";
                break;
        }
    }
}
