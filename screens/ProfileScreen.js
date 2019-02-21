import React from 'react'
import axios from 'axios'
import {
  ScrollView,
  StyleSheet,
  Text,
  AsyncStorage,
  View,
  Button,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native'

import { Icon } from 'expo'

import Profile from '../components/Profile'
import History from '../components/History'
import Analytics from '../components/Analytics'

export default class ProfileScreen extends React.Component {
  constructor(props) {
    super(props)
    this._bootstrapAsync()
    this.state = {
      userInfo: null,
      history: null,
      loaded: false,
    }
  }

  static navigationOptions = {
    title: 'Profile',
  }

  _bootstrapAsync = async () => {
    this.userToken = await AsyncStorage.getItem('userToken')
    axios
      .get(`https://sandbox-api.uber.com/v1.2/me`, {
        headers: {
          Authorization: `Bearer ${this.userToken}`,
        },
      })
      .then(response => {
        this.setState({
          userInfo: response.data,
        })
        return this._handleUberGetHistoryAsync()
      })
      .catch(console.log)
  }

  _handleUberGetHistoryAsync = async () => {
    axios
      .get('https://api.uber.com/v1.2/history', {
        headers: {
          Authorization: `Bearer ${this.userToken}`,
        },
      })
      .then(response => {
        this.setState({
          history: response.data,
        })
      })
      .catch(console.log)
  }

  _handleUberGetMaxHistoryAsync = async () => {
    axios
      .get('https://api.uber.com/v1.2/history', {
        headers: {
          Authorization: `Bearer ${this.userToken}`,
        },
        params: {
          limit: 50,
        },
      })
      .then(response => {
        this.setState({
          history: response.data,
          loaded: true,
        })
      })
      .catch(console.log)
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear()
    this.props.navigation.navigate('AuthLoading')
  }

  render() {
    const { userInfo, history, loaded } = this.state
    return (
      <ScrollView style={styles.container}>
        {userInfo && history ? (
          <>
            <Text style={[styles.userTitle, styles.title]}>Me</Text>
            <Profile
              picture={userInfo.picture}
              name={`${userInfo.first_name} ${userInfo.last_name}`}
              contact={userInfo.email}
              verified={userInfo.mobile_verified}
              verifiedText={
                userInfo.mobile_verified ? 'Verified' : 'Unverified'
              }
            />
            <Text style={[styles.pastTripsTitle, styles.title]}>
              Past Trips
            </Text>
            <History history={history} />
            {!loaded && (
              <Button
                title="Load More"
                onPress={this._handleUberGetMaxHistoryAsync}
              />
            )}
            <Text style={[styles.analyticsTitle, styles.title]}>Analytics</Text>
            <Analytics history={history} />
          </>
        ) : (
          <ActivityIndicator size="large" />
        )}
        <Text />
        <Button
          style={styles.signOutButton}
          title="Sign Out"
          onPress={this._signOutAsync}
        />
        <Text />
        <Text />
        <Text />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
  },
  userTitle: {
    paddingTop: 5,
    paddingBottom: 10,
  },
  pastTripsTitle: {
    paddingTop: 20,
    paddingBottom: 5,
  },
  analyticsTitle: {
    paddingTop: 20,
    paddingBottom: 5,
  },
  signOutButton: {
    paddingTop: 120,
  },
})
