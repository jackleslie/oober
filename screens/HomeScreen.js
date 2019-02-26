import React from 'react'
import axios from 'axios'
import {
  Image,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  AsyncStorage,
  ActivityIndicator,
  Animated,
  Alert,
  TextInput,
} from 'react-native'
import { WebBrowser, MapView, Location } from 'expo'
import MapViewDirections from 'react-native-maps-directions'

import Profile from '../components/Profile'
import Product from '../components/Product'
import Receipt from '../components/Receipt'
import Estimate from '../components/Estimate'
import Driver from '../components/Driver'
import LocationAccess from '../components/LocationAccess'

import Layout from '../constants/Layout'

import carImg from '../assets/images/Car.png'

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)

    LATITUDE = 37.762009
    LONGITUDE = -122.434677

    // The following line enables current location tracking, skipping it
    // simulates a fake location
    // this._getLocationAsync()

    this._bootstrapAsync()
    this.state = {
      latitude: LATITUDE,
      longitude: LONGITUDE,
      endLatitude: LATITUDE - 0.01,
      endLongitude: LONGITUDE - 0.01,
      address: null,
      endAddress: null,
      refreshing: false,
      products: null,
      requestEstimate: null,
      request: null,
      driverLocation: new MapView.AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
      }),
      receipt: null,
      inCar: false,
      awaitingRequest: false,
      hideTextbox: false,
      textBoxAddress: null,
      locationAllowed: true,
    }
  }

  componentDidMount() {
    this._getLocationNameAsync()
  }

  scrollX = new Animated.Value(0)

  static navigationOptions = {
    header: null,
  }

  _bootstrapAsync = async () => {
    this.userToken = await AsyncStorage.getItem('userToken')
    axios
      .get(`https://sandbox-api.uber.com/v1.2/products`, {
        params: {
          latitude: this.state.latitude,
          longitude: this.state.longitude,
        },
        headers: {
          Authorization: `Bearer ${this.userToken}`,
        },
      })
      .then(results => {
        this.setState({
          products: results.data.products,
        })
      })
      .catch(this._handleErrorResponse)
  }

  _onRefresh = () => {
    this.setState({ refreshing: true })
    this._getLocationAsync()
      .then(() => {
        this.setState({ refreshing: false, locationAllowed: true })
      })
      .catch(() => this.setState({ locationAllowed: false }))
  }

  _getLocationAsync = async () => {
    Location.getCurrentPositionAsync({})
      .then(location => {
        this.setState({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          locationAllowed: true,
        })
        return this._getLocationNameAsync()
      })
      .catch(err => {
        this.setState({
          locationAllowed: false,
        })
        console.log(err)
      })
  }

  _getLocationNameAsync = async () => {
    Location.reverseGeocodeAsync({
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    })
      .then(results => {
        this.setState({
          address: `${results[0].name}, ${results[0].region}`,
        })
        return Location.reverseGeocodeAsync({
          latitude: this.state.endLatitude,
          longitude: this.state.endLongitude,
        })
      })
      .then(results => {
        console.log(results)
        this.setState({
          endAddress: `${results[0].name}, ${results[0].region}`,
        })
        return this._bootstrapAsync()
      })
      .catch(console.log)
  }

  _getEndLocationLatLngAsync = async place => {
    Location.geocodeAsync(place)
      .then(results => {
        console.log(results)
        this.setState({
          endLatitude: results[0].latitude,
          endLongitude: results[0].longitude,
        })
        return this._getLocationNameAsync()
      })
      .catch(console.log)
  }

  _handleErrorResponse = error => {
    if (error.response) {
      if (error.response.status === 409) {
        Alert.alert(
          'Trip Already Active',
          'Please cancel or complete current trip'
        )
      } else if (error.response.status === 422) {
        Alert.alert(
          'Invalid Trip',
          'Please try another pickup location, desintation and/or product'
        )
      } else if (error.response.status === 403) {
        Alert.alert(
          'Blocked',
          'You are either forbidden to make trips or unverified, please contact Uber Support'
        )
      }
    }
    console.log(error)
  }

  _handleUberSelectAsync = async product_id => {
    await this.setState({
      awaitingRequest: true,
    })
    axios({
      method: 'post',
      url: 'https://sandbox-api.uber.com/v1.2/requests/estimate',
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
      data: {
        product_id: product_id,
        start_latitude: this.state.latitude,
        start_longitude: this.state.longitude,
        end_latitude: this.state.endLatitude,
        end_longitude: this.state.endLongitude,
      },
    })
      .then(response => {
        response.data.product_id = product_id
        console.log(response.data)
        if (response.data.fare) {
          this.setState({
            requestEstimate: response.data,
          })
        } else {
          this.setState({
            awaitingRequest: false,
          })
          Alert.alert(
            'Invalid Trip',
            'Please try another pickup location and/or desintation'
          )
        }
      })
      .catch(error => {
        this.setState({
          awaitingRequest: false,
        })
        this._handleErrorResponse(error)
      })
  }

  _handleUberRequestAsync = async (product_id, fare_id) => {
    axios({
      method: 'post',
      url: 'https://sandbox-api.uber.com/v1.2/requests',
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
      data: {
        fare_id: fare_id,
        product_id: product_id,
        start_latitude: this.state.latitude,
        start_longitude: this.state.longitude,
        end_latitude: this.state.endLatitude,
        end_longitude: this.state.endLongitude,
      },
    })
      .then(response => {
        console.log(response.data)
        this.setState({
          requestEstimate: null,
          request: response.data,
          awaitingRequest: false,
          hideTextbox: true,
        })
        return axios({
          method: 'put',
          url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
            response.data.request_id
          }`,
          headers: {
            Authorization: `Bearer ${this.userToken}`,
          },
          data: {
            status: 'accepted',
          },
        }).then(response => {
          console.log(response.data)
          this.interval = setInterval(
            () => this._handleUberRequestReloadAsync(response.data.request_id),
            2000
          )
        })
      })
      .catch(this._handleErrorResponse)
  }

  _handleUberRequestReloadAsync = async request_id => {
    axios
      .get(
        `https://sandbox-api.uber.com/v1.2/requests/${
          this.state.request.request_id
        }`,
        {
          headers: {
            Authorization: `Bearer ${this.userToken}`,
          },
        }
      )
      .then(response => {
        console.log(response.data)
        this.setState({
          request: response.data,
        })
      })
      .then(() => {
        const { location } = this.state.request
        const { driverLocation } = this.state
        const newCoordinate = {
          latitude: location.latitude,
          longitude: location.longitude,
        }

        driverLocation.timing(newCoordinate).start()
      })
      .catch(this._handleErrorResponse)
  }

  _handleUberCancelRequestAsync = async () => {
    clearInterval(this.interval)
    axios({
      method: 'delete',
      url: 'https://sandbox-api.uber.com/v1.2/requests/current',
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
    })
      .then(() => {
        this.setState({
          requestEstimate: null,
          request: null,
          inCar: false,
          hideTextbox: false,
        })
      })
      .catch(this._handleErrorResponse)
  }

  _handleUberInCarAsync = async () => {
    axios({
      method: 'put',
      url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
        this.state.request.request_id
      }`,
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
      data: {
        status: 'arriving',
      },
    })
      .then(() => {
        axios({
          method: 'put',
          url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
            this.state.request.request_id
          }`,
          headers: {
            Authorization: `Bearer ${this.userToken}`,
          },
          data: {
            status: 'in_progress',
          },
        })
      })
      .then(() => {
        this.setState({
          inCar: true,
        })
      })
      .catch(this._handleErrorResponse)
  }

  _handleUberTripEndAsync = async () => {
    clearInterval(this.interval)
    axios({
      method: 'put',
      url: `https://sandbox-api.uber.com/v1.2/sandbox/requests/${
        this.state.request.request_id
      }`,
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
      data: {
        status: 'completed',
      },
    })
      .then(() => {
        this.setState({
          latitude: this.state.request.location.latitude,
          longitude: this.state.request.location.longitude,
        })
        this._getLocationNameAsync()
        return axios.get(
          `https://sandbox-api.uber.com/v1.2/requests/${
            this.state.request.request_id
          }/receipt`,
          {
            headers: {
              Authorization: `Bearer ${this.userToken}`,
            },
          }
        )
      })
      .then(response => {
        this.setState({
          requestEstimate: null,
          request: null,
          inCar: false,
          receipt: response.data,
        })
      })
      .catch(this._handleErrorResponse)
  }

  render() {
    const { navigate } = this.props.navigation
    let location = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    }
    let endLocation = {
      latitude: this.state.endLatitude,
      longitude: this.state.endLongitude,
    }
    let driverLocation = this.state.request &&
      this.state.request.location && {
        latitude: this.state.request.location.latitude,
        longitude: this.state.request.location.longitude,
      }
    let position = Animated.divide(this.scrollX, Layout.window.width)
    return this.state.locationAllowed ? (
      <>
        <MapView
          style={{
            flex: 5,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
          initialRegion={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {!this.state.inCar && (
            <MapView.Marker
              coordinate={location}
              title={'Current Location'}
              description={this.state.address}
              draggable={
                this.state.request === null &&
                this.state.requestEstimate === null
              }
              onPress={() => this.start.showCallout()}
              onDrag={({ nativeEvent }) => {
                this.setState({
                  latitude: nativeEvent.coordinate.latitude,
                  longitude: nativeEvent.coordinate.longitude,
                })
              }}
              onDragEnd={() => {
                this._getLocationNameAsync()
                this.start.hideCallout()
              }}
              ref={start => (this.start = start)}
            />
          )}
          <MapView.Marker
            coordinate={endLocation}
            title={'Destination'}
            description={this.state.endAddress}
            draggable={
              this.state.request === null && this.state.requestEstimate === null
            }
            pinColor="#0061ff"
            onPress={() => this.end.showCallout()}
            onDrag={({ nativeEvent }) => {
              this.setState({
                endLatitude: nativeEvent.coordinate.latitude,
                endLongitude: nativeEvent.coordinate.longitude,
              })
            }}
            onDragEnd={() => {
              this._getLocationNameAsync()
              this.end.hideCallout()
              this.textInput.clear()
            }}
            ref={end => (this.end = end)}
          />
          {this.state.request && this.state.request.location && (
            <MapView.Marker.Animated
              ref={driver => {
                this.driver = driver
              }}
              coordinate={this.state.driverLocation}
              image={carImg}
              style={{
                transform: [
                  { rotate: `${this.state.request.location.bearing}deg` },
                  { scale: 0.33 },
                ],
              }}
            />
          )}
          {this.state.requestEstimate && (
            <MapViewDirections
              origin={location}
              destination={endLocation}
              apikey="AIzaSyAAC1h8dkCQCYZ5hLa8Z5Afkvep9AJ4kFk"
              resetOnChange={false}
            />
          )}
          {this.state.request &&
            this.state.request.status === 'in_progress' && (
              <MapViewDirections
                origin={driverLocation}
                destination={endLocation}
                apikey="AIzaSyAAC1h8dkCQCYZ5hLa8Z5Afkvep9AJ4kFk"
                resetOnChange={false}
              />
            )}
          {this.state.request && this.state.request.status === 'accepted' && (
            <MapViewDirections
              origin={driverLocation}
              destination={location}
              apikey="AIzaSyAAC1h8dkCQCYZ5hLa8Z5Afkvep9AJ4kFk"
              resetOnChange={false}
            />
          )}
          <TextInput
            onChangeText={val => this.setState({ textBoxAddress: val })}
            style={[
              styles.textInput,
              (this.state.awaitingRequest || this.state.hideTextbox) &&
                styles.textInputHide,
            ]}
            placeholder={this.state.endAddress}
            onSubmitEditing={event =>
              this._getEndLocationLatLngAsync(event.nativeEvent.text)
            }
            ref={textInput => (this.textInput = textInput)}
            autoComplete="street-address"
            editable={!this.state.awaitingRequest && !this.state.request}
            returnKeyType="go"
          />
        </MapView>
        {this.state.receipt && (
          <Receipt
            visible={this.state.receipt !== null}
            receipt={this.state.receipt}
            handleDone={() =>
              this.setState({
                receipt: null,
                awaitingRequest: false,
                hideTextbox: false,
              })
            }
            animationType="slide"
            style={{ padding: 40 }}
          />
        )}
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ScrollView
            contentContainerStyle={styles.productContainer}
            pagingEnabled
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event([
              { nativeEvent: { contentOffset: { x: this.scrollX } } },
            ])}
            scrollEventThrottle={16}
          >
            {this.state.products ? (
              this.state.products.length > 0 ? (
                !this.state.request ? (
                  !this.state.awaitingRequest ? (
                    this.state.products.map(product => (
                      <Product
                        key={product.product_id}
                        product={product}
                        handleChoose={this._handleUberSelectAsync}
                      />
                    ))
                  ) : (
                    <Estimate
                      estimate={this.state.requestEstimate}
                      handleRequest={() => {
                        this._handleUberRequestAsync(
                          this.state.requestEstimate.product_id,
                          this.state.requestEstimate.fare.fare_id
                        )
                      }}
                      handleCancel={() => {
                        this.setState({
                          requestEstimate: null,
                          awaitingRequest: false,
                        })
                      }}
                    />
                  )
                ) : (
                  <>
                    <View style={styles.fullScreenWidth}>
                      <Text style={styles.statusTitle}>
                        Request {this.state.request.status}
                      </Text>
                      <View style={styles.buttonRow}>
                        {this.state.request.status === 'accepted' && (
                          <Button
                            title="I'm in!"
                            onPress={this._handleUberInCarAsync}
                          />
                        )}
                        {this.state.request.status === 'in_progress' && (
                          <Button
                            title="Arrived"
                            onPress={this._handleUberTripEndAsync}
                          />
                        )}
                        {this.state.request.status !== 'in_progress' && (
                          <Button
                            title="Cancel Request"
                            onPress={this._handleUberCancelRequestAsync}
                          />
                        )}
                      </View>
                    </View>
                    {this.state.request.driver && (
                      <Driver
                        driver={this.state.request.driver}
                        vehicle={this.state.request.vehicle}
                      />
                    )}
                  </>
                )
              ) : (
                <View style={styles.fullScreenWidth}>
                  <Text style={styles.statusTitle}>No drivers available</Text>
                </View>
              )
            ) : (
              <ActivityIndicator
                size="large"
                style={[styles.productIndicator, styles.fullScreenWidth]}
              />
            )}
          </ScrollView>
          {!this.state.awaitingRequest && (
            <View style={{ flexDirection: 'row' }}>
              {this.state.products &&
              this.state.products.length &&
              !this.state.request > 0
                ? this.state.products.map((_, i) => {
                    let opacity = position.interpolate({
                      inputRange: [
                        i - 0.50000000001,
                        i - 0.5,
                        i,
                        i + 0.5,
                        i + 0.50000000001,
                      ],
                      outputRange: [0.3, 1, 1, 1, 0.3],
                      extrapolate: 'clamp',
                    })
                    return (
                      <Animated.View
                        key={i}
                        style={{
                          opacity,
                          height: 6,
                          width: 6,
                          backgroundColor: '#595959',
                          margin: 8,
                          borderRadius: 3,
                        }}
                      />
                    )
                  })
                : this.state.request &&
                  this.state.request.driver &&
                  [0, 1].map((_, i) => {
                    let opacity = position.interpolate({
                      inputRange: [
                        i - 0.50000000001,
                        i - 0.5,
                        i,
                        i + 0.5,
                        i + 0.50000000001,
                      ],
                      outputRange: [0.3, 1, 1, 1, 0.3],
                      extrapolate: 'clamp',
                    })
                    return (
                      <Animated.View
                        key={i}
                        style={{
                          opacity,
                          height: 6,
                          width: 6,
                          backgroundColor: '#595959',
                          margin: 8,
                          borderRadius: 3,
                        }}
                      />
                    )
                  })}
            </View>
          )}
        </View>
      </>
    ) : (
      <LocationAccess
        refreshing={this.state.refreshing}
        handleRefresh={this._onRefresh}
        handleLink={() =>
          Platform.OS === 'ios' && Linking.openURL('app-settings:')
        }
      />
    )
  }
}

const styles = StyleSheet.create({
  textInput: {
    width: Layout.window.width * 0.85,
    height: 50,
    borderRadius: 1,
    backgroundColor: '#fff',
    marginTop: 80,
    fontSize: 21,
    fontWeight: '300',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    paddingHorizontal: 12,
  },
  textInputHide: {
    opacity: 0,
  },
  productContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: '500',
    textAlign: 'center',
    paddingRight: 5,
  },
  fullScreenWidth: {
    width: Layout.window.width,
  },
})
