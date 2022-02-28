// Exporting this enum because ts will transform this
// into a js function so lets consider it as a function
// rather than a type
export enum TimeFormat {
  TWELVE_HOURS = 'hh:mm a',
  TWENTY_FOUR_HOURS = 'HH:mm',
}
