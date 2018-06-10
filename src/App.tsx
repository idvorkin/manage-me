import { CalendarHelper } from "./CalendarHelper";


import React from 'react';
import { StyleSheet, Text, View, Clipboard, StatusBar } from 'react-native';
import Expo from 'expo';
import moment from 'moment';
import { Linking } from 'react-native';
import { Container, Header, Content, Button, Title, Footer, FooterTab } from 'native-base';
import _ from 'lodash';


// TODO: Learn how to do react from TS correctly
// https://github.com/Microsoft/TypeScript-React-Starter

export class Wisdom {
  sampleSize(n: number): string[] {
    return _.sampleSize(this.splitAndClean(this.wisdom, '\n'), n)
  }

  private wisdom = `
    Be Deliberate Disciplined Daily
    Always ask questions
    Isn't that curious
    Seek first to understand
    Find Win/Win Solutions
    Synergize
    First Things First
    Appreciate those around you
    Be Present
    Be Grateful
    First things First
    Start with the End in Mind
    `;

  private splitAndClean(str: string, splitchar: string) {
    return str.split(splitchar).filter(s => s && s != "").map(s => s.trim())
  }
}

export type ICalendarEvent = Expo.Calendar.Event;

export interface CalenderAgendaProps {
  now:Date,
  calendarEvents: ICalendarEvent[]
}

function renderStartTimeAndTitle(calendarEvent: ICalendarEvent, keyPrefix:string){
    return <View key={keyPrefix + "_" + calendarEvent.id} style={styles.agendaContainer}>
      <Text style={styles.agendaHour}> {moment(calendarEvent.startDate).format('h:mm A')}:</Text>
      <Text>{(calendarEvent.title)}</Text>
    </View>
  }

function AgendaAndUpcomingMeetings(props: CalenderAgendaProps) {

  const agendaComponent = props.calendarEvents.map(e => renderStartTimeAndTitle(e, "agenda"))
  const nextMeetingComponent = props.calendarEvents
    .filter(e => moment(e.startDate) > moment(props.now).subtract(1, 'hours')).slice(0, 3)
    .map(nextMeeting =>
      <View key={"nm" + nextMeeting.id}>
        {renderStartTimeAndTitle(nextMeeting, "nm2")}
        <Text> {nextMeeting.location || ""}</Text>
      </View>);
  return <Content>
    <Text style={styles.dayText}>Today's Agenda</Text>
    {agendaComponent}

    <Text style={styles.dayText}>Upcoming meetings</Text>
    {nextMeetingComponent}
  </Content>
}

interface IAppProps {
}

interface IAppState {
  now: Date
  calendarEvents: ICalendarEvent[]
  wisdom : string[]
  stateLoaded:Boolean
}


export default class App extends React.Component<IAppProps, IAppState> {
  constructor(props: any) {
    super(props)
    // There is something bizare going on like fields
    // aren't initialized till after component did mount completes
  }
  calendarHelper = new CalendarHelper()
  async componentWillMount() {
    this.setState({
      calendarEvents: [],
      stateLoaded: false,
      now: (moment().toDate())
    });

    console.log('component will mount ++')
      await Expo.Font.loadAsync({
        'Roboto': require('native-base/Fonts/Roboto.ttf'),
        'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
        'Ionicons': require('@expo/vector-icons/fonts/Ionicons.ttf'),
      });

    await this.reloadState();
    this.setState({ stateLoaded: true})
    console.log('component will mount--')
  }

  async loadCalendarEvents() {
    const start = moment(this.state.now).startOf('day').toDate() ;
    const end = moment(this.state.now).endOf('day').toDate();
    //const end = moment(this.state.now).add(2,'days').toDate() // Debugging set forward a few days.

    return this.calendarHelper.getCalendarEvents(start , end);
  }

  async reloadState() {
    // TODO: Merge code back with component did mount.
    const calenderEvents = await this.loadCalendarEvents()
    this.setState({ stateLoaded: true, 
      calendarEvents: calenderEvents, 
      now: moment().toDate(),
      wisdom: new Wisdom().sampleSize(3)
    })
  }

  openNotabilityWithGratefulTitleOnClipboard() {
    const title = `Grateful ${moment(this.state.now).format('LL')}`
    console.log(title)
    Clipboard.setString(title)
    Linking.openURL('notability://junk')
  }


  render() {
    return (
        <Container>
        {
          this.state.stateLoaded ? this.renderWhenLoaded() : null
        }
        </Container>
    )
  }

  renderWhenLoaded() {
    // iPhoneX header in notch is tracked @   https://github.com/GeekyAnts/NativeBase/issues/1985
    const cleanEvents = this.calendarHelper.stripNoisyEvents(this.state.calendarEvents);
    return (
      <Container>
        <Header>
          <Title> {moment(this.state.now).format('LL - LT')}</Title>
        </Header>

        <Content>
          <AgendaAndUpcomingMeetings calendarEvents={cleanEvents} now={moment().toDate() }/>
          <Text style={styles.dayText}>Affirmations</Text>
          {this.state.wisdom.map(w=> <Text key={w}>{w}</Text>)}
        </Content>

        <Footer>
          <FooterTab>
            <Button active>
              <Text>Today</Text>
            </Button>
            <Button onPress= {()=>this.openNotabilityWithGratefulTitleOnClipboard()}>
              <Text>Grateful</Text>
            </Button>
            <Button onPress={()=>Linking.openURL('http://idvorkin.github.io/random')}>
              <Text>Wisdom</Text>
            </Button>
            <Button onPress={()=>this.reloadState()}>
              <Text>Refresh</Text>
            </Button>
          </FooterTab>
        </Footer>
      </Container>
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
