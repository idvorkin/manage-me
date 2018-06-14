import Expo from "expo";
import moment from "moment";
import { ICalendarEvent } from "./App";

export class CalendarHelper {
  async ensureCalendarPermissions() {
    console.log("Asking for permissions");
    const perm = "calendar"; // Looks like there isn't a permissions enum (need to log a bug)
    const { Permissions } = Expo;
    console.log(perm);
    const { status } = await Permissions.askAsync(perm);
    console.log(`Permission returned ${status}`);
    if (status !== "granted") {
      alert(
        "Hey! You might want to enable notifications for my app, they are good."
      );
    }
  }

  async getCalendarEvents(start: Date, end: Date) {
    this.ensureCalendarPermissions();
    let eventsToReturn: ICalendarEvent[] = [];
    const calendars = await Expo.Calendar.getCalendarsAsync();
    // TBD Remove all day events as they make it hard to see.
    // When will JS/TS get an async select many
    // Hymn - isn't that RxJS?
    for (let cal of calendars) {
      const events = await Expo.Calendar.getEventsAsync(
        [cal.id as string],
        start,
        end
      );
      eventsToReturn = eventsToReturn.concat(events);
    }
    return eventsToReturn;
  }
  private stripAmazonConferenceRoomJunk(location: string) {
    return location.replace("CONF US SEA ", "").replace("AV/VC", "");
  }
  stripNoisyEvents(events: ICalendarEvent[]) {
    return events
      .map(e => {
        return {
          ...e,
          location: this.stripAmazonConferenceRoomJunk(e.location || "")
        };
      })
      .filter(e => !(e.title || "").startsWith("Canceled:"));
    // Potentially remove all day events
    // TBD  - can I modify a field when returning it? E.g. removing conf room number? Ask JS expert.
  }
  calendarEventToString(calendarEvent: ICalendarEvent) {
    const e = calendarEvent;
    const start = moment(e.startDate);
    return `${start.format("LT")} - ${e.title}`;
  }
}
