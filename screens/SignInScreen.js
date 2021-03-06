import React from 'react'
import axios from 'axios'
import {
  StyleSheet,
  Text,
  Button,
  View,
  AsyncStorage,
  Image,
  Alert,
} from 'react-native'
import { AuthSession } from 'expo'
import { UBER_CLIENT_ID, UBER_CLIENT_SECRET } from 'react-native-dotenv'

export default class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Sign In',
  }

  state = {
    userInfo: null,
    didError: false,
  }

  handleUberLogin = async () => {
    let redirectUrl = AuthSession.getRedirectUrl()
    let results = await AuthSession.startAsync({
      authUrl: `https://login.uber.com/oauth/v2/authorize?response_type=code&client_id=${UBER_CLIENT_ID}&scope=profile+history+request+request_receipt&redirect_uri=${encodeURIComponent(
        redirectUrl
      )}`,
    })
    if (results.type !== 'success') {
      this.setState({ didError: true })
    } else {
      axios({
        method: 'post',
        url: 'https://login.uber.com/oauth/v2/token',
        params: {
          client_id: UBER_CLIENT_ID,
          client_secret: UBER_CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl,
          code: results.params.code,
          scope: 'profile+history+request+request_receipt',
        },
      })
        .then(response => {
          AsyncStorage.setItem('userToken', response.data.access_token)
          this.props.navigation.navigate('Main')
        })
        .catch(error => {
          this.setState({ didError: true })
          console.log(error)
        })
    }
  }

  render() {
    const { navigate } = this.props.navigation

    return (
      <View style={styles.container}>
        <View style={styles.main}>
          <Image
            style={styles.logo}
            source={require('../assets/images/Logo.png')}
          />
          <Text style={styles.title}>Oober</Text>
        </View>
        <View style={styles.welcome}>
          <Text style={styles.header}>Welcome</Text>
          <Button
            onPress={() => this.handleUberLogin()}
            title="Sign In / Create Account"
          />
          {this.state.didError &&
            Alert.alert('Error', 'Login unsuccessful, please try again later', {
              text: 'OK',
              onPress: () => this.setState({ didError: false }),
            })}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    fontSize: 30,
    fontWeight: '500',
    textAlign: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
})
