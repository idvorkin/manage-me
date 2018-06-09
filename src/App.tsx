import { CalendarHelper } from "./CalendarHelper";

// @flow
import React from 'react';
import { Button, StyleSheet, Text, View, Clipboard } from 'react-native';
import Expo from 'expo';
import moment from 'moment';
import { Linking } from 'react-native';

export type ICalendarEvent = Expo.Calendar.Event;

interface IAppProps {
}

interface IAppState {
  calendarEvents: ICalendarEvent[]
}

class AppState implements IAppState {
  constructor(public calendarEvents: ICalendarEvent[]) {
  }
}


export default class App extends React.Component<IAppProps, IAppState> {
  constructor(props: any) {
    super(props)
    this.state = new AppState([])
  }
  calendarHelper = new CalendarHelper()
  async componentWillMount() {
    // TBD Figure out state
    console.log('component will mount TSX2++')
    await this.loadCalendarEvents()
    console.log('component will mount--')
  }

  async loadCalendarEvents() {
    const start = moment().startOf('day') as any;
    // const end = moment().endOf('day');
    const end = moment().add(3,'days') // Debugging set forward a few days.

    this.setState({
        // Moment typing needs fixing.
          "calendarEvents": await this.calendarHelper.getCalendarEvents(start as any, end as any)
      }
    )
  }

  openNotabilityWithGratefulTitleOnClipboard() {
    const title = `Grateful ${moment().format('LL')}`
    console.log(title)
    Clipboard.setString(title)
    Linking.openURL('notability://junk')
  }


  renderStartTimeAndTitle(calendarEvent: any) {
    return <View key={calendarEvent.id} style={styles.agendaContainer}>
      <Text style={styles.agendaHour}> {moment(calendarEvent.startDate).format('h:mm A')}:</Text>
      <Text>{(calendarEvent.title)}</Text>
    </View>
  }

  render() {
    console.log(`render++`)

    const cleanEvents = this.calendarHelper.stripNoisyEvents(this.state.calendarEvents);
    //  Agenda component
    const agendaComponent = cleanEvents
      .map(this.renderStartTimeAndTitle)

    //  Next Meeting component
    const nextMeetingComponent = cleanEvents
      .filter(e => moment(e.startDate) > moment().subtract(1, 'hours')).slice(0, 3)
      .map(nextMeeting =>
        <View key={nextMeeting.id}>
          {this.renderStartTimeAndTitle(nextMeeting)}
          <Text> {this.calendarHelper.stripAmazonConferenceRoomJunk(nextMeeting.location || "")}</Text>
        </View>);

    return (
      <View style={styles.container} >
        <Text style={styles.dayText}>It is {moment().format('LL - LT')}</Text>
        {agendaComponent}
        <Button title="Open notability with Grateful"
          onPress={() => this.openNotabilityWithGratefulTitleOnClipboard()} />
        <Button title="Refresh" onPress={() => this.loadCalendarEvents()} />
        <Button title="Random Wisdom" onPress={() => Linking.openURL('http://idvorkin.github.io/random')} />
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
