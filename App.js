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
    console.log('component will mount++')
    const calendarEvents = await this.getCalendarEvents()
    this.setState(
      {
        // copy to object to avoid what I think is a promise reference or some such.
        "calendarEvents": calendarEvents
      }
    )
    console.log('component will mount--')
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
    // TBD can probably do this with a map reduce

    for (let cal of calendars) {
      const events = await Expo.Calendar.getEventsAsync([cal.id], moment().startOf('day'),moment().endOf('day'))
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
   render() {
    console.log(`render++`)
    const agenda = this.state.calendarEvents.map(e =>
      <View key={e.id} style={styles.agendaContainer}>
        <Text style={styles.agendaHour}> {moment(e.startDate).format('h:mm A')}:</Text>
        <Text>{(e.title)}</Text>
      </View>
    )

    return (
      <View style={styles.container} >
        <Text style={styles.dayText}>It is {moment().format('LL - LT')}</Text>
        <Text>{this.props.clip}</Text>
        {agenda}
        <Button title="Open notability with Grateful" 
          onPress={() => this.openNotabilityWithGratefulTitleOnClipboard()} />

        <Button title="Copy Calendar" onPress={() => this.copyAgendaToClipboard()} />
        <Button title = "Random Wisdom" onPress={() => Linking.openURL('http://idvorkin.github.io/random')}TouchableOpacity/>
       <Image
          style={{width: 50, height: 50}}
          source={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}
        />
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
