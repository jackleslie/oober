import React from 'react'
import {
  Image,
  Button,
  Platform,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native'
import { WebBrowser, MapView, Location } from 'expo'

import { MonoText } from '../components/StyledText'

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this._getLocationAsync()
  }

  state = {
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
    address: null,
    refreshing: false,
  }

  static navigationOptions = {
    header: null,
  }

  _onRefresh = () => {
    this.setState({ refreshing: true })
    this._getLocationAsync().then(() => {
      this.setState({ refreshing: false })
    })
  }

  _getLocationAsync = async () => {
    Location.getCurrentPositionAsync({})
      .then(location => {
        this.setState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
        return Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })
      })
      .then(results => {
        this.setState({
          address: results[0].name,
        })
      })
      .catch(console.log)
  }

  render() {
    const { navigate } = this.props.navigation
    let location = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    }
    return this.state.latitude ? (
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <MapView.Marker
          coordinate={location}
          title={'Current Location'}
          description={this.state.address}
        />
      </MapView>
    ) : (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh}
          />
        }
      >
        <Text>Please allow location access in </Text>
        <Text
          style={styles.link}
          onPress={() => Linking.openURL('app-settings:')}
        >
          Settings
        </Text>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  link: {
    fontWeight: '600',
  },
})
