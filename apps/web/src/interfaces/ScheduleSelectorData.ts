export default interface ScheduleSelectorData {
    scheduleData: Array<Date>;
    yTimesScheduleSelectorLabelsArray: string[];
    xDaysFormattedToSlicedDateString: string[];
    xDaysScheduleSelectorLabelsArray: string[];
    yTimesFormattedTo12Or24Hour: string[];
    is24Hour: boolean;
}
