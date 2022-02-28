export default interface ScheduleSelectorData {
    scheduleData: Array<Date>;
    xDaysScheduleSelectorLabelsArray: string[];
    xDaysFormattedToSlicedDateString: string[];
    yTimesScheduleSelectorLabelsArray: string[];
    yTimesFormattedTo12Or24Hour: string[];
    hourlyTimeFormat: boolean;
}
