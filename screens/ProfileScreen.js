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

export default class ProfileScreen extends React.Component {
  constructor(props) {
    super(props)
    this._bootstrapAsync()
    this.state = {
      userInfo: null,
    }
  }

  static navigationOptions = {
    title: 'Profile',
  }

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios
      .get(`https://sandbox-api.uber.com/v1.2/me`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .then(userInfo => {
        this.setState({
          userInfo: userInfo.data,
        })
      })
  }

  _signOutAsync = async () => {
    await AsyncStorage.clear()
    this.props.navigation.navigate('AuthLoading')
  }

  render() {
    const { userInfo } = this.state
    return (
      <ScrollView style={styles.container}>
        {userInfo ? (
          <Profile
            picture={userInfo.picture}
            name={`${userInfo.first_name} ${userInfo.last_name}`}
            contact={userInfo.email}
            verified={userInfo.mobile_verified}
            verifiedText={userInfo.mobile_verified ? 'Verified' : 'Unverified'}
          />
        ) : (
          <ActivityIndicator size="large" />
        )}
        <Button title="Sign Out" onPress={this._signOutAsync} />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
})
