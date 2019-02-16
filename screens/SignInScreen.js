import React from 'react'
import axios from 'axios'
import {
  StyleSheet,
  Text,
  Button,
  View,
  AsyncStorage,
  Image,
} from 'react-native'
import { AuthSession } from 'expo'

export default class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Sign In',
  }

  state = {
    userInfo: null,
    didError: false,
  }

  handleUberLogin = async () => {
    let redirectUrl = await AuthSession.getRedirectUrl()
    let results = await AuthSession.startAsync({
      authUrl: `https://login.uber.com/oauth/v2/authorize?response_type=code&client_id=jloIvMctI2Pnd3lbrKNpqpDiSfJD8SPk&scope=profile&redirect_uri=${encodeURIComponent(
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
          client_id: 'jloIvMctI2Pnd3lbrKNpqpDiSfJD8SPk',
          client_secret: 'rXXX5JKsN9dsRtw59ynoWM9TbSlBGNHPXPuDwoCE',
          grant_type: 'authorization_code',
          redirect_uri: redirectUrl,
          code: results.params.code,
          scope: 'profile',
        },
      })
        .then(response => {
          AsyncStorage.setItem('userToken', response.data.access_token)
          this.props.navigation.navigate('Main')
        })
        .catch(console.log)
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
