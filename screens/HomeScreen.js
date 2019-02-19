import React from 'react'
import axios from 'axios'
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
  AsyncStorage,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { WebBrowser, MapView, Location } from 'expo'

import { MonoText } from '../components/StyledText'
import Profile from '../components/Profile'
import Product from '../components/Product'
import Receipt from '../components/Receipt'

import carImg from '../assets/images/Car.png'

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    //this._getLocationAsync()
    this._bootstrapAsync()
    this.state = {
      latitude: 37.774929,
      longitude: -122.419418,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      address: null,
      refreshing: false,
      products: null,
      requestEstimate: null,
      request: null,
      driver: null,
      driverLocation: new MapView.AnimatedRegion({
        latitude: 0.0922,
        longitude: 0.0421,
      }),
      receipt: null,
      inCar: false,
      awaitingRequest: false,
    }
  }

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
        return this._bootstrapAsync()
      })
      .catch(console.log)
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
        end_latitude: 37.762009,
        end_longitude: -122.434677,
      },
    })
      .then(response => {
        response.data.product_id = product_id
        console.log(response.data)
        this.setState({
          requestEstimate: response.data,
        })
      })
      .catch(err => {
        this.setState({
          awaitingRequest: false,
        })
        console.log(err)
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
        end_latitude: 37.762009,
        end_longitude: -122.434677,
      },
    }).then(response => {
      console.log(response.data)
      this.setState({
        requestEstimate: null,
        request: response.data,
        awaitingRequest: false,
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

        if (Platform.OS === 'android') {
          if (this.driver) {
            this.driver._component.animateMarkerToCoordinate(newCoordinate, 500)
          }
        } else {
          driverLocation.timing(newCoordinate).start()
        }
      })
  }

  _handleUberCancelRequestAsync = async () => {
    axios({
      method: 'delete',
      url: 'https://sandbox-api.uber.com/v1.2/requests/current',
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
    }).then(() => {
      this.setState({
        requestEstimate: null,
        request: null,
        inCar: false,
      })
      clearInterval(this.interval)
    })
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
  }

  _handleUberTripEndAsync = async () => {
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
        clearInterval(this.interval)
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
      .catch(err => console.log(JSON.stringify(err)))
  }

  render() {
    const { navigate } = this.props.navigation
    let location = {
      latitude: this.state.latitude,
      longitude: this.state.longitude,
    }
    let screenWidth = Dimensions.get('window').width
    return this.state.latitude ? (
      <>
        <MapView
          style={{ flex: 5 }}
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
              draggable={this.state.request === null}
              onDrag={({ nativeEvent }) => {
                this.setState({
                  latitude: nativeEvent.coordinate.latitude,
                  longitude: nativeEvent.coordinate.longitude,
                })
              }}
            />
          )}
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
                ],
              }}
            />
          )}
        </MapView>
        {this.state.receipt && (
          <Receipt
            visible={this.state.receipt !== null}
            animationType="slide"
            style={{ padding: 40 }}
            receipt={this.state.receipt}
            handleDone={() =>
              this.setState({
                receipt: null,
              })
            }
          />
        )}
        <Modal
          animationType="fade"
          transparent={false}
          visible={this.state.requestEstimate !== null}
          presentationStyle="overFullScreen"
          transparent
        >
          <View style={styles.estimateModalView}>
            <View>
              <Text style={styles.estimateModalTitle}>
                {this.state.requestEstimate &&
                  `${this.state.requestEstimate.fare.display} • ${
                    this.state.requestEstimate.trip.distance_estimate
                  } ${this.state.requestEstimate.trip.distance_unit}(s)`}
              </Text>
              <Text style={styles.estimateModalText}>
                {this.state.requestEstimate &&
                  `Pickup ETA ${
                    this.state.requestEstimate.pickup_estimate
                  } minutes`}
              </Text>
              <View style={styles.buttonRow}>
                <Button
                  style={styles.productButton}
                  title="Request"
                  onPress={() =>
                    this._handleUberRequestAsync(
                      this.state.requestEstimate.product_id,
                      this.state.requestEstimate.fare.fare_id
                    )
                  }
                />
                <Button
                  style={styles.productButton}
                  title="Cancel"
                  onPress={() =>
                    this.setState({
                      requestEstimate: null,
                      awaitingRequest: false,
                    })
                  }
                />
              </View>
            </View>
          </View>
        </Modal>
        <ScrollView style={styles.productContainer} pagingEnabled horizontal>
          {this.state.products ? (
            this.state.products.length > 0 ? (
              !this.state.request ? (
                !this.state.awaitingRequest ? (
                  this.state.products.map(product => (
                    <Product
                      key={product.product_id}
                      product={product}
                      screenWidth={screenWidth}
                      handleChoose={this._handleUberSelectAsync}
                    />
                  ))
                ) : (
                  <ActivityIndicator
                    size="large"
                    style={[styles.productIndicator, { width: screenWidth }]}
                  />
                )
              ) : (
                <>
                  <View
                    style={[
                      styles.requestStatusContainer,
                      { width: screenWidth },
                    ]}
                  >
                    <Text style={styles.productTitle}>
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
                    <View
                      style={[styles.requestContainer, { width: screenWidth }]}
                    >
                      <Profile
                        picture={this.state.request.driver.picture_url}
                        name={this.state.request.driver.name}
                        contact={this.state.request.driver.phone_number}
                        verified
                        verifiedText={this.state.request.driver.rating.toString()}
                      />
                      <View style={styles.vehicleContainer}>
                        <Image
                          source={{
                            uri: this.state.request.vehicle.picture_url,
                          }}
                          style={styles.vehicleImage}
                        />
                        <Text style={styles.vehicleText}>
                          {this.state.request.vehicle.make}{' '}
                          {this.state.request.vehicle.model}
                          {'\n'}
                          <Text style={styles.vehicleLicensePlate}>
                            {this.state.request.vehicle.license_plate}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  )}
                </>
              )
            ) : (
              <View style={[styles.product, { width: screenWidth }]}>
                <Text style={styles.productTitle}>No drivers available</Text>
              </View>
            )
          ) : (
            <ActivityIndicator
              size="large"
              style={[styles.productIndicator, { width: screenWidth }]}
            />
          )}
        </ScrollView>
      </>
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
  productContainer: {
    flex: 1,
    padding: 8,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  link: {
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  estimateModalView: {
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  estimateModalTitle: {
    textAlign: 'center',
    fontSize: 30,
  },
  estimateModalText: {
    textAlign: 'center',
    fontSize: 18,
  },
  requestContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 5,
    justifyContent: 'space-around',
  },
  requestStatusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleContainer: {
    flex: 1,
    paddingLeft: 5,
    paddingRight: 15,
  },
  vehicleImage: {
    flex: 1,
  },
  vehicleText: {
    flex: 1,
  },
  vehicleLicensePlate: {
    backgroundColor: '#fbce30',
    fontWeight: '900',
  },
})
