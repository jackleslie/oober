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

export default class ProfileScreen extends React.Component {
  constructor(props) {
    super(props)
    this._bootstrapAsync()
  }
  static navigationOptions = {
    title: 'Profile',
  }

  state = {
    userInfo: null,
  }

  _bootstrapAsync = async () => {
    const userToken = await AsyncStorage.getItem('userToken')
    axios
      .get(`https://api.uber.com/v1.2/me`, {
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
    return (
      <ScrollView style={styles.container}>
        {this.state.userInfo ? (
          <View>
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: this.state.userInfo.picture }}
                style={styles.profilePicture}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {this.state.userInfo.first_name}{' '}
                  {this.state.userInfo.last_name}
                </Text>
                <Text style={styles.profileEmail}>
                  {this.state.userInfo.email}
                </Text>
                {this.state.userInfo.mobile_verified ? (
                  <View style={styles.profileVerified}>
                    <Icon.Ionicons
                      name={
                        Platform.OS === 'ios'
                          ? 'ios-checkmark-circle'
                          : 'md-checkmark-circle'
                      }
                      size={26}
                      color="#70C1B3"
                    />
                    <Text style={styles.profileVerifiedText}>Verified</Text>
                  </View>
                ) : (
                  <View style={styles.profileVerified}>
                    <Icon.Ionicons
                      name={
                        Platform.OS === 'ios'
                          ? 'ios-close-circle'
                          : 'md-close-circle'
                      }
                      size={26}
                      color="#F25F5C"
                    />
                    <Text style={styles.profileVerifiedText}>Unverified</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
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
    backgroundColor: '#fff',
  },
  profileHeader: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '500',
    marginTop: 5,
  },
  profileEmail: {
    fontSize: 16,
    fontWeight: '300',
  },
  profileVerified: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileVerifiedText: {
    marginLeft: 5,
    fontWeight: '400',
  },
})
