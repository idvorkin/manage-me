// @flow
import React from 'react';
import { Image,  WebView, Button, StyleSheet, Text, View, Clipboard } from 'react-native';
import Expo from 'expo';
import moment from 'moment';
import { Linking } from 'react-native';


export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      "calendarEvents":[]
    }
  }
    async componentWillMount() {
        // TBD Figure out state
        await this.loadCalendarEvents()
        console.log('component will mount++')
        console.log('component will mount--')
    }
    async loadCalendarEvents()
    {
        const calendarEvents = await this.getCalendarEvents()
        this.setState(
            {
                // copy to object to avoid what I think is a promise reference or some such.
                "calendarEvents": calendarEvents
            }
        )
    }

  openNotabilityWithGratefulTitleOnClipboard() {
    const title = `Grateful ${moment().format('LL')}`
    console.log(title)
    Clipboard.setString(title)
    Linking.openURL('notability://junk')
  }

  calendarEventToString(calendarEvent) {
    e = calendarEvent
    const start = moment(e.startDate)
    const end = moment(e.endDate)
    return `${start.format('LT')} - ${e.title}`
  }

  async ensureCalendarPermissions()
  {
    console.log("Asking for permissions")
    const perm = "calendar" // Looks like there isn't a permissions enum Ooops.
    const { Permissions } = Expo;
    console.log(perm)
    const { status } = await Permissions.askAsync(perm);
    console.log(`Permission returned ${status}`)
    if (status !== 'granted') {
      alert('Hey! You might want to enable notifications for my app, they are good.');
    }
  }

  async getCalendarEvents()
  {
    this.ensureCalendarPermissions()

    let eventsToReturn = []
    const calendars = await Expo.Calendar.getCalendarsAsync()

    // TBD Remove all day events as they make it hard to see.
    // TBD can probably do this with a map reduce

    const tomorrow = moment().endOf('day');
    // const tomorrow = moment("2018-06-12") // Debugging set a random day
    for (let cal of calendars) {
      const events = await Expo.Calendar.getEventsAsync([cal.id], moment().startOf('day'), tomorrow)
      eventsToReturn = eventsToReturn.concat(events)
    }
    return eventsToReturn
  }
  async copyAgendaToClipboard() {
    const calendarEvents  =  this.state.calendarEvents
    let output = `Agenda for ${moment().format('LL')}\n`
    const eventStrings = calendarEvents.map(this.calendarEventToString).join('\n')
    output += eventStrings
    Clipboard.setString(output)
    // Linking.openURL('onenote://junk')
  }

    stripAmazonConferenceRoomJunk(location)
    {
        return location.replace("CONF US SEA ","").replace("AV/VC","");
    }

    cleanedCalenderEvents()
    {
        return this.state.calendarEvents
               .filter(e=>!e.title.startsWith('Canceled:'))
    }

    renderStartTimeAndTitle(calendarEvent)
    {
            return <View key={calendarEvent.id} style={styles.agendaContainer}>
            <Text style={styles.agendaHour}> {moment(calendarEvent.startDate).format('h:mm A')}:</Text>
            <Text>{(calendarEvent.title)}</Text>
            </View>
    }

    render() {
        console.log(`render++`)

        //  Agenda component
        const agendaComponent = this.cleanedCalenderEvents().map(this.renderStartTimeAndTitle)

        //  Next Meeting component
        const nextMeetingComponent = this.cleanedCalenderEvents()
            .filter(e=>moment(e.startDate) > moment().subtract(1,'hours')).slice(0,3)
            .map(nextMeeting=>
        <View key={nextMeeting.id}>
                {this.renderStartTimeAndTitle(nextMeeting)}
                <Text> {this.stripAmazonConferenceRoomJunk(nextMeeting.location)}</Text>
        </View>);

        return (
            <View style={styles.container} >
            <Text style={styles.dayText}>It is {moment().format('LL - LT')}</Text>
            <Text>{this.props.clip}</Text>
            {agendaComponent}
            <Button title="Open notability with Grateful"
            onPress={() => this.openNotabilityWithGratefulTitleOnClipboard()} />
            <Button title="Refresh" onPress={() => this.loadCalendarEvents()} />
            <Button title = "Random Wisdom" onPress={() => Linking.openURL('http://idvorkin.github.io/random')}TouchableOpacity/>
            <Text style={styles.dayText}>Upcoming meetings</Text>
            {nextMeetingComponent}
            <Text style={styles.dayText}>Be Disciplined And Deliberate Every Day</Text>
            </View>
        );
    }
}

// Styles tutorial
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center', // justify is up down.
    // alignItems: 'center', // align is right left
  },
  agendaContainer: {
    alignItems: 'center', // align is right left
    flexDirection:"row",
    borderRadius:10,
    backgroundColor:'orange',
  },
  dayText: {
    justifyContent: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  agendaHour: {
    color:"red",
    fontWeight: 'bold',
  },
});
